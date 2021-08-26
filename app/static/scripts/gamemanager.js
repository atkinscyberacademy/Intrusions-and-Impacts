// Master game management script

// Define global variables
let rawdata = {};               // Raw immutable object containing JSON data
let threatassessdata = [];      // Raw immutable object containing threat_assessment.JSON data
let cardpositionmaster = {};    // Lookup table (Card ID Number --> Position as string (can be 'unstaged', 'staged' or 'played'))
let gamelog = {};               // Log of cardids played each turn

const budgeteachturn = 100000;  // Funding to be allocated each turn (extra carries over)
let currentbudget = 0;          // Current budget (including rollover)

const maxturns = 4;             // Turns to run before forcing endgame (may be unneeded due to causesEnd in JSON)
let turn = 0;                   // Current turn

let currentscore = 0;           // Current score (impacted by scoredeltas)
let currentimprovements = []    // A log of the current, most recommended improvements

// Gets JSON and builds required data structures on game start
function initialise() {
    var request = new XMLHttpRequest();
    request.open("GET", "defences.json", false);
    request.send(null)
    rawdata = JSON.parse(request.responseText);
    Object.values(rawdata).forEach(element => {
        let id = element.id;
        cardpositionmaster[id] = "unstaged";
    });
    var request1 = new XMLHttpRequest();
    request1.open("GET", "threat_assessment.json", false);
    request1.send(null)
    threatassessdata = JSON.parse(request1.responseText);
    currentbudget = budgeteachturn;
    recalculatecost();
    closeallmodals();
}

// Use card posn master to calculate cost of staged cards, current budget
// Also updates display to reflect calculated result
function recalculatecost() {
    let accumulator = 0;
    for (const idno in cardpositionmaster) {
        const loc = cardpositionmaster[idno];
        if (loc == "staged") {
            const cardcost = rawdata[idno].cost;
            accumulator += cardcost;
        }
    }
    console.log("[+] Total cost of staged cards: " + accumulator);
    const moneyleft = currentbudget - accumulator;
    document.getElementById("budget").innerHTML = moneyformat(moneyleft);
    let budgetdisplay = document.getElementById("budget");
    if (moneyleft < 0) {
        budgetdisplay.classList.remove("funded");
        budgetdisplay.classList.add("underfunded");
    } else {
        budgetdisplay.classList.remove("underfunded");
        budgetdisplay.classList.add("funded");
    }
}

function endgame() {
    // Calculate final score
    console.log("[*] Endgame reached, final score " + currentscore);

    // Use score to generate conclusion from conclusions.json
    var request = new XMLHttpRequest();
    request.open("GET", "conclusions.json", false);
    request.send(null)
    const concldata = JSON.parse(request.responseText);

    let concl = {};
    if (currentscore < -1300) {
        concl = concldata["0"];
    } else if (currentscore < 800) {
        concl = concldata["1"];
    } else if (currentscore < 1100) {
        concl = concldata["2"];
    } else if (currentscore < 1500) {
        concl = concldata["3"];
    } else if (currentscore < 1900) {
        concl = concldata["4"];
    } else if (currentscore < 2150) {
        concl = concldata["5"];
    } else {
        concl = concldata["0"];
    }

    // Show final conclusion modal
    showconclusion(concl, () => {
        // If user clicks 'review board', set board up for review
        // Disable card movement
        Object.keys(cardpositionmaster).forEach(idno => {
            if (cardpositionmaster[idno] != "played") {
                let modalid = "card" + idno + "modal";
                let modal = document.getElementById(modalid);
                modal.getElementsByClassName("togglestage")[0].remove();
                document.getElementById("card" + idno).setAttribute('draggable', false);
            }
        });

        // Remove the play button
        document.getElementById("playbutton").remove();
        document.getElementById("budget").style.marginBottom = "70px";

        // Remove turn counter
        document.getElementById("turndisplay").innerHTML = "Game Over";

        // Then remove the conclusion modal
        closeallmodals();

        // END OF MAIN CLIENT-SIDE SCRIPT EXECUTION
        console.log("[*] Main script execution complete");

        // Display gamelog
        console.log(gamelog);
    });
}

function showconclusion(concl, callback) {
    // Generate modal content
    const modalroot = document.getElementById("conclusionmodalroot");

    // Wipe existing content in the conclusion modal
    modalroot.innerHTML = ""

    // Generate conclusion from concl argument
    const stingerelement = document.createElement("p");
    stingerelement.classList.add("stinger");
    const stingertext = document.createTextNode("You have completed your tenure as Head of Cyber Security at AquaVolt Power. " + concl["stinger"]);
    stingerelement.appendChild(stingertext);
    modalroot.appendChild(stingerelement);

    const scoretitleelement = document.createElement("p");
    scoretitleelement.classList.add("stinger");
    const scoretitletext = document.createTextNode("Your final score:");
    scoretitleelement.appendChild(scoretitletext);
    modalroot.appendChild(scoretitleelement);

    let goodorbad = "";
    if (currentscore > 1500 && currentscore < 2150) {
        goodorbad = "good";
    } else {
        goodorbad = "bad";
    }

    const conclscoreelement = document.createElement("p");
    conclscoreelement.classList.add("conclscore");
    conclscoreelement.classList.add(goodorbad);
    const conclscoretext = document.createTextNode(currentscore);
    conclscoreelement.appendChild(conclscoretext);
    modalroot.appendChild(conclscoreelement);

    const concltextelement = document.createElement("p");
    concltextelement.classList.add("info-body-text")
    const concltexttext = document.createTextNode(concl["text"]);
    concltextelement.appendChild(concltexttext);
    modalroot.appendChild(concltextelement);

    // Display image if present
    if (concl["image"]) {
        const imageelement = document.createElement("img");
        imageelement.classList.add("conclimage");
        imageelement.src = "/images/conclusions/" + concl["image"];
        imageelement.alt = "Image emphasising conclusion";
        modalroot.appendChild(imageelement);
    }

    // Display improvements
    const impsting = document.createElement("p");
    impsting.classList.add("stinger");
    const impstingtext = document.createTextNode("Here's what you could've done better:");
    impsting.appendChild(impstingtext);
    modalroot.appendChild(impsting);
    
    currentimprovements.forEach(improvement => {
        const impelement = document.createElement("p");
        impelement.classList.add("info-body-text")
        const imptext = document.createTextNode(improvement["description"]);
        impelement.appendChild(imptext);
        modalroot.appendChild(impelement);
    });


    // Display buttons
    const btndiv = document.createElement("div");
    btndiv.classList.add("modallinkspace");
    const homebtnelement = document.createElement("a");
    const reviewbtnelement = document.createElement("p");
    homebtnelement.href = "/";
    homebtnelement.classList.add("modallink");
    reviewbtnelement.classList.add("modallink");
    const homebtntext = document.createTextNode("Home");
    const reviewbtntext = document.createTextNode("Review board");
    homebtnelement.appendChild(homebtntext);
    reviewbtnelement.appendChild(reviewbtntext);
    btndiv.appendChild(homebtnelement);
    btndiv.appendChild(reviewbtnelement);
    modalroot.appendChild(btndiv);

    // Display modal
    document.getElementById("endgamemodal").style.display = "block";
    document.getElementById("endgamemodal").scrollTop = 0;
    console.log("[+] Conclusion modal rendered, waiting for user input");

    // Set up event listeners if the user clicks either button
    homebtnelement.addEventListener("click", function homebtn(e) {
        if (!confirm('Are you sure you want to leave the page?')) {
            e.preventDefault();
        }
    }, false);

    reviewbtnelement.addEventListener("click", function reviewbtn(e) {
        reviewbtnelement.removeEventListener("click", reviewbtn, false);
        callback();
    }, false);
}