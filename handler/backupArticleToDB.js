import axios from "axios";
// import myCache from "../configs/myCache";
import connection from "../database/connection.js";
import { v4 as uuidv4 } from 'uuid';

export const backupArticleToDB = async (req, res) => {
    const sqlArticleRows = 'SELECT * FROM article'
    const API_KEY_NEWS = process.env.API_KEY_NEWS || 'a67388915ccc4bb186579c7443fbc737';

    const countArticleRows = await new Promise((resolve, reject) => {
        connection.query(sqlArticleRows, (err, rows) => {
            if (err) return reject(err);

            resolve(rows.length);
        })
    })

    let filterArticleDay = 0;

    // console.log(countArticleRows);

    if (countArticleRows <= 0) {
        filterArticleDay = 7;
    }

    const date = new Date();

    date.setDate(date.getDate() - filterArticleDay);

        
    const queryDate = date.toISOString().split("T")[0];

    // console.log(queryDate)

    const url = `https://newsapi.org/v2/everything?domains=forbes.com&q=mental&from=${queryDate}&apiKey=${API_KEY_NEWS}`;

    axios.get(url)
        .then( async (response) => {
            const { status, totalResults, articles } = response.data;
            // const getDozens = totalResults.toString();
            // const dozensIndex = getDozens.slice(0, getDozens.length - 1);

            // interface News {
            //     source: {
            //         id: undefined,
            //         name: string,
            //     };
            //     author: string;
            //     title: string;
            //     description: string;
            //     url: string;
            //     urlToImage: string;
            //     publishedAt: string;
            //     content: string;
            // }

            if (articles.totalResults === 0) {
                //
            }

            // console.log(articles);

            const values = articles.map((article) => [
                uuidv4(),
                article.source.name || null,
                article.author || null, 
                article.title || null, 
                article.description || null, 
                article.url || null, 
                article.urlToImage || null, 
                article.publishedAt || null,
                article.content || null
            ]);

            console.log(values);

            const sqlCreate = `INSERT INTO article (id, source, author, title, description, url, urlToImage, publishedAt, content) VALUES ?`

            const articleCreated = await new Promise((resolve, reject) => {
                connection.query(sqlCreate, [values], (err, rows) => {
                    if (err) return reject(err);

                    resolve(rows.affectedRows > 0)


                })
            })

            if (!articleCreated) {
                console.log('failed to create new article')
            }

            return res.status(200).json({
                status: false,
                message: 'new article successfully created', 
            })
        })
        .catch((err) => {
            // console.log(`Error: ${err}`);
            return res.status(404).json({
                status: false,
                message: 'no article founded when fetch API',
            });
        });
}

// export default getNews;