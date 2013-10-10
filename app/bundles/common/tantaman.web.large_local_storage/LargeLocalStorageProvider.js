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

	function selectImplementation() {
		return FilesystemAPIPRovider.init().then(function(impl) {
			return Q(impl);
		}, function() {
			return IndexedDBProvider.init();
		}).then(function(impl) {
			return Q(impl);
		}, function() {
			return WebSQLProvider.init();
		}).then(function(impl) {
			return Q(impl);
		}, function() {
			return LocalStorageProvider.init();
		});
	}

	function copyOldPresentations(from, to) {
		from = getImpl(from);
	}

	function LargeLocalStorageProvider() {
		var self = this;
		selectImplementation().then(function(impl) {
			console.log('Selected: ' + impl.type);
			self._impl = impl;
			if (window.sessionMeta.lastStorageImpl != this._impl.type) {
				copyOldPresentations(window.sessionMeta.lastStorageImpl, this._impl);
			}
		});
	}

	LargeLocalStorageProvider.prototype = {
		supportsAttachments: function() {
			return this._impl.supportsAttachments();
		},

		ready: function() {
			return true;
		},

		ls: function() {

		},

		rm: function(path, cb) {
			// check for attachments on this path
			// delete attachments in the storage as well.
		},

		getContents: function(path, cb) {
			// throw error if getting an attachment
		},

		setContents: function(path, data, cb) {
			// instanceof the data to see if it is an attachment?
		},

		getAttachment: function() {
			// see if we are already getting the desired attachment
		},

		setAttachment: function(path, data, cb) {

		},

		rmAttachment: function(path, cb) {

		}
	};

	return LargeLocalStorageProvider;
});