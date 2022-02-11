import request from '../utils/request';

export const login = query => {
    return request({
        url: '/login',
        method: 'post',
        data: query
    });
};
export const initCity = () => {
    return request({
        url: '/initCity',
        method: 'get',
    });
};
export const initLocale = () => {
    return request({
        url: '/initLocale',
        method: 'get',
    });
};
export const getLocals = (query) => {
    return request({
        url: '/getLocale',
        method: 'get',
        params: query
    });
};
export const initUnits = (query) => {
    return request({
        url: '/initUnit',
        method: 'get',
        // params: query
    });
};
