<template>
    <div class="article-label-wrap">
        <div class="article-label-nav">
            <div class="article-instructions">
                <img src="@/assets/article-title.png" height="20" width="20">
                <span>标签管理</span>
                <img src="@/assets/add.png" height="17" width="17" @click="addArticLabel">
            </div>
            <ul v-articleListHeight>
                <li v-for="item in articleLabel" @click="labelClassification(item.name)">
                    <img src="@/assets/labels.png" height="17" width="17">
                    <h3 class="articleLabel-title">{{item.name}} <span style="color:#7e7e7e;">(0)</span></h3>
                </li>
            </ul>
            <el-input class="tagName-input" v-if="isTagInputShow" v-model="tagName" placeholder="请输入标签名添加">
                <el-button slot="append" icon="check" @click="saveTagName"></el-button>
            </el-input>
        </div>
    </div>
</template>

<script>
import { Message } from 'element-ui';
export default{
    data(){
        return{
            articleLabel: [],
            tagName: '',
            isTagInputShow: false
        }
    },
    mounted: function(){    
        this.$axios.get('/tags/all').then(
            response => {
                console.log(response.data.data)
                this.articleLabel =  response.data.data
            },
            response => {
                Message.error('请求数据出错，请重新刷新页面')
            }
        )
    },
    methods: {
        labelClassification: function(title){
            localStorage.setItem("lebelTitle",title)
            this.$router.push('/articleList')
        },
        addArticLabel: function(){
            this.isTagInputShow = true;
        },
        saveTagName: function(){
            this.isTagInputShow = false;
            var obj = {
                name: this.tagName,
                description: this.tagName
            }
            if(this.tagName){
                this.$axios.post('/tags/new/save', obj).then(
                    response => {
                        if (response.data.succ){
                            Message.success('标签保存成功')
                            this.articleLabel.push(obj)
                            return;
                        }
                    },
                    response => {
                        response => Message.error('标签保存失败')
                    }
                )
                
            } 
        }
    },
    directives: {
        articleListHeight: {
            bind: function(el){
                var height = window.innerHeight - 120
                el.style.maxHeight = height + 'px'
            }
        }
    }
}
</script>

<style>
.article-label-wrap {
    position: relative;
    width: 100%;
    height: 100%;
    margin-left: 90px;
    border: 1px solid red;
}
.article-label-nav {
    width: 230px;
    height: 100%;
    position: fixed;
    top: 0;
    left: 90px;
    border-right: 1px solid #f1f1f1;
    z-index: 1;
    background-color: #fff;
}
.article-label-nav > ul {
    overflow: auto;
    padding-left: 22px;
    padding-right: 22px;
}
.article-label-nav > ul > li {
    height: 40px;
    line-height: 40px;
    border-bottom: 1px solid #f1f1f1;
    padding: 5px 10px 5px 10px;
}
.article-label-nav > ul > li > img {
    display: block;
    float: left;
    padding-top: 13px;
    padding-right: 5px;
}
.article-label-nav > ul > li > h3 {
    width: 170px;
    padding: 5px 0 5px 0;
    display: inline;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
    color: #20a0ff;
}
.tagName-input {
    margin: 5px 5px 0px;
    position: absolute;
    bottom: 13px
}
</style>
