"use strict";

let connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5000/scoreboardHub")
    .build();

connection.start().then(() => {
    console.log("Connection established");
    
    connection.invoke("LoadSavedData")
        .catch(err => console.error(err));
}).catch(err => {
    console.error("Connection failed: ", err);
});

connection.on("ReceiveInitialData", (input) => {
    // Handle the received initial data and update the UI
    document.getElementById("clanPrefixOne").innerText = input.clanPrefixOne || '';
    document.getElementById("nameOne").innerText = input.nameOne || '';
    document.getElementById("scoreOne").innerText = input.scoreOne || '';
    document.getElementById("countryOne").innerText = input.countryOne || '';

    document.getElementById("clanPrefixTwo").innerText = input.clanPrefixTwo || '';
    document.getElementById("nameTwo").innerText = input.nameTwo || '';
    document.getElementById("scoreTwo").innerText = input.scoreTwo || '';
    document.getElementById("countryTwo").innerText = input.countryTwo || '';

    document.getElementById("currentRound").innerText = input.currentRound || '';
    document.getElementById("prizePool").innerText = input.prizePool || '';

    document.getElementById("upcomingPrefixOne").innerText = input.upcomingPrefixOne || '';
    document.getElementById("upcomingNameOne").innerText = input.upcomingNameOne || '';
    document.getElementById("upcomingCountryOne").innerText = input.upcomingCountryOne || '';
    document.getElementById("upcomingCharacterOne").innerText = input.upcomingCharacterOne || '';

    document.getElementById("upcomingPrefixTwo").innerText = input.upcomingPrefixTwo || '';
    document.getElementById("upcomingNameTwo").innerText = input.upcomingNameTwo || '';
    document.getElementById("upcomingCountryTwo").innerText = input.upcomingCountryTwo || '';
    document.getElementById("upcomingCharacterTwo").innerText = input.upcomingCharacterTwo || '';

    document.getElementById("upcomingRound").innerText = input.upcomingRound || '';
});
connection.on("ReceiveScoreboardUpdate", (input) => {
    function updateElement(id, value) {
        let element = document.getElementById(id);
        if (element) {
            element.style.opacity = '0';
            
            element.innerText = value;
            
            setTimeout(() => {
                element.style.transition = 'opacity 0.5s';
                element.style.opacity = '1';
            }, 1000);
        }
    }

    // Player 1
    updateElement("clanPrefixOne", input.clanPrefixOne);
    updateElement("nameOne", input.nameOne);
    updateElement("scoreOne", input.scoreOne);
    updateElement("countryOne", input.countryOne);

    // Player 2
    updateElement("clanPrefixTwo", input.clanPrefixTwo);
    updateElement("nameTwo", input.nameTwo);
    updateElement("scoreTwo", input.scoreTwo);
    updateElement("countryTwo", input.countryTwo);

    // Round & Prize Pool
    updateElement("currentRound", input.currentRound);
    updateElement("prizePool", input.prizePool);

    // Upcoming Match
    updateElement("upcomingPrefixOne", input.upcomingPrefixOne);
    updateElement("upcomingNameOne", input.upcomingNameOne);
    updateElement("upcomingCountryOne", input.upcomingCountryOne);
    updateElement("upcomingCharacterOne", input.upcomingCharacterOne);

    updateElement("upcomingPrefixTwo", input.upcomingPrefixTwo);
    updateElement("upcomingNameTwo", input.upcomingNameTwo);
    updateElement("upcomingCountryTwo", input.upcomingCountryTwo);
    updateElement("upcomingCharacterTwo", input.upcomingCharacterTwo);

    updateElement("upcomingRound", input.upcomingRound);
});
