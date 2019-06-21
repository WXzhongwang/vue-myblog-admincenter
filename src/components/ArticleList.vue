<template>
    <div>
        <div class="article-list">
            <div class="article-instructions">
                <img src="@/assets/article-title.png" height="20" width="20">
                <span>文章列表</span>
                <img src="@/assets/add.png" height="17" width="17" @click="addArticle">
            </div>
            <ul v-articleListHeight>
                <li v-for="item in articleList">
                    <h3 :class="{'articlePreview-title-draft': item.state=='draft', 'articlePreview-title-publish': item.state=='publish'}" @click="articlePreview(item.id)">
                        {{item.title}}
                    </h3>
                    <p>{{new Date(item.publishTime).format('yyyy-MM-dd hh:mm:ss')}}
                        <!--<span class="label-item">{{item.label}}</span>-->
                    </p>
                </li>
            </ul>
        </div>
        <div class="router-view">
            <transition name="fade" mode="out-in">
                <router-view @saveArticleInformation="refreshArticleList" @emitArticleLabelList="onArticleLabelLis"></router-view>
            </transition>
        </div>
    </div>
</template>

<script>
export default{
    data(){
        return{
            articleList: []
        }
    },
    mounted: function(){
        Date.prototype.format = function(format) {
            var o = {
                "M+": this.getMonth() + 1,
                "d+": this.getDate(),
                "h+": this.getHours(),
                "m+": this.getMinutes(),
                "s+": this.getSeconds(),
                "q+": Math.floor((this.getMonth() + 3) / 3),
                "S": this.getMilliseconds()
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
    },
    created: function(){
        // 组件创建完后获取数据，
        // 此时 data 已经被 observed 了
        var param = localStorage.getItem("lebelTitle")
        if(param){
            localStorage.removeItem("lebelTitle")
            this.$axios.post('api/admin/articleList', {
                label: param
            }).then(
                respone => {
                    this.articleList = respone.body.reverse();
                },
                respone => console.log(respone)
            )
        } else {
            this.fetchData()
        }
    },
    methods: {
        fetchData: function(){
            this.$axios.get('/articles/all').then(
                respone => {
                    this.articleList = respone.data.data;
                    console.log(respone.data.data);
                },
                respone => console.log(respone)
            )
        },
        // 文章编辑页路由
        addArticle: function(){
            this.$router.push('/articleList/articleEdit')
        },
        // 文章预览页
        articlePreview: function(id){
            this.$router.push('/articleList/articlePreview'+id+'')
        },
        // 接受ArtcleEdit组件派发的事件去获取最新的文章列表
        refreshArticleList: function(){
            this.$axios.get('/articles/all').then(
                respone => this.articleList = respone.body.reverse(),
                respone => console.log(respone)
            )
        },
        onArticleLabelLis: function(title){
            console.log(title)
        }
    },
    watch: {
        '$route': 'fetchData'
    },
    directives: {
        articleListHeight: {
            bind: function(el){
                var height = window.innerHeight - 80
                el.style.maxHeight = height + 'px'
            }
        }
    }
}
</script>

<style>
.article-list {
    width: 230px;
    height: 100%;
    position: fixed;
    top: 0;
    left: 90px;
    border-right: 1px solid #f1f1f1;
    z-index: 1;
    background-color: #fff;
}
.article-list > ul {
    overflow: auto;
    padding-left: 12px;
    padding-right: 12px;
}
::-webkit-scrollbar
{
    width: 5px;
    height: 16px;
    background-color: #fff;
}
 
/*定义滚动条轨道 内阴影+圆角*/
::-webkit-scrollbar-track
{
    //-webkit-box-shadow: inset 0 0 3px rgba(0 , 0, 0, 0.8);
    border-radius: 6px;
    background-color: #fff;
}
 
/*定义滑块 内阴影+圆角*/
::-webkit-scrollbar-thumb
{
    border-radius: 6px;
    //-webkit-box-shadow: inset 0 0 3px rgba(0 , 0, 0, 0.8);
    background-color: #fff;
}
.article-list > ul > li {
    border-bottom: 1px solid #f1f1f1;
    padding: 5px 10px 5px 10px;
}
.article-list > ul > li > h3 {
    width: 170px;
    padding: 5px 0 5px 0;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
}
.article-list > ul > li > p {
    font-size: 12px;
    color: #b3bbbc;
}
.article-instructions {
    height: 65px;
    line-height: 65px;
    padding-left: 20px;
    border-bottom: 1px solid #f1f1f1;
    color: #666;
}
.article-instructions > span {
    width: 150px;
    display: inline-block;
}
.article-instructions > img {
    vertical-align:middle;
    cursor: pointer;
}
.router-view {
    position: relative;
    height: 100%;
    margin-left: 321px;
}
.articlePreview-title-publish {
    color: #20a0ff;
}
.articlePreview-title-draft {
    color: #FF4949;
}
.label-item {
    border: 1px #ccc solid;
    border-radius: 5px;
    padding: 2px 4px;
}
</style>
