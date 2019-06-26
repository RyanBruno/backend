var active = "Inbox";

const fetchOptions = { 
    method: "GET",
    credentials: "same-origin",
    headers: {
        "Accept": "application/json",
    },
};
//{
//    username:,
//    name:,
//    channelList: [ {address:, nickname:,},],
//    tagList: [{name:, color:,},],
//}

function loadingDisplay()
{
    var dot1 = document.createElement("div");
    var dot2 = document.createElement("div");
    var dot3 = document.createElement("div");
    var loading = document.createElement("p");

    loading.appendChild(document.createTextNode("Loading"));

    dot1.className = "dot";
    dot2.className = "dot";
    dot3.className = "dot";

    dot1.style.top = (window.innerHeight / 3) + "px";
    dot2.style.top = (window.innerHeight / 3) + "px";
    dot3.style.top = (window.innerHeight / 3) + "px";

    loading.style.position = "absolute";
    loading.style.top = ((window.innerHeight / 3) - 50) + "px";

    var interval;

    return {
        display: function() {
            var chat = document.getElementById("chat");

            chat.appendChild(dot1);
            chat.appendChild(dot2);
            chat.appendChild(dot3);
            chat.appendChild(loading);

            var offset = 50;
            var delta = 1;

            interval = setInterval(() => {
                offset = offset + delta;
                if (offset == 100) {
                    delta = -1;
                } else if (offset == 0) {
                    delta = 1;
                }
                var pos = offset + (window.innerWidth / 2) - 50;
                dot1.style.left = (pos - 45) + "px";
                dot2.style.left = (pos - 5) + "px";
                dot3.style.left = (pos + 35) + "px";
                loading.style.left = (window.innerWidth / 2 - 35) + "px";
            }, 1);
        }, hide: function() {
            clearInterval(interval);

            loading.style.display = "none";
            dot1.style.display = "none";
            dot2.style.display = "none";
            dot3.style.display = "none";
        }
    };
}

function setHeight()
{
    var sidebar = document.getElementById("sidebar");
    var chat = document.getElementById("chat");
    var users = document.getElementById("users");
    var messages = document.getElementById("messages");

    sidebar.style.height = (window.innerHeight - 40) + "px";
    chat.style.height = (window.innerHeight - 40) + "px";
    users.style.height = (window.innerHeight - 40) + "px";
    messages.style.height = (window.innerHeight - 100) + "px";
}

async function login()
{
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    //TODO change submit box to loading...

    fetch("/api/session/", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        credentials: "same-origin",
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
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        credentials: "same-origin",
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

    var loading = loadingDisplay();
    loading.display();

    try { 

        var addressableId = await fetch("/api/session/", fetchOptions);
        addressableId = await addressableId.json();
        addressableId = addressableId.data;

        var profileCache = profileCache(addressableId);
        var messageCache = messageCache(addressableId);

        profileCache.getCacheProfile(addressableId).then((profile) => {
            document.getElementById("profile").
                appendChild(document.createTextNode(profile.name));
        });

        let channels = await fetch("/api/" + addressableId + "/channels/", fetchOptions);
        channels = await channels.json();
        channels = channels.data;

        var sidebar = document.getElementById("sidebar");
        channels.channels.forEach(function (channel) {
            profileCache.getCacheProfile(channel).then((profile) => {
                var p = document.createElement("p");
                p.appendChild(document.createTextNode(profile.name));
                sidebar.appendChild(p);

                p.addEventListener("click", function() {
                    messageCache.displayRecentMessages(channel);
                }); 
            });
        });

        loading.hide();
        messageCache.displayRecentMessages(addressableId);
    } catch(error) {
        // TODO error handling
        console.log(error);
    }
}

function profileCache()
{
    var cache = {};
    async function getCacheProfile(addressableId)
    {
        if (cache[addressableId] !== undefined)
        {
            return cache[addressableId];
        }

        var profile = await fetch("/api/" + addressableId + "/profile", fetchOptions);
        profile = await profile.json();
        cache[addressableId] = profile.data;
        return profile.data;
    }
}

async function messageCache()
{
    var current;
    var cache = {};
    async function displayRecentMessages(addressableId)
    {
        var data = getCachedMessages(addessableId);
        var messages = document.getElementById("messages");
        data.forEach((message) => {
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
        });
    }

    async function getCacheMessages(addressableId)
    {
        if (cache[addressableId] !== undefined)
        {
            return cache[addressableId];
        }

        var messages = await fetch("/api/" + addressableId + "/messages", fetchOptions);
        // TODO only recent messages
        messages = await messages.json();
        cache[addressableId] = messages.data;
        return messages.data;
    }
}
