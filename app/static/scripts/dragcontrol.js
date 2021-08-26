// Drag and Drop controller
// Triggers dropzone popups and calls passthrough functions on drop

function dragStart(ev) {
    let idno = ev.target.id.substring(4);
    ev.dataTransfer.setData("text", idno);
    document.getElementById("leftdrag").style.visibility = "visible";
    document.getElementById("stagedrag").style.visibility = "visible";
    console.log("[+] Began dragging card " + idno);
}

function dragStop(ev) {
    let idno = ev.target.id.substring(4);
    document.getElementById("leftdrag").style.visibility = "hidden";
    document.getElementById("stagedrag").style.visibility = "hidden";
    console.log("[+] Finished dragging card " + idno);
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drop(ev) {
    ev.preventDefault();
    if (ev.target.classList.contains("droppable")) {
        let origin = ev.dataTransfer.getData("text");
        let siblings = ev.target.parentNode.children;
        for (var i = 0; i < siblings.length; i++) {
            let child = siblings.item(i);
            if (child.classList.contains("carddeck")) {
              if (child.id == "stageddeck") {
                  stagecard(origin);
              } else if (child.id == "unstageddeck") {
                  unstagecard(origin);
              } else {
                  console.log("[*] Card dropped into invalid space");
              }
            }        
        }
    }
}