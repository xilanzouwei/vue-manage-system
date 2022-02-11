<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item> <i class="el-icon-lx-cascades"></i> 开单 </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <!-- <el-button
                    type="primary"
                    icon="el-icon-delete"
                    class="handle-del mr10"
                    @click="delAllSelection"
                >批量删除</el-button> -->
                <el-date-picker v-model="orderInfo.orderDate" type="datetime" placeholder="订单日期"
                    value-format="yyyy-MM-dd HH:mm:ss"
                 > </el-date-picker>

                <el-select
                    size="medium"
                    style="width: 300px"
                    clearable
                    filterable
                    v-model="orderInfo.custId"
                    placeholder="客户姓名/地址/电话"
                    class="handle-select mr10"
                >
                    <el-option
                        v-for="(item, index) in custs"
                        :key="index"
                        :label="`${item.custName}--${item.cityDesc}${item.localeDesc}--${item.custIphone}`"
                        :value="item.custId"
                    ></el-option>
                </el-select>
                <el-select clearable filterable v-model="commObj" value-key="commName" placeholder="商品" class="handle-select mr10">
                    <el-option v-for="(item, index) in comms" :key="index" :label="item.commName" :value="item"></el-option>
                </el-select>
                <!-- <el-select clearable v-model="query.localeCode" placeholder="镇" class="handle-select mr10">
                    <el-option v-for="(item, index) in locales" :key="index" :label="item.localeDesc" :value="item.localeCode"></el-option>
                </el-select> -->
                <!-- <el-input v-model="query.custName" placeholder="客户姓名" class="handle-input mr10"></el-input> -->
                <!-- <el-form-item label="日期时间">
                        <el-col :span="11">
                            <el-date-picker
                                type="date"
                                placeholder="选择日期"
                                v-model="query.startDate"
                                value-format="yyyy-MM-dd"
                                style="width: 100%;"
                            ></el-date-picker>
                        </el-col>
                        <el-col class="line" :span="2">-</el-col>
                        <el-col :span="11">
                            <el-time-picker
                                placeholder="选择时间"
                                v-model="query.endDate"
                                style="width: 100%;"
                            ></el-time-picker>
                        </el-col>
                    </el-form-item> -->
                <el-button type="primary" icon="el-icon-plus" @click="addComm">添加</el-button>
            </div>
            <el-table :data="orderInfo.ls_order" border class="table" ref="multipleTable" header-cell-class-name="table-header">
                <!-- <el-table-column type="selection" width="55" align="center"></el-table-column> -->
                <el-table-column type="index" label="序号" width="55" align="center"></el-table-column>
                <el-table-column prop="commName" label="商品名称"></el-table-column>
                <el-table-column label="数量">
                    <template slot-scope="scope">
                        <el-input v-model="scope.row.commCount" @input="onInputChange(scope.$index, scope.row)"></el-input>
                    </template>
                </el-table-column>
                <el-table-column prop="commUnitDesc" label="单位"></el-table-column>
                <el-table-column prop="commSalePrice" label="售价"></el-table-column>
                <el-table-column prop="orderTotalNum" label="合计">
                    <!-- <template slot-scope="scope">
                        <div>{{ Number(scope.row.commCount) * scope.row.commSalePrice }}</div>
                    </template> -->
                </el-table-column>

                <el-table-column label="操作" width="180" align="center">
                    <template slot-scope="scope">
                        <el-button type="text" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
                        <!-- <el-button
                            type="text"
                            icon="el-icon-delete"
                            class="red"
                            @click="handleDelete(scope.$index, scope.row)"
                        >删除</el-button> -->
                    </template>
                </el-table-column>
            </el-table>
            <el-button type="primary" icon="el-icon-plus" @click="saveOrder">保存</el-button>
            <!-- <div class="pagination">
                <el-pagination
                    background
                    layout="total, prev, pager, next"
                    :current-page="query.pageNum"
                    :page-size="query.pageSize"
                    :total="pageTotal"
                    @current-change="handlePageChange"
                ></el-pagination>
            </div> -->
        </div>
    </div>
</template>

<script>
import { getOrderListByPage, addOrderPrintInfo } from '../../../api/order';
import { selectAllCust } from '../../../api/cust';
import { getCommodityOnSaleList } from '../../../api/comm';
import { initCity, initLocale, getLocals } from '../../../api/index';
import bus from '../../common/bus';
export default {
    name: 'basetable',
    inject: ['reload'],
    data() {
        return {
            custs: [],
            comms: [],
            citys: [],
            locales: [],
            orderInfo: {
                orderDate:this.$moment().format('YYYY-MM-DD HH:mm:ss'),
                custId: '',
                ls_order: []
            },
            commObj: null,
            tableData: [],
            multipleSelection: [],
            delList: [],
            editVisible: false,
            pageTotal: 0,
            form: {},
            idx: -1,
            id: -1
        };
    },
    created() {
        this.init();
        // this.getData();
    },
    mounted() {},
    methods: {
        init() {
            // initCity().then((res) => {
            //     this.citys = res;
            // });
            selectAllCust().then((res) => {
                this.custs = res.data.list;
            });

            getCommodityOnSaleList().then((res) => {
                this.comms = res;
            });
        },
        addComm() {
            if (this.commObj) {
                if(this.orderInfo.ls_order.includes(this.commObj)){
                    this.$message.error('已添加');
                    return;
                }
                this.commObj.commCount = 1;
                this.commObj.orderTotalNum = this.commObj.commCount * this.commObj.commSalePrice;
                this.commObj.orderTotalCost = this.commObj.commCount * this.commObj.commCostPrice;
                this.orderInfo.ls_order.push(this.commObj);
                this.commObj = null;
            } else {
                this.$message.error('先选择商品');
            }
        },
        onInputChange(index, row) {
            console.log(this.orderInfo.ls_order);
            row.orderTotalNum = row.commCount * row.commSalePrice;
            row.orderTotalCost = row.commCount * row.commCostPrice;
            this.$set(this.orderInfo.ls_order, index, row);
            // this.orderInfo.ls_order[scope.$index].commCount = val
        },
        saveOrder() {
            if (this.orderInfo.orderDate&&this.orderInfo.custId && this.orderInfo.ls_order.length > 0) {
                console.log(this.orderInfo)
                addOrderPrintInfo(this.orderInfo).then((res) => {
                    if (res.code === 0) {
                        this.orderInfo.custId = '';
                        this.orderInfo.ls_order = [];
                        this.reload();
                        this.$router.push('/orderList');
                    } else {
                        this.$message.error('保存失败');
                    }
                });
            } else {
                this.$message.error('选择日期，客户和商品');
            }
        },
        // 获取 easy-mock 的模拟数据
        // getData() {
        //     getOrderListByPage(this.query).then((res) => {
        //         console.log(res);
        //         this.tableData = res.data.list;
        //         this.pageTotal = res.data.total;
        //     });
        // },

        // // 触发搜索按钮
        // handleSearch() {
        //     this.$set(this.query, 'pageNum', 1);
        //     this.getData();
        // },
        // 删除操作
        handleDelete(index, row) {
            this.orderInfo.ls_order.splice(index, 1);
        }
        // // 多选操作
        // handleSelectionChange(val) {
        //     this.multipleSelection = val;
        // },
        // delAllSelection() {
        //     const length = this.multipleSelection.length;
        //     let str = '';
        //     this.delList = this.delList.concat(this.multipleSelection);
        //     for (let i = 0; i < length; i++) {
        //         str += this.multipleSelection[i].name + ' ';
        //     }
        //     this.$message.error(`删除了${str}`);
        //     this.multipleSelection = [];
        // },
        // // 编辑操作
        // handleEdit(index, row) {
        //     this.idx = index;
        //     this.form = row;
        //     this.editVisible = true;
        //     getLocals({ cityCode: this.form.cityCode }).then((res) => {
        //         this.editLocales = res;
        //     });
        // },
        // // 保存编辑
        // saveEdit() {
        //     this.$refs.form.validate((valid) => {
        //         if (valid) {
        //             this.editVisible = false;
        //             this.$message.success(`修改第 ${this.idx + 1} 行成功`);
        //             this.$set(this.tableData, this.idx, this.form);
        //             updateCustomer(this.form).then((res) => {
        //                 this.getData();
        //             });
        //         } else {
        //             this.$message.error('请输入必填信息');
        //             return false;
        //         }
        //     });
        // },
        // // 分页导航
        // handlePageChange(val) {
        //     this.$set(this.query, 'pageNum', val);
        //     this.getData();
        // }
    }
};
</script>

<style scoped>
.handle-box {
    margin-bottom: 20px;
}

.handle-select {
    width: 120px;
}

.handle-input {
    width: 300px;
    display: inline-block;
}
.table {
    width: 100%;
    font-size: 14px;
}
.red {
    color: #ff0000;
}
.mr10 {
    margin-right: 10px;
}
.table-td-thumb {
    display: block;
    margin: auto;
    width: 40px;
    height: 40px;
}
</style>
