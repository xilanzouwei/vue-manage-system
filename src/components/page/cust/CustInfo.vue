<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item> <i class="el-icon-lx-cascades"></i> 客户列表 </el-breadcrumb-item>
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
                <el-input v-model="query.custName" clearable @clear="handleSearch" placeholder="客户姓名" class="handle-input mr10"></el-input>
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
                <el-table-column prop="custName" label="客户姓名"></el-table-column>
                <el-table-column prop="custIphone" label="客户电话"></el-table-column>
                <el-table-column prop="cityDesc" label="市"></el-table-column>
                <el-table-column prop="localeDesc" label="镇"></el-table-column>

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
                <el-form-item label="客户姓名" prop="custName">
                    <el-input v-model="form.custName"></el-input>
                </el-form-item>
                <el-form-item label="客户电话" prop="custIphone">
                    <el-input v-model="form.custIphone"></el-input>
                </el-form-item>
                <el-form-item label="市" prop="cityCode">
                    <el-select v-model="form.cityCode" placeholder="请选择" @change="editCityChange">
                        <el-option v-for="item in citys" :key="item.cityId" :label="item.cityDesc" :value="item.cityCode"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="镇" prop="localeCode">
                    <el-select v-model="form.localeCode" placeholder="请选择">
                        <el-option
                            v-for="item in editLocales"
                            :key="item.localeId"
                            :label="item.localeDesc"
                            :value="item.localeCode"
                        ></el-option>
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
import { getCustomerList, updateCustomer } from '../../../api/cust';
import { initCity, initLocale, getLocals } from '../../../api/index';
import bus from '../../common/bus';
export default {
    name: 'basetable',
    data() {
        return {
            citys: [],
            locales: [],
            editLocales: [],
            rules: {
                custName: [{ required: true, message: '请输入客户姓名', trigger: 'blur' }],
                custIphone: [
                    { required: true, message: '请输入客户电话', trigger: 'blur' },
                    {
                        pattern:
                            /^[1](([3][0-9])|([4][0,1,4-9])|([5][0-3,5-9])|([6][2,5,6,7])|([7][0-8])|([8][0-9])|([9][0-3,5-9]))[0-9]{8}$/,
                        message: '请输入正确的客户电话',
                        trigger: 'blur'
                    }
                ],
                cityCode: [{ required: true, message: '请选择市', trigger: 'change' }],
                localeCode: [{ required: true, message: '请选择镇', trigger: 'change' }]
            },
            query: {
                custName: '',
                custIphone: '',
                cityCode: '',
                localeCode: '',
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
            id: -1
        };
    },
    created() {
        this.init();
        this.getData();
    },
    mounted() {
        bus.$on('cust-refresh', () => {
            this.getData();
        });
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
            this.form.localeCode='';
            getLocals({ cityCode: e }).then((res) => {
                this.editLocales = res;
            });
        },
        // 获取 easy-mock 的模拟数据
        getData() {
            getCustomerList(this.query).then((res) => {
                console.log(res);
                this.tableData = res.data.list;
                this.pageTotal = res.data.total;
            });
        },
        add() {
            this.$router.push('/addCustInfo');
        },
        // 触发搜索按钮
        handleSearch() {
            this.$set(this.query, 'pageNum', 1);
            this.getData();
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
            getLocals({ cityCode: this.form.cityCode }).then((res) => {
                this.editLocales = res;
            });
        },
        // 保存编辑
        saveEdit() {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    this.editVisible = false;
                    // this.$message.success(`修改第 ${this.idx + 1} 行成功`);
                    // console.log('保存',this.form)
                    // this.$set(this.tableData, this.idx, this.form);
                    updateCustomer(this.form).then((res) => {
                        this.getData();
                        this.$refs.form.resetFields();
                    });
                } else {
                    this.$message.error('请输入必填信息');
                    return false;
                }
            });
        },
        cancelEdit(formName) {
            this.editVisible = false;
            this.$refs[formName].resetFields();
        },
        // 分页导航
        handlePageChange(val) {
            this.$set(this.query, 'pageNum', val);
            this.getData();
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
