<template>
  <div class="vue-world-map">
    <Countries
      @hoverCountry="onHoverCountry"
      @hoverLeaveMap="onHoverLeaveMap"
    />
    <div
      v-if="legend.name && hoverEnabled(legend.code)"
      class="vue-map-legend"
      :style="'left:' + position.left + 'px; top: ' + position.top + 'px'"
    >
      <div class="vue-map-legend-header">
        <span>{{ legend.name }}</span>
      </div>
      <div
        class="vue-map-legend-content"
        v-html="countryData[legend.code]"
      ></div>
    </div>
  </div>
</template>

<script>
import Countries from "./Countries";
import {
  getDynamicMapCss,
  getBaseCss,
  getCombinedCssString,
} from "./dynamic-map-css";

let legend = {
  data: null,
  code: null,
  name: null,
};

let position = {
  left: 0,
  top: 0,
};

export default {
  name: "MapChart",
  components: { Countries },
  watch: {
    countryData() {
      this.renderMapCSS();
    },
  },
  props: [
    "countryData",
    "countries",
    "defaultCountryFillColor",
    "countryStrokeColor",
    "legendHeaderBackgroundColor",
    "legendContentBackgroundColor",
    "legendFontColorHeader",
    "legendFontColorContent",
    "legendBorderColor",
    "legendBorderRadius",
    "legendBoxShadow"
  ],
  data() {
    return {
      legend: legend,
      position: position,
      node: document.createElement("style")
    };
  },
  mounted() {
    document.body.appendChild(this.$data.node);
    this.renderMapCSS();
  },
  methods: {
    onHoverCountry(country) {
      this.legend = country;
      this.position = country.position;
    },
    onHoverLeaveMap() {
      this.legend = {
        data: null,
        code: null,
        name: null,
      };
    },
    renderMapCSS() {
      const baseCss = getBaseCss(this.$props);
      const dynamicMapCss = getDynamicMapCss(this.$props.countryData);
      this.$data.node.innerHTML = getCombinedCssString(baseCss, dynamicMapCss);
    },
    hoverEnabled(country) {
      return (this.countries.indexOf(country) > -1)
    },
  },
};
</script>

<style>
.vue-world-map,
#map-svg {
  height: 100%;
}

.vue-world-map {
  position: relative;
}

.vue-map-legend {
  width: 220px;
  background: #fff;
  overflow: auto;
  border: 1px solid;
  position: absolute;
}

.vue-map-legend-header {
  padding: 10px 15px;
}

.vue-map-legend-content {
  background: #dadbda;
  border-top: 1px solid #acacad;
  padding-bottom:10px;
}
.vue-map-legend-content>ul{
  line-height:25px;
}

</style>