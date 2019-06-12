const db = require("./dbConfig.js");

module.exports = {
  add,
  find,
  findBy,
  findById
};

function find() {
  return db("credentials").select("id", "username", "password");
}

function findBy(filter) {
  return db("credentials").where(filter);
}

async function add(user) {
  const [id] = await db("credentials").insert(user);

  return findById(id);
}

function findById(id) {
  return db("credentials")
    .where({ id })
    .first();
}
