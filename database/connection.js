import mysql from 'mysql';
const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST || '127.0.0.2',
  port: process.env.MYSQL_PORT || '8111',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'moodify'
})

export default connection;

