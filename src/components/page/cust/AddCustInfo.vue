<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item> <i class="el-icon-lx-calendar"></i> 表单 </el-breadcrumb-item>
                <el-breadcrumb-item>基本表单</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="form-box">
                <el-form ref="custForm" :model="form" :rules="rules" label-width="80px">
                    <el-form-item label="客户姓名" prop="custName">
                        <el-input v-model="form.custName"></el-input>
                    </el-form-item>
                    <el-form-item label="客户电话" prop="custIphone">
                        <el-input v-model="form.custIphone"></el-input>
                    </el-form-item>
                    <el-form-item label="市" prop="cityCode">
                        <el-select v-model="form.cityCode" placeholder="请选择" @change="cityChange">
                            <el-option v-for="item in citys" :key="item.cityId" :label="item.cityDesc" :value="item.cityCode"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="镇" prop="localeCode">
                        <el-select v-model="form.localeCode" placeholder="请选择">
                            <el-option
                                v-for="item in locales"
                                :key="item.localeId"
                                :label="item.localeDesc"
                                :value="item.localeCode"
                            ></el-option>
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
import { initCity, getLocals } from '../../../api/index';
import { addCustomer } from '../../../api/cust';
import bus from '../../common/bus';

  var validPhone=(rule, value,callback)=>{
      const reg = /^[1](([3][0-9])|([4][0,1,4-9])|([5][0-3,5-9])|([6][2,5,6,7])|([7][0-8])|([8][0-9])|([9][0-3,5-9]))[0-9]{8}$/;
      if (!value){
          callback(new Error('请输入电话号码'))
      }else  if (!reg.test(value)){
        callback(new Error('请输入正确的11位手机号码'))
      }else {
          callback()
      }
  }

export default {
    name: 'baseform',
    data() {
        return {
            citys: [],
            locales: [],
            form: {
                custName: '',
                custIphone: '',
                cityCode: '',
                localeCode: ''
            },
            rules: {
                custName: [{ required: true, message: '请输入客户姓名', trigger: 'blur' }],
                custIphone: [
                    { required: true,validator: validPhone, trigger: 'blur' },
                    {
                        Pattern:
                            /^[1](([3][0-9])|([4][0,1,4-9])|([5][0-3,5-9])|([6][2,5,6,7])|([7][0-8])|([8][0-9])|([9][0-3,5-9]))[0-9]{8}$/,
                        message: '请输入正确的客户电话',
                        trigger: 'blur'
                    }
                ],
                cityCode: [{ required: true, message: '请选择市', trigger: 'change' }],
                localeCode: [{ required: true, message: '请选择镇', trigger: 'change' }]
            }
        };
    },
    mounted() {
        this.initCity();
    },

    methods: {
        initCity() {
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
        onSubmit() {
            this.$refs.custForm.validate((valid) => {
                if (valid) {
                    addCustomer(this.form).then((res) => {
                        console.log(res);
                        this.$message.success('提交成功！');
                        bus.$emit('cust-refresh');
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
            this.$refs.custForm.resetFields();
            this.$router.back();
        }
    }
};
</script>