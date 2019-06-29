const fetchOptions = { 
    method: "GET",
    credentials: "same-origin",
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
    },
};

function loadingDisplay()
{
    var chat = document.getElementById("chat");

    var dots = new Array(3).fill().map(() => {
        var dot = document.createElement("div");

        dot.className = "dot";
        dot.style.top = (window.innerHeight / 3) + "px";
        dot.style.left = (window.innerWidth / 2) + "px";

        chat.appendChild(dot);
        return dot;
    });

    var loading = document.createElement("p");

    loading.appendChild(document.createTextNode("Loading"));


    loading.style.position = "absolute";
    loading.style.top = ((window.innerHeight / 3) - 50) + "px";
    loading.style.left = ((window.innerWidth / 2) - 20) + "px";

    chat.appendChild(loading);

    var counter = 0;

    var interval = setInterval(() => {
        counter++;

        dots.forEach((dot, index) => {
            var offset = (index * 40) - 45;
            dot.style.left = ((window.innerWidth / 2) + (Math.sin((counter / 100) * Math.PI) * 50) + offset) + "px";
        });
    }, 1);

    return function() {
        clearInterval(interval);

        loading.style.display = "none";
        dots.forEach((dot) => dot.style.display = "none");
    };
}

function setHeight()
{
    [ "sidebar", "chat", "users" ].forEach((id) => {
        document.getElementById("sidebar").style.height = 
            (window.innerHeight - 40) + "px";
    });

    var messages = document.getElementById("messages");
    messages.style.height = (window.innerHeight - 100) + "px";
}

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
            message.appendNode(document.createTextNode("Invalid username and/or password!"));
        }
    });
}

async function startup()
{
    setHeight();
    window.addEventListener("resize", setHeight);

    var loadingCleanup = loadingDisplay();

    try { 

        //TODO Error handling
        var addressableId = await fetch("/api/session/", fetchOptions);
        addressableId = await addressableId.json();
        addressableId = addressableId.data;

        var profiles = profileCache();
        var messages = messageCache();
        console.log(profiles);
        console.log(messages);

        profiles(addressableId).then((profile) => {
            document.getElementById("profile").
                appendChild(document.createTextNode(profile.name));
        });

        let channels = await fetch("/api/" + addressableId + "/channels/", fetchOptions);
        channels = await channels.json();
        channels = channels.data.channels;

        var sidebar = document.getElementById("sidebar");
        channels.forEach(function (channel) {
            profiles(channel).then((profile) => {
                var p = document.createElement("p");
                p.appendChild(document.createTextNode(profile.name));
                sidebar.appendChild(p);

                p.addEventListener("click", function() {
                    displayMessages(messages(channel));
                }); 
            });
        });

        loadingCleanup();
        displayMessages(messages(addressableId));
    } catch(error) {
        // TODO error handling
        console.log(error);
    }
}

function profileCache()
{
    var cache = {};
    return async function(addressableId)
    {
        if (cache[addressableId] !== undefined)
        {
            return cache[addressableId];
        }

        var profile = await fetch("/api/" + addressableId + "/profile", fetchOptions);
        profile = await profile.json();
        cache[addressableId] = profile.data.profile;
        return cache[addressableId];
    };
}

function messageCache()
{
    var current;
    var cache = {};
    return async function(addressableId)
    {
        current = addressableId;
        if (cache[addressableId] !== undefined)
        {
            return cache[addressableId];
        }

        var messages = await fetch("/api/" + addressableId + "/messages", fetchOptions);
        // TODO only recent messages
        messages = await messages.json();
        cache[addressableId] = messages.data;
        return messages.data;
    };
}

function displayMessages(data)
{
    var messages = document.getElementById("messages");
    messages.childNodes.forEach((node) => messages.removeChild(node));

    data.forEach(displayMessage);
}

function displayMessage(message)
{
    var messages = document.getElementById("messages");

    var div      = document.createElement("div");
    var img      = document.createElement("img");
    var username = document.createElement("p");
    var time     = document.createElement("p");
    var br       = document.createElement("br");
    var msg      = document.createElement("p");

    div.className = "message";
    img.src = message.img;

    username.appendChild(document.createTextNode(message.username));
    time.appendChild(document.createTextNode(" " + message.timestamp));
    msg.appendChild(document.createTextNode(message.message));

    div.appendChild(img);
    div.appendChild(username);
    div.appendChild(time);
    div.appendChild(br);
    div.appendChild(msg);

    messages.appendChild(div);
}
