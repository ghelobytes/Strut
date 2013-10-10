define(['Q'], function(Q) {
	return {
		init: function() {
			var deferred = Q.defer();
			deferred.reject("No FS API");
			return deferred.promise;
		}
	}
});