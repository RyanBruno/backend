const username = {
    presence: true,
    length: {
        minimum: 6,
        maximum: 36
    },
    type: "string",
    format: {
        pattern: /[\w-]+/
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
    }
};

const login = {
    username: username,
    password: {
        presence: true,
        length: {
            minimum: 6,
            maximum: 36
        },
        type: "string",
        format: {
            pattern: /[\w\s!@#$%^&*?,.~]+/
        }
    }
};

const message = {
    username: username,
    channelName: channelName,
    timestamp: {
        presence: false,
        // TODO
    },
    message: {
        presence: true,
        type: "string",
        length: {
            minimum: 1,
            maximum: 1000
        }
    },
};

module.exports = { username, channelName, login, message };
