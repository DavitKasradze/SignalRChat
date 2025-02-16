"use strict";

let connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5000/scoreboardHub")
    .build();

connection.on("ReceiveScoreboardUpdate", (input) => {
    // Player 1 Section
    document.getElementById("clanPrefixOne").innerText = input.clanPrefix1;
    document.getElementById("nameOne").innerText = input.name1;
    document.getElementById("scoreOne").innerText = input.score1;
    document.getElementById("countryOne").innerText = input.country1;
    document.getElementById("upcomingCharacterOne").innerText = input.character1;

    // Player 2 Section
    document.getElementById("clanPrefixTwo").innerText = input.clanPrefix2;
    document.getElementById("nameTwo").innerText = input.name2;
    document.getElementById("scoreTwo").innerText = input.score2;
    document.getElementById("countryTwo").innerText = input.country2;
    document.getElementById("upcomingCharacterTwo").innerText = input.character2;

    // Round and prize pool
    document.getElementById("currentRound").innerText = input.round;
    document.getElementById("prizePool").innerText = input.prizePool;

    // Upcoming match information
    document.getElementById("upcomingPrefixOne").innerText = input.upcomingPrefix1;
    document.getElementById("upcomingNameOne").innerText = input.upcomingName1;
    document.getElementById("upcomingCountryOne").innerText = input.upcomingCountry1;

    document.getElementById("upcomingPrefixTwo").innerText = input.upcomingPrefix2;
    document.getElementById("upcomingNameTwo").innerText = input.upcomingName2;
    document.getElementById("upcomingCountryTwo").innerText = input.upcomingCountry2;

    document.getElementById("upcomingRound").innerText = input.upcomingRound;
});


connection.start().catch(err => console.error(err));