<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item> <i class="el-icon-lx-cascades"></i> 订单列表 </el-breadcrumb-item>
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
                <el-select
                    clearable
                    @clear="clearCity"
                    v-model="query.cityCode"
                    placeholder="市"
                    class="handle-select mr10"
                    @change="cityChange"
                >
                    <el-option v-for="(item, index) in citys" :key="index" :label="item.cityDesc" :value="item.cityCode"></el-option>
                </el-select>
                <el-select clearable v-model="query.localeCode" placeholder="镇" class="handle-select mr10">
                    <el-option v-for="(item, index) in locales" :key="index" :label="item.localeDesc" :value="item.localeCode"></el-option>
                </el-select>
                <el-input v-model="query.custName" placeholder="客户姓名" class="handle-input mr10"></el-input>

                <el-date-picker type="date" placeholder="开始日期" v-model="query.startDate" value-format="yyyy-MM-dd"></el-date-picker>
                --
                <el-date-picker type="date" placeholder="结束日期" v-model="query.endDate" value-format="yyyy-MM-dd"></el-date-picker>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
            </div>
            <div class="el-table">
                <span style="color: red">订单合计: {{ totalAmount }}元</span>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <span style="color: red">实收合计: {{ totalIncome }}元</span>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <span style="color: red">成本合计: {{ totalCost }}元</span>
            </div>
            <el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header">
                <!-- <el-table-column type="selection" width="55" align="center"></el-table-column> -->
                <el-table-column type="index" label="序号" width="55" align="center"></el-table-column>
                <el-table-column prop="orderDate" label="订单时间" width="170" align="center"></el-table-column>
                <el-table-column prop="custName" label="客户姓名" width="120" align="center"></el-table-column>
                <el-table-column label="地址" width="150" align="center">
                    <template slot-scope="scope">
                        <div>{{ scope.row.cityDesc }}{{ scope.row.localeDesc }}</div>
                    </template>
                </el-table-column>
                <el-table-column prop="orderTotalAmount" label="订单金额" width="140" align="center"></el-table-column>
                <el-table-column prop="orderIncomeAmount" label="实收金额" width="140" align="center">
                    <template slot-scope="scope">
                        <el-input v-model="scope.row.orderIncomeAmount" placeholder="可输入"></el-input>
                    </template>
                </el-table-column>
                <el-table-column prop="orderBasicRemarks" label="备注" align="center">
                    <template slot-scope="scope">
                        <el-input v-model="scope.row.orderBasicRemarks" placeholder="可输入"></el-input>
                    </template>
                </el-table-column>
                <el-table-column prop="orderStatus" label="支付状态" width="200" align="center">
                    <template slot-scope="scope">
                        <el-switch
                            active-value="Y"
                            inactive-value="N"
                            active-text="已结清"
                            inactive-text="未结清"
                            active-color="#13ce66"
                            inactive-color="#ff4949"
                            v-model="scope.row.orderStatus"
                        >
                        </el-switch>
                    </template>
                </el-table-column>

                <el-table-column label="操作" width="180" align="center">
                    <template slot-scope="scope">
                        <el-button type="primary" @click="getDetail(scope.row)">查看详情</el-button>
                        <el-button type="primary" @click="btnPrintOrder(scope.$index, scope.row)">打印</el-button>
                        <el-button type="primary" @click="updateOrder(scope.$index, scope.row)">保存</el-button>
                        <el-button type="danger" @click="delOrder(scope.$index, scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination
                    background
                    layout="total, prev, pager, next"
                    :current-page="query.pageNum"
                    :page-size="query.pageSize"
                    :total="pageTotal"
                    @current-change="handlePageChange"
                ></el-pagination>
            </div>

            <el-dialog title="详情" :visible.sync="editVisible" width="50%">
                <el-table :data="detailData" border show-summary :summary-method="getSummaries" class="table" header-cell-class-name="table-header">
                    <el-table-column type="index" label="序号" width="55" align="center"></el-table-column>
                    <el-table-column prop="commName" label="商品名称"></el-table-column>
                    <el-table-column prop="commCount" label="数量"></el-table-column>
                    <el-table-column prop="commSalePrice" label="单价"></el-table-column>
                    <el-table-column prop="commCostPrice" label="成本"></el-table-column>
                    <el-table-column prop="orderTotalNum" label="售价合计"></el-table-column>
                    <el-table-column prop="orderTotalCost" label="成本合计"></el-table-column>
                </el-table>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="editVisible = false">关闭</el-button>
                </span>
            </el-dialog>
        </div>
    </div>
</template>

<script>
import { getOrderListByPage, getOrderDetailList, updateOrderBasicInfo, getPrintData, calcTotalAmount, delOrder } from '../../../api/order';
import { initCity, initLocale, getLocals } from '../../../api/index';
import bus from '../../common/bus';
import { getLodop } from '../../../assets/LodopFuncs'; //导入模块

export default {
    name: 'basetable',
    data() {
        return {
            citys: [],
            locales: [],
            query: {
                custName: '',
                startDate: null,
                endDate: null,
                cityCode: '',
                localeCode: '',
                pageNum: 1,
                pageSize: 10
            },
            tableData: [],
            detailData: [],
            multipleSelection: [],
            delList: [],
            editVisible: false,
            pageTotal: 0,
            form: {},
            idx: -1,
            id: -1,
            totalAmount: 0,
            totalIncome: 0,
            totalCost:0
        };
    },
    created() {
        this.init();
        this.getData();
    },

    methods: {
        init() {
            initCity().then((res) => {
                this.citys = res;
            });
        },
        cityChange(e) {
            console.log(e);
            getLocals({ cityCode: e }).then((res) => {
                this.locales = res;
            });
        },
        clearCity() {
            this.locales = [];
            this.query.localeCode = '';
        },
        editCityChange(e) {
            console.log(e);
            getLocals({ cityCode: e }).then((res) => {
                this.editLocales = res;
            });
        },
        // 获取 easy-mock 的模拟数据
        getData() {
            getOrderListByPage(this.query).then((res) => {
                console.log(res);
                this.tableData = res.data.list;
                this.pageTotal = res.data.total;
            });
            calcTotalAmount(this.query).then((res) => {
                console.log(res);
                this.totalAmount = res[0].orderTotalAmount;
                this.totalIncome = res[0].orderIncomeAmount;
                this.totalCost = res[0].orderCostAmount;
            });
        },
        getDetail(row) {
            console.log(row);
            getOrderDetailList({ orderId: row.orderId }).then((res) => {
                console.log(res);
                this.detailData = res;
                this.editVisible=true;
            });
        },

        updateOrder(index, row) {
            console.log(row);
            const param = {
                orderId: row.orderId,
                orderIncomeAmount: row.orderIncomeAmount,
                orderBasicRemarks: row.orderBasicRemarks,
                orderStatus: row.orderStatus
            };
            updateOrderBasicInfo(param).then((res) => {
                console.log(res);
                if (res.code === 0) {
                    this.$message.success('更新成功');
                    this.getData();
                } else {
                    this.$message.success('更新失败');
                }
            });
        },
        btnPrintOrder(index, row) {
            getPrintData({ orderId: row.orderId }).then((res) => {
                console.log(res);
                this.printDataList = res.orderModelList;
                this.pritTotalAmount = res.pritTotalAmount;
                this.printOrder();
            });
        },

        // 触发搜索按钮
        handleSearch() {
            this.$set(this.query, 'pageNum', 1);
            this.getData();
        },
        // 删除操作
        delOrder(index, row) {
            // 二次确认删除
            this.$confirm('确定要删除吗？', '提示', {
                type: 'warning'
            })
                .then(() => {
                    // this.$message.success('删除成功');
                    // this.tableData.splice(index, 1);
                    delOrder({ delarr: [row.orderId] }).then((res) => {
                        if (res.code === 0) {
                            this.$message.success('删除成功');
                            this.getData();
                        } else {
                            this.$message.error('删除失败');
                        }
                    });
                })
                .catch(() => {});
        },
        // 多选操作
        handleOrderStatusChange(index, row) {
            this.tableData[index] = val;
        },
        delAllSelection() {
            const length = this.multipleSelection.length;
            let str = '';
            this.delList = this.delList.concat(this.multipleSelection);
            for (let i = 0; i < length; i++) {
                str += this.multipleSelection[i].name + ' ';
            }
            this.$message.error(`删除了${str}`);
            this.multipleSelection = [];
        },
        // 编辑操作
        handleEdit(index, row) {
            this.idx = index;
            this.form = row;
            this.editVisible = true;
            getLocals({ cityCode: this.form.cityCode }).then((res) => {
                this.editLocales = res;
            });
        },
        // 保存编辑
        saveEdit() {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    this.editVisible = false;
                    this.$message.success(`修改第 ${this.idx + 1} 行成功`);
                    this.$set(this.tableData, this.idx, this.form);
                    updateCustomer(this.form).then((res) => {
                        this.getData();
                    });
                } else {
                    this.$message.error('请输入必填信息');
                    return false;
                }
            });
        },
        // 分页导航
        handlePageChange(val) {
            this.$set(this.query, 'pageNum', val);
            this.getData();
        },
        getSummaries(param) {
        const { columns, data } = param;
        const sums = [];
        columns.forEach((column, index) => {
          if ([0,1,2,3,4].includes(index)) {
            index === 0 ?sums[index] = '合计':'';
            return;
          }
          const values = data.map(item => Number(item[column.property]));
          if (!values.every(value => isNaN(value))) {
            sums[index] = values.reduce((prev, curr) => {
              const value = Number(curr);
              if (!isNaN(value)) {
                return prev + curr;
              } else {
                return prev;
              }
            }, 0);
            sums[index] += ' 元';
          } else {
            sums[index] = 'N/A';
          }
        });

        return sums;
      },

        DX(t) {
            if (!/^(0|[1-9]\d*)(\.\d+)?$/.test(t)) return '数据非法';
            if (0 == t) return '零元整';
            var e = '千百拾亿千百拾万千百拾元角分',
                r = '';
            t += '00';
            var o = t.indexOf('.');
            o >= 0 && (t = t.substring(0, o) + t.substr(o + 1, 2)), (e = e.substr(e.length - t.length));
            for (var n = 0; n < t.length; n++) r += '零壹贰叁肆伍陆柒捌玖'.charAt(t.charAt(n)) + e.charAt(n);
            return r
                .replace(/零(千|百|拾|角)/g, '零')
                .replace(/(零)+/g, '零')
                .replace(/零(万|亿|元)/g, '$1')
                .replace(/(亿)万|壹(拾)/g, '$1$2')
                .replace(/^元零?|零分/g, '')
                .replace(/元$/g, '元整');
        },
        printOrder() {
            let t = getLodop();
            const e = this.printDataList,
                r = this.pritTotalAmount;
            t.PRINT_INITA(0, -8, 900, 600, '销售单打印'),
                t.SET_PRINT_PAGESIZE(1, '2410', '1400', ''),
                t.SET_PRINT_MODE('PRINT_NOCOLLATE', 1),
                t.ADD_PRINT_TEXT(30, 317, 208, 35, '尹氏家具厂送货单'),
                t.SET_PRINT_STYLEA(0, 'FontName', '新宋体'),
                t.SET_PRINT_STYLEA(0, 'FontSize', 16),
                t.SET_PRINT_STYLEA(0, 'Alignment', 2),
                t.ADD_PRINT_RECT(116, 92, 703, 261, 0, 1),
                t.ADD_PRINT_TEXT(63, 93, 90, 25, '客户姓名：'),
                t.SET_PRINT_STYLEA(0, 'FontSize', 11),
                t.ADD_PRINT_TEXT(63, 182, 115, 25, e[0].custName),
                t.SET_PRINT_STYLEA(0, 'FontSize', 12),
                t.ADD_PRINT_TEXT(66, 578, 90, 25, '订单日期：'),
                t.SET_PRINT_STYLEA(0, 'FontSize', 11),
                t.ADD_PRINT_TEXT(66, 665, 110, 25, e[0].orderDate),
                t.SET_PRINT_STYLEA(0, 'FontSize', 12),
                t.ADD_PRINT_TEXT(89, 93, 90, 25, '客户电话：'),
                t.SET_PRINT_STYLEA(0, 'FontSize', 11),
                t.ADD_PRINT_TEXT(89, 182, 115, 25, e[0].custIphone),
                t.SET_PRINT_STYLEA(0, 'FontSize', 12),
                t.ADD_PRINT_TEXT(89, 578, 90, 25, '客户地址：'),
                t.SET_PRINT_STYLEA(0, 'FontSize', 11),
                t.ADD_PRINT_TEXT(89, 665, 121, 25, e[0].cityDesc + e[0].localeDesc),
                t.SET_PRINT_STYLEA(0, 'FontSize', 12),
                t.ADD_PRINT_TEXT(122, 95, 42, 21, '序号'),
                t.SET_PRINT_STYLEA(0, 'FontSize', 11),
                t.SET_PRINT_STYLEA(0, 'Alignment', 2),
                t.ADD_PRINT_TEXT(122, 132, 230, 21, '品名'),
                t.SET_PRINT_STYLEA(0, 'FontSize', 11),
                t.SET_PRINT_STYLEA(0, 'Alignment', 2),
                t.ADD_PRINT_TEXT(122, 368, 44, 21, '单位'),
                t.SET_PRINT_STYLEA(0, 'FontSize', 11),
                t.SET_PRINT_STYLEA(0, 'Alignment', 2),
                t.ADD_PRINT_TEXT(122, 413, 80, 21, '数量'),
                t.SET_PRINT_STYLEA(0, 'FontSize', 11),
                t.SET_PRINT_STYLEA(0, 'Alignment', 2),
                t.ADD_PRINT_TEXT(122, 494, 115, 21, '单价'),
                t.SET_PRINT_STYLEA(0, 'FontSize', 11),
                t.SET_PRINT_STYLEA(0, 'Alignment', 2),
                t.ADD_PRINT_TEXT(122, 609, 185, 21, '金额'),
                t.SET_PRINT_STYLEA(0, 'FontSize', 11),
                t.SET_PRINT_STYLEA(0, 'Alignment', 2),
                t.ADD_PRINT_LINE(142, 92, 141, 795, 0, 1),
                t.ADD_PRINT_LINE(116, 134, 343, 135, 0, 1),
                t.ADD_PRINT_LINE(166, 92, 167, 795, 0, 1),
                t.ADD_PRINT_LINE(192, 92, 191, 795, 0, 1),
                t.ADD_PRINT_LINE(217, 92, 216, 795, 0, 1),
                t.ADD_PRINT_LINE(242, 92, 241, 795, 0, 1),
                t.ADD_PRINT_LINE(267, 92, 266, 795, 0, 1),
                t.ADD_PRINT_LINE(292, 92, 291, 795, 0, 1),
                t.ADD_PRINT_LINE(317, 92, 316, 795, 0, 1),
                t.ADD_PRINT_LINE(342, 367, 115, 368, 0, 1),
                t.ADD_PRINT_LINE(342, 412, 115, 413, 0, 1),
                t.ADD_PRINT_LINE(342, 493, 115, 494, 0, 1),
                t.ADD_PRINT_LINE(342, 609, 115, 610, 0, 1);
            for (let o = 0; o < e.length; o++) {
                const n = 25;
                t.ADD_PRINT_TEXT(145 + o * n, 95, 35, 21, o + 1),
                    t.SET_PRINT_STYLEA(0, 'FontSize', 12),
                    t.SET_PRINT_STYLEA(0, 'Alignment', 2),
                    t.ADD_PRINT_TEXT(145 + o * n, 132, 235, 21, e[o].commName),
                    t.SET_PRINT_STYLEA(0, 'FontSize', 12),
                    t.SET_PRINT_STYLEA(0, 'Alignment', 2),
                    t.ADD_PRINT_TEXT(145 + o * n, 368, 44, 21, e[o].commUnitDesc),
                    t.SET_PRINT_STYLEA(0, 'FontSize', 12),
                    t.SET_PRINT_STYLEA(0, 'Alignment', 2),
                    t.ADD_PRINT_TEXT(145 + o * n, 413, 80, 21, e[o].commCount),
                    t.SET_PRINT_STYLEA(0, 'FontSize', 12),
                    t.SET_PRINT_STYLEA(0, 'Alignment', 2),
                    t.ADD_PRINT_TEXT(145 + o * n, 494, 115, 21, e[o].commSalePrice.toFixed(2)),
                    t.SET_PRINT_STYLEA(0, 'FontSize', 12),
                    t.SET_PRINT_STYLEA(0, 'Alignment', 2),
                    t.ADD_PRINT_TEXT(145 + o * n, 610, 185, 21, e[o].orderTotalNum.toFixed(2)),
                    t.SET_PRINT_STYLEA(0, 'FontSize', 12),
                    t.SET_PRINT_STYLEA(0, 'Alignment', 2);
            }
            t.ADD_PRINT_TEXT(353, 93, 130, 24, '合计金额(大写)：'),
                t.SET_PRINT_STYLEA(0, 'FontSize', 11),
                t.ADD_PRINT_TEXT(353, 220, 295, 24, this.DX(r.toFixed(2))),
                t.SET_PRINT_STYLEA(0, 'FontSize', 12),
                t.ADD_PRINT_TEXT(353, 547, 145, 24, '合计金额：'),
                t.SET_PRINT_STYLEA(0, 'FontSize', 11),
                t.SET_PRINT_STYLEA(0, 'Alignment', 3),
                t.ADD_PRINT_TEXT(353, 693, 100, 21, r.toFixed(2)),
                t.SET_PRINT_STYLEA(0, 'FontSize', 12),
                // t.ADD_PRINT_TEXT(429, 92, 365, 50, ''),
                // t.SET_PRINT_STYLEA(0, 'FontSize', 11),
                 t.ADD_PRINT_TEXT(380, 93, 342, 25, '地址：仙桃市新318国道电排河大桥往西一公里'),
                t.SET_PRINT_STYLEA(0, 'FontSize', 11),
                t.ADD_PRINT_TEXT(403, 93, 300, 25, '电话：15871885556     13597458122'),
                t.SET_PRINT_STYLEA(0, 'FontSize', 11),
                t.ADD_PRINT_TEXT(380, 481, 314, 25, '农  行：6213363260254453214    尹述道'),
                t.SET_PRINT_STYLEA(0, 'FontSize', 11),
                t.ADD_PRINT_TEXT(405, 481, 314, 25, '农商行：6210134092503358       尹述道'),
                t.SET_PRINT_STYLEA(0, 'FontSize', 11),
                t.ADD_PRINT_TEXT(430, 481, 314, 25, '邮  政：6217985200007711012    尹述道'),
                t.SET_PRINT_STYLEA(0, 'FontSize', 11),
               
                t.ADD_PRINT_LINE(343, 92, 342, 795, 0, 1),
                t.PREVIEW();
                // t.PRINT_SETUP();
        }
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
