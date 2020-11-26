<template>
  <v-alert
    :color="type"
    elevation="12"
    border="left"
    transition="scale-transition"
    dismissible
    dark
  >
    {{ message }}
  </v-alert>
</template>

<script>
export default {
  name: 'notification-item',
  props: {
    type: String,
    message: String,
    title: String,
    duration: {
      type: Number,
      default: 6000,
    },
  },
  mounted() {
    this.closeTimerId = setTimeout(() => this.$emit('remove'), this.duration);
  },
  beforeDestroy() {
    if (this.closeTimerId) clearTimeout(this.closeTimerId);
  },
};
</script>
