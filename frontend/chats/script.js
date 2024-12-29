const base_url = 'http://localhost:3000';

document.getElementById('send').addEventListener('click', async function () {

    var message = document.getElementById('message').value;
    const id = window.localStorage.getItem('user');
    console.log(id);
    console.log(message);

    try {
        const response = await axios.post(`${base_url}/api/sendchat`, { userId: id, message });
        if (response.status === 201) {
            document.getElementById('response').textContent = 'Message sent successfully';
            document.getElementById('response').style.color = 'green';
            window.location.reload();
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
    console.log(id);

    try {
        const response = await axios.get(`${base_url}/api/userchats/${id}`);
        console.log(response.data);
        if (response.status === 200) {
            response.data.data.forEach((chat) => {
                const message = document.createElement('p');
                message.textContent = "user: " + chat.message;
                document.getElementById('chats').appendChild(message);
            });
            const chatContainer = document.getElementById('chats');
            chatContainer.scrollTop = chatContainer.scrollHeight;
        } else {
            console.log('No chats found');
        }
    } catch (error) {
        console.error(error);
    }
});