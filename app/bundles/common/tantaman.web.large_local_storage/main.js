define(['./LargeLocalStorageProvider'],
function(LargeLocalStorageProvider) {
	return {
		initialize: function(registry) {
			var provider = new LargeLocalStorageProvider(registry);
		}
	};
});