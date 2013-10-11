define(['./impls/FilesystemAPIPRovider',
		'./impls/IndexedDBProvider',
		'./impls/WebSQLProvider',
		'./impls/LocalStorageProvider',
		'Q'],
function(FilesystemAPIPRovider,
		 IndexedDBProvider,
		 WebSQLProvider,
		 LocalStorageProvider,
		 Q) {

	var sessionMeta = localStorage.getItem('LargeLocalStorage-meta');
	if (sessionMeta)
		sessionMeta = JSON.parse(sessionMeta);
	else
		sessionMeta = {};

	function getImpl(type) {
		switch(type) {
			case 'FileSystemAPI':
				return FilesystemAPIPRovider.init();
			case 'IndexedDB':
				return IndexedDBProvider.init();
			case 'WebSQL':
				return WebSQLProvider.init();
			case 'LocalStorage':
				return LocalStorageProvider.init();
		}
	}

	function selectImplementation(registry, config) {
		return FilesystemAPIPRovider.init(registry, config).then(function(impl) {
			return Q(impl);
		}, function() {
			return IndexedDBProvider.init(registry, config);
		}).then(function(impl) {
			return Q(impl);
		}, function() {
			return WebSQLProvider.init(registry, config);
		}).then(function(impl) {
			return Q(impl);
		}, function() {
			return LocalStorageProvider.init(registry, config);
		});
	}

	function copyOldData(from, to) {
		from = getImpl(from);
	}

	function LargeLocalStorageProvider(registry, config) {
		var self = this;
		var deferred = Q.defer();
		selectImplementation(registry, config).then(function(impl) {
			console.log('Selected: ' + impl.type);
			self._impl = impl;
			if (sessionMeta.lastStorageImpl != self._impl.type) {
				copyOldData(sessionMeta.lastStorageImpl, self._impl);
			}
			sessionMeta.lastStorageImpl = impl.type;
			deferred.resolve(self);
		}).catch(function(e) {
			// This should be impossible
			console.log(e);
			deferred.reject('No storage provider found');
		});

		this.initialized = deferred.promise;
	}

	LargeLocalStorageProvider.prototype = {
		supportsAttachments: function() {
			return this._impl.supportsAttachments();
		},

		ready: function() {
			return true;
		},

		ls: function(path) {
			return this._impl.ls(path);
		},

		rm: function(path) {
			// check for attachments on this path
			// delete attachments in the storage as well.
			return this._impl.rm(path);
		},

		getContents: function(path) {
			return this._impl.getContents(path);
		},

		setContents: function(path, data) {
			return this._impl.setContents(path, data);
		},

		getAttachment: function(path) {
			return this._impl.getAttachment(path);
		},

		setAttachment: function(path, data) {
			return this._impl.setAttachment(path, data);
		},

		rmAttachment: function(path) {
			return this._impl.rmAttachment(path);
		}
	};

	return LargeLocalStorageProvider;
});