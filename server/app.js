const express = require('express')
const app = express()
const router = require('./router/file')
const cors = require('cors');
const path = require("path");
const fs = require("fs");
var bodyParser = require('body-parser')
const port = 3033
// app.use(cors({
//     origin: 'http://127.0.0.1:9000',
//     optionsSuccessStatus: 200
// }))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(router);
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

// const promises = require("fs/promises");
// const a = async ()=>{
//     try {
//         const dir = await promises.opendir(path.resolve(__dirname,'./static/upload'));
//         const writer = fs.createWriteStream(path.resolve(__dirname, `./static/upload/sum.txt`));
//         const reader = fs.createReadStream(path.resolve(__dirname, `./static/upload/10.txt`))
//         reader.pipe(writer);
//         for await (const dirent of dir){}
//           // console.log(dirent.name);
//       } catch (err) {
//         console.error(err);
//       }
// }
// // a()

// app.post('/queryText', (req, res) => {
//     console.log(req,res);
//     const sql = `select * from file`;
//     db.query(sql, function (err, results) {
//         res.send(results);
//         // console.log(err, results);
//         // TODO: 用户名可用，继续后续流程...
//     })
// })


