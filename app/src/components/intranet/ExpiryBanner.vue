<template>
  <div v-if="expired" class="alert alert-warning">
    <div class="container">
      <h3>
        <div class="alert-icon">
          <i class="md-icon md-icon-font md-theme-default">warning</i>
        </div>
        The contents of this page have expired and may be out of date.
      </h3>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      expired: false,
    };
  },
  created() {
    if (typeof _expiry != "undefined") {
      if (moment(_expiry).isBefore(moment())) {
        this.expired = true;
      }
    }
  },
};
</script>
