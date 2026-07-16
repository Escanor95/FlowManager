function openModal(content) {

    const overlay = document.getElementById("modalOverlay");

    const modalContent = document.getElementById("modalContent");

    modalContent.innerHTML = content;

    overlay.classList.remove("hidden");

}

function closeModal() {

    const overlay = document.getElementById("modalOverlay");

    overlay.classList.add("hidden");

}

document.addEventListener("click", (event) => {

    const overlay = document.getElementById("modalOverlay");

    if (!overlay) return;

    if (event.target === overlay) {

        closeModal();

    }

});