const { sql, poolConnect } = require('../db');
const bcrypt = require('bcryptjs');

async function registerUser(user) {
    // wait for connection to DB
    await poolConnect;
    const { username, password, name, surname } = user;
    // this is always user, since admin role is injected directly into DB while seeding
    const role = 'user';
    // encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const request = (await poolConnect).request();
    request.input('username', sql.VarChar, username);
    request.input('password', sql.VarChar, hashedPassword);
    request.input('name', sql.VarChar, name);
    request.input('surname', sql.VarChar, surname);
    request.input('role', sql.VarChar, role);
    
    const result = await request.query(`
    INSERT INTO Users (username, password, name, surname, role)
    VALUES (@username, @password, @name, @surname, @role)
  `);

    return result;
}

async function findUserByUsername(username) {
  await poolConnect;

  const request = (await poolConnect).request();
  request.input('username', sql.VarChar, username);

  const result = await request.query(`
    SELECT * FROM Users WHERE username = @username
  `);

  return result.recordset[0];
}

async function listBeekeepers() {
  await poolConnect;
  const req = (await poolConnect).request();
  req.input('role', sql.VarChar, 'user');

  const q = `
    SELECT id, username, name, surname
    FROM Users
    WHERE role = @role
    ORDER BY username;
  `;
  const rs = await req.query(q);
  return rs.recordset;
}

async function changePassword({ username, oldPassword, newPassword }) {
  if (!username || !oldPassword || !newPassword) {
    const e = new Error('username, oldPassword and newPassword are required');
    e.statusCode = 400; throw e;
  }

  await poolConnect;

  // Load user
  const req1 = (await poolConnect).request();
  req1.input('username', sql.VarChar, username);
  const ures = await req1.query(`SELECT id, password FROM Users WHERE username = @username;`);
  const user = ures.recordset[0];
  if (!user) {
    const e = new Error('User not found');
    e.statusCode = 404; throw e;
  }

  // Verify old password
  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok) {
    const e = new Error('Old password is incorrect');
    e.statusCode = 401; throw e;
  }

  // Hash new password
  const hashed = await bcrypt.hash(newPassword, 10);

  // Update
  const req2 = (await poolConnect).request();
  req2.input('id', sql.Int, user.id);
  req2.input('pwd', sql.VarChar, hashed);
  await req2.query(`
    UPDATE Users
      SET password = @pwd
    WHERE id = @id;
  `);

  return { ok: true };
}

module.exports = { registerUser, findUserByUsername, listBeekeepers, changePassword };
