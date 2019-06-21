const express = require("express");

const session = require("express-session");
const redisStore = require("connect-redis")(session);

const api = require("./api");

const app = express();

app.use("/style.css", express.static("views/style.css"));
app.use("/app.js", express.static("views/app.js"));
app.use("/ui", express.static("views/ui.html"));

app.use(session({ store: new redisStore({ url: "redis://localhost:6379" }), secret: "very secret secret", resave: false, saveUninitialized: false, }));
app.use(express.json());

const apiRouter = express.Router();

apiRouter.get("/session", api.getSession);
apiRouter.get("/:channelName/message", api.getChannelMessages);
apiRouter.get("/user/:username/channel", api.getUserChannels);
apiRouter.get("/user/:username/message", api.getUserMessages);

apiRouter.post("/session", api.postSession);
apiRouter.post("/:channelName/message", api.postChannelMessage);

app.use("/api", apiRouter);

app.listen(8080, () => {
    console.log("App listing: 8080");
});
