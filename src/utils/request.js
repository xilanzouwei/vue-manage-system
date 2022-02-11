import axios from 'axios';
import router from '../router';
const service = axios.create({
    // process.env.NODE_ENV === 'development' 来判断是否开发环境
    // easy-mock服务挂了，暂时不使用了
    // baseURL: 'https://www.easy-mock.com/mock/592501a391470c0ac1fab128',
    timeout: 5000
});

service.interceptors.request.use(
    config => {
        // console.log('config',config)
        // config.url = '/api'+config.url
        return config;
    },
    error => {
        console.log(error);
        return Promise.reject();
    }
);

service.interceptors.response.use(
    response => {
        console.log('response',response);
        if (response.status === 200) {
            return response.data;
        } else {
            Promise.reject();
        }
    },
    error => {
        console.log(error);
        if(error.response.status === 401){
            // window.location.href = "/login"
            router.push({ path: `/login`});
        }
        return Promise.reject();
    }
);

export default service;
