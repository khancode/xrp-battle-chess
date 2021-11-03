const loginJson = require('./login.json');

const loginHelper = (username) => {
    const lowercase = username.toLowerCase();
    if (!loginJson[lowercase]) {
        throw new Error(`Invalid username: ${lowercase}`);
    }

    return loginJson[lowercase];
}

export default loginHelper;
