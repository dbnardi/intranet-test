<template>
  <div class="accordion-view">
    <h3 v-if="accordion.title.length > 0">{{accordion.title}}</h3>
    <div class="accordion-sections">
      <div class="accordion-section" v-for="(section, index) in accordion.sections" :key="index">
        <button 
          type="button" 
          class="accordion" 
          @click="section.active = !section.active;">
          <i class="md-icon md-icon-font md-theme-default" v-if="section.active">remove</i>
          <i class="md-icon md-icon-font md-theme-default" v-else>add</i>
          {{section.title}}
        </button>
        <div class="panel" v-if="section.active" v-html="section.content"></div>
      </div>
    </div>
  </div>
</template>

<script>


export default {
  name: "accordion-view",
  data() {
    return {
      data: null
    }
  },
  created: function () {
    // get a reference to the accordion data text field
    const accordionDataContainer = document.getElementById("txtAccordionData");
    const accordionData = JSON.parse(accordionDataContainer.innerText);
    const data =  accordionData.find((item) => item.id === this.$parent.id);

    data.sections = data.sections.map((item) => {
      item.active = false
      return item;
    });

    this.data = data;
  },
  computed: {
    accordion: function () {
      return this.data
    }
  }
};
</script>
