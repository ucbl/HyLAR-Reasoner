function displayPage(id, page) {
	$.get('/github-pages/' + page, function(data) {
		$('#'+id).html(data);	
	});	
}

function updateContent() {
    var md = $(location)[0].hash.substr(1);
    $.get('./github-pages/' + md + '.md', function(data) {
        $('#documentation').html(new showdown.Converter().makeHtml(data));
    });
}   

$(window).on('hashchange', updateContent);
$(window).on('load', updateContent);