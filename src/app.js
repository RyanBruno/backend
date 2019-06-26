const express = require("express");


const exSession = require("express-session");
const redisStore = require("connect-redis")(exSession);

const session = require("./session");
const routes = require("./routes");

const app = express();

app.use("/style.css", express.static("views/style.css"));
app.use("/app.js", express.static("views/app.js"));
app.use("/ui", express.static("views/ui.html"));
app.use("/login", express.static("views/login.html"));

app.use(exSession({ store: new redisStore({ url: "redis://localhost:6379" }), secret: "very secret secret", resave: false, saveUninitialized: false, }));
app.use(express.json());

const apiRouter = express.Router();

apiRouter.get("/session/", session.getSession); // {}
apiRouter.get("/:addressableId/channels", routes.getChannels); // { addressableId }
apiRouter.get("/:addressableId/messages", routes.getMessages); // { addressableId }
apiRouter.get("/:addressableId/profile", routes.getProfile); // { addressableId }

apiRouter.post("/session/", session.postSession); // { username, password }
apiRouter.post("/user/", routes.postUser); // { username, password }
apiRouter.post("/:addressableId/message", routes.postMessage); // { addressableId ...message} 

app.use("/api", apiRouter);

app.listen(8080, () => {
    console.log("App listing: 8080");
});
