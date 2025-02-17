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

connection.on("ReceiveScoreboardUpdate", (input) => {
    function updateElement(id, value) {
        let element = document.getElementById(id);
        if (element) {
            element.style.transition = 'opacity 0.5s';
            element.style.opacity = '0';
            if (value.length > 10) {
                element.style.fontSize = '16px';
            }
            
            setTimeout(() => {
                if (id === 'scoreOne' ||id === 'scoreTwo'){
                    element.innerText = value;
                }
                element.innerText = String(value).toUpperCase(); 
                element.style.opacity = '1'; 
            }, 500);
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
