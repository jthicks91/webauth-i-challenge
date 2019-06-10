const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const session = require("express-session");
const SessionStore = require("connect-session-knex")(session);

const authRouter = require("../auth/auth-router.js");
const usersRouter = require("../users/users-router");

const server = express();
const sessionConfig = {
  name: "dog", // default name for cookie will be sid; CHANGE THE NAME to keep hackers guessing
  secret: "something secret i suppose",
  resave: false,
  saveUninitialized: false, // GDPR laws against setting cookies automatically
  cookie: {
    maxAge: 60 * 60 * 1000,
    secure: process.env.NODE_ENV === "producition" ? true : false, // true in production
    // secure: false,
    httpOnly: true
  },
  store: new SessionStore({
    knex: require("../data/dbConfig"),
    tablename: "sessions", // name of table we will be using from database
    sidfieldname: "sid",
    createtable: true,
    clearInterval: 60 * 60 * 1000
  })
};

function logger(req, res, next) {
  const { path } = req;
  const timeStamp = Date.now();
  const log = { path, timeStamp };
  console.log(`${req.method} Request`, log);
  next();
}

server.use(logger);

server.use(session(sessionConfig));

server.use(helmet());
server.use(express.json());
server.use(cors());

server.use("/api/auth", authRouter);
server.use("/api/users", usersRouter);

server.get("/", (req, res) => {
  res.send("It's alive!");
});

module.exports = server;
