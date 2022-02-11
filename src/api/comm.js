import request from '../utils/request';

export const getCommodityList = query => {
    return request({
        url: '/getCommodityList',
        method: 'get',
        params: query
    });
};
export const getCommodityOnSaleList = query => {
    return request({
        url: '/getCommodityOnSaleList',
        method: 'get',
        // params: query
    });
};
export const addCommodity = query => {
    return request({
        url: '/addCommodity',
        method: 'post',
        data: query
    });
};
export const updateCommodity = query => {
    return request({
        url: '/updateCommodity',
        method: 'post',
        data: query
    });
};
