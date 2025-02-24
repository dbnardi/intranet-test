<template>
  <el-carousel
    trigger="click"
    :interval="transitionTime"
    direction="vertical"
    class="mt-15 flipboard"
  >
    <div
      v-for="(item, index) in limitedItems"
      :key="index"
      class="pointer"
      @click="onClick(item.CarouselLinkUrl)"
    >
      <el-carousel-item class="slide">
        <img :src="extractImage(item.NewsImage, 3)" />
        <div class="carousel-text">
          <h3>{{ item.Title }}</h3>
        </div>
      </el-carousel-item>
    </div>
  </el-carousel>
</template>
<script>
import { Carousel, CarouselItem } from "element-ui";
import sharepoint from "@/api/api";
export default {
  components: {
    Carousel,
    CarouselItem,
  },
  props: {
    config: Object,
  },
  computed: {
    limitedItems: function() {
      return this.config
        ? this.carouselItemsPulled.slice(0, this.config.FlipboardItemLimit)
        : this.carouselItemsPulled.slice(0, this.defaultItemLimit);
    },
    transitionTime: function() {
      return this.config
        ? this.config.FlipboardTransitionTime
        : this.defaultTransitionTime;
    },
  },
  data() {
    return {
      carouselItemsPulled: [],
      defaultItemLimit: 8,
      defaultTransitionTime: 10000,
    };
  },
  methods: {
    onClick(url) {
      if (url) window.open(url,"_blank");
    },
  },
  created: async function() {
    this.carouselItemsPulled = await sharepoint.getListItemsWithHTMLField(
      "Flipboard",
      ["NewsImage"],
      {
        rowLimit: 4,
        orderBy: "Modified",
        ascending: false,
        selects: ["Id", "Title", "CarouselLinkUrl"],
      }
    );
  },
};
</script>
