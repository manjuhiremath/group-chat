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


document.addEventListener('DOMContentLoaded', async function () {
    const id = window.localStorage.getItem('user');
    const chatContainer = document.getElementById('chats');
    const LOCAL_STORAGE_KEY = `user_${id}_chats`;
    const MAX_CHATS = 10;

    // Load existing chats from local storage
    const loadChatsFromLocalStorage = () => {
        const storedChats = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
        chatContainer.innerHTML = "";
        storedChats.forEach(chat => {
            const message = document.createElement('p');
            message.textContent = "user: " + chat.message;
            chatContainer.appendChild(message);
        });
        return storedChats;
    };

    // Save chats to local storage (maintain only the latest 10)
    const saveChatsToLocalStorage = (chats) => {
        const storedChats = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
        const updatedChats = [...storedChats, ...chats].slice(-MAX_CHATS); // Keep only the last 10 chats
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedChats));
    };

    // Load chats from local storage initially
    let storedChats = loadChatsFromLocalStorage();
    let lastMessageTimestamp = storedChats.length ? storedChats[storedChats.length - 1].createdAt : null;

    // Polling for new messages
    setInterval(async () => {
        try {
            const response = await axios.get(`${base_url}/api/userchats/${id}`, {
                params: { lastTimestamp: lastMessageTimestamp } // Pass the timestamp of the latest message
            });

            if (response.status === 200 && response.data.data.length > 0) {
                const newChats = response.data.data;

                // Append new chats to the DOM
                newChats.forEach(chat => {
                    const message = document.createElement('p');
                    message.textContent = "user: " + chat.message;
                    chatContainer.appendChild(message);
                });

                // Update last message timestamp
                lastMessageTimestamp = newChats[newChats.length - 1].createdAt;

                // Save new chats to local storage
                saveChatsToLocalStorage(newChats);

                // Scroll to the latest message
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
        } catch (error) {
            console.error('Error fetching new chats:', error);
        }
    }, 2000);
});
