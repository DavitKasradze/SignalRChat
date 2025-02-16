"use strict";

let connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5000/scoreboardHub")
    .build();

connection.on("ReceiveScoreboardUpdate", (input) => {
    function updateElement(id, value) {
        let element = document.getElementById(id);
        if (element) {
            element.innerText = value;
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


connection.start().catch(err => console.error(err));