define(['Q', 'common/FileUtils'], function(Q, FileUtils) {

	function FSAPI(fs) {
		this._fs = fs;
		this.type = "FilesystemAPI";
	}

	//
	// myPres.strut
	// myPres.strut-attachments/
	//  -a1
	//  -a2
	// otherPres.strut
	// otherPres.strut-attachments/
	//  -a1
	//  -a2...

	function makeErrorHandler(deferred) {
		// TODO: normalize the error so
		// we can handle it upstream
		return function(e) {
			deferred.reject(e);
		}
	}

	FSAPI.prototype = {
		getContents: function(path) {
			var deferred = Q.defer();
			this._fs.root.getFile(path, {}, function(fileEntry) {
				fileEntry.file(function(file) {
					var reader = new FileReader();

					reader.onloadend = function(e) {
						var data = e.target.result;
						// for some reason our mime type is lost...
						try {
							data = JSON.parse(data);
						} catch (e) {}
						deferred.resolve(data);
					};

					reader.readAsText(file);
				}, makeErrorHandler(deferred));
			}, makeErrorHandler(deferred));

			return deferred.promise;
		},

		// create a file at path
		// and write `data` to it
		setContents: function(path, data) {
			var deferred = Q.defer();

			this._fs.root.getFile(path, {create:true}, function(fileEntry) {
				fileEntry.createWriter(function(fileWriter) {
					var blob;
					fileWriter.onwriteend = function(e) {
						fileWriter.onwriteend = function() {
							deferred.resolve();
						};
						fileWriter.truncate(blob.size);
					}

					fileWriter.onerror = makeErrorHandler(deferred);

					if (data instanceof Blob) {
						blob = data;
					} else if (typeof data === 'string') {
						blob = new Blob([data], {type: 'text/plain'});
					} else {
						blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
					}

					fileWriter.write(blob);
				}, makeErrorHandler(deferred));
			}, makeErrorHandler(deferred));

			return deferred.promise;
		},

		rm: function(path) {
			// remove attachments that go along with the path
			// rm dirname(path)+"-attachments"
			var deferred = Q.defer();

			// TODO: what if the path is actually a directory?!?
			var dir = FileUtils.dirName(path);
			var attachmentsDir = dir + "-attachments";

			// TODO: we can't just resolve the defered.  Need
			// to wait for multiple deferreds to be resolved.
			function entryHandler(entry) {
				entry.remove(function() {
					deferred.resolve();
				}, makeErrorHandler(deferred));
			};

			this._fs.root.getFile(path, {create:false}, entryHandler,
				makeErrorHandler(deferred));

			this._fs.root.getDirectory(attachmentsDir, {}, entryHandler,
				makeErrorHandler(deferred));

			return deferred.promise;
		},

		getAttachment: function(path) {
			// same thing as getContents?
			// we can't do this!  We need to just return the file
			// so an objectURL can be created to it an so on.
			// return this.getContents(path);
		},

		// Create a folder at dirname(path)+"-attachments"
		// add attachment under that folder as basename(path)
		setAttachment: function(path, data) {
			var dir = FileUtils.dirName(path);
			var attachmentsDir = dir + "-attachments";

			var deferred = Q.defer();

			var self = this;
			this._fs.root.getDirectory(attachmentsDir, {create:true}, function(dirEntry) {
				deferred.resolve(
					self.setContents(attachmentsDir + "/" + FileUtils.basename(path)));
			}, makeErrorHandler(deferred));

			return deferred.promise;
		},

		// rm the thing at dirname(path)+"-attachments/"+basename(path)
		rmAttachment: function(path) {
			var attachmentPath = FileUtils.dirName(path) + "-attachments/" + FileUtils.baseName(path);

			var deferred = Q.defer();
			this._fs.root.getFile(attachmentPath, {create:false},
				function(entry) {
					entry.remove(function() {
						deferred.resolve();
					}, makeErrorHandler(deferred));
			}, makeErrorHandler(deferred));

			return Q.promise;
		}
	};

	return {
		init: function(registry, config) {
			var deferred = Q.defer();
			window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
			var persistentStorage = navigator.persistentStorage || navigator.webkitPersistentStorage;

			if (!requestFileSystem) {
				deferred.reject("No FS API");
				return deferred.promise;
			}

			persistentStorage.requestQuota(config.size,
			function(numBytes) {
				requestFileSystem(window.PERSISTENT, numBytes,
				function(fs) {
					deferred.resolve(new FSAPI(fs));
				}, function(err) {
					// TODO: implement various error messages.
					console.log(err);
					deferred.reject(err);
				});
			}, function(err) {
				// TODO: implement various error messages.
				console.log(err);
				deferred.reject(err);
			});

			return deferred.promise;
		}
	}
});