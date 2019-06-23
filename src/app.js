const express = require("express");

const redisStore = require("connect-redis")(session);

const session = require("./session");
const user = require("./user");
const channel = require("./channel");

const app = express();

app.use("/style.css", express.static("views/style.css"));
app.use("/app.js", express.static("views/app.js"));
app.use("/ui", express.static("views/ui.html"));

app.use(session.session({ store: new redisStore({ url: "redis://localhost:6379" }), secret: "very secret secret", resave: false, saveUninitialized: false, }));
app.use(express.json());

const apiRouter = express.Router();
const sessionRouter = express.Router();
const userRouter = express.Router();
const channelRouter = express.Router();

sessionRouter.use(session.middleware);
userRouter.use(user.middleware);
channelRouter.use(channel.middleware);

sessionRouter.get("/", session.getSession);
userRouter.get("/:username/channel", user.getUserChannels);
userRouter.get("/:username/message", user.getUserMessages);
channelRouter.get("/:channelName/message", channel.getChannelMessages);

sessionRouter.post("/", session.postSession);
userRouter.post("/", user.postUser);
channelRouter.post("/:channelName/message", user.postChannelMessage);

app.use("/api", apiRouter);
apiRouter.use("/user", userRouter);
apiRouter.use("/channel", channelRouter);

app.listen(8080, () => {
    console.log("App listing: 8080");
});
