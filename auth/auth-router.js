const router = require("express").Router();
const bcrypt = require("bcryptjs");
const restricted = require("./restricted-middleware");

const db = require("../data/dbMethod.js");

router.post("/register", (req, res) => {
  let user = req.body;
  const hash = bcrypt.hashSync(user.password, 10); // 2 ^ n
  user.password = hash;

  db.add(user)
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

router.post("/login", (req, res) => {
  let { username, password } = req.body;

  db.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        req.session.user = user;
        res.status(200).json({
          message: `Welcome ${user.username}!`
        });
      } else {
        res.status(401).json({ message: "Invalid Credentials" });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

router.get("/logout", restricted, (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "There was an error" });
      }
      res.end();
    });
  } else {
    res
      .status(200)
      .json({ message: "You have been successfully logged out." })
      .end();
  }
});

module.exports = router;
