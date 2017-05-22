

function displayPage(id, page) {
	$.get('/github-pages/' + page, function(data) {
		$('#'+id).html(data);	
	});	
}