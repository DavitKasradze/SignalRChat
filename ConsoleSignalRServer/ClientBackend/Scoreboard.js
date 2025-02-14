const connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5000/scoreboardHub")
    .build();

connection.on("ReceiveScoreboardUpdate", (scoreboardData) => {
    for (let key in scoreboardData) {
        const fieldElement = document.getElementById(key);
        if (fieldElement) {
            fieldElement.textContent = scoreboardData[key];
        }
    }
});

connection.start().catch(err => console.error(err));