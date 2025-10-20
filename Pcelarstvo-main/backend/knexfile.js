module.exports = {
  development: {
    client: 'mssql',
    connection: {
      user: 'admin',
      password: 'Admin123',
      server: 'localhost',     
      port: 1433,               
      database: 'Pcelarstvo',
      options: {
        trustServerCertificate: true
      }
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',  
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  }
};
