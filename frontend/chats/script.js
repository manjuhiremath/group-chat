const base_url = 'http://localhost:3000';

document.getElementById('send').addEventListener('click', async function () {

    var message = document.getElementById('message').value;
    const id = window.localStorage.getItem('user');

    try {

        const response = await axios.post(`${base_url}/api/sendchat`, { userId: id, message });

        if (response.status === 201) {
            
            setTimeout(() => {
            document.getElementById('response').textContent = 'Message sent successfully';
            document.getElementById('response').style.color = 'green';
            const chatContainer = document.getElementById('chats');
            chatContainer.scrollTop = chatContainer.scrollHeight;
            },2000);
        } else {
            document.getElementById('response').textContent = 'Message not sent check your connection';
            document.getElementById('response').style.color = 'red';
            console.log('Message not sent');
        }
    } catch (error) {
        console.error(error);
    }
    document.getElementById('message').value = '';
});

const LOCAL_STORAGE_KEY = "user_chats"; // Key for storing chats in local storage

function loadChatsFromLocalStorage() {
    const storedChats = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
    const chatContainer = document.getElementById("chats");
    chatContainer.innerHTML = ""; // Clear chat container

    storedChats.forEach((chat) => {
        const message = document.createElement("p");
        message.textContent = `user: ${chat.message}`;
        chatContainer.appendChild(message);
    });

    return storedChats;
}

function saveChatsToLocalStorage(newChats) {
    const storedChats = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
    const updatedChats = [...storedChats, ...newChats].slice(-10); // Keep only the last 10 chats
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedChats));
}

async function fetchNewChats(userId, lastTimestamp) {
    try {
        const response = await axios.get(`${base_url}/api/userchats/${userId}`, {
            params: { lastTimestamp },
        });
        return response.data.data || [];
    } catch (error) {
        console.error("Error fetching chats:", error);
        return [];
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    const userId = localStorage.getItem("user");
    if (!userId) {
        console.error("User ID not found in local storage.");
        return;
    }

    let storedChats = loadChatsFromLocalStorage();
    let lastTimestamp = storedChats.length
        ? new Date(storedChats[storedChats.length - 1].createdAt).toISOString()
        : null;

    setInterval(async () => {
        const newChats = await fetchNewChats(userId, lastTimestamp);

        if (newChats.length) {
            const chatContainer = document.getElementById("chats");
            newChats.forEach((chat) => {
                const message = document.createElement("p");
                message.textContent = `user: ${chat.message}`;
                chatContainer.appendChild(message);
            });

            saveChatsToLocalStorage(newChats);
            lastTimestamp = new Date(newChats[newChats.length - 1].createdAt).toISOString();
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }, 2000);
});

