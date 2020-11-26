<template>
  <div :class="$options.name">
    <div class="home-block">
      <v-card elevation="24" class="mt-12">
        <v-card-text class="pa-8">
          <div class="d-flex">
            <v-avatar :size="96">
              <v-img :src="$currentUser.picture" />
            </v-avatar>

            <div class="user-info ml-6 d-flex flex-column justify-center">
              <h2
                class="text--black"
                v-text="`${$currentUser.firstName} ${$currentUser.lastName}`"
              />
              <small v-text="`@${$currentUser.username}`" />
              <small v-text="$currentUser.email" />
              <a href="/auth/logout">Выход</a>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'home-view',
};
</script>

<style lang="scss" scoped>

.home-view {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.home-block {
  display: flex;
  flex-direction: column;
  align-items: center;

  img {
    height: 240px;
  }

  .user-info {
    h2 {
      color: #000;
    }

    small {
      margin-top: 4px;
      font-size: 14px;
      line-height: 1.4em;
    }
  }
}
</style>
