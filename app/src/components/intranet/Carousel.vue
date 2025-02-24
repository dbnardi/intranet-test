<template>
  <el-carousel trigger="click" :interval="transitionTime" :autoplay="true" arrow="always" class="home-carousel">
    <div v-for="(item, index) in limitedItems" :key="index" class="pointer" @click="onClick(item)">
      <el-carousel-item class="slide">
        <!-- small column left -->
        <div v-if="item.CarouselTemplate === carouselTypes[0]" class="carousel-1"
          :style="'background:' + (item.PanelColourHex || '#131621')">
          <img v-if="item.FieldValuesAsHtml.PublishingPageImage"
            :src="extractImage(item.FieldValuesAsHtml.PublishingPageImage, 1)" />
          <img v-else src="/publishingimages/newsplaceholder.jpg?RenditionID=1" />
          <div class="carousel-text" v-if="item.Title">
            <a :href="item.CarouselLinkUrl || item.url" target="_blank">
              <h2>{{ item.Title }}</h2>
            </a>
            <!-- <p>{{ item.DFATDescription }}</p> -->
          </div>
        </div>
        <!-- two column left  -->
        <div v-else-if="item.CarouselTemplate === carouselTypes[1]" class="carousel-3"
          :style="'background:' + (item.PanelColourHex || '#131621')">
          <img v-if="item.FieldValuesAsHtml.PublishingPageImage"
            :src="extractImage(item.FieldValuesAsHtml.PublishingPageImage, 4)" />
          <img v-else src="/publishingimages/newsplaceholder.jpg?RenditionID=4" />
          <div class="carousel-text" v-if="item.Title">
            <a :href="item.CarouselLinkUrl || item.url" target="_blank">
              <h2>{{ item.Title }}</h2>
            </a>
            <!-- <p>{{ item.DFATDescription }}</p> -->
          </div>
        </div>
        <!-- two column right  -->
        <div v-else-if="item.CarouselTemplate === carouselTypes[2]" class="carousel-5"
          :style="'background:' + (item.PanelColourHex || '#131621')">
          <div class="carousel-text" v-if="item.Title">
            <a :href="item.CarouselLinkUrl || item.url" target="_blank">
              <h2>{{ item.Title }}</h2>
            </a>
            <!-- <p>{{ item.DFATDescription }}</p> -->
          </div>
          <img v-if="item.FieldValuesAsHtml.PublishingPageImage"
            :src="extractImage(item.FieldValuesAsHtml.PublishingPageImage, 4)" />
          <img v-else src="/publishingimages/newsplaceholder.jpg?RenditionID=4" />
        </div>
        <!-- staggered left  -->
        <div v-if="item.CarouselTemplate === carouselTypes[3]" class="carousel-4"
          :style="'background:' + (item.PanelColourHex || '#131621')">
          <img v-if="item.FieldValuesAsHtml.PublishingPageImage"
            :src="extractImage(item.FieldValuesAsHtml.PublishingPageImage, 4)" />
          <img v-else src="/publishingimages/newsplaceholder.jpg?RenditionID=4" />
          <div class="line-overlay line-overlay-1" :style="'background:' + (item.PanelColourHex || '#131621')"></div>
          <div class="line-overlay line-overlay-2" :style="'background:' + (item.PanelColourHex || '#131621')"></div>
          <div class="line-overlay line-overlay-3" :style="'background:' + (item.PanelColourHex || '#131621')"></div>
          <div class="line-overlay line-overlay-4" :style="'background:' + (item.PanelColourHex || '#131621')"></div>
          <div class="carousel-text" v-if="item.Title">
            <h2>{{ item.Title }}</h2>
            <!-- <p>{{ item.DFATDescription }}</p> -->
          </div>
        </div>
        <!-- default -->
        <div v-if="item.CarouselTemplate === carouselTypes[4]" class="carousel-6"
          :style="'background:' + (item.PanelColourHex || '#131621')">
          <img v-if="item.FieldValuesAsHtml.PublishingPageImage"
            :src="extractImage(item.FieldValuesAsHtml.PublishingPageImage, 1)" />
          <img v-else src="/publishingimages/newsplaceholder.jpg?RenditionID=1" />
          <div class="carousel-text" v-if="item.Title">
            <a :href="item.CarouselLinkUrl || item.EncodedAbsUrl" target="_blank">
              <h2 :style="'border-bottom-color:' + (item.PanelColourHex || '#131621')">
                {{ item.Title }}
              </h2>
            </a>
            <!-- <p>{{ item.DFATDescription }}</p> -->
          </div>
        </div>
      </el-carousel-item>
    </div>
  </el-carousel>
</template>
<script>
import { Carousel, CarouselItem } from "element-ui";
export default {
  components: {
    Carousel,
    CarouselItem,
  },
  props: {
    items: Array,
    config: Object,
  },
  computed: {
    limitedItems: function () {
      return this.config
        ? this.items.slice(0, this.config.CarouselItemLimit)
        : this.items.slice(0, this.defaultItemLimit);
    },
    transitionTime: function () {
      return this.config
        ? this.config.CarouselTransitionTime
        : this.defaultTransitionTime;
    },
  },
  methods: {
    onClick(item) {
      window.open(item.CarouselLinkUrl ? item.CarouselLinkUrl : item.url, '_blank').focus();
    }
  },
  data() {
    return {
      carouselTypes: [
        "Small column left",
        "Two column image left",
        "Two column image right",
        "Stutter image left",
        "Default",
      ],
      defaultItemLimit: 8,
      defaultTransitionTime: 5000,
    };
  },
};
</script>

