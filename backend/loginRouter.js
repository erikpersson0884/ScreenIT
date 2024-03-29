
import { Router } from 'express';
import fs from 'fs';

import { getUserFromAdminKey, getUsernameFromAdminKey, isAdminKeyValid, logEvent, pathToAdminKeysFile, pathToUsersFile  } from '../server.js';

const loginRouter = Router();



// LOGIN SYSTEM
loginRouter.post('/login', (req, res) => {
    const username = req.body.username; // Extract username from request body
    const password = req.body.password; // Extract password from request body

    let users = fs.readFileSync(pathToUsersFile, 'utf8');
    users = JSON.parse(users); // Parse the JSON string into an object

    const user = users.find(user => user.username === username && user.password === password);
    // console.log(user)

    if (credentialsIsValid(username, password)) {
        
        let adminKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        saveAdminKey(adminKey, user.id);
        res.status(200).json({ adminKey: adminKey, user: user }); // Send the content back to the client
    } else {
        logEvent({event: "Invalid login attempt", username: username, password: password })
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

loginRouter.post('/testAdminKey', (req, res) => {
    const adminKey = req.body.adminKey; 
    if (!isAdminKeyValid(adminKey)) return res.status(401).json("Adminkey is not valid");

    const user = getUserFromAdminKey(adminKey);
    res.status(200).json({ user: user});
});

function saveAdminKey(adminKey, id) {
    const currentDate = new Date().toISOString();
    const adminKeyData = { key: adminKey, id: id, date: currentDate };

    // Read existing admin keys from file, or create an empty array if the file doesn't exist
    let adminKeys = [];
    if (fs.existsSync(pathToAdminKeysFile)) {
        adminKeys = JSON.parse(fs.readFileSync(pathToAdminKeysFile, 'utf8'));
    }

    // Add the new admin key data to the array
    adminKeys.push(adminKeyData);

    // Write the updated admin keys array back to the file
    fs.writeFileSync(pathToAdminKeysFile, JSON.stringify(adminKeys, null, 2));
}

function credentialsIsValid(username, pass) {
    let userCredentials = fs.readFileSync(pathToUsersFile, 'utf8');
    userCredentials = JSON.parse(userCredentials); // Parse the JSON string into an object

    for (const user of userCredentials) {
        if (user.username === username && user.password === pass) {
            return true;
        }
    }
    return false;
}

export default loginRouter;