"use strict";

let connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5000/scoreboardHub")
    .build();


document.getElementById("updateScoreboard").addEventListener("click", () => {
    const scoreboardInput = {
        clanPrefixOne: document.getElementById("clanPrefixOne").value,
        nameOne: document.getElementById("nameOne").value,
        scoreOne: parseInt(document.getElementById("scoreOne").value) || 0,
        countryOne: document.getElementById("countryOne").value,
        upcomingCharacterOne: document.getElementById("upcomingCharacterOne").value,
        clanPrefixTwo: document.getElementById("clanPrefixTwo").value,
        nameTwo: document.getElementById("nameTwo").value,
        scoreTwo: parseInt(document.getElementById("scoreTwo").value) || 0,
        countryTwo: document.getElementById("countryTwo").value,
        upcomingCharacterTwo: document.getElementById("upcomingCharacterTwo").value,
        currentRound: document.getElementById("currentRound").value,
        prizePool: document.getElementById("prizePool").value,
        upcomingPrefixOne: document.getElementById("upcomingPrefixOne").value,
        upcomingNameOne: document.getElementById("upcomingNameOne").value,
        upcomingCountryOne: document.getElementById("upcomingCountryOne").value,
        upcomingPrefixTwo: document.getElementById("upcomingPrefixTwo").value,
        upcomingNameTwo: document.getElementById("upcomingNameTwo").value,
        upcomingCountryTwo: document.getElementById("upcomingCountryTwo").value,
        upcomingRound: document.getElementById("upcomingRound").value 
    };

    connection.invoke("UpdateScoreboard", scoreboardInput)
        .catch(err => console.error(err));
});

connection.start().catch(err => console.error(err));