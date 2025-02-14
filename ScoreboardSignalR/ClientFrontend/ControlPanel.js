"use strict";

const connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5000/scoreboardHub")
    .build();

document.getElementById("updateScoreboard").addEventListener("click", () => {
    const scoreboardInput = {
        clanPrefix1: document.getElementById("clanPrefix1").value,
        name1: document.getElementById("name1").value,
        score1: parseInt(document.getElementById("score1").value) || 0,
        country1: document.getElementById("country1").value,
        character1: document.getElementById("character1").value,
        clanPrefix2: document.getElementById("clanPrefix2").value,
        name2: document.getElementById("name2").value,
        score2: parseInt(document.getElementById("score2").value) || 0,
        country2: document.getElementById("country2").value,
        character2: document.getElementById("character2").value,
        round: document.getElementById("round").value,
        upcoming1: document.getElementById("upcoming1").value,
        upcoming2: document.getElementById("upcoming2").value,
        prizePool: document.getElementById("prizePool").value
    };

    connection.invoke("UpdateScoreboard", scoreboardInput)
        .catch(err => console.error(err));
});

connection.start().catch(err => console.error(err));