import React, { useState } from 'react';
import 'antd/dist/antd.css';
import ReactDOM from 'react-dom';
import { Upload, Button, Progress, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons';
import { upload, mergeFile, queryFileByHash, queryDirFileByHash } from '../../axios'
import { fileUpload } from './fileUtils'

const App = () => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [chunkTotal, setChunkTotal] = useState(0);
  const [uploadChunkNum, setUploadChunkNum] = useState(0);
  const handleUpload = () => {
    fileUpload({ file: fileList[0] }).then(async (fileMsg) => {
      setUploading(true);
      setChunkTotal(fileMsg.fileChunkList.length);
      let fileChunkList = fileMsg.fileChunkList;
      try {
        /** 根据文件md5查询数据库 */
        const queryFileByHashRes = await queryFileByHash({ fileHash: fileMsg.hash });
        if (queryFileByHashRes.data.data.length) {
          message.success("文件上传成功");
          setUploading(false);
          setUploadChunkNum(fileMsg.fileChunkList.length);
          return;
        }
        /** 根据文件md5查询文件夹下文件（快传） */
        const queryDirFileByHashRes = await queryDirFileByHash({ fileHash: fileMsg.hash });
        const { data } = queryDirFileByHashRes.data; 
        /** 过滤掉已经上传成功的分片（断点续传） */
        if(data.length){
          fileChunkList = fileMsg.fileChunkList.filter(item=>!data.includes(String(item.currentChunk)));
          setUploadChunkNum(data.length);
        }
      } catch (error) {
        message.error(error);
        fileChunkList = [];
        // fileChunkList();
      }
      const reqs = fileChunkList.map((item, index) => {
        let formData = new FormData();
        formData.append('fileChunkName', item.currentChunk);
        formData.append('fileHash', fileMsg.hash);
        // 文件切片（尽量放在最后，node中间件multer可能会获取不到）
        formData.append('file', item.fileChunk);
        return upload(formData, (e) => {
          // 当前分片上传完成
          if (e.loaded === e.total) {
            setUploadChunkNum((uploadChunkNum) => uploadChunkNum + 1);
          }
        });
      })
      Promise.all(reqs).then(() => {
        setUploading(false);
        message.success("上传成功");
        mergeFile({ fileName: fileMsg.name, fileHash: fileMsg.hash });
      }).catch(()=>{
        message.error("上传失败")
      })
    })
  };

  const props = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      console.log(file);
      setFileList([file]);
      return false;
    },
    fileList,
  };
  console.log(chunkTotal, uploadChunkNum);
  return (
    <div style={{ margin: '100px' }}>
      <Upload {...props}>
        <Button icon={<UploadOutlined />}>文件上传</Button>
      </Upload>
      <Progress percent={(parseInt(chunkTotal === 0 ? 0 : (uploadChunkNum / chunkTotal) * 100))} />
      <span>分片总数：{chunkTotal}，已上传总数：{uploadChunkNum}</span>
      <Button
        type="primary"
        onClick={handleUpload}
        disabled={fileList.length === 0}
        loading={uploading}
        style={{
          marginTop: 16,
        }}
      >
        {uploading ? '上传中' : '开始上传'}
      </Button>
    </div>
  );
};
function renderComponent() {
  ReactDOM.render(
    <App />,
    document.getElementById('root')
  );
}
renderComponent();

