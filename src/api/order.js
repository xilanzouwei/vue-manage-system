import request from '../utils/request';
import qs from 'qs'

export const getOrderListByPage = query => {
    return request({
        url: '/getOrderListByPage',
        method: 'get',
        params: query
    });
};
export const addOrderPrintInfo = query => {
    return request({
        url: '/addOrderPrintInfo',
        method: 'post',
        data: query
    });
};
export const getOrderDetailList = query => {
    return request({
        url: '/getOrderDetailList',
        method: 'get',
        params: query
    });
};
export const updateOrderBasicInfo = query => {
    return request({
        url: '/updateOrderBasicInfo',
        method: 'post',
        data: query
    });
};
export const getPrintData = query => {
    return request({
        url: '/getPrintData',
        method: 'get',
        params: query
    });
};
export const calcTotalAmount = query => {
    return request({
        url: '/calcTotalAmount',
        method: 'post',
        data: query
    });
};
export const delOrder = query => {
    return request({
        url: '/delOrder',
        method: 'post',
        data: qs.stringify(query,  { indices: false }, { charset: 'utf-8' })
    });
};
