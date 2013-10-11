define(['tantaman/web/large_local_storage/main',
		'ServiceRegistry'],
function(llsp, SR) {
	var registry = new SR.ServiceRegistry();
	llsp.initialize(registry, {
		size: 10 * 1024 * 1024,
		forceProvider: 'IndexedDB' // force a desired provider.
	});

	function fail(err) {
		console.log(err);
		expect(false).to.equal(true);
	}

	function getAttachment(a, cb) {
        // Create XHR
        var xhr = new XMLHttpRequest(),
            blob;

        xhr.open("GET", a, true);
        // Set the responseType to blob
        xhr.responseType = "blob";

        xhr.addEventListener("load", function () {
            if (xhr.status === 200) {
                blob = xhr.response;
                cb(blob);
            }
        }, false);
        // Send XHR
        xhr.send();
    }

	var storage = registry.getBest('tantaman.web.large_local_storage');
	describe('LargeLocalStorage', function() {
		it('Allows string contents to be set and read', function(done) {
			storage.initialized.then(function() {
				return storage.setContents("testFile", "contents");
			}).then(function() {
				return storage.getContents("testFile");
			}).then(function(contents) {
				expect(contents).to.equal("contents");
				done();
			}).catch(function(err) {
				fail(err);
				done();
			})
		});

		// well.... maybe not anymore... need to think about this ability.
		it('Allows js objects to be set and read', function(done) {
			var jsondoc = {
				a: 1,
				b: 2,
				c: {a: true}
			};
			storage.initialized.then(function() {
				return storage.setContents("testfile2", JSON.stringify(jsondoc));
			}).then(function() {
				return storage.getContents("testfile2");
			}).then(function(contents) {
				expect(jsondoc).to.eql(JSON.parse(contents));
				done();
			}).catch(function(err) {
				fail(err);
				done();
			});
		});

		it('Allows items to be deleted', function(done) {
			storage.initialized.then(function() {
				return storage.setContents("testfile3", "contents");
			}).then(function() {
				return storage.rm("testfile3");
			}).then(function() {
				return storage.getContents("testfile3");
			}).then(function(contents) {
				expect("File should not have been found").to.equal("");
			}).catch(function(err) {
				expect(err.code).to.equal(FileError.NOT_FOUND_ERR);
				done();
			});
		});


		it('Allows attachments to be written, read', function(done) {
			getAttachment("elephant.jpg", function(blob) {
				storage.initialized.then(function() {
					return storage.setContents("testfile4", "file...");
				}).then(function() {
					return storage.setAttachment("testfile4/ele", blob);
				}).then(function() {
					return storage.getAttachment("testfile4/ele");
				}).then(function(attach) {
					expect(attach instanceof Blob).to.equal(true);
					done();
				}).catch(function(err) {
					fail(err);
					done();
				});
			});
		});


		// Apparently these tests are being run sequentially...
		// so taking advantage of that...
		it('Allows us to get attachments as urls', function(done) {
			storage.getAttachmentURL("testfile4/ele").then(function(url) {
				// urls are pretty opaque since they could be from
				// filesystem api, indexeddb, or websql
				expect(typeof url === 'string').to.equal(true);
				$(document.body).append('<img src="' + url + '">');
				done();
			}).catch(function() {
				fail(err);
				done();
			});
		});

		it('Allows attachments to be deleted', function(done) {
			storage.rmAttachment("testfile4/ele").then(function() {
				done();
			}).catch(function() {
				fail(err);
				done();
			});
		});

		it('Removes all attachments when removing a file', function(done) {
			getAttachment("pie.jpg", function(blob) {
				storage.setContents("testfile5", "fileo").then(function() {
					return storage.setAttachment("testfile5/pie", blob);
				}).then(function() {
					return storage.rm("testfile5");
				}).then(function() {
					return storage.getAttachment("testfile5/pie");
				}).then(function() {
					console.log('fail?');
					fail(err);
					done();
				}).catch(function(err) {
					expect(err.code).to.equal(FileError.NOT_FOUND_ERR);
					done();
				});
			});
		});

		it('Allows one to revoke attachment urls', function() {
			storage.revokeAttachmentURL('');
		});
	});
});