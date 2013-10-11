define(['tantaman/web/large_local_storage/main',
		'ServiceRegistry'],
function(llsp, SR) {
	window.config = {
		storageSize: 10 * 1024 * 1024
	};

	var registry = new SR.ServiceRegistry();
	llsp.initialize(registry);

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
				console.log(err);
				done();
			})
		});

		it('Allows js objects to be set and read', function(done) {
			var jsondoc = {
				a: 1,
				b: 2,
				c: {a: true}
			};
			storage.initialized.then(function() {
				return storage.setContents("testfile2", jsondoc);
			}).then(function() {
				return storage.getContents("testfile2");
			}).then(function(contents) {
				expect(contents).to.eql(jsondoc);
				done();
			}).catch(function(err) {
				throw err;
			});
		});
	});
});