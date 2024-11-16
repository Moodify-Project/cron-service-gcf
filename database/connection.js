import mysql from 'mysql';
const connection = mysql.createConnection({
  host: process.env.HOST || '127.0.0.2',
  port: process.env.PORT || '8111',
  user: process.env.USER || 'root',
  password: process.env.PASSWORD || '',
  database: process.env.DATABASE || 'moodify'
})

export default connection;

