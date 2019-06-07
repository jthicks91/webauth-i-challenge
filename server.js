const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const Users = require("./users/users-model.js");

const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors());

function logger(req, res, next) {
  const { path } = req;
  const timeStamp = Date.now();
  const log = { path, timeStamp };
  console.log(`${req.method} Request`, log);
  next();
}

server.use(logger);

server.get("/", (req, res) => {
  res.send("It's alive!");
});

server.post("/api/register", async (req, res) => {
  try {
    const credentials = req.body;
    // genereate hash form users' password
    const hash = bcrypt.hashSync(credentials.password, 12); // 2 ^ n
    //ovverride user.password with hash
    credentials.password = hash;
    const newUser = await Users.add(credentials);
    if (newUser) {
      res.status(201).json(newUser);
    } else {
      res.status(400).json({ message: "Cannot register. Error with request" });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong with this request. Try again." });
  }
});

server.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    Users.findBy({ username })
      .first()
      .then(user => {
        // check that passwords match`
        if (user && bcrypt.compareSync(password, user.password)) {
          res.status(200).json({ message: `Welcome ${user.username}!` });
        } else {
          res
            .status(401)
            .json({ message: "Invalid Credentials. You Shall not pass" });
        }
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong with this request. Try again." });
  }
});

function authorize(req, res, next) {
  const username = req.headers["x-username"];
  const password = req.headers["x-password"];

  if (!username || !password) {
    return res.status(401).json({ message: "Invalid Credentials" });
  }

  Users.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        next();
      } else {
        res.status(401).json({ message: "Invalid Credentials" });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
}

//protect ths route, only authenticated users should see it

server.get("/api/users", authorize, async (req, res) => {
  try {
    Users.find().then(users => {
      res.json(users);
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong with this request. Try again." });
  }
});

module.exports = server;
