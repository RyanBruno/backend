const fetchOptions = { 
    method: "GET",
    credentials: "same-origin",
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
    },
};

/* Display Functions */
function displayUser(profile)
{
    document.getElementById("profile").appendChild(document.createTextNode(profile.name));
}

function displayChannel(profile, listener)
{
    var p = document.createElement("p");
    p.appendChild(document.createTextNode(profile.name));
    document.getElementById("sidebar").appendChild(p);

    p.addEventListener("click", listener); 
}

function clearMessages()
{
    var messages = document.getElementById("messages");
    messages.childNodes.forEach((node) => messages.removeChild(node));
}

function displayMessage(message, profile)
{
    console.log(profile);
    var messages = document.getElementById("messages");

    var div      = document.createElement("div");
    var img      = document.createElement("img");
    var username = document.createElement("p");
    var time     = document.createElement("p");
    var br       = document.createElement("br");
    var msg      = document.createElement("p");

    div.className = "message";
    img.src = profile.img;

    username.appendChild(document.createTextNode(profile.name));
    time.appendChild(document.createTextNode(" " + message.timestamp));
    msg.appendChild(document.createTextNode(message.message));

    div.appendChild(img);
    div.appendChild(username);
    div.appendChild(time);
    div.appendChild(br);
    div.appendChild(msg);

    messages.appendChild(div);
}

/* Frontend Functions */
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

function UI()
{
    setHeight();
    window.addEventListener("resize", setHeight);

    this.loadingCleanup = loadingDisplay();
    this.active;
    this.profiles = profileCache();
    this.messages = messageCache();
}

UI.prototype.loadUser = async function()
{
    const result = await myFetch("/api/session/");

    if (!result) {/*Login*/return; } // TODO THrow error

    this.addressableId = result.addressableId;

    this.profiles(this.addressableId).then((profile) => {
        if (profile) displayUser(profile);
    });
};

UI.prototype.loadChannels = function()
{
    myFetch("/api/" + this.addressableId + "/channels/").then((result) => {
        if (result)
        {
            result.data.channels.forEach((channel) => {
                this.profiles(channel).then((profile) => {
                    displayChannel(profile, () => {
                        this.loadMessages(channel);
                    });
                }).catch(() => {
                    console.log("Fetch Error: Could not fetch profile from API: " + channel);
                });
            });
        } else
        {
            console.log("Fetch Error: Could not fetch channels from API: " + this.addressableId);
        }
    });
};

UI.prototype.loadMessages = function(addressableId)
{
    this.messages(addressableId).then((messages) => {
        if (messages)
        {
            this.active = addressableId;
            this.loadingCleanup();
            clearMessages();
            messages.forEach((message) => {
                this.profiles(message.fromAddressableId).then((profile) => {
                    displayMessage(message, profile);
                }).catch(() => {
                    console.log("Fetch Error: Could not fetch profile from API: " + message.fromAddressableId);
                });
            });
        }
    }).catch((error) => {
        console.log("Wiping message cache to try and fix the problem.");
        this.messages();
    });
};

UI.prototype.sendMessage = function(message)
{
    myFetch("/api/" + this.active + "/message" , {
        ...fetchOptions,
        method: "POST",
        body: JSON.stringify({ toAddressableId: this.active, fromAddressableId: this.addressableId, message }),
    });
};

function startup()
{
    const ui = new UI();
    ui.loadUser().then(() => {
        ui.loadChannels();
        ui.loadMessages(ui.addressableId);

        const bar = document.getElementsByTagName("input")[0];
        bar.addEventListener("keypress", (event) => {
            if (event.key === "Enter")
            {
                ui.sendMessage(event.target.value);
                event.target.value = "";
            }
        });

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
            cache[addressableId] = result.data.profile;
            return cache[addressableId];
        } else
        {
            console.log("Fetch Error: Could not fetch profile from API: " + addressableId);
            return null;
        }
    };
}

function messageCache()
{
    var cache = {};

    return async function(addressableId)
    {
        if (!addressableId) { cache = {}; return; }

        var after;

        if (!cache[addressableId])
        {
            cache[addressableId] = [];
            after = 0;
        } else
        {
            after = cache[addressableId][0].timestamp;
        }

        var result = await myFetch("/api/" + addressableId + "/messages?n=50&after=" + after);
        if (result)
        {
            cache[addressableId] = _.concat(cache[addressableId], result.data.messages);
            cache[addressableId] = _.sortBy(cache[addressableId], [ "timestamp" ]);
            return cache[addressableId];
        } else
        {
            console.log("Fetch Error: Could not fetch messages from API: " + addressableId);
            return null;
        }
    };
}

async function myFetch(endpoint, options = fetchOptions)
{
    var result;
    try {
        result = await fetch(endpoint, options);
        if (!result.ok)
        {
            console.log("Not OK fetch: Endpoint: " + endpoint + " Status code: " + result.status);
            return null;
        }
    } catch (error) {
        console.log("Fetch Error: Could not fetch API endpoint: " + endpoint);
        return null;
    }

    try {
        result = await result.json();
    } catch (error) {
        console.log("Parsing Error: There was a problem parsing JSON data sent from API");
        return null;
    }

    return result;
}
