<template>
  <div class="upcoming-events-container">
    <modal v-if="this.openEvent" class="view-details-modal" @close="closeModals">
      <template slot="header">
        <h2>
          <md-icon class="md-size-2x">event</md-icon>{{ this.openEvent.Title }}
        </h2>
        <div class="close-modal-icon" v-on:click="closeModals">
          <md-icon>close</md-icon>
        </div>
      </template>
      <template slot="body">
        <div class="modal-content">
          <div class="label" style="margin-top: 0">Description</div>
          <p v-html="this.openEvent.Description" />
          <div class="label" v-if="this.openEvent.Location">Location</div>
          <div class="value">{{ this.openEvent.Location }}</div>
          <div class="label">Start Date</div>
          <div class="value">
            {{ this.openEvent.EventDate | standardDateFormat }}
          </div>
          <div class="label">End Date</div>
          <div class="value" v-if="this.openEvent.EndDate">
            {{ this.openEvent.EndDate | standardDateFormat }}
          </div>
          <el-button @click="downloadEvent" type="primary" style="margin-top: 20px"
            >Add to Calendar</el-button
          >
        </div>
      </template>
    </modal>
    <div class="modal-background" v-if="this.openEvent" @click="closeModals" />
    <div
      class="md-card md-card-pricing home-rollup-card md-layout-item fixed-height"
    >
      <h3 class="card-category">{{computedTitle}}</h3>

      <div class="md-card-content">
        <ul>
          <div
            v-for="(item, index) in items"
            :key="index"
            v-on:click="clickedEvent(item)"
          >
            <announcement-item
              :title="item.Title"
              :content="item.FieldValuesAsText.Description"
              :date="new Date(item.EventDate)"
              :url="item.EncodedAbsUrl"
            />
          </div>
        </ul>
      </div>
      <div class="md-card-actions md-alignment-right">
        <div class="ml-auto">
          <a href="/events" class="md-button md-simple view-more"  target="_blank">
            View calendar
            <i class="md-icon md-icon-font md-theme-default">arrow_forward</i>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AnnouncementItem from "@/components/Common/AnnouncementItem";
import Modal from "../Modal.vue";
export default {
  components: {
    AnnouncementItem,
    Modal,
  },
  props: {
    items: Array,
    config: Object
  },
  data() {
    return {
      openEvent: null,
    };
  },
  computed: {
    computedTitle: function () {
      return this.config ? this.config.ClosuresTitle : "Upcoming Events";
    }
  },
  methods: {
    clickedEvent(item) {
      this.openEvent = item;
    },
    closeModals() {
      this.openEvent = null;
    },
    downloadEvent(item) {
      this.$ics.addEvent(
        "en-us",
        this.openEvent.Title,
        "",
        this.openEvent.Location || '',
        this.openEvent.EventDate,
        this.openEvent.EndDate,
      );
      this.$ics.download(this.openEvent.Title);
      this.$ics.removeAllEvents();
    },
  },
};
</script>

<style lang="scss" scoped>
.md-card-content ul li {
  cursor: pointer;
}
.md-card-content ul li:hover {
  background-color: #d9dff5;
}

.upcoming-events-container {
  display: flex;
  align-content: center;
  justify-content: center;
}
</style>
