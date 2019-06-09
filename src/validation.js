
// !! All return false if validated
var validateName = function(name)
{
    return name.length < 6 || name.length > 36 || name.match("[^A-Za-z\-' ']");
};

var validateUsername = function(username) 
{
    return username.length < 6 || username.length > 36 || username.match("[^A-Za-z0-9]");
};

var validatePassword = function(password)
{
    return password.length < 6 || password.length > 36 || password.match("[^A-Za-z0-9!@#$%^&*<>,.~]");
}

module.exports = { validateName, validateUsername, validatePassword};
