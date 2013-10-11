define(['./LargeLocalStorageProvider'],
function(LargeLocalStorageProvider) {
	return {
		initialize: function(registry) {
			var provider = new LargeLocalStorageProvider(registry);
			registry.register('tantaman.web.large_local_storage', provider);
		}
	};
});