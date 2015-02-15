// Init
$(function() {
	
	$.ajax({
		url: 'data/data.json'
	}).success(function(data) {

		spaceBalls({
			id: '#myViz',
			data: data.data
		});

	});

	
});