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
var createTemporaryRoomButton = document.getElementById("createTemporaryRoomButton");
var roomDurationInput = document.getElementById("roomDuration");
var joinRoomButtonContainer = document.getElementById("joinRoomButtonContainer")
const openRoomContainerButton = document.getElementById('openRoomContainerButton');
const roomContainer = document.getElementById('roomContainer');
const temporaryRoomContainer = document.getElementById('temporaryRoomContainer');
var memberActions = document.querySelector('.member-actions');

var currentRoom = null;
var messages = {};
var members = {};
var roomOwners = {};

messageInput.disabled = true;
sendButton.disabled = true;


sendButton.addEventListener("click", async function () {
    await sendMessage();
});

createRoomButton.addEventListener("click", async function () {
    await createRoom();
});

deleteRoomButton.addEventListener("click", async function () {
    await deleteRoom();
});

registerButton.addEventListener("click", async () => {
    await registerUser();
});

joinRoomButton.addEventListener("click", async function () {
    await joinRoom();
});

removeMemberButton.addEventListener("click", async function () {
    await removeMember();
});

createTemporaryRoomButton.addEventListener("click", async function () {
    await createTemporaryRoom();
});

openRoomContainerButton.addEventListener('click', function() {
    displayRoomContainer();
});


connection.on("ReceiveMessage", async function (message) {
    var roomName = message.roomName;
    var content = message.content;

    if (!messages[roomName]) {
        messages[roomName] = [];
    }
    messages[roomName].push(content);

    if (roomName === currentRoom) {
        await displayMessages(roomName);
    }
});

connection.on("RoomCreated", async function (roomName, owner) {
    await addRoomToList(roomName);
    alert(`Room "${roomName}" created by ${owner}`);
    members[roomName] = [];
    await updateMemberList(roomName);
    roomOwners[roomName] = owner;
    await updateUIOnRoomSelection(usernameInput.value, roomName);
});


connection.on("ReceiveRoomMember", async function (roomName, roomMembers) {
    members[roomName] = roomMembers;
    await updateMemberList(roomName);
    if (!roomOwners[roomName] && roomMembers.length > 0) {
        roomOwners[roomName] = roomMembers[0];
    }
});

connection.on("RoomDeleted", async function (roomName) {
    await removeRoomFromList(roomName);

    if (currentRoom === roomName) {
        currentRoom = null;
        currentRoomName.textContent = "";
        messageList.innerHTML = "";
        memberList.innerHTML = "";
        memberActions.style.display = 'none';
    }
});

connection.on("AllRooms", function (rooms) {
    roomList.innerHTML = "";
    rooms.forEach(function (room) {
        addRoomToList(room);
    });
});

connection.on("ReceiveExistingMessages", async function (roomName, existingMessages) {
    messages[roomName] = existingMessages;
    if (roomName === currentRoom) {
        await displayMessages(roomName);
    }
});

connection.on("UserRegistered", async (username) => {
    document.getElementById("registerRoomForm").style.display = "none";
    document.getElementById("roomListContainer").style.display = "flex";
    document.getElementById("messageContainer").style.display = "flex";

    // document.getElementById("displayUsername").textContent = username.toUpperCase();
    // document.getElementById("welcomeMessage").style.display = "flex";
    console.log(`${username} registered successfully.`);
    await fetchRooms();
});

connection.on("UserAlreadyRegistered", async (username) => {
    document.getElementById("registerRoomForm").style.display = "none";
    document.getElementById("roomListContainer").style.display = "flex";
    document.getElementById("messageContainer").style.display = "flex";

    // document.getElementById("displayUsername").textContent = username.toUpperCase();
    // document.getElementById("welcomeMessage").style.display = "flex";
    console.log(`${username} already registered.`);
    await fetchRooms();
});

connection.on("ErrorMessage", function (errorMessage) {
    alert(errorMessage);
});

connection.start()
    .then(async function () {
        await fetchRooms();
    })
    .catch(function (err) {
        console.error(err.toString());
    });

connection.onclose(function () {
    console.log("Disconnected from SignalR server");
    alert("You have been disconnected from the server.");
});

async function fetchRooms() {
    try {
        await connection.invoke("GetAllRooms");
    } catch (err) {
        console.error(err.toString());
    }
}

function sendMessage() {
    var user = usernameInput.value;
    var message = messageInput.value;
    var roomName = currentRoom;

    if (connection.state === signalR.HubConnectionState.Connected && roomName && user && message) {
        connection.invoke("SendMessageToRoom", roomName, user, message)
            .then(async function () {
                messageInput.value = '';
            })
            .catch(function (err) {
                console.error(err.toString());
            });
    } else {
        console.error("Connection is not in 'Connected' state, or no room selected, or username/message is empty.");
    }
}

async function registerUser() {
    var username = usernameInput.value;
    await connection.invoke("RegisterUser", username)
        .catch(err => {
            console.error(err.toString());
        });
}

function joinRoom() {
    var user = usernameInput.value;
    var roomName = currentRoomName.textContent;

    if (connection.state === signalR.HubConnectionState.Connected && user && roomName) {
        connection.invoke("JoinRoom", user, roomName)
            .then(async function () {
                messageInput.disabled = false;
                sendButton.disabled = false;
                await addRoomToList(roomName);
                await switchRoom(roomName);
                await updateUIOnRoomSelection(user, roomName);
            })
            .catch(function (err) {
                console.error(err.toString());
            });
    } else {
        console.error("Connection is not in 'Connected' state, or username/room name is empty.");
    }
}

async function createRoom() {
    displayMain();
    var user = usernameInput.value;
    var roomName = roomNameInput.value;

    if (connection.state === signalR.HubConnectionState.Connected && user && roomName) {
        connection.invoke("CreateRoom", user, roomName)
            .then(async function () {
                await joinRoomInternal(user, roomName);
                await updateMemberList(roomName);
                await displayMessages(roomName);
                roomNameInput.value = '';
            })
            .catch(function (err) {
                console.error(err.toString());
            });
    } else {
        console.error("Connection is not in 'Connected' state, or username/room name is empty.");
    }
}

async function createTemporaryRoom() {
    displayMain();
    var user = usernameInput.value;
    var timer = Number(roomDurationInput.value);
    var roomName = roomNameInput.value;

    if (connection.state === signalR.HubConnectionState.Connected && user && roomName && timer) {
        connection.invoke("CreateRoom", user, roomName).then(async function () {
            await joinRoomInternal(user, roomName);
            await updateMemberList(roomName);
            await displayMessages(roomName);
            await scheduledRoomRemoval(user, roomName, timer);
            roomDurationInput.value = '';
            roomNameInput.value = '';
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
        .then(async function () {
            currentRoom = roomName;
            currentRoomName.textContent = roomName;
            messageInput.disabled = false;
            sendButton.disabled = false;
            await addRoomToList(roomName);
            await switchRoom(roomName);
            await updateUIOnRoomSelection(user, roomName);
        })
        .catch(function (err) {
            console.error(err.toString());
        });
}


function deleteRoom() {
    displayMain();
    var user = usernameInput.value;
    var roomName = roomNameInput.value;

    if (connection.state === signalR.HubConnectionState.Connected && user && roomName) {
        connection.invoke("DeleteRoom", user, roomName)
            .then(async function () {
                joinRoomButtonContainer.style.display = "none";
                messageInput.disabled = true;
                sendButton.disabled = true;
            })
            .catch(function (err) {
                console.error(err.toString());
            });
    } else {
        console.error("Connection is not in 'Connected' state, or username/room name is empty.");
    }
}

async function removeMember() {
    var user = usernameInput.value;
    var roomName = currentRoom;
    var memberToRemove = removeMemberInput.value;

    if (connection.state === signalR.HubConnectionState.Connected && roomName && user && memberToRemove) {
        await connection.invoke("RemoveMember", user, roomName, memberToRemove).then(async function () {
            await updateMemberList(roomName);
            removeMemberInput.value = '';
        })
            .catch(function (err) {
                console.error(err.toString());
            });
    } else {
        console.error("Connection is not in 'Connected' state, or no room selected, or username/member to remove is empty.");
    }
}

async function switchRoom(roomName) {
    displayMain();
    currentRoom = roomName;
    currentRoomName.textContent = roomName;
    await displayMessages(roomName);
    await updateMemberList(roomName);
    await updateUIOnRoomSelection(usernameInput.value, roomName);

    var isJoined = members[currentRoom] && members[currentRoom].includes(usernameInput.value);
    joinRoomButtonContainer.style.display = isJoined ? "none" : "block";
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

            li.textContent = `${sender}: ${messageContent}`;
            
            if (sender === usernameInput.value) {
                li.classList.add('user-message');
            } else {
                li.classList.add('other-message');
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

    var roomListItem = document.createElement("button");
    roomListItem.className = "roomListItem";
    roomListItem.textContent = roomName;
    roomListItem.id = roomName;
    roomListItem.onclick = async function () {
        await switchRoomUI(roomName);
    };
    roomList.appendChild(roomListItem);
}


async function switchRoomUI(roomName) {
    displayMain();
    currentRoom = roomName;
    currentRoomName.textContent = roomName;
    await clearMessages();
    joinRoomButtonContainer.style.display = "block";
    
    var user = usernameInput.value;


    if (roomOwners[roomName] === user) {
        joinRoomInternal(user, roomName);
    } else {
        var isJoined = members[currentRoom] && members[currentRoom].includes(usernameInput.value);
        joinRoomButtonContainer.style.display = isJoined ? "none" : "block";
    }
}


function clearMessages() {
    messageList.innerHTML = '';
}

async function removeRoomFromList(roomName) {
    var roomListItem = document.getElementById(roomName);
    if (roomListItem) {
        await roomListItem.remove();
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
    displayMain();
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

async function scheduledRoomRemoval(user, roomName, durationInMinutes) {
    try {
        await connection.invoke("ScheduledRoomRemoval", user, roomName, durationInMinutes);
    } catch (error) {
        console.error("Error scheduling room deletion: ", error);
    }
}

function displayMain(){
    messageContainer.style.display = 'block';
    
    roomContainer.style.display = 'none';
    temporaryRoomContainer.style.display = 'none';
    roomContainer.style.margin = 'auto';
    temporaryRoomContainer.style.margin = 'auto';
}

function displayRoomContainer(){
    messageContainer.style.display = 'none';
    
    roomContainer.style.display = 'block';
    temporaryRoomContainer.style.display = 'block';
    roomContainer.style.margin = 'auto';
    temporaryRoomContainer.style.margin = 'auto';
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
