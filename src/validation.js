
// !! All return false if validated
const validate = function(input, minLength, maxLength, regex)
{
    return input.length < minLength || input.length > maxLength || input.match(regex);
};

var validateName = function(name)
{
    return validateName(name, 6, 36, "[^A-Za-z\-' ']");
};

var validateUsername = function(username) 
{
    return username.length < 6 || username.length > 36 || username.match("[^A-Za-z0-9]");
};

var validatePassword = function(password)
{
    return password.length < 6 || password.length > 36 || password.match("[^A-Za-z0-9!@#$%^&*<>,.~]");
}

module.exports = { validate };
