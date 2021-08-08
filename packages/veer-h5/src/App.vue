<template>
  <div id="app" class="App">
    <div
      v-if="!$route.meta.hide"
      id="nav"
    >
      <router-link to="/">
        Home
      </router-link>|
      <router-link to="/about">
        About
      </router-link>
    </div>
    <keep-alive>
      <router-view
        v-if="$route.meta.keepAlive"
        class="router"
      />
    </keep-alive>
    <router-view
      v-if="!$route.meta.keepAlive"
      class="router"
    />
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue'
import { useStore } from 'vuex'
export default defineComponent({
  setup() {
    const store = useStore()
    return {
      title: computed(() => store.state.title)
    }
  }
})
</script>
<style lang="scss">
#app {
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    font-family: "flag";
}
#nav {
  padding: 20px 0;
    a {
        font-weight: bold;
        color: #2c3e50;
        font-size: 32px;
        &.router-link-exact-active {
            color: red;
        }
    }
}
h3 {
    font-size: 18px;
}
</style>
