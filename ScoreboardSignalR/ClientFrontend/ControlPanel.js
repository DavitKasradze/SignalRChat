"use strict";

let connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5000/scoreboardHub")
    .build();


document.getElementById("updateScoreboard").addEventListener("click", () => {
    const scoreboardInput = {
        clanPrefix1: document.getElementById("clanPrefix1").value,
        name1: document.getElementById("name1").value,
        score1: parseInt(document.getElementById("score1").value) || 0,
        country1: document.getElementById("country1").value,
        character1: document.getElementById("upcomingCharacter1").value,
        clanPrefix2: document.getElementById("clanPrefix2").value,
        name2: document.getElementById("name2").value,
        score2: parseInt(document.getElementById("score2").value) || 0,
        country2: document.getElementById("country2").value,
        character2: document.getElementById("upcomingCharacter2").value,
        round: document.getElementById("round").value,
        prizePool: document.getElementById("prizePool").value,
        upcomingPrefix1: document.getElementById("upcomingPrefix1").value,
        upcomingName1: document.getElementById("upcomingName1").value,
        upcomingCountry1: document.getElementById("upcomingCountry1").value,
        upcomingPrefix2: document.getElementById("upcomingPrefix2").value,
        upcomingName2: document.getElementById("upcomingName2").value,
        upcomingCountry2: document.getElementById("upcomingCountry2").value,
        upcomingRound: document.getElementById("upcomingRound").value // Added upcoming round
    };

    connection.invoke("UpdateScoreboard", scoreboardInput)
        .catch(err => console.error(err));
});

connection.start().catch(err => console.error(err));