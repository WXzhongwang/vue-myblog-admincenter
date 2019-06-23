<template>
	<div class="articel-edit-wrap">
        <div class="article-title">
            <input type="text" v-model="articleTitle">
        </div>
        <div class="article-toolbar">
            <div class="label">
                <el-popover ref="tag" placement="top-start" width="150" trigger="click">
                    <ul class="tag-list-wrap">
                        <li v-for="item in tags" @click="selectTag(item)">{{item.name}}</li>
                    </ul>
                </el-popover>
                <img src="@/assets/tag.png" height="30" width="30" v-popover:tag>
                <el-tag v-for="(item,index) in list" :closable="true" type="success" :key="index" :close-transition="false" @close="handleClose(tag)">
                    {{item.name}}
                </el-tag>
            </div>
            <div class="action-button">
                <el-button v-if="this.$route.query.id" type="danger" size="small" @click="delectArticles">删除</el-button>
                <el-button size="small" @click="saveDraft">保存草稿</el-button>
                <el-button type="primary" size="small" @click="publishedArticles">发布文章</el-button>
            </div>
        </div>
        <textarea id="editor"></textarea>
	</div>
</template>

<script>
import SimpleMDE from 'simplemde'
import '@/assets/simplemde.css'
import marked from 'marked';
import highlight from 'highlight.js'
import '@/assets/atom-one-light.css'
import { Message } from 'element-ui';
export default {
	data () {
        return {
            articleTitle: '请输入文章标题',
            content: '',
            tags: [],
            list: []
        }
    },
    mounted: function(){
    	Date.prototype.format = function(format) {
            var o = {
                "M+": this.getMonth() + 1, //month
                "d+": this.getDate(), //day
                "h+": this.getHours(), //hour
                "m+": this.getMinutes(), //minute
                "s+": this.getSeconds(), //second
                "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
                "S": this.getMilliseconds() //millisecond
            }
            if (/(y+)/.test(format)) {
                format = format.replace(RegExp.$1,(this.getFullYear() + "").substr(4 - RegExp.$1.length));
            }
            for (var k in o){
                if (new RegExp("(" + k + ")").test(format)){
                    format = format.replace(RegExp.$1,RegExp.$1.length == 1 ? o[k] :("00" + o[k]).substr(("" + o[k]).length));
                }
            }
            return format;
        }
        var self = this
        var smde = new SimpleMDE({
            element: document.getElementById('editor'),
            autofocus: true,
            autosave: true,
            previewRender: function(plainText) {
                return marked(plainText,{
                    renderer: new marked.Renderer(),
                    gfm: true,
                    pedantic: false,
                    sanitize: false,
                    tables: true,
                    breaks: true,
                    smartLists: true,
                    smartypants: true,
                    highlight: function (code) {
                        return highlight.highlightAuto(code).value;
                    }
                });
            },
        });
        smde.codemirror.on("change", function(){
            var value = smde.value();
            self.content = value
        });


        if(this.$route.query.id){
            //console.log(this.$route.query.id)
            this.$axios.get('/articles/' + this.$route.query.id).then(
                respone => {
                    let articleDetail = respone.data.data
                    this.articleTitle = articleDetail.title
                    for(let  i = 0; i< articleDetail.tags.length; i++){
                        this.list.push({
                            id: articleDetail.tags[i].id,
                            name: articleDetail.tags[i].name
                        })
                    }
                    //this.list = articleDetail.tags
                    smde.value(articleDetail.content)
                },
                respone => console.log(respone)
            )
        } else {
            smde.value("快来开始写博客吧");
        }

        // 请求标签数据列表
        this.$axios.get('/tags/all').then(
            respone => {
                //console.log(respone.data.data)
                this.tags =  respone.data.data
            },
            respone => {
                Message.error('数据出错，请重新刷新页面')
            }
        )
    },
    methods: {
        // 删除
        delectArticles: function(){
            this.$axios.post('/articles/delete/', {
                _id : this.$route.query.id
            }).then(
                respone => {
                    this.$message('删除成功'),
                    this.$emit('saveArticleInformation'),
                    this.$router.push('/articleList/articleEdit')
                },
                respone => {
                    this.$message.error('删除失败请重试')
                }
            )
        },
    	// 保存草稿
    	saveDraft: function(){
    	    var self = this
    	    if(this.$route.query.id){
    	        // 更新    	       
    	        var obj = {
    	            _id: this.$route.query.id,
                    title: self.articleTitle,
                    content: self.content,
                    createtime: new Date().format('yyyy-MM-dd hh:mm:ss'),
                    state: 'draft'
                }
                this.$axios.post('/articles/add' + this.$route.query.id, {
                    article: obj
                }).then(
                    respone => {
                        Message.success('文章保存成功')
                        // 如果文章信息保存成功就给父组件派发一个事件通知它刷新文章列表
                        self.$emit('saveArticleInformation')
                    },
                    respone => {
                        Message.error('文章保存失败')
                    }
                )
    	    } else {
    	        // 新建保存    	        
                var obj = {
                    title: self.articleTitle,
                    articleContent: self.content,
                    date: new Date().format('yyyy-MM-dd hh:mm:ss'),
                    state: 'draft'
                }
                this.$axios.post('/articles/add', {
                    articleInformation: obj
                }).then(
                    respone => {
                        Message.success('文章保存成功')
                        // 如果文章信息保存成功就给父组件派发一个事件通知它刷新文章列表
                        self.$emit('saveArticleInformation')
                    },
                    respone => {
                        Message.error('文章保存失败')
                    }
                )
    	    }
        },
        // 发布文章
        publishedArticles: function(){
        	var self = this
        	if(this.$route.query.id){
    	        var obj = {
    	            _id: this.$route.query.id,
                    title: self.articleTitle,
                    articleContent: self.content,
                    date: new Date().format('yyyy-MM-dd hh:mm:ss'),
                    state: 'publish',
                    label: labelName
                }
                this.$axios.post('/api/updateArticle',{
                    obj: obj
                }).then(
                    respone => {
                        Message.success('文章发布成功')
                        // 如果文章信息保存成功就给父组件派发一个事件通知它刷新文章列表
                        self.$emit('saveArticleInformation')
                    },
                    respone => {
                        Message.error('文章发布成功')
                    }
                )
    	    } else {
    	        // 新建发布                
                var obj = {
                    title: self.articleTitle,
                    articleContent: self.content,
                    date: new Date().format('yyyy-MM-dd hh:mm:ss'),
                    state: 'publish',
                    label: labelName
                }
                this.$axios.post('/articles/add', {
                    articleInformation: obj
                }).then(
                    respone => {
                        Message.success('文章发布成功')
                        // 如果文章信息保存成功就给父组件派发一个事件通知它刷新文章列表
                        self.$emit('saveArticleInformation')
                    },
                    respone => Message.error('文章发布失败')
                )
            }
        },
        //选择tag
        selectTag: function(data){
            for(let  i = 0; i< this.list.length; i++){
               if(this.list[i].name == data.name && this.list[i].id == data.id){
                Message.warning('已经加过此标签了')
                return;
               }
            }  
            this.list.push(data) 
        },
        //移除tag
        handleClose: function(tag) {
            this.list.splice(this.tags.indexOf(tag), 1);
        }
    },
    directives: {

    }
}
</script>

<style>
.fade-enter-active, .fade-leave-active {
    transition: opacity .5s
}
.fade-enter, .fade-leave-active {
    opacity: 0
}
.articel-edit-wrap {
    width: 100%;
    height: 100%;
}
.article-title {
    height: 45px;
    border-bottom: 1px solid #f1f1f1;
}
.article-title > input {
    border: none;
    outline-style: none;
    width: 97%;
    height: 43px;
    padding-left: 10px;
    font-size: 20px;
}
.article-toolbar {
    height: 60px;
    line-height: 60px;
}
.label {
    width: 60%;
    height: 60px;
    line-height: 60px;
    padding-left: 10px;
    float: left;
    display: table-cell;
    vertical-align: middle;
}
.label > img {
    vertical-align: middle;
    cursor: pointer;
}
.label > img:hover {
    border-bottom: 2px solid #20a0ff;
}
.tag-list-wrap {
    border: 1px solid #e0e6ed;
    padding: 5px;
    max-height: 150px;
    overflow: auto;
}
.tag-list-wrap > li {
    margin: 2px;
    padding: 3px;
    cursor: pointer;
    height: 30px;
    line-height: 36px;
}
.tag-list-wrap > li:hover {
    background-color: #e0e6ed;
}
.action-button {
    min-width: 120px;
    float: right;
    padding-right: 20px;
}
.CodeMirror {
    border-bottom: none!important;
    border-left: none!important;
    border-right: none!important;
    border-top: 1px solid #f1f1f1!important;
}
.editor-toolbar {
    border-top-left-radius: 0!important;
    border-top-right-radius: 0!important;
    border-left: none!important;
    border-right: none!important;
    border-top: 1px solid #f1f1f1!important;
}
.editor-statusbar {
    display: none;
}
</style>
