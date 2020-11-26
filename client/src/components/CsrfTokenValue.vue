<template>
  <input type="hidden" name="_csrf" :value="csrfToken" />
</template>

<script>
export default {
  name: 'csrf-token-value',
  data: () => ({
    csrfToken: null,
  }),
  mounted() {
    this.csrfToken = document.head.querySelector('meta[name="csrf-token"]').getAttribute('content');
  },
};
</script>
