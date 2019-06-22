const username = {
    presents: true,
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
    presents: true,
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
        presents: true,
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
    address: {
        presents: true,
        email: true
    },
    timestamp: {
        presents: false,
        // TODO
    },
    message: {
        presents: true,
        type: "string",
        length: {
            minimum: 1,
            maximum: 1000
        }
    },
};

module.exports = { username, channelName, login, message };
