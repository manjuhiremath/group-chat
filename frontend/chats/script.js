const BASE_URL = 'http://localhost:3000/api';
const token = window.localStorage.getItem('token');
const groupsContainer = document.getElementById('groups');
const userId = window.localStorage.getItem('user');
const createGroupButton = document.getElementById('create-group-btn');
const messageInput = document.getElementById('message');
const sendButton = document.getElementById('send');
const chatsDiv = document.getElementById('chats');
const groupheader = document.getElementById('groupheader');
let currentGroupId = null;
let currentGroupName = null;
groupheader.style.display = 'none';


async function fetchGroups() {
    try {
        const response = await axios.get(`${BASE_URL}/users/${userId}/groups`);
        const groups = response.data.data;
        console.log(groups);

        groups.forEach(group => {
            const groupElement = document.createElement('div');
            groupElement.style.padding = '10px';
            groupElement.style.display = 'flex';
            groupElement.style.justifyContent = 'space-between';
            groupElement.style.alignItems = 'center';
            groupElement.style.marginBottom = '5px';
            groupElement.style.borderRadius = '5px';
            groupElement.style.cursor = 'pointer';
            groupElement.style.background = '#A19AD3';
            groupElement.style.color = 'white';
            groupElement.classList.add('group');
            groupElement.textContent = group.name;
            groupElement.dataset.id = group.id;
            
            const inviteButton = document.createElement('button');
            inviteButton.id = 'invite';
            inviteButton.textContent = 'Invite';
            inviteButton.style.padding = '5px 10px';
            inviteButton.style.background = '#28a745';
            inviteButton.style.color = 'white';
            inviteButton.style.border = 'none';
            inviteButton.style.borderRadius = '5px';
            inviteButton.style.cursor = 'pointer';

            inviteButton.addEventListener('mouseover', () => {
                inviteButton.style.background = '#218838';
            });
            inviteButton.addEventListener('mouseout', () => {
                inviteButton.style.background = '#28a745';
            });

            inviteButton.addEventListener('click', async () => {
                showInviteModal(group.id);
            });

            groupElement.appendChild(inviteButton);
            groupElement.addEventListener('click', () => selectGroup(group.name,group.id));
            groupsContainer.appendChild(groupElement);
        });
    } catch (error) {
        console.error('Error fetching groups:', error);
    }
}

async function showModal(groupId,buttonname) {
    const inviteModal = document.getElementById('inviteModal');
    const userList = document.getElementById('userList');
    try {
        if(buttonname === 'invite'){
            const response = await axios.get(`${BASE_URL}/groups/${groupId}/inviteList/${userId}`);
            var users = response.data;
        }else if(buttonname === 'makeadmin'){
            const response = await axios.get(`${BASE_URL}/groups/${groupId}/nonAdminMembers`);
            var users = response.data.data;
        }else if(buttonname === 'remove'){
            const response = await axios.get(`${BASE_URL}/groups/${groupId}/members`);
            var users = response.data.data;
        }

        userList.innerHTML = '';

        users.forEach(user => {
            const userItem = document.createElement('li');
            userItem.style.display = 'flex';
            userItem.style.justifyContent = 'space-between';
            userItem.style.alignItems = 'center';
            userItem.style.marginBottom = '5px';

            const userName = document.createElement('span');
            if(user.id === userId){
                userName.textContent = user.name + '(You)';
            }else{
                userName.textContent = user.name;
            }
            userItem.appendChild(userName);

            const addButton = document.createElement('button');
            if(user.id === userId){
                addButton.style.display='none';
            }
            buttonname === 'invite'? addButton.textContent = 'Add':buttonname === 'makeadmin'?addButton.textContent = 'mark as admin':buttonname=== 'remove'? addButton.textContent='Remove' :addButton.textContent=''
            addButton.style.padding = '5px 10px';
            addButton.style.background = '#28a745';
            addButton.style.color = 'white';
            addButton.style.border = 'none';
            addButton.style.borderRadius = '5px';
            addButton.style.cursor = 'pointer';

            addButton.addEventListener('mouseover', () => {
                addButton.style.background = '#218838';
            });
            addButton.addEventListener('mouseout', () => {
                addButton.style.background = '#28a745';
            });

            addButton.addEventListener('click', async () => {
                try {
                    if(buttonname === 'invite'){
                        await axios.post(`${BASE_URL}/groups/invite`, { userId: user.id, groupId: groupId, adminId: userId });
                        await showModal(groupId,'invite');
                    }else if(buttonname === 'makeadmin'){
                        await axios.post(`${BASE_URL}/groups/${groupId}/makeAdmin`, {groupId: groupId, currentAdminId : userId, newAdminId:user.id });
                        await showModal(groupId,'makeadmin');
                    }else if(buttonname === 'remove'){
                        await axios.delete(`${BASE_URL}/groups/${groupId}/admin/${userId}/members/${user.id}`, { groupId: groupId, adminId:userId, memberId: user.id });
                        await showModal(groupId,'remove');
                    }
                } catch (error) {
                    console.error('Error sending invite:', error);
                }
            });

            userItem.appendChild(addButton);
            userList.appendChild(userItem);
        });

    } catch (error) {
        userList.innerHTML = '<li>No users available</li>';
    }



    inviteModal.style.display = 'block';

    const closeModal = document.querySelector('.close');
    closeModal.addEventListener('click', () => {
        inviteModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === inviteModal) {
            inviteModal.style.display = 'none';
        }
    });
}
async function selectGroup(groupname,groupId) {
    currentGroupId = groupId;
    currentGroupName = groupname;
    console.log(currentGroupName);
    console.log(currentGroupId);
    document.getElementById('groupname').innerText = groupname;
    groupheader.style.display = 'block';
    document.getElementById('invites').addEventListener('click', ()=>{
        showModal(currentGroupId,'invite');
    })
    document.getElementById('makeadmin').addEventListener('click', ()=>{
        showModal(currentGroupId,'makeadmin');
    })
    document.getElementById('remove').addEventListener('click', ()=>{
        showModal(currentGroupId,'remove');
    })

    document.querySelectorAll('.group').forEach(group => group.classList.remove('active'));
    document.querySelector(`.group[data-id='${groupId}']`).classList.add('active');
    await loadGroupChats(groupId);
}

async function createGroup() {
    const groupName = prompt('Enter group name:');
    if (!groupName) {
        alert('Group name cannot be empty');
        return;
    }
    console.log(userId);
    try {
        const response = await axios.post(`${BASE_URL}/groups`, { userId, groupName }, {

        });

        if (response.data.message === 'Group created successfully') {
            alert('Group created successfully');
            window.location.reload();
        }
    } catch (error) {
        console.error('Error creating group:', error);
        alert('Failed to create group');
    }
}


async function loadGroupChats(groupId) {
    try {
        const response = await axios.get(`${BASE_URL}/groups/${groupId}/messages`);
        const chats = response.data.data;
        chatsDiv.innerHTML = ''; // Clear previous chats
        console.log(chats);
        chats.forEach(chat => {
            const chatElement = document.createElement('div');
            chatElement.textContent = `${chat.senderName}: ${chat.text}`;
            chatsDiv.appendChild(chatElement);
        });
    } catch (error) {
        console.error('Error loading group chats:', error);
    }
}

sendButton.addEventListener('click', async () => {
    if (!currentGroupId) {
        alert('Please select a group first.');
        return;
    }
    const message = messageInput.value.trim();
    if (!message) return;

    try {
        const response = await axios.post(`${BASE_URL}/groups/${currentGroupId}/messages`, {
            groupId: currentGroupId,
            senderId: userId,
            message
        });
        alert('Message sent successfully');
        messageInput.value = '';
        await loadGroupChats(currentGroupId);
    } catch (error) {
        console.error('Error sending message:', error);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    fetchGroups();
});

createGroupButton.addEventListener('click', createGroup);




