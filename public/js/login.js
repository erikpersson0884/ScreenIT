
createLoginDiv();
const loginDiv = document.getElementById('loginDiv');
const submitLoginButton = document.getElementById('submitLoginButton');
// const openCreatePostButton = document.getElementById('openCreatePostButton');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

const loginNotificationDiv = document.getElementById('loginNotification');

let adminButtons = document.getElementsByClassName('adminButton');

let logInFunctions = [];
let logOutFunctions = [];

let isLoggedIn = false;
let adminKey = null;

let username = null;

const loginNotificationTime = 3 * 1000; // 3 seconds




function createLoginDiv() {
    let loginDiv = document.createElement('aside');
    loginDiv.id = 'loginDiv';
    loginDiv.classList.add('popupWindow', 'hidden');

    let closeButton = document.createElement('div');

        let closeButtonImg = document.createElement('img');
        closeButtonImg.src = '/img/icons/close.svg';
        closeButton.appendChild(closeButtonImg);
    
    closeButton.classList.add('closeButton');
    loginDiv.appendChild(closeButton);
    closeButton.addEventListener('click', () => {
        loginDiv.classList.add('hidden');
    });

    let loginForm = document.createElement('div');
    loginForm.classList.add('loginForm');
    loginDiv.appendChild(loginForm);

    let usernameInput = document.createElement('input');
    usernameInput.type = 'text';
    usernameInput.id = 'username';
    usernameInput.placeholder = 'Username';
    usernameInput.autocomplete = 'on';
    usernameInput.required = true;
    loginForm.appendChild(usernameInput);

    let passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.id = 'password';
    passwordInput.placeholder = 'Password';
    passwordInput.autocomplete = 'on';
    passwordInput.required = true;
    loginForm.appendChild(passwordInput);

    let submitLoginButton = document.createElement('button');
    submitLoginButton.id = 'submitLoginButton';
    submitLoginButton.textContent = 'Log in';
    loginForm.appendChild(submitLoginButton);

    const notification = document.createElement('div');
    notification.id = 'loginNotification';
    notification.classList.add('notification');
    
    loginDiv.appendChild(notification);

    document.body.appendChild(loginDiv);
}


function logout() {
    isLoggedIn = false;
    adminKey = null;
    localStorage.removeItem('adminKey');
    for (const button of adminButtons) {
        button.classList.add('hidden');
    }
    loginButton.textContent = 'Log in';

    logOutFunctions.forEach(func => func());
}

function login() {
    const loginCredentials = {
        username: usernameInput.value,
        password: passwordInput.value
    };

    fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginCredentials)
    })
    .then(response => {
        if (response.status === 401) {
            notify(loginNotificationDiv, 'Invalid credentials', loginNotificationTime, 'red');
            throw new Error('Invalid credentials');
        }
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        adminKey = data.adminKey;
        username = usernameInput.value;

        localStorage.setItem('adminKey', adminKey);
        console.log("Login successful");

        userIsLoggedIn();
        
    })
}

function testAdminKeyOnLoad() {
    adminKey = localStorage.getItem('adminKey');
    if (adminKey) {
        fetch('/api/auth/testAdminKey', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({adminKey})
        })
        .then(response => {
            if (response.status === 200) {
                console.log('Saved adminKey was valid');
                userIsLoggedIn();
            }
            if (response.status === 401) {
                localStorage.removeItem('adminKey');

            } else if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            username = data.username;
            console.log('username: ', data.username);        
        });
    }
}


function userIsLoggedIn(){
    isLoggedIn = true;
    loginDiv.classList.add('hidden');   
    
    if (loginButton) {
        loginButton.textContent = 'Log out'; // TODO: if needed for when loginbutton has not loaded
    };
    
    usernameInput.value = '';
    passwordInput.value = '';

    for (const button of adminButtons) { // show all admin buttons
        button.classList.remove('hidden');
    }

    logInFunctions.forEach(func => func());
};


submitLoginButton.addEventListener('click', login);



