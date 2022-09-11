const express = require('express')
const routerHandle = require('../router_handler/file')
const router = express.Router()
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const FILE_STORE_PATH = path.resolve(__dirname, '../static');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { fileHash } =  req.body;
    /** 根据文件MD5动态生成文件夹 */
    const tempStoragePath = `${FILE_STORE_PATH}/${fileHash}`;
    if (!fs.existsSync(tempStoragePath)) {
      fs.mkdirSync(tempStoragePath, { recursive: true });
    }
    cb(null, tempStoragePath);
  },
  filename: function (req, file, cb) {
    cb(null, req.body.fileChunkName);
  }
})

const upload = multer({ storage });
router.post('/upload', upload.single("file"), routerHandle.upload);
router.post('/mergeFile', routerHandle.mergeFile);
router.post('/queryFileByHash', routerHandle.queryFileByHash);
router.post('/queryDirFileByHash', routerHandle.queryDirFileByHash);
router.post('/queryAllFile', routerHandle.queryAllFile);

module.exports = router