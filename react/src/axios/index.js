import axios from "axios";

export const upload = (data,onUploadProgress=()=>{})=>{
    return axios({
        url:'/api/upload',
        data,
        method:'POST',
        onUploadProgress
    })
}
export const mergeFile = (data)=>axios.post('/api/mergeFile',data);
export const queryFileByHash = (data)=>axios.post('/api/queryFileByHash',data);
export const queryDirFileByHash = (data)=>axios.post('/api/queryDirFileByHash',data);