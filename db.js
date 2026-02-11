const mariadb = require('mariadb');
const dotenv = require('dotenv').config();

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DBNAME,
  connectionLimit: 5
});

pool.getConnection()
  .then(conn => {
    console.log('Conexão com banco de dados estabelecida');
    conn.release();
  })
  .catch(err => {
    console.error('Erro ao conectar ao banco de dados:', err);
  });

module.exports = pool;
