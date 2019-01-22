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