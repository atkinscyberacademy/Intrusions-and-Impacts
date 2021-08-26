// Card movement controller
// Functions to change the location of cards representationally

// If card is currently unstaged, stage it
// If card is currently staged, unstage it
function togglestage(idno) {
    if (cardpositionmaster[idno] == "unstaged") {
        stagecard(idno);
    } else if (cardpositionmaster[idno] == "staged") {
        unstagecard(idno);
    } else {
        console.log("[*] Card neither staged nor unstaged - taking no action.");
    }
    closeallmodals();
}

// Stage card
// Move card element
// Modify root data structure
// Modify innerhtml on card popup modal move button
function stagecard(idno) {
    console.log("[+] Staging card " + idno);
    cardpositionmaster[idno] = "staged";
    let modalid = "card" + idno + "modal";
    let modal = document.getElementById(modalid);
    modal.getElementsByClassName("togglestage")[0].innerHTML = "Remove card";
    let source = document.getElementById("card" + idno);
    document.getElementById("stageddeck").appendChild(source);
    recalculatecost();
}

function unstagecard(idno) {
    console.log("[-] Unstaging card " + idno);
    cardpositionmaster[idno] = "unstaged";
    let modalid = "card" + idno + "modal";
    let modal = document.getElementById(modalid);
    modal.getElementsByClassName("togglestage")[0].innerHTML = "Play card";
    let source = document.getElementById("card" + idno);
    document.getElementById("unstageddeck").appendChild(source);
    recalculatecost();
}

function playcard(idno) {
    console.log("[*] Playing card " + idno);
    cardpositionmaster[idno] = "played";
    let modalid = "card" + idno + "modal";
    let modal = document.getElementById(modalid);
    modal.getElementsByClassName("togglestage")[0].remove();
    let source = document.getElementById("card" + idno);
    document.getElementById("playeddeck").appendChild(source);
    source.setAttribute('draggable', false);
}