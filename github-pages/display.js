function displayPage(id, page) {
	$.get('./github-pages/' + page, function(data) {
		$('#'+id).html(data);	
	});	
}

function updateContent() {
    var md = $(location)[0].hash.substr(1);
    if (md != '') {
	    $.get('./github-pages/' + md + '.md', function(data) {
	        $('#documentation').html(new showdown.Converter().makeHtml(data));
	        hljs.configure({useBR: false});
			$('code').each(function(i, block) {
			  hljs.highlightBlock(block);
			});
			$('pre').click(function() {
				if ($(this).css('height') == '200px')  {
					$(this).css({'height': 'auto'});
				} else {
					$(this).css({'height': '200px'});	
				}				
			});
	    });
	}
}   

$(window).on('hashchange', updateContent);
$(window).on('load', updateContent);		

function evalCode(elem) {
	eval($(elem.parentElement.nextElementSibling.firstElementChild).text());
}