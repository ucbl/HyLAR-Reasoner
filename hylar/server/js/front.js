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

const checkStatus = (contextPath = '') => {
    if (document.getElementById('hylar-navbar')) {
        $.get(`${contextPath}/status`)
            .success((result) => {
                document.getElementById('hylar-navbar').classList.remove('is-warning')
            })
            .error(() => {
                document.getElementById('hylar-navbar').classList.add('is-warning')
            })
    }
}

const prove = async(inferredFactId, assertedFactIds, entailment) => {
    let facts = []

    const buildFact = (factId) => {
        let sub = document.getElementById(`subject-${factId}`).dataset.atom
        let pred = document.getElementById(`predicate-${factId}`).dataset.atom
        let obj = document.getElementById(`object-${factId}`).dataset.atom
        return new Fact(pred, sub, obj)
    }

    let inferredFact = buildFact(inferredFactId)

    for (let factId of assertedFactIds) {
        facts.push(buildFact(factId))
    }

    let proofChain = [facts]

    const evalLoop = async() => {
        let values = await Solver.evaluateRuleSet(Rules[entailment] ? Rules[entailment] : Rules.owl2rl, proofChain.flat(), true)
        if (Utils.uniques(proofChain.flat(), values.cons).length > proofChain.flat().length) {
            let previousDerivations = proofChain[proofChain.length-1]
            let currentDerivations = []
            for (let derivation of values.cons) {
                if (!previousDerivations.map(d => { return d.asString }).includes(derivation.asString)) {
                    currentDerivations.push(derivation)
                }
            }
            proofChain.push(currentDerivations)
            await evalLoop()
        }
    }

    await evalLoop()

    document.getElementById('proof') ? document.getElementById('proof').remove() : ''

    let container = `<div class="container"><article id="proof" class="message is-link is-proof"><div class="message-header">Proof (${entailment})<button class="delete" aria-label="delete" onclick="closeProof()"></button></div><div class="message-body">`

    for (let proof of proofChain) {
        container = `${container}<div class="subtitle">Loop #${proofChain.indexOf(proof)}</div><p>`
        for (let fact of proof) {
            container = `
                ${container}
                <div class="columns">
                    <div class="column is-one-fifth">
                        <span class="fact fact-state ${fact.explicit ? 'explicit' : 'implicit'}">
                            ${fact.rule != null ? fact.rule.name : 'asserted'}
                        </span>
                    </div>                    
                    <div class="column">                    
                    <${fact.rule != null || fact.toRaw() != inferredFact.toRaw() ? 'span' : 'b'} class="proof-fact">
                        ${fact.subject} ${fact.predicate} ${fact.object}
                    </${fact.rule != null || fact.toRaw() != inferredFact.toRaw() ? 'span' : 'b'}>
                    </div>                        
                </div>
            `
        }
        container = `${container}</p>`
    }

    container = `${container}</div></article></div>`

    document.getElementById('facts-list').insertAdjacentHTML('beforebegin', container)
    document.getElementById('proof').scrollIntoView()
}

const highlightFacts = (ev, entailment) => {
    let blocks = Object.keys(ev.dataset).map(blockId => { return document.getElementById(blockId) })
    let factIds = blocks.map(block => { return block.dataset.factId })

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

    prove(ev.closest("tr").dataset.factId, factIds, entailment)
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
            let sparqlErrorsSection = document.getElementById('sparql-errors-section')
            let sparqlSuccessSection = document.getElementById('sparql-success-section')
            let resultsTable = document.getElementById('sparql-results-table')
            let graphResultDiv = document.getElementById('sparql-graph-result')
            let graphDownloadDiv = document.getElementById('graph-result-menu')
            let successContent = document.getElementById('sparql-success')


            resultsTable.innerHTML = null
            graphResultDiv.innerText = null
            sparqlErrorsSection.style.display = 'none'
            sparqlSuccessSection.style.display = ''

            if (graphDownloadDiv) graphDownloadDiv.remove()

            if (xhr.getResponseHeader('content-type').includes('text/turtle')) {
                successContent.innerText = `Graph successfully built`
                resultsSection.style.display = 'none'
                graphResultDiv.style.display = null
                graphResultDiv.innerText = `${result}`
                graphResultDiv.insertAdjacentHTML('beforebegin', `
                    <div id="graph-result-menu" class="graph-result-menu">
                        <a id="graph-download" href="">Download graph <i class="fas fa-file-download"></i></a>
                    </div>
                `)
                document.getElementById('graph-download').href = `data:text/html;charset=utf-8,${result.replace(/#/g, '%23')}`
                document.getElementById('graph-download').download = 'graph.ttl'
                return
            } else {
                successContent.innerText = `Query executed in ${result.metadata.time} ms`;
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
        },
        error: function(error) {
            let sparqlErrorsSection = document.getElementById('sparql-errors-section')
            let sparqlSuccessSection = document.getElementById('sparql-success-section')
            let errorContent = document.getElementById('sparql-errors')
            sparqlErrorsSection.style.display = '';
            sparqlSuccessSection.style.display = 'none';
            errorContent.innerText = `${error.responseText}`;
        }
    })
}

const closeProof = () => {
    document.getElementById('proof').remove()
}

const putSparql = (el) => {
    var query = $(el).text();
    $('#query').val(query);
    $('html, body').animate({ scrollTop: 0 }, 0);
}

const copy = (el) => {
    sparqlQuery.setValue(`${sparqlQuery.getValue()}${el.innerText}`)
}

const addRule = (contextPath) => {
    let rulename = document.querySelector('[name="rulename"]').value
    let rule = document.querySelector('[id="rule-content"]').value

    if (rulename == "" || rule == "") {
        alert("Name and content of rule cannot be empty")
        return
    }

    $.ajax({
        url: `${contextPath}/rule`,
        type: "PUT",
        data: {
            rule,
            rulename
        },
        success: function (result) {
            location.reload()
        },
        error: function(error) {
            alert(error.responseText)
        }
    })
}