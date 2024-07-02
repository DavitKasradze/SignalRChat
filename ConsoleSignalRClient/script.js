"use strict";

var connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5000/messageHub")
    .build();

var messageList = document.getElementById("messageList");
var sendButton = document.getElementById("sendButton");
var messageInput = document.getElementById("messageInput");
var usernameInput = document.getElementById("username");
var roomNameInput = document.getElementById("roomName");
var currentRoomName = document.getElementById("currentRoomName");
var roomList = document.getElementById("roomList");
var memberList = document.getElementById("memberList");
var createRoomButton = document.getElementById("createRoomButton");
var deleteRoomButton = document.getElementById("deleteRoomButton");
var registerButton = document.getElementById("registerButton");
var joinRoomButton = document.getElementById("joinRoomButton");
var removeMemberButton = document.getElementById("removeMemberButton");
var removeMemberInput = document.getElementById("removeMemberInput");
var memberActions = document.querySelector('.member-actions');

var currentRoom = null;
var messages = {};
var members = {};
var roomOwners = {};

messageInput.disabled = true;
sendButton.disabled = true;


sendButton.addEventListener("click", function () {
    sendMessage();
});

createRoomButton.addEventListener("click", function () {
    createRoom();
});

deleteRoomButton.addEventListener("click", function () {
    deleteRoom();
});

registerButton.addEventListener("click", function () {
    registerUser();
});

joinRoomButton.addEventListener("click", function () {
    joinRoom();
});

removeMemberButton.addEventListener("click", function () {
    removeMember();
});

connection.on("ReceiveMessage", function (message) {
    var roomName = message.roomName;
    var content = message.content;

    if (!messages[roomName]) {
        messages[roomName] = [];
    }
    messages[roomName].push(content);

    if (roomName === currentRoom) {
        displayMessages(roomName);
    }
});

connection.on("RoomCreated", function (roomName, owner) {
    addRoomToList(roomName);
    members[roomName] = [];
    updateMemberList(roomName);
    roomOwners[roomName] = owner;
    updateUIOnRoomSelection(usernameInput.value, roomName);

    if (owner) {
        alert(`Room "${roomName}" created by ${owner}`);
    }
});


connection.on("ReceiveRoomMember", function (roomName, roomMembers) {
    members[roomName] = roomMembers;
    updateMemberList(roomName);
    if (!roomOwners[roomName] && roomMembers.length > 0) {
        roomOwners[roomName] = roomMembers[0];
    }
});

connection.on("RoomDeleted", function (roomName) {
    removeRoomFromList(roomName);
    if (currentRoom === roomName) {
        currentRoom = null;
        currentRoomName.textContent = "";
        messageList.innerHTML = "";
        memberList.innerHTML = "";
        memberActions.style.display = 'none';
    }
});

connection.on("AllRooms", function (rooms) {
    rooms.forEach(function (room) {
        addRoomToList(room);
    });
});

connection.on("ReceiveExistingMessages", function (roomName, existingMessages) {
    messages[roomName] = existingMessages;
    if (roomName === currentRoom) {
        displayMessages(roomName);
    }
});

connection.on("ErrorMessage", function (errorMessage) {
    alert(errorMessage);
});

connection.start()
    .then(function () {
    })
    .catch(function (err) {
        console.error(err.toString());
    });

connection.onclose(function () {
    console.log("Disconnected from SignalR server");
    alert("You have been disconnected from the server.");
});

function registerUser() {
    var user = usernameInput.value;

    if (connection.state === signalR.HubConnectionState.Connected && user) {
        connection.invoke("RegisterUser", user)
            .catch(function (err) {
                console.error(err.toString());
            });
    } else {
        console.error("Connection is not in 'Connected' state, or username is empty.");
    }
}

function sendMessage() {
    var user = usernameInput.value;
    var message = messageInput.value;
    var roomName = currentRoom;

    if (connection.state === signalR.HubConnectionState.Connected && roomName && user && message) {
        connection.invoke("SendMessageToRoom", roomName, user, message)
            .catch(function (err) {
                console.error(err.toString());
            });
    } else {
        console.error("Connection is not in 'Connected' state, or no room selected, or username/message is empty.");
    }
}

function joinRoom() {
    var user = usernameInput.value;
    var roomName = currentRoomName.textContent;

    if (connection.state === signalR.HubConnectionState.Connected && user && roomName) {
        connection.invoke("JoinRoom", user, roomName)
            .then(function () {
                messageInput.disabled = false;
                sendButton.disabled = false;
                addRoomToList(roomName);
                switchRoom(roomName);
                updateUIOnRoomSelection(user, roomName);
            })
            .catch(function (err) {
                console.error(err.toString());
            });
    } else {
        console.error("Connection is not in 'Connected' state, or username/room name is empty.");
    }
}

function createRoom() {
    var user = usernameInput.value;
    var roomName = roomNameInput.value;

    if (connection.state === signalR.HubConnectionState.Connected && user && roomName) {
        connection.invoke("CreateRoom", user, roomName)
            .then(function () {
                joinRoomInternal(user, roomName);
            })
            .catch(function (err) {
                console.error(err.toString());
            });
    } else {
        console.error("Connection is not in 'Connected' state, or username/room name is empty.");
    }
}

function joinRoomInternal(user, roomName) {
    connection.invoke("JoinRoom", user, roomName)
        .then(function () {
            currentRoom = roomName;
            currentRoomName.textContent = roomName;
            messageInput.disabled = false;
            sendButton.disabled = false;
            addRoomToList(roomName);
            switchRoom(roomName);
            updateUIOnRoomSelection(user, roomName);
        })
        .catch(function (err) {
            console.error(err.toString());
        });
}


function deleteRoom() {
    var user = usernameInput.value;
    var roomName = roomNameInput.value;

    if (connection.state === signalR.HubConnectionState.Connected && user && roomName) {
        connection.invoke("DeleteRoom", user, roomName)
            .catch(function (err) {
                console.error(err.toString());
            });
    } else {
        console.error("Connection is not in 'Connected' state, or username/room name is empty.");
    }
}

function removeMember() {
    var user = usernameInput.value;
    var roomName = currentRoom;
    var memberToRemove = removeMemberInput.value;

    if (connection.state === signalR.HubConnectionState.Connected && roomName && user && memberToRemove) {
        connection.invoke("RemoveMember", user, roomName, memberToRemove)
            .catch(function (err) {
                console.error(err.toString());
            });
    } else {
        console.error("Connection is not in 'Connected' state, or no room selected, or username/member to remove is empty.");
    }
}

function switchRoom(roomName) {
    currentRoom = roomName;
    currentRoomName.textContent = roomName;
    displayMessages(roomName);
    updateMemberList(roomName);
    updateUIOnRoomSelection(usernameInput.value, roomName);

    var isJoined = members[currentRoom] && members[currentRoom].includes(usernameInput.value);
    document.getElementById("joinRoomButtonContainer").style.display = isJoined ? "none" : "block";
}


function displayMessages(roomName) {
    messageList.innerHTML = '';

    var roomMessages = messages[roomName] || [];
    var maxMessagesToShow = 50;


    var startIndex = Math.max(roomMessages.length - maxMessagesToShow, 0);
    var displayedMessages = roomMessages.slice(startIndex);

    displayedMessages.forEach(function (message) {
        var li = document.createElement("li");


        if (message.includes(': ')) {
            var messageParts = message.split(': ');
            var sender = messageParts[0].trim();
            var messageContent = messageParts.slice(1).join(': ').trim();

            if (sender === roomOwners[roomName]) {
                li.innerHTML = `<span style="color: red;">${sender}</span>: ${messageContent}`;
            } else {
                li.innerHTML = `<span style="color: blue;">${sender}</span>: ${messageContent}`;
            }
        } else {
            li.textContent = message;
        }

        messageList.appendChild(li);
    });

    messageList.scrollTop = messageList.scrollHeight;
}

function addRoomToList(roomName) {
    if (document.getElementById(roomName)) {
        return;
    }

    var roomListItem = document.createElement("div");
    roomListItem.className = "roomListItem";
    roomListItem.textContent = roomName;
    roomListItem.id = roomName;
    roomListItem.onclick = function () {
        switchRoomUI(roomName);
    };
    roomList.appendChild(roomListItem);
}


function switchRoomUI(roomName) {
    currentRoom = roomName;
    currentRoomName.textContent = roomName;
    clearMessages();
    displayJoinRoomButton();

    var user = usernameInput.value;


    if (roomOwners[roomName] === user || (members[roomName] && members[roomName].includes(user))) {
        joinRoomInternal(user, roomName);
    } else {
        var isJoined = members[currentRoom] && members[currentRoom].includes(usernameInput.value);
        document.getElementById("joinRoomButtonContainer").style.display = isJoined ? "none" : "block";
    }
}


function clearMessages() {
    messageList.innerHTML = '';
}

function displayJoinRoomButton() {
    var joinRoomButtonContainer = document.getElementById("joinRoomButtonContainer");
    joinRoomButtonContainer.style.display = "block";
}

function removeRoomFromList(roomName) {
    var roomListItem = document.getElementById(roomName);
    if (roomListItem) {
        roomListItem.remove();
    }

    if (currentRoom === roomName) {
        currentRoom = null;
        currentRoomName.textContent = "";
        messageList.innerHTML = "";
        memberList.innerHTML = "";
        memberActions.style.display = 'none';
    }
}

function updateMemberList(roomName) {
    var roomMembers = members[roomName] || [];
    memberList.innerHTML = '';

    var maxMembersToShow = 20;

    var startIndex = Math.max(roomMembers.length - maxMembersToShow, 0);
    var displayedMembers = roomMembers.slice(startIndex);

    displayedMembers.forEach(function (member) {
        var li = document.createElement("li");
        li.textContent = member;

        if (member === roomOwners[roomName]) {
            li.classList.add("owner");
        } else {
            li.classList.add("member");
        }

        memberList.appendChild(li);
    });

    memberList.scrollTop = memberList.scrollHeight;
}


function updateUIOnRoomSelection(user, roomName) {
    var roomMembers = members[roomName] || [];

    var isMember = roomMembers.includes(user);

    if (isMember) {
        messageInput.disabled = false;
        sendButton.disabled = false;
    } else {
        messageInput.disabled = true;
        sendButton.disabled = true;
    }

    if (roomOwners[roomName] === user) {
        memberActions.style.display = 'block';
    } else {
        memberActions.style.display = 'none';
    }
}

messageInput.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        sendButton.click();
    }
});

roomNameInput.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        joinRoomButton.click();
    }
});

usernameInput.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        registerButton.click();
    }
});

removeMemberInput.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        removeMemberButton.click();
    }
});
