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

checkStatus()
window.setInterval(checkStatus, 1000)