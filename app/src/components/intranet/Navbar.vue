<template>
  <div>
    <nav>
      <mobile-menu></mobile-menu>
      <div>
        <a href="/">
          <img :src="siteLogo" />
        </a>
      </div>
      <mega-menu></mega-menu>
      <div class="search">
        <!-- <tour-icon/> -->
        <hero-search></hero-search>
      </div>
    </nav>
  </div>
</template>

<script>
import MobileMenu from './MobileMenu.vue';
import HeroSearch from "./HeroSearch.vue";
import MegaMenu from "./MegaMenu.vue";

export default {
  name: "Navbar",
  components: { HeroSearch, MegaMenu, MobileMenu },
  data() {
    return {
      classification: _classification.toUpperCase(),
      siteLogo: _spPageContextInfo.webLogoUrl,
    };
  },
};
</script>