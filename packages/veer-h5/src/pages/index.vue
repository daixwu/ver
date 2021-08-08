<template>
  <div>
    <img
      src="../assets/images/logo.png"
      alt=""
    >
    <p class="title">
      {{ title }}
    </p>
    <div class="div1">
      box
    </div>
    <van-button type="success">
      成功按钮
    </van-button>
    <img
      src="../assets/images/test.jpg"
      alt=""
    >
  </div>
</template>
<script>
import { defineComponent, ref, onMounted } from 'vue'
// import { user } from "../api/index";
export default defineComponent({
  name: 'Index',

  setup() {
    const title = ref('渐进式JavaScript 框架-首页1')
    onMounted(() => {
      // user();
      console.log('mounted!')
    })

    return {
      title
    }
  }
})
</script>
<style lang="scss" scoped>
.title {
  color: #000;
  font-size: 48px;
  text-align: center;
}
img {
  max-width: 100%;
}
.van-button{
margin-bottom: 20px;}
.div1 {
  width: 200px;
  height: 200px;
  background: url("../assets/images/category-active.png") no-repeat;
  background-size: 100%;
}
</style>
