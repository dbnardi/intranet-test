<template>
  <md-card class="md-card-login" :class="{ 'md-card-hidden': cardHidden }">
    <md-card-header :style="style">
      <slot name="title"></slot>
      <div class="social-line">
        <slot name="buttons"></slot>
      </div>
    </md-card-header>

    <md-card-content>
      <slot name="description"></slot>
      <slot name="inputs"></slot>
    </md-card-content>

    <md-card-actions>
      <slot name="footer"></slot>
    </md-card-actions>
  </md-card>
</template>

<script>
export default {
  name: "login-card",
  props: {
    headerColor: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      cardHidden: true
    };
  },
  computed:{
    style(){
      return `background-color: ${this.headerColor}`
    }
  },
  beforeMount() {
    setTimeout(this.showCard, 400);
  },
  methods: {
    showCard: function() {
      this.cardHidden = false;
    },
    getClass: function(headerColor) {
      return "md-card-header-" + headerColor + "";
    }
  }
};
</script>

<style lang="scss">
@import "@/assets/scss/material-kit/variables";
@import "@/assets/scss/material-kit/mixins";
@import "@/assets/scss/material-kit/shadows";
@import "@/assets/scss/material-kit/cards";
.md-card-header-ona-green {
  background: linear-gradient(
    60deg,
    $theme-secondary,
    $theme-secondary
  ) !important;
}

.md-card-header-success {
  background: linear-gradient(60deg, #ab47bc, #902fa1) !important;
}

.md-card-header-ona-blue {
  background: linear-gradient(60deg, $theme-primary, $theme-primary) !important;
}
.md-card-login .md-card-header + .md-card-content {
  padding-bottom: 0px;
  padding-top: 10px;
}
</style>
