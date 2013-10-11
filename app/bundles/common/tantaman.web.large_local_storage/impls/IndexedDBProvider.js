define(['Q'], function(Q) {
	var URL = window.URL || window.webkitURL;
	function IDB(db) {
		this._db = db;
		this.type = 'IndexedDB';
	}

	// TODO: normalize returns and errors.
	IDB.prototype = {
		getContents: function(path) {
			var deferred = Q.defer();
			var transaction = this._db.transaction(['files'], 'readonly');

			var get = transaction.objectStore('files').get(path);
			get.onsuccess = function(e) {
				deferred.resolve(e.target.result);
			};

			get.onerror = function(e) {
				deferred.reject(e);
			};

			return deferred.promise;
		},

		setContents: function(path, data) {
			var deferred = Q.defer();
			var transaction = this._db.transaction(['files'], 'readwrite');

			var put = transaction.objectStore('files').put(data, path);
			put.onsuccess = function(e) {
				deferred.resolve(e);
			};

			put.onerror = function(e) {
				deferred.reject(e);
			};

			return deferred.promise;
		},

		rm: function(path) {
			var deferred = Q.defer();
			var finalDeferred = Q.defer();

			var transaction = this._db.transaction(['files', 'attachments'], 'readwrite');
			
			var del = transaction.objectStore('files').delete(path);
			var openCur = transaction.objectStore('attachments').openCursor();

			del.onsuccess = function(e) {
				finalDeferred.resolve(deferred);
			};

			del.onerror = function(e) {
				finalDeferred.reject();
			};

			openCur.onsuccess = function(e) {
				var cursor = e.target.result;
				if (cursor) {
					console.log(cursor);
					// check if the item has the key we are interested in
					cursor.continue();
				} else {
					deferred.resolve();
				}
			};

			openCur.onerror = function(e) {
				deferred.reject(e);
			};

			return finalDeferred.promise;
		},

		getAttachment: function(path) {
			var deferred = Q.defer();

			var transaction = this._db.transaction(['attachments'], 'readonly');
			var get = transaction.objectStore('attachments').get(path);

			get.onsuccess = function(e) {
				deferred.resolve(e.target.result);
			};

			get.onerror = function(e) {
				deferred.resolve(e);
			};

			return deferred.promise;
		},

		getAttachmentURL: function(path) {
			var deferred = Q.defer();
			this.getAttachment(path).then(function(attachment) {
				deferred.resolve(URL.createObjectURL(attachment));
			}, function(e) {
				deferred.reject(e);
			});

			return deferred.promise;
		},

		revokeAttachmentURL: function(url) {
			URL.revokeObjectURL(url);
		},

		setAttachment: function(path, data) {
			var deferred = Q.defer();

			var transaction = this._db.transaction(['attachments'], 'readwrite');
			var put = transaction.objectStore('attachments').put(data, path);

			put.onsuccess = function(e) {
				deferred.resolve(e);
			};

			put.onerror = function(e) {
				deferred.reject(e);
			};

			return deferred.promise;
		},

		rmAttachment: function(path) {
			var deferred = Q.defer();
			var transaction = this._db.transaction(['attachments'], 'readwrite');
			var del = transaction.objectStore('attachments').delete(path);

			put.onsuccess = function(e) {
				deferred.resolve(e);
			};

			put.onerror = function(e) {
				deferred.reject(e);
			};

			return deferred.promise;
		}
	};

	return {
		init: function() {
			var deferred = Q.defer();

			var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB,
			IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction,
			dbVersion = 1.0;

			if (!indexedDB || !IDBTransaction) {
				deferred.reject("No IndexedDB");
				return deferred.promise;
			}

			var request = indexedDB.open("largelocalstorage", dbVersion);

			function createObjectStore(db) {
				db.createObjectStore("files");
				db.createObjectStore("attachments");
			}

			// TODO: normalize errors
			request.onerror = function (event) {
				deferred.reject(event);
			};
		 
			request.onsuccess = function (event) {
				var db = request.result;
		 
				db.onerror = function (event) {
					console.log(event);
				};
				
				// Chrome workaround
				if (db.setVersion) {
					if (db.version != dbVersion) {
						var setVersion = db.setVersion(dbVersion);
						setVersion.onsuccess = function () {
							createObjectStore(db);
							deferred.resolve();
						};
					}
					else {
						deferred.resolve(new IDB(db));
					}
				} else {
					deferred.resolve(new IDB(db));
				}
			}
			
			request.onupgradeneeded = function (event) {
				createObjectStore(event.target.result);
			};

			return deferred.promise;
		}
	}
});