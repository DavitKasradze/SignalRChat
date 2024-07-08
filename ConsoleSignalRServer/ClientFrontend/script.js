"use strict";

const connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5000/messageHub")
    .build();

const messageList = document.getElementById("messageList");
const registerRoomForm = document.getElementById("registerRoomForm");
const roomMembersList = document.getElementById("roomMembersList");
const messageContainer = document.getElementById("messageContainer");
const roomListContainer = document.getElementById("roomListContainer");
const manageMemberButton = document.getElementById("manageMemberButton");
const sendButton = document.getElementById("sendButton");
const messageInput = document.getElementById("messageInput");
const usernameInput = document.getElementById("username");
const roomNameInput = document.getElementById("roomName");
const currentRoomName = document.getElementById("currentRoomName");
const roomList = document.getElementById("roomList");
const memberList = document.getElementById("memberList");
const createRoomButton = document.getElementById("createRoomButton");
const deleteRoomButton = document.getElementById("deleteRoomButton");
const registerButton = document.getElementById("registerButton");
const removeMemberButton = document.getElementById("removeMemberButton");
const removeMemberInput = document.getElementById("removeMemberInput");
const createTemporaryRoomButton = document.getElementById("createTemporaryRoomButton");
const temporaryRoomName = document.getElementById("temporaryRoomName");
const roomDuration = document.getElementById("roomDuration");
const joinRoomButton = document.getElementById("joinRoomButton")
const manageRoomButton = document.getElementById('manageRoomButton');
const roomContainer = document.getElementById('roomContainer');
const temporaryRoomContainer = document.getElementById('temporaryRoomContainer');
const muteMemberButton = document.getElementById('muteMemberButton');

let currentRoom = null;
let messages = {};
let members = {};
let roomOwners = {};
let mutedMembers = [];

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

manageRoomButton.addEventListener('click', async function () {
    await displayRoomContainer();
});

manageMemberButton.addEventListener('click', async function () {
    await displayMembers();
});

muteMemberButton.addEventListener('click', async function () {
    await muteMember();
});

connection.on("ReceiveMessage", async function (message) {
    const messageParts = message.content.split(': ');
    const sender = messageParts[0].trim();
    
    if (!mutedMembers.includes(sender)) {
        const roomName = message.roomName;
        const content = message.content;

        if (!messages[roomName]) {
            messages[roomName] = [];
        }
        messages[roomName].push(content);

        if (roomName === currentRoom) {
            await displayMessages(roomName);
        }
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
    members[roomName] = await connection.invoke("GetRoomMembers", roomName);
    if (!members[roomName].includes(usernameInput.value)){
        removeMemberInput.style.display = "none";
        muteMemberButton.style.display = "none";
        cleanMessageContainer();
    }
    if (roomName === currentRoom) {
        await updateMemberList(roomName);
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
    registerRoomForm.style.display = "none";
    roomListContainer.style.display = "block";
    messageContainer.style.display = "block";
    
    sendButton.style.display = "none";
    messageInput.style.display = "none";
    console.log(`${username} registered successfully.`);
    await fetchRooms();
});

connection.on("UserAlreadyRegistered", async (username) => {
    alert(`${username} already exists!`)
});

connection.on("ErrorMessage", function (errorMessage) {
    alert(errorMessage);
});

connection.on("MemberMutedByOwner", function (user, roomName, mutedMember) {
    console.log(`Member '${mutedMember}' muted in room '${roomName}'.`);
});
connection.on("MemberMutedByUser", function (updatedMutedMembers) {
    mutedMembers = updatedMutedMembers;
    alert(`user has been muted!`);
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
    const user = usernameInput.value;
    const message = messageInput.value;
    const roomName = currentRoom;

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
    const username = usernameInput.value;
    await connection.invoke("RegisterUser", username)
        .catch(err => {
            console.error(err.toString());
        });
}

function joinRoom() {
    const user = usernameInput.value;
    const roomName = currentRoomName.textContent;

    if (connection.state === signalR.HubConnectionState.Connected && user && roomName) {
        connection.invoke("JoinRoom", user, roomName)
            .then(async function () {
                messageContainer.style.display = 'block';
                messageInput.style.display = 'block';
                sendButton.style.display = 'block';
                await addRoomToList(roomName);
                await switchRoom(roomName);
                await updateUIOnRoomSelection(user, roomName);
                manageMemberButton.style.display = "block";
                joinRoomButton.style.display = 'none';
                messageInput.disabled = false;
                sendButton.disabled = false;
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
    const user = usernameInput.value;
    const roomName = roomNameInput.value;

    if (connection.state === signalR.HubConnectionState.Connected && user && roomName) {
        connection.invoke("CreateRoom", user, roomName)
            .then(async function () {
                await joinRoomInternal(user, roomName);
                await updateMemberList(roomName);
                await displayMessages(roomName);
                roomNameInput.value = '';
                currentRoom = roomName;
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
    const user = usernameInput.value;
    const timer = Number(roomDuration.value);
    const roomName = temporaryRoomName.value;

    if (connection.state === signalR.HubConnectionState.Connected && user && roomName && timer) {
        connection.invoke("CreateRoom", user, roomName).then(async function () {
            await joinRoomInternal(user, roomName);
            await updateMemberList(roomName);
            await displayMessages(roomName);
            await scheduledRoomRemoval(user, roomName, timer);
            roomDuration.value = '';
            roomNameInput.value = '';
            currentRoom = roomName;
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
            messageContainer.style.display = 'block';
            await displayMessages(roomName);
            await updateMemberList(roomName);
            await updateUIOnRoomSelection(user, roomName);
            manageMemberButton.style.display = "block";
            
            sendButton.style.display = 'block';
            messageInput.style.display = 'block';
            joinRoomButton.style.display = 'none';
            messageInput.disabled = false;
            sendButton.disabled = false;
        })
        .catch(function (err) {
            console.error(err.toString());
        });
}



function deleteRoom() {
    displayMain();
    const user = usernameInput.value;
    const roomName = roomNameInput.value;

    if (connection.state === signalR.HubConnectionState.Connected && user && roomName) {
        connection.invoke("DeleteRoom", user, roomName)
            .then(async function () {
                joinRoomButton.style.display = "none";
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
    const user = usernameInput.value;
    const roomName = currentRoom;
    const memberToRemove = removeMemberInput.value;
    
    if (connection.state === signalR.HubConnectionState.Connected && roomName && user && memberToRemove) {
        try {
            await connection.invoke("RemoveMember", user, roomName, memberToRemove);
        } catch (err) {
            console.error(err.toString());
        }
    } else {
        console.error("Connection is not in 'Connected' state, or no room selected, or username/member to remove is empty.");
    }

    removeMemberInput.value = '';
}

async function switchRoom(roomName) {
    displayMain();
    currentRoom = roomName;
    currentRoomName.textContent = roomName;
    await displayMessages(roomName);
    await updateMemberList(roomName);
    await updateUIOnRoomSelection(usernameInput.value, roomName);

    const isJoined = members[currentRoom] && members[currentRoom].includes(usernameInput.value);
    joinRoomButton.style.display = isJoined ? "none" : "block";
}


function displayMessages(roomName) {
    messageList.innerHTML = '';

    const roomMessages = messages[roomName] || [];
    const maxMessagesToShow = 50;


    const startIndex = Math.max(roomMessages.length - maxMessagesToShow, 0);
    const displayedMessages = roomMessages.slice(startIndex);

    displayedMessages.forEach(function (message) {
        const li = document.createElement("li");


        if (message.includes(': ')) {
            const messageParts = message.split(': ');
            const sender = messageParts[0].trim();
            const messageContent = messageParts.slice(1).join(': ').trim();

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

    const roomListItem = document.createElement("button");
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
    roomMembersList.style.display = "none";

    const user = usernameInput.value;
    
    const isJoined = members[currentRoom] && members[currentRoom].includes(user);

    if (isJoined) {
        joinRoomButton.style.display = "none";
        messageInput.style.display = "block";
        sendButton.style.display = "block";
        await displayMessages(roomName);
    } else {
        messageInput.style.display = "none";
        sendButton.style.display = "none";
        joinRoomButton.style.display = "block";
    }
    
    await updateMemberList(roomName);
    await updateUIOnRoomSelection(user, roomName);
}

function clearMessages() {
    messageList.innerHTML = '';
}

async function removeRoomFromList(roomName) {
    const roomListItem = document.getElementById(roomName);
    if (roomListItem) {
        await roomListItem.remove();
    }

    if (currentRoom === roomName) {
        currentRoom = null;
        currentRoomName.textContent = "";
        messageList.innerHTML = "";
        memberList.innerHTML = "";
        manageMemberButton.style.display = "none";
    }
}

function updateMemberList(roomName) {
    const roomMembers = members[roomName] || [];
    memberList.innerHTML = '';

    const maxMembersToShow = 20;
    const startIndex = Math.max(roomMembers.length - maxMembersToShow, 0);
    const displayedMembers = roomMembers.slice(startIndex);

    displayedMembers.forEach(function (member) {
        const li = document.createElement("li");
        li.textContent = member;

        if (roomOwners[roomName] && member === roomOwners[roomName]) {
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
    const roomMembers = members[roomName] || [];

    const isMember = roomMembers.includes(user);

    if (isMember) {
        messageInput.disabled = false;
        sendButton.disabled = false;
        
    } else {
        messageInput.disabled = true;
        sendButton.disabled = true;
    }

    if (roomOwners[roomName] === user) {
        manageMemberButton.style.display = "block";
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
}

function displayMembers(){
    const user = usernameInput.value;
    const roomName = currentRoomName.textContent;
    
    roomMembersList.style.display = 'block';
    messageContainer.style.display = 'none';

    if (roomOwners[roomName] !== user){
        removeMemberButton.style.display = 'none';
        removeMemberInput.style.display = 'block';
    }
    else{
        removeMemberButton.style.display = 'block';
        removeMemberInput.style.display = 'block';
    }
}

function displayRoomContainer(){
    messageContainer.style.display = 'none';
    roomMembersList.style.display = 'none';
    
    roomContainer.style.display = 'block';
    temporaryRoomContainer.style.display = 'block';
    roomContainer.style.margin = 'auto';
    temporaryRoomContainer.style.margin = 'auto';
}

async function muteMember() {
    const user = usernameInput.value;
    const roomName = currentRoom;
    const memberToMute = removeMemberInput.value;

    if (connection.state === signalR.HubConnectionState.Connected && roomName && user && memberToMute) {
        try {
            await connection.invoke("MuteMember", user, roomName, memberToMute);
        } catch (err) {
            console.error(err.toString());
        }
    } else {
        console.error("Connection is not in 'Connected' state, or no room selected, or username/member to mute is empty.");
    }

    removeMemberInput.value = '';
}

function cleanMessageContainer(){
    messageInput.style.display = 'none';
    sendButton.style.display = 'none';
    manageMemberButton.style.display = 'none';
    clearMessages();
    currentRoomName.textContent = "No Room Selected";
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
