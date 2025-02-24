<template>
  <div class="mobile-menu">
    <md-button @click="drawerOpen=true" class="md-primary md-just-icon md-lg"><md-icon >menu</md-icon></md-button>
    <nav id="nav-drawer" class="slide-nav" :class="drawerOpen ? 'open' : 'closed'">
      <ul class="lvl1">
        <li v-for="(lvl1, index) in menu" :key="index" class="top-level">
          <div v-if="lvl1.url" class="lvl1-text anchor">
            <i v-if="lvl1.icon" class="md-icon md-icon-font md-theme-default">
              {{ lvl1.icon }}
            </i>
            <a :href="lvl1.url">
              {{ lvl1.title }}
            </a>
          </div>
          <div v-else class="lvl1-text">
            {{ lvl1.title }}
          </div>
          <ul class="lvl2">
            <li v-for="(lvl2, index2) in lvl1.children" :key="index2">
              <div v-if="lvl2.url" class="lvl2-text anchor">
                <a :href="lvl2.url">
                  {{ lvl2.title }}
                </a>
              </div>
              <div v-else class="lvl2-text">
                {{ lvl2.title }}
              </div>
              <ul>
                <li v-for="(lvl3, index3) in lvl2.children" :key="index3">
                  <div class="lvl3-text anchor">
                    <a :href="lvl3.url">{{ lvl3.title }}</a>
                  </div>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
      <md-button @click="drawerOpen=false" class="md-primary md-just-icon md-lg"><md-icon >close</md-icon></md-button>
    </nav>
  </div>
</template>

<script>
  export default {
    name: "mobile-menu",
    data() {
      return {
        menu: [],
        drawerOpen: false,
      };
    },
    created: function () {
      this.menu = _navigation.filter((navItem) => navItem.parentId == "");
      this.menu.forEach((item) => {
        item.show = false;
        item.children = _navigation.filter((lvl2) => lvl2.parentId == item.id);
        item.children.forEach((lvl2) => {
          lvl2.children = _navigation.filter((lvl3) => +lvl3.parentId == lvl2.id);
        });
      });
    },
  };
</script>