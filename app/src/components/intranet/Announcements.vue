<template>
  <div class="announcements">
    <modal v-if="this.openModal" class="view-details-modal" @close="closeModals">
      <template slot="header">
        <h3>{{ this.openModal.Title }}</h3>
        <div class="close-modal-icon" @click="closeModals">
          <md-icon>close</md-icon>
        </div>
      </template>
      <template slot="body">
        <div class="modal-content">
          <p v-html="this.openModal.ArticleBody" />
        </div>
      </template>
    </modal>
    <div class="modal-background" v-if="this.openModal" @click="closeModals" />
    <div class="md-card md-card-pricing home-rollup-card fixed-height md-layout-item">
      <h3 class="card-category">Announcements</h3>
      <div class="md-card-content">
        <ul>
          <div
            v-for="(item, index) in items"
            :key="index"
            class="announcement">
            <div style="width: 100%" @click="clickAnnouncement(item)">
              <announcement-item
                :title="item.Title"
                :content="item.DFATDescription"
                :foreign="item.ForeignNational"
                :date="new Date(item.AnnouncementDate)"
                :url="item.url">
              </announcement-item>
            </div>
            <div v-if="showDismiss">
              <el-popconfirm 
                title="Are you sure to dismiss this item?"
                confirm-button-text="Yes"
                cancel-button-text="No"
                @onConfirm="dismiss(item)">
                <template #reference>
                  <div class="dismiss ml-auto">
                    <md-icon>close</md-icon>
                  </div>
                </template>
              </el-popconfirm>
            </div>
          </div>
        </ul>
      </div>
      <div class="md-card-actions md-alignment-right">
        <div class="ml-auto">
          <a href="/news?type=DFATAnnouncement" class="md-button md-simple view-more" target="_blank">
              View more
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
import sharepoint from "../../api/sharepoint";

export default {
  components: {
    AnnouncementItem,
    Modal
  },
  data() {
    return {
      items: [],
      openModal: null,
      showDismiss: false,
      detailsForm: {
        Title: "",
        PublishingPageContent: "",
      },
      detailsFormRules: {
        Title: { required: true, message: "Title is required" },
        PublishingPageContent: {
          required: true,
          message: "Content is required",
        },
      },
    };
  },
  async created() {
    var groups = await sharepoint.getCurrentUserGroups();
    this.showDismiss = groups.filter((group) => _configuration.AnnouncementsAdminGroups.indexOf(group.Title) > -1).length > 0;
    this.getData();
  },
  methods: {
    clickAnnouncement(item) {
      this.openModal = item;
    },
    closeModals() {
      this.openModal = null;
    },
    async dismiss(announcement) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      announcement.ExpiryDate = yesterday;
      await sharepoint.updateListItemPnP(
        "Announcements",
        announcement,
        announcement.Id,
        ["ExpiryDate"],
        `${_spPageContextInfo.siteAbsoluteUrl}/News`
      );

      this.getData();
    },
    async getData() {
      this.items = [];
      var date = new Date();
      var today = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}T00:00:00.000Z`

      const adminItems = await sharepoint.getAllListItemsPnP({
          listName: "Announcements",
          filter: `PublishingDate le datetime'${today}' and (ExpiryDate eq null or ExpiryDate ge datetime'${today}')`,
          rowLimit: 10,
          orderBy: "AnnouncementDate",
          ascending: false,
        },
        "News"
      );
      for (const item of adminItems) {
        this.items.push(item);
      }
    }
  },
};
</script>
