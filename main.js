import express from 'express';
import { fetchFromJournal } from './handler/fetchFromJournal.js';
import connection from './database/connection.js';
import { backupArticleToDB } from './handler/backupArticleToDB.js';

const app = express();
const port = 3000;

app.use(express.json());

connection.connect();

app.get('/', (req, res) => {
    res.status(200).json({ message: 'hello world' });
})

app.get('/fetch', fetchFromJournal);
app.post('/backup-article', backupArticleToDB);

// connection.end();

export const api = app;

app.listen(port, '0.0.0.0', () => {
    console.log('server run on port:', port);
})