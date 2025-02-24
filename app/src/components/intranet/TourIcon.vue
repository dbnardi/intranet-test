<template>
  <i
    id="tourIcon"
    v-if="onHomePage"
    @click="startTour"
    class="md-icon md-icon-font md-theme-default"
  >
    tour
  </i>
</template>

<script>
export default {
  name: "TourIcon",
  methods: {
    startTour: () => {
      window.startTour(); //Code for this method is in App.vue
    },
  },
  computed: {
    onHomePage: () =>
      location.href == _spPageContextInfo.siteAbsoluteUrl + "/" ||
      location.href == _spPageContextInfo.siteAbsoluteUrl + "/Pages/home.aspx",
  },
};
</script>
