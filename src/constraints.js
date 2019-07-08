const addressableId = {
    presence: true,
    length: {
        is: 32,
    },
    type: "string",
    format: {
        pattern: /[0-9A-F]+/i
    },
};

const number = {
    presence: true,
    type: "number",
};

const username = {
    presence: true,
    length: {
        minimum: 6,
        maximum: 36
    },
    type: "string",
    format: {
        pattern: /[\w-]+/
    },
};

const password = {
    presence: true,
    length: {
        minimum: 6,
        maximum: 36
    },
    type: "string",
    format: {
        pattern: /[\w\s!@#$%^&*?,.~]+/
    }
};

const login = {
    username,
    password,
};

const channelName = {
    presence: true,
    length: {
        minimum: 6,
        maximum: 36
    },
    type: "string",
    format: {
        pattern: /[\w-]+/
    },
};

const message = {
    toAddressableId: addressableId,
    fromAddressableId: addressableId,
    message: {
        presence: true,
        type: "string",
        length: {
            minimum: 1,
            maximum: 1000
        }
    },
};

const user = {
    addressableId,
    "login.username": username,
    "login.password": password,
    "profile.name": {
        presence: true,
        length: {
            minimum: 6,
            maximum: 36
        },
        type: "string",
        format: {
            pattern: /[\w\s-]+/
        },
    },
};

const getMessages = {
    addressableId,
    limit: number,
    //after: , TODO
};


module.exports = { addressableId, number, username, password, login, channelName, message, user, getMessages };
