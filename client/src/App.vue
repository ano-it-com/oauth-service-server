<template>
  <v-app id="application" :class="{ animated: $route.name === 'index' }">
    <notify-list />
    <v-container :class="[{ 'view': $route.meta.isCenteredPage }, 'main-view']">
      <router-view />
    </v-container>
  </v-app>
</template>

<script>
import NotifyList from './components/Notifications';

export default {
  name: 'application',
  components: { NotifyList },
};
</script>

<style lang="scss" src="@/styles/main.scss" />

<style lang="scss">
#application {
  font-family: 'Roboto', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;

  &.animated {
     background: linear-gradient(90deg,
     rgba(246,124,27,1) 0%,
     rgba(212,127,19,1) 35%,
     rgba(113,135,161,1) 62%,
     rgba(49,127,255,1) 100%);
     background-size: 400% 400%;
     animation: gradient 15s ease infinite;
   }
}

@keyframes gradient {
  0% {
    background-position: 0 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

.view {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.container {
  height: 100vh;
}
</style>
