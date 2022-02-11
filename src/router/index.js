import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

//获取原型对象上的push函数
const originalPush = Router.prototype.push
//修改原型对象中的push方法
Router.prototype.push = function push(location) {
   return originalPush.call(this, location).catch(err => err)
}

export default new Router({
    routes: [
        {
            path: '/',
            redirect: '/addOrder'
        },
        {
            path: '/',
            component: () => import(/* webpackChunkName: "home" */ '../components/common/Home.vue'),
            meta: { title: '自述文件' },
            children: [
                {
                    path: '/addOrder',
                    component: () => import(/* webpackChunkName: "dashboard" */ '../components/page/order/AddOrder.vue'),
                    meta: { title: '开单' }
                },
                {
                    path: '/orderList',
                    component: () => import(/* webpackChunkName: "dashboard" */ '../components/page/order/OrderList.vue'),
                    meta: { title: '订单列表' }
                },
                {
                    path: '/custInfo',
                    component: () => import(/* webpackChunkName: "dashboard" */ '../components/page/cust/CustInfo.vue'),
                    meta: { title: '客户列表' }
                },
                {
                    path: '/addCustInfo',
                    component: () => import(/* webpackChunkName: "dashboard" */ '../components/page/cust/AddCustInfo.vue'),
                    meta: { title: '新增客户' }
                },
                {
                    path: '/commodityInfo',
                    component: () => import(/* webpackChunkName: "dashboard" */ '../components/page/commodity/CommodityInfo.vue'),
                    meta: { title: '商品列表' }
                },
                {
                    path: '/addCommodityInfo',
                    component: () => import(/* webpackChunkName: "dashboard" */ '../components/page/commodity/AddCommodity.vue'),
                    meta: { title: '新增商品' }
                },
                
            ]
        },
        {
            path: '/login',
            component: () => import(/* webpackChunkName: "login" */ '../components/page/Login.vue'),
            meta: { title: '登录' }
        },
        {
            path: '*',
            redirect: '/404'
        }
    ]
});
