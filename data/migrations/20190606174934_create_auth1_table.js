exports.up = async function(knex, Promise) {
  await knex.schema.createTable("credentials", tbl => {
    tbl.increments();
    tbl
      .string("username", 12)
      .notNullable()
      .unique();
    tbl.string("password").notNullable();
  });
};

exports.down = async function(knex, Promise) {
  await knex.schema.dropTableIfExists("credentials");
};
