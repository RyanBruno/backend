var active = "Inbox";

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
        var options = { 
            method: "GET",
            credentials: "same-origin",
            headers: {
                "Accept": "application/json",
            },
        };

        let username = await fetch("/api/session/", options);
        username = await username.json();
        username = username.username;

        document.getElementById("profile").
            appendChild(document.createTextNode(username));

        fetch("/api/user/" + username + "/channel/", options).then((result) => {
            return result.json();
        }).then((channels) => {
            var sidebar = document.getElementById("sidebar");
            channels.forEach((channel) => {
                var p = document.createElement("p");
                p.className = "channel";
                p.appendChild(document.createTextNode(channel.channelName));
                sidebar.appendChild(p);
                sidebar.appendChild(document.createElement("br"));
            });
        });


        fetch("/api/user/" + username + "/message/", options).then((result) => {
            return result.json();
        }).then((inbox) => {
            loading.hide();

            var messages = document.getElementById("messages");
            inbox.forEach((message) => {
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
        });
    } catch(error) {
        // TODO error handling
        console.log(error);
    }
}
