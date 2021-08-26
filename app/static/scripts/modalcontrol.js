// Modal controller
// Handles modal showing/hiding

function showmodal(idno) {
    let modal = document.getElementById("card" + idno + "modal");
    modal.style.display = "block";
    console.log("[+] Showing modal for card " + idno);
}

function closeallmodals() {
    const modals = document.getElementsByClassName("modal");

    for (let i = 0; i < modals.length; i++) {
        modals[i].style.display = "none";
    }
    console.log("[-] All modals hidden.");
}

// Close modals if they're clicked off
// This only closes cardmodals - forces buttonclick to advance from
// consequences as I kept accidentally skipping them
window.onclick = function (event) {
    if (event.target.classList.contains("cardmodal")) {
        closeallmodals();
    }
}