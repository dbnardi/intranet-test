<template>
  <div>
    <modal v-if="this.openOutage" class="view-details-modal" @close="closeModals">
      <template slot="header">
        <h3><md-icon class="md-size-2x">event</md-icon>{{ this.openOutage.Title }}</h3>
        <div class="close-modal-icon" @click="closeModals">
          <md-icon>close</md-icon>
        </div>
      </template>
      <template slot="body">
        <div class="modal-content">
          <div class="value"><p>{{ this.openOutage.DFATDescription }}</p></div>
          <div class="value"> Outage Start </div>
          <p class="value">{{ this.openOutage.OutageDate | standardDateFormat }}</p>
          <div class="value"> Outage End </div>
          <p v-if="this.openOutage.OutageEndDate" class="value">{{ this.openOutage.OutageEndDate | standardDateFormat }}</p>
          <p v-else class="value">Under investigation...</p>
          <div style="margin-top: 20px">
            <a v-if="this.openOutage.OutageLinkUrl" :href="this.openOutage.OutageLinkUrl" target="_blank">
              Go to Link
            </a>
          </div>
        </div>
      </template>
    </modal>
    <div class="modal-background" v-if="this.openOutage" @click="closeModals"/>
    <div class="md-card md-card-pricing md-layout-item home-rollup-card mt-15 outages">
      <h3 class="card-category">Outages</h3>
      <div class="md-card-content">
        <ul>
          <div
            v-for="(item, index) in pulledOutages" 
            :key="index"
            class="pointer"
            @click="clickedOutage(item)"
          >
            <li :class="{'alert-message': alert, 'foreign-message': foreign, 'outage': true}" >
              <time class="time-icon">
                <span>{{item.OutageDate | dayOfMonth}}</span>
                <p>{{item.OutageDate | month}}</p>
              </time>
              <div>
                  <p>{{item.Title | charLimit60}}</p>
              </div>
            </li>
          </div>
        </ul>
      </div>
      <div class="md-card-actions md-alignment-right">
        <div class="ml-auto">
          <a href="javascript:void(0)" @click="viewMore" class="md-button md-simple view-more" target="_blank">
                View more
                <i class="md-icon md-icon-font md-theme-default">arrow_forward</i>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import sharepoint from "@/api/api";
import AnnouncementItem from '@/components/Common/AnnouncementItem'
import Modal from "../Modal.vue";

export default {
  components: { AnnouncementItem, Modal },
  props: {
    config: Object
  },
  created: function () {
    let date = new Date();
    sharepoint.getAllListItemsPnP({
        listName: "Outages",
        rowLimit: 3,
        orderBy: "OutageDate",
        ascending: false,
        select: ["Title", "OutageDate", "OutageEndDate", "DFATDescription", "OutageLinkUrl"],
        filter: `OutageEndDate ge datetime'${date.toISOString()}' or OutageEndDate eq null`
      })
      .then((res) => {
        this.pulledOutages = res;
      });
      if (this.config && this.config.systemHealthLink)
        this.systemHealthLink = this.config.systemHealthLink;
  },
  data() {
    return {
      pulledOutages: [],
      openOutage: null
    };
  },
  methods: {
    clickedOutage(item) {
      this.openOutage = item;
    },
    closeModals() {
      this.openOutage = null;
    },
    viewMore(){
      var modalObj = {
        title: this.computedTitle,
        url:`${_spPageContextInfo.siteAbsoluteUrl}/Lists/Outages/AllItems.aspx`,
        showClose: true,
        width: 700,
        height: 500
      }
      SP.UI.ModalDialog.showModalDialog(modalObj);
    }
  },
};
</script>
<style lang="scss" scoped>
  @import "@/assets/scss/material-kit/colors";
  .time-icon {
    margin-right: 10px;
  }
  .outage-title {
    font-size: 0.9rem;
  }
  .md-card {
    line-height: 1.5em;
  }
  pre{
font-family: SofiaProLight!important;
font-weight: 300;
font-size: 1rem;
  }
</style>

