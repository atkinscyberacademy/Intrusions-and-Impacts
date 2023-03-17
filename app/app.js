// INITIAL PROGRAM SETUP ------------------------------------------------------
// Import required libraries
const express = require("express");
const app = express();
const nunjucks = require("nunjucks");

// Load game data from JSON
const gamedata = require(__dirname + "/static/defences.json");

// Configure Express and Nunjucks
app.use(express.static(__dirname + "/static/"));
let nunconf = nunjucks.configure(__dirname + "/templates/", {
    autoescape: true,
    express: app
});

// Add custom filter to the Nunjucks environment
// to enable displaying ints with a comma every 3 values
// Regex help from https://stackoverflow.com/a/2901298
nunconf.addFilter("moneycomma", (input) => {
    return input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
});

// Set port to 3000
const PORT = process.env.PORT;

// ROUTES ---------------------------------------------------------------------
app.get("/", (req, res) => {
    return res.render("home.html.njk");
});

app.get("/game", (req, res) => {
    return res.render("game.html.njk", {
        defences: Object.values(gamedata)
    });
});

app.get("/howtoplay", (req, res) => {
    return res.render("howtoplay.html.njk");
});

app.get("/about", (req, res) => {
    return res.render("about.html.njk");
});

// HOST HTTP SERVER -----------------------------------------------------------
app.listen(PORT, () => {
    console.log("[+] Server listening on port " + PORT);
});
