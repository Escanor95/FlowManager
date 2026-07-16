function disableButton(button, text = "Procesando...") {

    button.dataset.originalText = button.innerHTML;

    button.innerHTML = text;

    button.disabled = true;

}

function enableButton(button) {

    button.innerHTML = button.dataset.originalText;

    button.disabled = false;

}