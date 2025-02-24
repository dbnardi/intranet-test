<template>
  <div>
    <div class="md-card md-card-pricing home-rollup-card fixed-height md-layout-item">
      <h3 class="card-category">{{computedTitle}}</h3>
      <div class="md-card-content">
        <ul>
          <div
            v-for="(item, index) in items"
            :key="index"
            v-on:click="clickedClosure(item)"
          >
            <announcement-item
              :title="item.Title"
              :content="item.DFATDescription"
              :date="new Date(item.ClosureStartDate)"
              :url="item.EncodedAbsUrl"
            />
          </div>
        </ul>
      </div>
      <div class="md-card-actions md-alignment-right">
        <div class="ml-auto">
          <a href="javascript:void(0)" @click="viewMore" class="md-button md-simple view-more"> 
                View more
                <i class="md-icon md-icon-font md-theme-default">arrow_forward</i>
          </a>
        </div>
      </div>
    </div>
    <modal v-if="this.openClosure" class="view-details-modal" @close="closeModals">
      <template slot="header">
        <h2>
          <md-icon class="md-size-2x">event</md-icon>
          {{ this.openClosure.Title }}
        </h2>
        <div class="close-modal-icon" v-on:click="closeModals">
          <md-icon>close</md-icon>
        </div>
      </template>
      <template slot="body">
        <div class="modal-content">
          <div class="label" style="margin-top: 0">Description</div>
          <div class="value">{{ this.openClosure.DFATDescription }}</div>
          <div class="label">Location</div>
          <div class="value">
            {{ this.openClosure.EmbassyLocation }}
          </div>
          <div class="label">Start Date</div>
          <div class="value">
            {{ this.openClosure.ClosureStartDate | standardDateNoTime }}
          </div>
          <div class="label">End Date</div>
          <div class="value">
            {{ this.openClosure.ClosureEndDate | standardDateNoTime }}
          </div>
        </div>
      </template>
    </modal>
    <div class="modal-background" v-if="this.openClosure" @click="closeModals" />
  </div>
</template>

<script>
import sharepoint from "@/api/api";
import AnnouncementItem from "@/components/Common/AnnouncementItem";
import Modal from "../Modal.vue";
export default {
  props: {
    config: Object
  },
  components: { AnnouncementItem, Modal },
  data() {
    return {
      items: [],
      openClosure: null
    };
  },
  computed: {
    computedTitle: function () {
      return this.config ? this.config.ClosuresTitle : "Embassy Closures";
    }
  },
  methods: {
    viewMore(){
      var modalObj = {
        title: this.computedTitle,
        url:`${_spPageContextInfo.siteAbsoluteUrl}/Lists/Closures/AllItems.aspx`,
        showClose: true,
        width: 700,
        height: 500
      }
      SP.UI.ModalDialog.showModalDialog(modalObj);
    },
    clickedClosure(item) {
      this.openClosure = item;
    },
    closeModals() {
      this.openClosure = null;
    },
  },
  created: async function() {
    const getClosuresQuery =
      "<Where><Geq>\
        <FieldRef Name='ClosureEndDate' />\
        <Value Type='DateTime'>\
          <Today />\
        </Value>\
      </Geq></Where><OrderBy>\
      <FieldRef Name='ClosureStartDate' Ascending='True' />\
      </OrderBy>";
    this.items = await sharepoint.getListItemsByCaml(
      "Closures",
      getClosuresQuery,
      null,
      2
    );
  },
};
</script>
