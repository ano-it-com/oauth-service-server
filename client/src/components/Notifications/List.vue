<template>
  <div v-if="notifyList && notifyList.length" :class="$options.name">
    <notification-item
      v-for="item in notifyList"
      :key="item.id"
      :title="item.tile"
      :message="item.message"
      :type="item.type"
      @remove="removeNotify(item.id)"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import NotificationItem from './Item.vue';

export default {
  name: 'notifications-list',
  components: { NotificationItem },
  computed: {
    ...mapGetters(['notifyList']),
  },
  methods: {
    ...mapActions(['removeNotify']),
  },
};
</script>

<style lang="scss" scoped>

.notifications-list {
  position: fixed;
  top: 0;
  right: 0;
  width: 450px;
  margin: 6px;
  z-index: 1999;
}
</style>
