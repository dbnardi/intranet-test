<template>
  <div class="mega-menu-container" tabindex="0">
    <ul class="exo-menu">
      <li v-for="(item, index) in menu" :key="index" class="mega-drop-down">
        <a :href="item.url" :class="{'first-level':item.children.length>0}"  target="_blank">
          <i class="md-icon md-icon-font md-theme-default">{{ item.icon }}</i>
          {{ item.title }}
        </a>
        <div class="mega-menu" >
          <div class="mega-menu-wrap">
            <div class="md-layout">
              <div
                class="md-layout-item"
                v-for="(lvl2, index2) in orderedItems(item.children)"
                :key="index2"
              >
                <h4 class="mega-title">
                  <a v-if="lvl2.url" :href="lvl2.url" target="_blank">{{ lvl2.title }}</a>
                  <span v-else>{{ lvl2.title }}</span>
                </h4>
                <ul class="stander">
                  <li v-for="(lvl3, index3) in orderedItems(lvl2.children)" :key="index3">
                    <a :href="lvl3.url"  target="_blank">{{ lvl3.title }}</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "mega-menu",
  data() {
    return {
      menu: [],
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
  methods:{
    orderedItems(items){
      return _.sortBy(items, "title")
    }
  }
};
</script>