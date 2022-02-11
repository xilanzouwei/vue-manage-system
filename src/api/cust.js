import request from '../utils/request';

export const getCustomerList = query => {
    return request({
        url: '/getCustomerList',
        method: 'get',
        params: query
    });
};
export const selectAllCust = query => {
    return request({
        url: '/selectAllCust',
        method: 'get',
        // params: query
    });
};
export const addCustomer = query => {
    return request({
        url: '/addCustomer',
        method: 'post',
        data: query
    });
};
export const updateCustomer = query => {
    return request({
        url: '/updateCustomer',
        method: 'post',
        data: query
    });
};
