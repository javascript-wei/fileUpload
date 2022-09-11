const path = require("path");
const fs = require("fs");
const fsPromise = require("fs/promises")
const db = require("../db")
const { Buffer } = require("buffer")

const FILE_STORE_PATH = path.resolve(__dirname, '../static/'),
  WRITE_PATH = path.resolve(__dirname, '../resources');

exports.upload = (req, res) => {
  res.send({ 'code': 200, success: true })
}
/** 根据文件hash在数据查询当前文件是否已经上传 */
exports.queryFileByHash = (req, res) => {
  const { fileHash } = req.body;
  const sql = `select * from file where fileHash = ?`
  db.query(sql, [fileHash], function (err, results) {
    if (err) {
      res.send({ code: 500, success: false, msg: '查询失败' });
      return;
    }
    res.send({ code: 200, success: true, data: results });
  })
}

/** 根据文件hash在查询当前文件夹所有文件 */
exports.queryDirFileByHash = (req, res) => {
  const { fileHash } = req.body;
  const tempStoragePath = `${FILE_STORE_PATH}/${fileHash}`;
  if (!fs.existsSync(tempStoragePath)) return res.send({ code: 200, success: true, data: [] });
  const fileList = fs.readdirSync(tempStoragePath);
  res.send({ code: 200, success: true, data: fileList });
}

/** 合并文件 */
exports.mergeFile = (req, res) => {
  const { fileName, fileHash } = req.body;
  const tempStoragePath = `${FILE_STORE_PATH}/${fileHash}`;
  if (!fs.existsSync(WRITE_PATH)) fs.mkdirSync(WRITE_PATH);
  const insertFileMeg = () => {
    const sql = 'INSERT INTO file (fileHash,fileName) VALUES (?,?)';
    db.query(sql, [fileHash, fileName], function (err, results) {
      console.log(err, '11');
      if (err) {
        return res.send({ code: 500, success: false, msg: '文件信息存储失败' });
      }
      res.send({ code: 200, success: true, msg: "文件处理成功" });
    })
  }
  try {
    let len = 0
    const bufferList = fs.readdirSync(tempStoragePath).sort((a, b) =>
      parseInt(a.split('.')[0] - parseInt(b.split('.')[0]))).map((value, index) => {
        const buffer = fs.readFileSync(`${tempStoragePath}/${value}`)
        len += buffer.length;
        return buffer;
      });
    const buffer = Buffer.concat(bufferList, len);
    const ws = fs.createWriteStream(`${WRITE_PATH}/${fileName}`)
    ws.write(buffer);
    ws.close();
    /** 递归删除static/upload文件夹下所有内容 */
    fsPromise.rm(path.resolve(__dirname, FILE_STORE_PATH), { recursive: true, force: true })
    // 文件写入完成，把当前文件信息存进数据库
    insertFileMeg();
  } catch (error) {
    res.send({ code: 500, msg: error, success: false })
  }
}
/** 查询文件所有信息 */
exports.queryAllFile = (req, res) => {
  const sql = `select * from file`;
  db.query(sql, function (err, results) {
    if(err){
     return res.send({ code: 500, success: false, msg: '查询失败' });
    }
    res.send({ code: 200, success: false,data: results });
  })
}



