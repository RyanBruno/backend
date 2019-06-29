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
    format: {
        pattern: /[0-9]+/
    },
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
    timestamp: number,
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
    name: {
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
    username,
    password,
};


module.exports = { addressableId, number, username, password, channelName, message, user };
