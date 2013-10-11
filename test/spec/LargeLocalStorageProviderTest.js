define(['tantaman/web/large_local_storage/main',
		'ServiceRegistry'],
function(llsp, SR) {
	var registry = new SR.ServiceRegistry();
	llsp.initialize(registry);

	var storage = registry.getBest('tantaman.web.large_local_storage');
});