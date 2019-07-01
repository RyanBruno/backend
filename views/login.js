const fetchOptions = { 
    method: "GET",
    credentials: "same-origin",
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
    },
};

async function login()
{
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    //TODO change submit box to loading...

    fetch("/api/session/", {
        ...fetchOptions,
        method: "POST",
        body: JSON.stringify({ username, password }),
    }).then((result) => {
        if (result.ok)
        {
            // Redirect to ui
        } else
        {
            const message = document.getElementById("message");
            message.childNodes.forEach((node) => message.removeChild(node));
            message.appendNode(document.createTextNode("Invalid username and/or password!"));
        }
    });
}

async function signup()
{
    const name = document.getElementById("name").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    //TODO change submit box to loading...

    fetch("/api/user/", {
        ...fetchOptions,
        method: "POST",
        body: JSON.stringify({ name, username, password }),
    }).then((result) => {
        if (result.ok)
        {
            // Redirect to ui
        } else
        {
            const message = document.getElementById("message");
            message.childNodes.forEach((node) => message.removeChild(node));
            message.appendNode(document.createTextNode("Invalid username and/or password!"));
        }
    });
}
