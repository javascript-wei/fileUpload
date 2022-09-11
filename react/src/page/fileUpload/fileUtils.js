import SparkMD5 from "spark-md5"
/**
 * file:文件
 * chunkSize： 分割大小
*/
export const fileUpload = ({ file, chunkSize = 1024 * 100 }) => {
  return new Promise((resolve, reject) => {
    let blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
      chunks = Math.ceil(file.size / chunkSize),
      currentChunk = 0,
      spark = new SparkMD5.ArrayBuffer(),
      fileReader = new FileReader(),
      fileChunkList = []; // 切片集合
    fileReader.onload = function (e) {
      spark.append(e.target.result);
      // const hash = spark.end();
      /** 切换hash */
      // fileChunkList[currentChunk]["hash"] = hash;
      currentChunk++;
      if (currentChunk < chunks) {
        loadNext();
      } else {
        resolve({ fileChunkList, hash: spark.end(), size: file.size, name: file.name });
      }
    };
    fileReader.onerror = () => {
      reject("文件读取失败");
    }
    function loadNext() {
      let start = currentChunk * chunkSize,
        end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize,
        fileChunk = blobSlice.call(file, start, end);
      fileChunkList.push({
        fileChunk,
        currentChunk,
        size: fileChunk.size,
      })
      fileReader.readAsArrayBuffer(fileChunk);
    }
    loadNext();
  })
}