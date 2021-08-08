import './assets/style/app.scss'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router/router'
import _ from 'lodash'

console.log(_.join(['Another', 'module', 'loaded!'], ' '))

if (process.env.NODE_ENV !== 'production') {
  console.log('Looks like we are in development mode!')
}

createApp(App).use(router).mount('#app')
