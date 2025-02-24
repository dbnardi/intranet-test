<template>
  <div>
    <md-button id="toolbox-button" class="md-just-icon btn-home-edit md-success"
      :class="{ 'btn-home-edit--open': open }" @click="toggleOpen">
      <div class="drawText">
        
        Open
        
          <md-icon>double_arrow</md-icon>
          
        
        </div>
    </md-button>
    <Drawer @close="toggleOpen" align="right" :closeable="true" :maskClosable="true">
      <div v-if="open">
        <modal v-if="this.editQuickLink != null" class="edit-modal" @close="closeModals">
          <template slot="header">
            <h3>Edit Quicklink</h3>
            <div class="close-modal-icon" v-on:click="closeModals">
              <md-icon>close</md-icon>
            </div>
          </template>
          <template slot="body">
            <h3>Link Name</h3>
            <input v-model="newQuickLink.title" />
            <h3 style="margin-top: 10px">Link URL</h3>
            <input v-model="newQuickLink.url" />
            <br />
            <el-button type="primary" style="margin: 10px" v-on:click="submitEditQuickLink">Submit</el-button>
            <el-button type="secondary" style="margin: 10px" v-on:click="closeModals">Cancel</el-button>
          </template>
        </modal>
        <modal v-if="modals.addQuickLinks" class="edit-modal" @close="closeModals">
          <template slot="header">
            <h3>Add new Quicklink</h3>
            <div class="close-modal-icon" v-on:click="closeModals">
              <md-icon>close</md-icon>
            </div>
          </template>
          <template slot="body">
            <h4>Link Name</h4>
            <el-input v-model="newQuickLink.title"></el-input>
            <h4 style="margin-top: 10px">Link URL</h4>
            <el-input v-model="newQuickLink.url"></el-input>
            <br />
            <el-button type="primary" style="margin: 10px" v-on:click="addQuickLink">Add</el-button>
            <el-button type="secondary" style="margin: 10px" v-on:click="closeModals">Cancel</el-button>
          </template>
        </modal>
        <modal v-if="modals.addAZ" class="edit-modal" @close="closeModals">
          <template slot="header">
            <h3>Add new A-Z Link</h3>
            <div class="close-modal-icon" @click="closeModals">
              <md-icon>close</md-icon>
            </div>
          </template>
          <template slot="body">
            <el-autocomplete v-if="availableAZLinks.length > 0" class="md-app-container" v-model="azState"
              :fetch-suggestions="querySearch" placeholder="Please Input" @select="addAZLink">
              <template slot-scope="{ item }">
                <div class="value">{{ item.title }}</div>
              </template>
            </el-autocomplete>
            <p v-else>
              No more available A-Z Links to add...
            </p>
          </template>
        </modal>
        <div class="modal-background" v-if="
          this.editQuickLink != null || modals.addAZ || modals.addQuickLinks
        " @click="closeModals" />
        <el-menu class="el-menu-vertical-demo">
          <div class="flex">
            <h2 class="menu-title" id ="AZ"><a :href="config.AZLink"  target="_blank">A-Z</a></h2> 
            <div class="add-link-btn" v-on:click="modals.addAZ = !modals.addAZ">
              <md-icon class="more-icon">add</md-icon>
            </div>
          </div>
          <a v-for="(item, index) in personalisation.azLinks" :key="index" :href="item.url || item.AZUrl"  target="_blank">
            <el-menu-item :index="index">
              <md-icon class="item-icon">{{
                  item.icon || "dashboard"
              }}</md-icon>
              <span>{{ item.title || item.Title }}</span>
              <div class="clickable-icon delete-icon" v-on:click.prevent="removeAzLink(index)">
                <md-icon class="delete-icon">close</md-icon>
              </div>
            </el-menu-item>
          </a>
        </el-menu>
        <div class="flex">
          <h2 class="menu-title">Quicklinks</h2>
          <div id="addQuickLink" class="add-link-btn" v-on:click="modals.addQuickLinks = !modals.addQuickLinks">
            <md-icon class="more-icon">add</md-icon>
          </div>
        </div>
        <div class="el-menu-vertical-demo projects-menu">
          <div class="el-menu-item" v-for="(item, index) in personalisation.quickLinks" :index="index" :key="index">
            <a :href="item.url"  target="_blank"> {{ item.title }}</a>
            <div class="clickable-icon delete-icon edit-icon" v-on:click.prevent="openEditQuickLink(index)">
              <md-icon>edit</md-icon>
            </div>
            <div class="clickable-icon delete-icon" v-on:click.prevent="removeQuickLink(index)">
              <md-icon>close</md-icon>
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  </div>
</template>

<script>
import Drawer from "vue-simple-drawer";
import sharepoint from "../../api/api";
import Modal from "../Modal.vue";
export default {
  name: "Toolbox",
  props: ['personalisation'],
  components: {
    Modal,
    Drawer,
  },
  data() {
    return {
      open: false,
      modals: {
        addAZ: false,
        addQuickLinks: false,
      },
      azState: '',
      newQuickLink: {
        title: "",
        url: "",
      },
      newAZ: {
        title: "",
        url: "",
      },
      editQuickLink: null,
      allAvailableAZLinks: [..._azLinks],
      configWebUrl: _spPageContextInfo.siteAbsoluteUrl + "/configuration",
      config: _configuration
    };
  },
  created: async function () {
    if (Object.keys(this.personalisation).length === 0) {
      const blankData = {
        quickLinks: [],
        azLinks: [],
        dismissedAlerts: [],
        visitors: [],
      };
      // this.personalisation = blankData;
      const blankTemplate = {
        Title: _spPageContextInfo.userLoginName,
        Personalisation: JSON.stringify(blankData),
      };
      await sharepoint.createListItemPnP(
        "Personalisation",
        blankTemplate,
        null,
        this.configWebUrl
      );
      this.$emit("updatePersonalisation", blankData)
    }
  },
  computed: {
    //Only return azLinks that are not already in users personalistion object
    availableAZLinks: function () {
      return this.allAvailableAZLinks.filter(
        (link) =>
          !this.personalisation.azLinks.some(
            (savedLink) => savedLink.ID == link.id
          )
      );
    },
  },
  methods: {
    closeModals() {
      this.modals = { addAZ: false, addQuickLinks: false };
      this.editQuickLink = null;
    },
    removeQuickLink(index) {
      this.personalisation.quickLinks.splice(index, 1);
      this.updatePersonalisationSP();
    },
    removeAzLink(index) {
      this.personalisation.azLinks.splice(index, 1);
      this.updatePersonalisationSP();
    },
    querySearch(queryString, cb) {
      var results = (queryString) ? this.availableAZLinks.filter(e => e.title.toLowerCase().indexOf(queryString.toLowerCase()) > -1) : this.availableAZLinks;
      cb(results);
    },
    addAZLink(link) {
      if (link) {
        this.personalisation.azLinks.push({ ...link });
        this.updatePersonalisationSP();
      } else {
        this.personalisation.azLinks.push({ ...this.newAZ });
        this.updatePersonalisationSP();
        this.newAZ = { title: "", url: "" };
      }
    },
    addQuickLink() {
      this.personalisation.quickLinks.push({ ...this.newQuickLink });
      this.updatePersonalisationSP();
      this.newAZ = { title: "", url: "" };
      this.modals.addQuickLinks = false;
    },
    async updatePersonalisationSP() {
      await sharepoint.updateListItemPnPByFilter(
        "Personalisation",
        {
          Title: _spPageContextInfo.userLoginName,
          Personalisation: JSON.stringify(this.personalisation),
        },
        "Title eq '" + _spPageContextInfo.userLoginName + "'",
        this.configWebUrl
      );
      this.$emit("updatePersonalisation", this.personalisation);
    },
    openEditQuickLink(index) {
      this.editQuickLink = index;
      this.newQuickLink = this.personalisation.quickLinks[index];
    },
    submitEditQuickLink() {
      this.personalisation.quickLinks[this.editQuickLink] = this.newQuickLink;
      this.updatePersonalisationSP();
      this.newQuickLink = { title: "", url: "" };
      this.editQuickLink = null;
    },
    toggleOpen() {
      this.open = !this.open;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/material-kit/colors";
@import "@/assets/scss/material-kit/variables";
@import "@/assets/scss/material-kit/typography";

.add-link-btn {
  position: relative;
  top: -20px;
}

input {
  width: 100%;
}

.modal-header {
  padding: 0 !important;
}

.el-menu-item {
  color: $theme-light-blue;
  height: 30px;
  line-height: 30px;

  a {
    margin-left: 10px;
  }

  &.is-active {
    background-color: $theme-light-blue;
    color: white;

    .item-icon.md-theme-default {
      color: white;
    }

    .delete-icon {
      color: white;
    }
  }

  &.dash-item {
    .item-icon {
      margin-left: -50px;
    }

    span {
      margin-left: 60px;
    }
  }

  .item-icon.md-theme-default,
  .delete-icon.md-theme-default {
    color: $theme-light-blue;
  }

  .clickable-icon.delete-icon i {
    margin-left: 0;
    right: 0;
    opacity: 0.4;
    color: $theme-light-blue;
  }

  .delete-icon.edit-icon {
    margin-right: 45px;
  }
}

.md-icon.more-icon.md-theme-default {
  cursor: pointer;
  display: block;
  margin-left: auto;
  margin-right: 15px;
  color: $theme-light-blue;
}

#AZ a{
  color: $theme-light-blue;
}

.menu-title{
  color: $theme-light-blue;
  margin-left: 20px;
  margin-top: 15px;
}

.projects-menu .el-menu-item {
  margin-left: -10px;
}

.flex {
  display: flex;
  align-items: flex-end;
}

.edit-modal {
  position: fixed;
  left: calc(50vw - 400px);
  width: 400px;
  top: 250px;
  z-index: 5;
}

.clickable-icon {
  margin-right: 15px;
  position: absolute;
  top: 0;
  right: 0;
  margin-top: 0;
}

.availableAZ {
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.26);
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 200px;
  padding: 5px 10px 5px 10px;
  border-radius: 5px;
  border: 1px solid $theme-light-blue;
  cursor: pointer;
  margin: 10px auto 10px auto;

  p {
    margin-bottom: 0;
  }

  .md-icon.more-icon.md-theme-default {
    margin: 0;
  }
}

.availableAZ:hover {
  background-color: $theme-light-grey;
}

.drawText {
  writing-mode: vertical-lr;
}

</style>
