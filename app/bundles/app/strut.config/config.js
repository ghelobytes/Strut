define(function () {
	var config = {
		slide: {
			size: {
				width: 1024,
				height: 768
			},
			overviewSize: {
				width: 75,
				height: 50
			}
		},
		// TODO: dynamically grow the size as we edge up on capacity
		storageSize: 75 * 1024 * 1024
	};

	var temp = localStorage.getItem("Strut_sessionMeta");
	try {
		var sessionMeta = JSON.parse(temp);
	} catch (e) {
	}

	var sessionMeta = sessionMeta || {
		generator_index: 0
	};

	window.config = config;
	window.sessionMeta = sessionMeta;

	return config;
});