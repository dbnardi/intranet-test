<template>
  <div class="accordion-edit" v-if="show">
    <div class="accordions">
      <div class="accordion" v-for="(accordion, index) in accordions" :key="index">
        <div class="accordion-header">
          <label class="accordion-label">FAQ Title</label>
          <span class="accordion-id">{{accordion.id}}</span>
        </div>
        <input type="text" v-model="accordion.title"/>
        <div class="accordion-section" v-for="(section, index2) in accordion.sections" :key="index2">
          <div class="field">
            <label class="accordion-label">Section Title</label>
            <input type="text" v-model="section.title"/>
          </div>
          <div class="field">
            <label class="accordion-label">Content</label>
            <div class="wysiwyg">
              <ckeditor :editor="editor" v-model="section.content"></ckeditor>
            </div>
          </div>
          <button type="button" @click="removeSection(index, index2)">Remove Section</button>
        </div>
        <div class="section-button">
          <button type="button" @click="addSection(index)">Add Section</button>
          <button type="button" @click="removeAccordion(index)">Remove Accordion</button>
        </div>
      </div>
    </div>
    <button type="button" @click="newAccordion">Add Accordion</button>
  </div>
</template>

<script>

import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

export default {
  name: "accordion-edit",
  data() {
    return {
      editor: ClassicEditor,
      show: false,
      accordions: [],
      customToolbar: [
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"]
      ],
      accordionDataElement: null
    };
  },
  created: async function () {
    // get a reference to the accordion data text field
    const accordionDataContainer = document.getElementById("txtAccordionData");
    this.accordionDataElement = accordionDataContainer.querySelector("textarea");

    if (this.accordionDataElement.value.length > 0) {
      this.accordions = JSON.parse(this.accordionDataElement.value);
    }
    
    // get a reference to the checkbox
    const accordionCheckboxContainer = document.getElementById("chkAccordions");
    const checkbox = accordionCheckboxContainer.querySelector("input");
    this.show = checkbox.checked;

    checkbox.addEventListener("change", (event) => {
      if (event.currentTarget.checked) {
        this.show = true;
      } else {
        this.show = false;
      }
    });
  },
  methods: {
    newAccordion: function() {
      this.accordions.push({
        id: `faq-${this.accordions.length + 1}`,
        title: '',
        sections: [{ title: '', content: '' }]
      });
    },
    addSection: function(accordionIndex) {
      const accordion = this.accordions[accordionIndex];
      accordion.sections.push({ title: '', content: '' });
    },
    removeSection: function(accordionIndex, sectionIndex) {
      const accordion = this.accordions[accordionIndex];
      accordion.sections.splice(sectionIndex, 1);
    },
    removeAccordion: function(accordionIndex) {
      this.accordions.splice(accordionIndex, 1);
    },
  },
  watch: {
    accordions: {
      deep: true,
      handler() {
        const accordionData = JSON.stringify(this.accordions);
        this.accordionDataElement.value = accordionData;
      }
    }
  }
};
</script>