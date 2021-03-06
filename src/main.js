import Vue from 'vue'
import App from './App.vue'
import VueResource from 'vue-resource'
import VueRouter from 'vue-router'
// import 'element-ui/lib/theme-default/index.css'
import 'element-ui/lib/theme-chalk/index.css'
import ElementUI from 'element-ui'
import PersonnalCenter from '@/components/PersonnalCenter'
import ArticleLabel from '@/components/ArticleLabel'
import ArticleList from '@/components/ArticleList'
import ArticleEdit from '@/components/ArticleEdit'
import ArticlePreview from '@/components/ArticlePreview'
import axios from 'axios'

Vue.use(ElementUI);
Vue.use(VueRouter);
Vue.use(VueResource);

Vue.config.productionTip = false

//axios.defaults.baseURL = 'http://mockjs.com' 
axios.defaults.baseURL = '/api';
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
axios.defaults.headers.get['Content-Type'] = 'application/x-www-form-urlencoded';
axios.defaults.transformRequest = [function (data) {
    let ret = ''
    for (let it in data) {
      ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
    }
    return ret
}]

Vue.prototype.$axios = axios

const router = new VueRouter({
  mode: 'history',
  routes: [
        { path: '/', component: PersonnalCenter },
        { path: '/articleLabel', component: ArticleLabel },
        { path: '/personalCenter', component: PersonnalCenter },
        { path: '/articleList', component: ArticleList,
            children: [
                {path: 'articleEdit', component: ArticleEdit },
                {path: 'articlePreview:id', component: ArticlePreview },
            ]
        }
  ]
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
