define(['./LargeLocalStorageProvider'],
function(LargeLocalStorageProvider) {
	return {
		initialize: function(registry, config) {
			var provider = new LargeLocalStorageProvider(registry, config);
			registry.register('tantaman.web.large_local_storage', provider);
		}
	};
});