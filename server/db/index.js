const mysql = require('mysql')
// 需要补充相关的配置数据库连接信息
const db = mysql.createConnection({
    host: '',
    user: '',
    password: '',
    database: '',
    port:''
})
module.exports = db;
