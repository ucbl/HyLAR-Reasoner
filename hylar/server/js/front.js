const fileUpload = (ev, contextPath) => {
    let formData = new FormData()
    formData.append('file', ev.files[0])

    $.ajax({
        url: `${contextPath}/ontology`,
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (result) {
            location.reload()
        }
    })
}

const areYouSure = (ev, url) => {
    let oldText = ev.innerText
    let oldOnclick = ev.onclick

    ev.innerText = 'Are you sure?'
    ev.onclick = () => {
        $.get(url).success(() => {
            location.reload()
            ev.innerText = oldText
        })
    }

    ev.onmouseout = () => {
        ev.innerText = oldText
        ev.onclick = oldOnclick
    }
}

const checkStatus = () => {
    $.get('/status')
        .success((result) => {
            $('#hylar-status').html(`<span class="status-ok"></span><i class="fas fa-check"></i> HyLAR is currently used on the <b>server-side</b></span>  |<span class="last-log">${result.lastLog}</span>`)
            $('footer').addClass('status-ok')
            $('footer').removeClass('status-nok')
        })
        .error(() => {
            $('#hylar-status').html(`<span class="status-nok"></span><i class="fas fa-exclamation-triangle"></i></i> HyLAR has disconnected</span>`)
            $('footer').addClass('status-nok')
            $('footer').removeClass('status-ok')
        })
}

const highlightFacts = (ev) => {
    let blocks = Object.keys(ev.dataset).map(blockId => { return document.getElementById(blockId) })

    for (let block of document.getElementsByClassName('fact-entry')) {
        block.classList.remove("fact-highlight")
        block.classList.remove("fact-derived")
    }

    ev.closest("tr").classList.add("fact-derived")
    blocks.push(ev.closest("tr"))

    for (let block of blocks) {
        $("#facts-list tbody").prepend(block).closest('th')
        block.classList.add('fact-highlight')
        block.scrollIntoView({ block: 'center' })
    }
}

const appendPrefix = (ev) => {
    document.getElementById('rule-content').value = `${document.getElementById('rule-content').value}${ev.value}`
}

const sparql = (ev, contextPath) => {
    let query = sparqlQuery.getValue()

    $.ajax({
        url: `${contextPath}/query`,
        type: "POST",
        data: {
            query
        },
        headers: {
            Accept: "application/sparql-results+json"
        },
        success: function (result, status, xhr) {
            let resultsSection = document.getElementById('sparql-results-section')
            let resultsTable = document.getElementById('sparql-results-table')
            let graphResultDiv = document.getElementById('sparql-graph-result')

            resultsTable.innerHTML = null
            graphResultDiv.innerText = null

            if (xhr.getResponseHeader('content-type').includes('text/turtle')) {
                resultsSection.style.display = 'none'
                graphResultDiv.style.display = null
                graphResultDiv.innerText = `${result}`
                graphResultDiv.insertAdjacentHTML('beforeend', `
                    <div class="graph-result-menu">
                        <a id="graph-download" href="">Download graph <i class="fas fa-file-download"></i></a>
                    </div>
                `)
                document.getElementById('graph-download').href = `${contextPath}/query?query=${query}`
                return
            } else {
                graphResultDiv.style.display = 'none'
                resultsSection.style.display = null
            }

            let thead = ''
            if (result.head.vars != '') {
                thead = '<thead><tr>'
                for (let variable of result.head.vars) {
                    thead = `${thead}<th>${variable}</th>`
                }
                thead = `${thead}</thead></tr>`
            }

            let tbody = '<tbody>'
            for (let binding of result.results.bindings) {
                tbody = `${tbody}<tr>`
                if (typeof binding == 'object') {
                    for (let variable of result.head.vars) {
                        tbody = `${tbody}<td draggable="true" onclick="copy(this)">${binding[variable].value}</td>`
                    }
                } else {
                    tbody = `${tbody}No results found.`
                }
                tbody = `${tbody}</tr>`
            }
            tbody = `${tbody}</tbody>`

            resultsTable.insertAdjacentHTML('afterbegin', `${thead}${tbody}`)
        }
    })
}

function putSparql(i) {
    var query = $('#'+i).text();
    $('#query').val(query);
    $('html, body').animate({ scrollTop: 0 }, 0);
}

const copy = (el) => {
    sparqlQuery.setValue(`${sparqlQuery.getValue()}${el.innerText}`)
}

checkStatus()
window.setInterval(checkStatus, 1000)