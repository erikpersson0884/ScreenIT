
import { Router } from 'express';
import fs from 'fs';

import { getUsernameFromAdminKey, isAdminKeyValid, pathToAdminKeysFile, pathToUsersFile  } from '../server.js';

const imageRouter = Router();



// LOGIN SYSTEM
imageRouter.post('/login', (req, res) => {
    const username = req.body.username; // Extract username from request body
    const password = req.body.password; // Extract password from request body

    let userCredentials = fs.readFileSync(pathToUsersFile, 'utf8');
    userCredentials = JSON.parse(userCredentials); // Parse the JSON string into an object

    const userId = userCredentials.find(user => user.username === username && user.password === password).id;

    if (credentialsIsValid(username, password)) {
        let adminKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        saveAdminKey(adminKey, userId);
        res.status(200).json({ adminKey }); // Send the content back to the client
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

imageRouter.post('/testAdminKey', (req, res) => {
    const adminKey = req.body.adminKey; // Extract admin key from request body

    if (isAdminKeyValid(adminKey)) {
        const username = getUsernameFromAdminKey(adminKey);
        res.status(200).json({ username: username});
        return;
    }
    res.status(401).json("Adminkey is not valid");
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

export default imageRouter;