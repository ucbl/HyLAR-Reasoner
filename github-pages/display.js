function displayPage(id, page) {
	$.get('./github-pages/' + page, function(data) {
		$('#'+id).html(data);	
	});	
}

function updateContent() {
    var md = $(location)[0].hash.substr(1);

    if (md != '') {
	    $.get('./github-pages/' + md + '.md', function(data) {
	    	
	    	data = replaceCodeHeaders(data)
	        
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
	eval($(elem.parentElement.parentElement.nextElementSibling.firstElementChild).text());
}

function copyCode(elem) {
	document.execCommand('copy', true, $(elem.parentElement.parentElement.nextElementSibling.firstElementChild).text());
}

function replaceCodeHeaders(data) {
	return data.replace(/```\[([^\]]+)\]/g, '<span class="ragged"><a href="#stor" class="eval" onclick="evalCode(this)">&nbsp;<span style="font-family:webdings">8</span> Test Example&nbsp;</a> <a href="#stor" class="eval" onclick="copyCode(this)">&nbsp;<span style="font-family:webdings">2</span> Copy to Clipboard&nbsp;</a> *$1*</span>\n```')	
}