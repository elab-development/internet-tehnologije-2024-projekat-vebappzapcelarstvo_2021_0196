exports.seed = async function(knex) {
  const bcrypt = require('bcrypt');

  // Hashovane lozinke
  const adminPassword = bcrypt.hashSync('Admin123', 10);
  const userPassword = bcrypt.hashSync('User123', 10);

  // Admin
  const adminExists = await knex('Users').where({ username: 'admin' }).first();
  if (!adminExists) {
    await knex('Users').insert({
      username: 'admin',
      password: adminPassword,
      name: 'Admin',
      surname: 'User',
      role: 'administrator'
    });
  }

  // Obični korisnik
  const userExists = await knex('Users').where({ username: 'user' }).first();
  if (!userExists) {
    await knex('Users').insert({
      username: 'user',
      password: userPassword,
      name: 'User',
      surname: 'User',
      role: 'user'
    });
  }
};
