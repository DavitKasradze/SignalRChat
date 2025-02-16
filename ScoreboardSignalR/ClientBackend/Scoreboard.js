"use strict";

let connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5000/scoreboardHub")
    .build();

connection.on("ReceiveScoreboardUpdate", (input) => {
    // Player 1 Section
    document.getElementById("clanPrefix1").innerText = input.clanPrefix1;
    document.getElementById("name1").innerText = input.name1;
    document.getElementById("score1").innerText = input.score1;
    document.getElementById("country1").innerText = input.country1;
    document.getElementById("upcomingCharacter1").innerText = input.character1;

    // Player 2 Section
    document.getElementById("clanPrefix2").innerText = input.clanPrefix2;
    document.getElementById("name2").innerText = input.name2;
    document.getElementById("score2").innerText = input.score2;
    document.getElementById("country2").innerText = input.country2;
    document.getElementById("upcomingCharacter2").innerText = input.character2;

    // Round and prize pool
    document.getElementById("currentRound").innerText = input.round;
    document.getElementById("prizePool").innerText = input.prizePool;

    // Upcoming match information
    document.getElementById("upcomingPrefix1").innerText = input.upcomingPrefix1;
    document.getElementById("upcomingName1").innerText = input.upcomingName1;
    document.getElementById("upcomingCountry1").innerText = input.upcomingCountry1;

    document.getElementById("upcomingPrefix2").innerText = input.upcomingPrefix2;
    document.getElementById("upcomingName2").innerText = input.upcomingName2;
    document.getElementById("upcomingCountry2").innerText = input.upcomingCountry2;

    document.getElementById("upcomingRound").innerText = input.upcomingRound;
});


connection.start().catch(err => console.error(err));