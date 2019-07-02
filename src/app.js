const express = require("express");

const session = require("express-session");
const redisStore = require("connect-redis")(session);

const routes = require("./routes");

const app = express();

app.use("/style.css", express.static("views/style.css"));
app.use("/app.js", express.static("views/app.js"));
app.use("/ui", express.static("views/ui.html"));
app.use("/login", express.static("views/login.html"));

app.use(session({ store: new redisStore({ url: "redis://localhost:6379" }), secret: "very secret secret", resave: false, saveUninitialized: false, }));
app.use(express.json());

const apiRouter = express.Router();

apiRouter.get("/session/", routes.getSession);
apiRouter.get("/:addressableId/channels", routes.getChannels);
apiRouter.get("/:addressableId/messages", routes.getMessages);
apiRouter.get("/:addressableId/profile", routes.getProfile);

apiRouter.post("/session/", routes.postSession);
apiRouter.post("/user/", routes.postUser);
apiRouter.post("/:addressableId/message", routes.postMessage);

app.use("/api", apiRouter);

app.listen(8080, () => {
    console.log("App listing: 8080");
});
