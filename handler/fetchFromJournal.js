import connection from "../database/connection.js"

export const fetchFromJournal = async (req, res) => {

    const predictURL = process.env.PREDICT_URL || 'http://localhost:8000';

    const date = new Date();
    date.setDate(date.getDate() - 1);
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const yesterday = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    console.log(yesterday);
    

    const sqlQUery = `SELECT * FROM journal WHERE isPredicted = 0 AND createdAt BETWEEN '${yesterday} 00:00:00' AND '${yesterday} 23:59:59'`;

    const journals = await new Promise((resolve, reject) => {
        connection.query(sqlQUery, (err, rows, fields) => {
            if (err) reject(err);
            resolve(rows);
          })
    });

    const requests = await Promise.all(journals.map(async (journal) => {
        const url = `${predictURL}/predict/${journal.journalId}`;
        const options = {
          method: 'PUT',
          body: JSON.stringify({content: journal.content}),
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
            }
        };
        
        try {
          const response = await fetch(url, options);
          const result = await response.json();
          console.log(result);
        } catch (err) {
          console.error('Error during fetch:', err);
        }
    }));

    await Promise.all(requests);

    return res.status(200).json({
        success: true,
        data: journals,
    })
}