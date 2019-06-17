var active = "Inbox";

    //{
    //    username:,
    //    name:,
    //    channelList: [ {address:, nickname:,},],
    //    tagList: [{name:, color:,},],
    //}
        //name: "Inbox",
        //messages: [{ img: "https://proxy.duckduckgo.com/iu/?u=https%3A%2F%2Fpng.pngtree.com%2Fsvg%2F20170602%2Fperson_1058425.png&f=1",
        //            message: "Message............",
        //            username: "Username",
        //            timestamp: "10:50:60" },],

function displayLoading()
{

    var chat = document.getElementById("chat");

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

    chat.appendChild(dot1);
    chat.appendChild(dot2);
    chat.appendChild(dot3);
    chat.appendChild(loading);

    var offset = 50;
    var delta = 1;
    return setInterval(() => {
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
}

function setHeight()
{
    var sidebar = document.getElementById("sidebar");
    var chat = document.getElementById("chat");
    var users = document.getElementById("users");

    sidebar.style.height = (window.innerHeight - 40) + "px";
    chat.style.height = (window.innerHeight - 40) + "px";
    users.style.height = (window.innerHeight - 40) + "px";
}

// /api/user/
// Dump all information based 
async function fetchUserInfo() 
{
    var userInfo = await fetch("/api/user/", {
          credentials: 'same-origin' 
    });

    //TODO validate input
    return userInfo.json();
} 

async function fetchChannelMessages(channel) 
{
    var userInfo = await fetch(window.location.host + "/:channel/messages", {
          credentials: 'same-origin' 
    });

    //TODO validate input
    return userInfo.json();
} 

async function startup()
{
    setHeight();
    window.addEventListener('resize', setHeight);
    displayLoading();

    try{ 
        var userInfo = await fetchUserInfo();

        {
            var p = document.createElement("p");
            p.appendChild(document.createTextNode(userInfo.name));
            document.getElementById("profile").appendChild(p);
        }

        var sidebar = document.getElementById("sidebar");

        userInfo.channelList.forEach((channel) => {
            var p = document.createElement("p");
            p.className = "channel";
            p.appendChild(document.createTextNode(channel.nickname));
            sidebar.appendChild(p);
        });

        userInfo.tagList.forEach((tag) => {
            var p = document.createElement("p");
            p.className = "tag";
            p.appendChild(document.createTextNode(tag.name));
            sidebar.appendChild(p);
        });

        var chat = document.getElementById("chat");

        userInfo.messageList.forEach((message) => {
            var div = document.createElement("div");
            div.className = "message";
            var img = document.createElement("img");
            img.className = "icon";
            img.src = message.img;
            var username = document.createElement("p");
            username.appendChild(document.createTextNode(message.username));
            var time = document.createElement("p");
            time.appendChild(document.createTextNode(message.timestamp));
            var br = document.createElement("br");
            var msg = document.createElement("p");
            msg.appendChild(document.createTextNode(message.message));

            div.appendChild(img);
            div.appendChild(username);
            div.appendChild(time);
            div.appendChild(br);
            div.appendChild(msg);

            chat.appendChild(div);
        });
    } catch(error) {
        console.log(error);
    }
}

startup();
                //<div class="message">
                //    <img src="https://proxy.duckduckgo.com/iu/?u=https%3A%2F%2Fpng.pngtree.com%2Fsvg%2F20170602%2Fperson_1058425.png&f=1" class="icon">
                //    <p>Username</p>
                //    <p>10:50:60</p>
                //    <br>
                //    <p>Message...............................</p>
                //</div>



// Message Format <Profile> <Username> <Time>
//                <Profile> <Message>
/*
fakeData.forEach((message) => {
    var div = document.createElement("div");
    div.className = "message";
    var img = document.createElement("img");
    img.className = "icon";
    img.src = message.img;
    var username = document.createElement("p");
    username.appendChild(document.createTextNode(message.username));
    var time = document.createElement("p");
    time.appendChild(document.createTextNode(message.timestamp));
    var br = document.createElement("br");
    var msg = document.createElement("p");
    msg.appendChild(document.createTextNode(message.message));

    div.appendChild(img);
    div.appendChild(username);
    div.appendChild(time);
    div.appendChild(br);
    div.appendChild(msg);

    messages.appendChild(div);
});
*/
