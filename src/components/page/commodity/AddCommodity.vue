<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item> <i class="el-icon-lx-calendar"></i> 商品列表 </el-breadcrumb-item>
                <el-breadcrumb-item>新增</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="form-box">
                <el-form ref="commForm" :model="form" :rules="rules" label-width="80px">
                    <el-form-item label="商品名称" prop="commName">
                        <el-input v-model="form.commName"></el-input>
                    </el-form-item>
                    <el-form-item label="售价" prop="commSalePrice">
                        <el-input v-model="form.commSalePrice"></el-input>
                    </el-form-item>
                    <el-form-item label="成本价" prop="commCostPrice">
                        <el-input v-model="form.commCostPrice"></el-input>
                    </el-form-item>
                    <!-- <el-form-item label="单位" prop="commUnitDesc">
                        <el-input v-model="form.commUnitDesc"></el-input>
                    </el-form-item> -->
                    <el-form-item label="单位" prop="commUnit">
                        <el-select v-model="form.commUnit" placeholder="请选择">
                            <el-option v-for="item in units" :key="item.unitId" :label="item.unitDesc" :value="item.unitCode"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="onSubmit">提交</el-button>
                        <el-button @click="onCancel">取消</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </div>
    </div>
</template>

<script>
import { addCommodity } from '../../../api/comm';
import { initUnits } from '../../../api/index';
import bus from '../../common/bus';
export default {
    name: 'baseform',
    data() {
        return {
            units:[],
            form: {
                commName: '',
                commUnitDesc: '',
                commSalePrice: '',
                commCostPrice:"",
                commUnit:''
            },
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
    },

    methods: {
        init(){
            initUnits().then(res=>{
                this.units = res;
            })
        },
        onSubmit() {
            this.$refs.commForm.validate((valid) => {
                if (valid) {
                    addCommodity(this.form).then((res) => {
                        this.$refs.commForm.resetFields();
                        console.log(res);
                        this.$message.success('提交成功！');
                        bus.$emit('comm-refresh');
                        this.$router.back();
                    });
                } else {
                    this.$message.error('请输入必填信息');
                    console.log('error submit!!');
                    return false;
                }
            });
        },
        onCancel() {
            this.$refs.commForm.resetFields();
            this.$router.back();
        }
    }
};
</script>