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

	function selectImplementation(registry) {
		return FilesystemAPIPRovider.init(registry).then(function(impl) {
			return Q(impl);
		}, function() {
			return IndexedDBProvider.init(registry);
		}).then(function(impl) {
			return Q(impl);
		}, function() {
			return WebSQLProvider.init(registry);
		}).then(function(impl) {
			return Q(impl);
		}, function() {
			return LocalStorageProvider.init(registry);
		});
	}

	function copyOldPresentations(from, to) {
		from = getImpl(from);
	}

	function LargeLocalStorageProvider(registry) {
		var self = this;
		var deferred = Q.defer();
		selectImplementation(registry).then(function(impl) {
			console.log('Selected: ' + impl.type);
			self._impl = impl;
			if (window.sessionMeta && 
				window.sessionMeta.lastStorageImpl != self._impl.type) {
				copyOldPresentations(window.sessionMeta.lastStorageImpl, self._impl);
			}
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