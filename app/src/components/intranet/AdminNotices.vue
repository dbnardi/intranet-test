<template>
  <div>
    <modal v-if="this.openModal" class="view-details-modal" @close="closeModals">
      <template slot="header">
        <h3>{{ this.openModal.Title }}</h3>
        <div class="close-modal-icon" v-on:click="closeModals">
          <md-icon>close</md-icon>
        </div>
      </template>
      <template slot="body">
        <div class="modal-content">
          <p v-html="this.openModal.ArticleBody"/>
        </div>
      </template>
    </modal>
    <div class="modal-background" v-if="this.openModal" @click="closeModals"/>
    <div class="md-card md-card-pricing home-rollup-card md-layout-item fixed-height">
      <h3 class="card-category">Admin Notices</h3>
      <div class="md-card-content">
        <ul>
          <div 
            v-for="(item, index) in items.slice(0,5)"
            :key="index"
            @click="clickNotice(item)"
            >
            <announcement-item
              :title="item.Title"
              :content="item.DFATDescription"
              :date="new Date(item.Created)"
              :url="item.url"
            />
          </div>
        </ul>
      </div>
      <div class="md-card-actions md-alignment-right">
        <div class="ml-auto">
          <a href="/news?type=Admin" class="md-button md-simple view-more"  target="_blank">
                View more
                <i class="md-icon md-icon-font md-theme-default">arrow_forward</i>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AnnouncementItem from '@/components/Common/AnnouncementItem'
import Modal from "../Modal.vue";
import sharepoint from '../../api/sharepoint';
export default {
  components: {
    AnnouncementItem,
    Modal
  },
  async created(){
    const adminItems = await sharepoint.getAllListItemsPnP({
      listName: "Admin News",
      rowLimit: 5,
      orderBy: "Created",
      ascending: false,
    }, "News");
    for (const item of adminItems) {
      this.items.push(item);
    }
  },
  data() {
    return {
      items:[],
      openModal: null
    };
  },
  methods: {
    clickNotice(item) {
      this.openModal = item
    },
    closeModals() {
      this.openModal = null;
    },
  }
};
</script>


