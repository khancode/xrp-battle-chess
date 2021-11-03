const loginJson = require('./login.json');

const loginHelper = (username) => {
    if (!loginJson[username]) {
        throw new Error(`Invalid username: ${username}`);
    }

    return loginJson[username];
}

export default loginHelper;
