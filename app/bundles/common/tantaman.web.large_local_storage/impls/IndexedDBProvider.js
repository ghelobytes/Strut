define(['Q'], function(Q) {
	return {
		init: function() {
			var deferred = Q.defer();
			deferred.reject("No IndexedDB");
			return deferred.promise;
		}
	}
});