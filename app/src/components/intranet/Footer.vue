<template>
  <footer class="footer bg-color-primary">

    <div class="container flex-direction-row">
      <a href="/" class="footer-brand" style="color:white !important;">Australian Government</a>
      
<div class="o365cs-nav-centerAlign">
        <div>{{ classification }}</div>
      </div>  
      <ul class="social-buttons">
        <li>
          <div @click="quickLinkModalOpen = !quickLinkModalOpen"
            class="md-button md-twitter md-just-icon md-simple md-theme-default" title="Add current page to quicklinks">
            <md-icon style="color:white !important;">link</md-icon>
          </div>
        </li>
        <li>
          <div @click="feedbackModalOpen = !feedbackModalOpen"
            class="md-button md-twitter md-just-icon md-simple md-theme-default" title="Submit feedback for this page">
            <md-icon style="color:white !important;">chat</md-icon>
          </div>
        </li>

      </ul>

    </div>
    <modal class="edit-modal" v-if="feedbackModalOpen" @close="closeModals">
      <template slot="header">
        <h3>Feedback</h3>
        <div class="close-modal-icon" v-on:click="closeModals">
          <md-icon>close</md-icon>
        </div>
      </template>
      <template slot="body">
        <h4>Title</h4>
        <el-input placeholder="Title" v-model="feedbackTitle"></el-input>
        <h4>Comments</h4>
        <el-input type="textarea" placeholder="Write your feedback here..." v-model="feedbackComments" class="mb-20">
        </el-input>
        <el-button @click="submitFeedback" type="primary">Submit</el-button>
      </template>
    </modal>
    <modal class="edit-modal" v-if="quickLinkModalOpen" @close="closeModals">
      <template slot="header">
        <h3>Add Page to QuickLinks</h3>
        <div class="close-modal-icon" v-on:click="closeModals">
          <md-icon>close</md-icon>
        </div>
      </template>
      <template slot="body">
        <el-input placeholder="Title" v-model="QuickLinkTitle" class="mb-20"></el-input>
        <el-button type="primary" @click="addQuickLink">Submit</el-button>
      </template>
    </modal>
    <div class="modal-background" v-if="feedbackModalOpen || quickLinkModalOpen" @click="closeModals" />
  </footer>
</template>

<script>
import Modal from "../Modal.vue";
import sharepoint from "../../api/api";
export default {
  name: "footer",
  components: { Modal },
  data() {
    return {
      personalisation: null,
      feedbackModalOpen: false,
      quickLinkModalOpen: false,
      QuickLinkTitle: "",
      feedbackTitle: "",
      feedbackComments: "",
      classification: window._classification.toUpperCase()
    };
  },
  created: function () {
    this.setPersonalisation();
  },
  methods: {
    closeModals() {
      this.feedbackModalOpen = false;
      this.quickLinkModalOpen = false;
    },
    addQuickLink() {
      this.personalisation.quickLinks.push({
        title: this.QuickLinkTitle,
        url: window.location.href,
      });
      this.updatePersonilisationSP();
      this.closeModals();
      alert("Quicklink Added");
    },
    updatePersonilisationSP() {
      sharepoint.updateListItemPnPByFilter(
        "Personalisation",
        {
          Title: _spPageContextInfo.userLoginName,
          Personalisation: JSON.stringify(this.personalisation),
        },
        "Title eq '" + _spPageContextInfo.userLoginName + "'",
        _spPageContextInfo.siteAbsoluteUrl + "/configuration"
      );
    },
    async submitFeedback() {
      await sharepoint.createListItemPnP("Feedback", {
        Title: this.feedbackTitle,
        DFATDescription: this.feedbackComments,
      }, null, _spPageContextInfo.siteAbsoluteUrl);
      this.feedbackTitle = "";
      this.feedbackComments = "";
      this.closeModals();
      alert("Feedback submitted");
    },
    setPersonalisation: function () {
      if (_personalisation) {
        this.personalisation = _personalisation;
      } else setTimeout(this.setPersonalisation, 500);
    },
  },
};
</script>

<style lang="scss" scoped>
.edit-modal {
  z-index: 5;
  position: fixed;
  top: calc(50% - 150px);
  left: calc(50% - 150px);
  width: 300px;
  height: 300px;
}
.footer {
  flex-direction: column;
}
</style>
