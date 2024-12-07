import axios from "axios";
import connection from "../database/connection.js";

export const fetchFromJournal = async (req, res) => {
  const predictURL = process.env.URL_BE_MOODIFY;

  const date = new Date();
  date.setDate(date.getDate() - 1);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const yesterday = `${year}-${month}-${day}`;

  console.log("Processing journals for:", yesterday);

  const sqlQuery = `
    SELECT * FROM Journal 
    WHERE isPredicted = 0 
      AND createdAt BETWEEN '${yesterday} 00:00:00' AND '${yesterday} 23:59:59'
  `;

  try {
    const journals = await new Promise((resolve, reject) => {
      connection.query(sqlQuery, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });

    console.log(`${journals.length} journals found`);

    if (journals.length === 0) {
      return res.status(200).json({ success: true, message: "No journals to process" });
    }

    const failedJournals = [];

    for (const journal of journals) {
      const url = `${predictURL}/api/v1/journals/predict/${journal.journalId}`;
      const options = {
        method: "PUT",
        data: { content: journal.content },
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      };

      try {
        const response = await axios(url, options);
        console.log(`Predicted journal ${journal.journalId}:`, response.data);

        if (response.data.error) {
          const { error, message } = response.data;
          return res.status(409).json({
            error: error,
            message: "Journal already predicted caused error"
          })
        }

        // Update database to mark as predicted
        // const updateQuery = `
        //   UPDATE Journal 
        //   SET isPredicted = 1 
        //   WHERE journalId = '${journal.journalId}'
        // `;
        // await new Promise((resolve, reject) => {
        //   connection.query(updateQuery, (err) => {
        //     if (err) return reject(err);
        //     resolve();
        //   });
        // });
      } catch (err) {
        console.error(`Error processing journal ${journal.journalId}:`, err.message);
        failedJournals.push(journal.journalId);
      }
    }

    return res.status(200).json({
      success: true,
      processed: journals.length,
      failed: failedJournals,
    });
  } catch (err) {
    console.error("Error fetching journals:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
