const sql = require('mssql');

const config = {
  user: 'admin',
  password: 'Admin123',
  server: 'localhost',
  port: 1433,
  database: 'Pcelarstvo',
  options: {
    trustServerCertificate: true
  }
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

module.exports = { sql, pool, poolConnect };
