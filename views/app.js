const fetchOptions = { 
    method: "GET",
    credentials: "same-origin",
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
    },
};

/* Frontend Functions */

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

function setHeight()
{
    [ "sidebar", "chat", "users" ].forEach((id) => {
        document.getElementById("sidebar").style.height = 
            (window.innerHeight - 40) + "px";
    });

    var messages = document.getElementById("messages");
    messages.style.height = (window.innerHeight - 100) + "px";
}

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
            var offset = window.innerWidth / 2;
            offset += (index * 40) - 45;
            offset += Math.sin((counter / 100) * Math.PI) * 50;

            dot.style.left = offset + "px";
        });
    }, 1);

    return function() {
        clearInterval(interval);

        loading.style.display = "none";
        dots.forEach((dot) => dot.style.display = "none");
    };
}

/* Backend Functions */

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

async function startup()
{
    setHeight();
    window.addEventListener("resize", setHeight);

    var loadingCleanup = loadingDisplay();
    var profiles = profileCache();
    var messages = messageCache();

    var addressableId = await myFetch("/api/session/");
    
    if (!addressableId)
    {
        // Login
        return;
    }

    addressableId = addressableId.data.addressableId;

    profiles(addressableId).then((profile) => {
        document.getElementById("profile").
            appendChild(document.createTextNode(profile.name));
    }).catch((error) => {
        // Could not load your profile.

    });

    myFetch("/api/" + addressableId + "/channels/").then((result) => {
        if (result)
        {
            result.data.channels.forEach((channel) => {
                profiles(channel).then((profile) => {
                    var p = document.createElement("p");
                    p.appendChild(document.createTextNode(profile.name));
                    document.getElementById("sidebar").appendChild(p);

                    p.addEventListener("click", function() {
                        displayMessages(messages(channel));
                    }); 
                }).catch((error) => {
                    // Could not retrive profile.
                });
            });
        } else
        {
            console.log("Fetch Error: Could not fetch channels from API: " + addressableId);
        }
    });

    messages(addressableId).then((data) => {
        loadingCleanup();
        displayMessages(data);
    }).catch((error) => {
        // Could not retrive messages 
    });
}

/* Low abstraction functions */
function profileCache()
{
    var cache = {};
    return async function(addressableId)
    {
        if (cache[addressableId] !== undefined)
        {
            return cache[addressableId];
        }

        var result = await myFetch("/api/" + addressableId + "/profile");
        if (result)
        {
            cache[addressableId] = profile.data.profile;
            return cache[addressableId];
        } else
        {
            console.log("Fetch Error: Could not fetch profile from API: " + addressableId);
            return null
        }
    };
}

function messageCache()
{
    var current;
    var cache = {};

    return async function(addressableId)
    {
        current = addressableId;
        var after;

        if (!cache[addressableId])
        {
            cache[addressableId] = [];
            after = 0;
        } else
        {
            after = cache[addressableId][0].timestamp;
        }

        var result = await myFetch("/api/" + addressableId + "/profile?n=50&after=" + after);
        if (result)
        {
            cache[addressableId].append(result.data.messages);
            //TODO sort messages
            return cache[addressableId];
        } else
        {
            console.log("Fetch Error: Could not fetch messages from API: " + addressableId);
            return null
        }
    };
}

async function myFetch(endpoint, options = fetchOptions)
{
    var result;
    try {
        result = fetch(endpoint, fetchOptions);
        if (!result.ok)
        {
            console.log("Not OK fetch: Endpoint: " + endpoint + "Status code: " + result.status);
            return null;
        }
    } catch (error) {
        console.log("Fetch Error: Could not fetch API endpoint: " + endpoint);
        return null;
    }

    try {
        result = result.json();
    } catch (error) {
        console.log("Parsing Error: There was a problem parsing JSON data sent from API");
        return null;
    }

    return result;
}

