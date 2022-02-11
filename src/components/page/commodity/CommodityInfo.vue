<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item> <i class="el-icon-lx-cascades"></i> 商品列表 </el-breadcrumb-item>
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
                <!-- <el-select
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
                </el-select> -->
                <el-input v-model="query.commName" clearable @clear="handleSearch" placeholder="商品名称" class="handle-input mr10"></el-input>
                <!-- <el-select clearable filterable v-model="commObj" value-key="commName" placeholder="商品名称" class="handle-select mr10">
                    <el-option v-for="(item, index) in tableData" :key="index" :label="item.commName" :value="item"></el-option>
                </el-select> -->
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
                <el-button type="primary" icon="el-icon-plus" @click="add">新增</el-button>
            </div>
            <el-table
                :data="tableData"
                border
                class="table"
                ref="multipleTable"
                header-cell-class-name="table-header"
                @selection-change="handleSelectionChange"
            >
                <!-- <el-table-column type="selection" width="55" align="center"></el-table-column> -->
                <el-table-column type="index" label="序号" width="55" align="center"></el-table-column>
                <el-table-column prop="commName" label="商品名称"></el-table-column>
                <el-table-column prop="commUnitDesc" label="单位"></el-table-column>
                <el-table-column prop="commSalePrice" label="售价"></el-table-column>
                <el-table-column prop="commCostPrice" label="成本价"></el-table-column>
                <el-table-column prop="commStatus" label="是否在售">
                    <template slot-scope="scope">
                        <div v-if="scope.row.commStatus == 'Y'" v-bind:style="{ color: 'green', fontSize: 14 }">在售</div>
                        <div v-else v-bind:style="{ color: 'red', fontSize: 14 }">停售</div>
                        <!-- <el-switch
                            @change="handleShowStatusChange(scope.$index, scope.row)"
                            :active-value="1"
                            :inactive-value="0"
                            v-model="scope.row.commStatus"
                        >
                        </el-switch> -->
                    </template>
                </el-table-column>

                <el-table-column label="操作" width="180" align="center">
                    <template slot-scope="scope">
                        <el-button type="text" icon="el-icon-edit" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                        <!-- <el-button
                            type="text"
                            icon="el-icon-delete"
                            class="red"
                            @click="handleDelete(scope.$index, scope.row)"
                        >删除</el-button> -->
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
        </div>

        <!-- 编辑弹出框 -->
        <el-dialog title="编辑" :visible.sync="editVisible" width="50%">
            <el-form ref="form" :model="form" :rules="rules" label-width="120px">
                <el-form-item label="商品名称" prop="commName">
                    <el-input v-model="form.commName"></el-input>
                </el-form-item>
                <el-form-item label="单位" prop="commUnit">
                    <el-select v-model="form.commUnit" placeholder="请选择" >
                        <el-option v-for="item in units" :key="item.unitId" :label="item.unitDesc" :value="item.unitCode"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="售价" prop="commSalePrice">
                    <el-input v-model="form.commSalePrice"></el-input>
                </el-form-item>
                <el-form-item label="成本价" prop="commCostPrice">
                    <el-input v-model="form.commCostPrice"></el-input>
                </el-form-item>
                <el-form-item label="是否在售" prop="commStatus">
                    <el-select v-model="form.commStatus" placeholder="请选择">
                        <el-option key="bbk" label="在售" value="Y"></el-option>
                        <el-option key="xtc" label="停售" value="N"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="cancelEdit('form')">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { getCommodityList, updateCommodity } from '../../../api/comm';
import { initUnits } from '../../../api/index';
import bus from '../../common/bus';
export default {
    name: 'basetable',
    data() {
        return {
            citys: [],
            locales: [],
            comms: [],
            units: [],
            editLocales: [],
            query: {
                commName: '',
                pageNum: 1,
                pageSize: 10
            },
            tableData: [],
            multipleSelection: [],
            delList: [],
            editVisible: false,
            pageTotal: 0,
            form: {},
            idx: -1,
            id: -1,
            rules: {
                commName: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
                commSalePrice: [{ required: true, message: '请输入售价', trigger: 'blur' }],
                commCostPrice: [{ required: true, message: '请输入成本价', trigger: 'blur' }],
                commUnit: [{ required: true, message: '请输入计量单位', trigger: 'blur' }]
            }
        };
    },
    created() {
        this.init();
        this.getCommodityList();
    },

    mounted() {
        console.log(this, bus);
        bus.$on('comm-refresh', () => {
            console.log('列表刷新');
            this.getCommodityList();
        });
    },
    methods: {
        init() {
            initUnits().then((res) => (this.units = res));
        },
        // 获取 easy-mock 的模拟数据
        getCommodityList() {
            getCommodityList(this.query).then((res) => {
                console.log(res);
                this.tableData = res.data.list;
                this.pageTotal = res.data.total;
            });
        },
        add() {
            this.$router.push('/addCommodityInfo');
        },
        // 触发搜索按钮
        handleSearch() {
            this.$set(this.query, 'pageNum', 1);
            this.getCommodityList();
        },
        // 删除操作
        handleDelete(index, row) {
            // 二次确认删除
            this.$confirm('确定要删除吗？', '提示', {
                type: 'warning'
            })
                .then(() => {
                    this.$message.success('删除成功');
                    this.tableData.splice(index, 1);
                })
                .catch(() => {});
        },
        // 多选操作
        handleSelectionChange(val) {
            this.multipleSelection = val;
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
        },
        // 保存编辑
        saveEdit() {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    this.editVisible = false;
                    // this.$message.success(`修改第 ${this.idx + 1} 行成功`);
                    // this.$set(this.tableData, this.idx, this.form);
                    updateCommodity(this.form).then((res) => {
                        // this.query.pageNum=1
                        this.getCommodityList();
                    });
                } else {
                    this.$message.error('请输入必填信息');
                    return false;
                }
            });
        },
        cancelEdit(formName){
            this.$refs[formName].resetFields();
            this.editVisible = false;
        },
        // 分页导航
        handlePageChange(val) {
            this.$set(this.query, 'pageNum', val);
            this.getCommodityList();
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
