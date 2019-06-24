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
    }
};

const login = {
    username: username,
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

module.exports = { username, password, channelName, login, message, user };
