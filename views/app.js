
var active = "Inbox";

var data = [
];

        //name: "Inbox",
        //messages: [{ img: "https://proxy.duckduckgo.com/iu/?u=https%3A%2F%2Fpng.pngtree.com%2Fsvg%2F20170602%2Fperson_1058425.png&f=1",
        //            message: "Message............",
        //            username: "Username",
        //            timestamp: "10:50:60" },],

var channels = document.getElementsByClassName("channel");

for (i = 0; i < channels.length; i++)
{
    console.log(channels[i]);
    var channel = { name: channels[i].innerHTML, messages: [] };

    // Call api get messages

    data.push(channel);
}

                //<div class="message">
                //    <img src="https://proxy.duckduckgo.com/iu/?u=https%3A%2F%2Fpng.pngtree.com%2Fsvg%2F20170602%2Fperson_1058425.png&f=1" class="icon">
                //    <p>Username</p>
                //    <p>10:50:60</p>
                //    <br>
                //    <p>Message...............................</p>
                //</div>
var messages = document.getElementById("chat");
messages.style.height = (window.innerHeight - 80) + "px";
window.addEventListener('resize', function(event) {
    messages.style.height = (window.innerHeight - 80) + "px";
});

// TODO Spinning loading animation
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
