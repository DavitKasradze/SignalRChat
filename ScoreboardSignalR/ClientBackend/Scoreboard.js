"use strict";

const connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5000/scoreboardHub")
    .build();

connection.on("ReceiveScoreboardUpdate", (input) => {
    document.getElementById("clanPrefix1").textContent = input.clanPrefix1;
    document.getElementById("name1").textContent = input.name1;
    document.getElementById("score1").textContent = input.score1;
    document.getElementById("country1").textContent = input.country1;
    document.getElementById("character1").textContent = input.character1;

    document.getElementById("clanPrefix2").textContent = input.clanPrefix2;
    document.getElementById("name2").textContent = input.name2;
    document.getElementById("score2").textContent = input.score2;
    document.getElementById("country2").textContent = input.country2;
    document.getElementById("character2").textContent = input.character2;

    document.getElementById("round").textContent = input.round;

    document.getElementById("upcoming1").textContent = input.upcoming1;
    document.getElementById("upcoming2").textContent = input.upcoming2;

    document.getElementById("prizePool").textContent = input.prizePool;
});

connection.start().catch(err => console.error(err));