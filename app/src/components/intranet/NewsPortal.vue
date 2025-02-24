<template>
  <div class="loader-container" v-if="!ready">
    <div class="spinner-container">
      <div class="spinner-dot"></div>
      <div class="spinner-dot"></div>
      <div class="spinner-dot"></div>
      <div class="spinner-dot"></div>
      <div class="spinner-dot"></div>
      <div class="spinner-dot"></div>
    </div>
  </div>

  <div v-else class="md-layout mt-40">
    <div class="md-layout-item md-size-20">
      <div class="md-card page-section-card">
        <h3 class="card-category">Filters</h3>
        <div class="md-card-content">
          <div class="title">
            <h3>Search</h3>
          </div>
          <md-field>
            <label>Search text</label>
            <md-input v-model="searchText" v-on:keyup.enter="search"></md-input>
            <i class="md-icon md-icon-font md-theme-default">search</i>
          </md-field>

          <div class="title">
            <h3>News type</h3>
          </div>
          <md-checkbox v-model="newsType" value="General">General</md-checkbox>
          <br />
          <md-checkbox v-model="newsType" value="DFATAnnouncement">Announcements</md-checkbox>
          <br />
          <md-checkbox v-model="newsType" value="Admin">Admin Notices</md-checkbox>
          <br />
          <md-checkbox v-model="newsType" value="Exec">Exec Messages</md-checkbox>
          <br />
          <md-checkbox v-model="newsType" value="Social">Social</md-checkbox>
          <div class="title">
            <h3>Date range</h3>
          </div>
          <div>
            <md-datepicker v-model="startDate">
              <label>between</label>
            </md-datepicker>
            <md-datepicker v-model="endDate">
              <label>and</label>
            </md-datepicker>
          </div>
          <md-button class="md-primary" @click="clear">Reset</md-button>
          <md-button class="md-primary" @click="search">Search</md-button>
        </div>
      </div>
    </div>
    <div class="md-layout-item">
      <modal v-if="this.openModal" class="view-details-modal" @close="closeModals">
        <template slot="header">
          <h3>{{ this.openModal.Title }}</h3>
          <div class="close-modal-icon" v-on:click="closeModals">
            <md-icon>close</md-icon>
          </div>
        </template>
        <template slot="body">
          <div class="modal-content">
            <p v-html="this.openModal.ArticleBody || this.openModal.DFATDescription" />
          </div>
        </template>
      </modal>
      <div class="modal-background" v-if="this.openModal" @click="closeModals" />
      <div class="md-card page-section-card">
        <h3 class="card-category">News</h3>
        <div class="md-card-content">
          <div class="md-layout news-portal-container pb-20">
            <h4 v-if="newsItems.length == 0">No news items found.</h4>
            <div
              class="md-layout-item md-size-33"
              v-for="(item, index) in newsItems"
              :key="index"
            >
              <div class="md-card md-card-blog md-theme-default">
                <div class="md-card-header md-card-header-image">
                  <a :href="item ? item.Path : '#'"  target="_blank">
                    <img v-if="item.PublishingImage" :src="extractImage(item.PublishingImage, 2)"
                    />
                    <img
                      v-if="!item.PublishingImage && item.ContentType !== 'DFATAnnouncement' && item.ContentType != 'Admin News'"
                      src="/publishingimages/placeholder.jpg?RenditionID=2"
                    />
                  </a>
                </div>
                <div class="md-card-content">
                  <h5 class="card-category text-success uppercase m-0">
                    {{ item.NewsType | type }}
                  </h5>
                  <h3 class="card-title mt-0 mb-10">
                    <a v-if="item.ContentType === 'DFATAnnouncement' || item.ContentType === 'Admin News'" href="javascript:void(0)" @click="clickAnnouncement(item)">{{ item.Title }}</a>
                    <a v-else :href="item.Path || '#'"  target="_blank">
                      {{ item.Title }}
                    </a>
                  </h3>
                  <p class="card-description">{{ item.DFATDescription }}</p>
                </div>
                <div class="md-card-actions md-alignment-right">
                  <strong class="author text-danger">{{
                    item.Classification
                  }}</strong>
                  <div class="stats ml-auto">
                    <i class="md-icon md-icon-font md-theme-default"
                      >schedule</i
                    >
                    Published {{ item.Created | timeago }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import sharepoint from "@/api/sharepoint";
import { SortDirection } from "@pnp/sp/presets/all";
import Modal from "../Modal.vue";
export default {
  components: {
    Modal
  },
  data() {
    return {
      ready: false,
      searchText: "",
      newsType: [],
      newsItems: [],
      startDate: null,
      endDate: null,
      openModal: null
    };
  },
  created() {
    //check for type querystring (i.e. navigation from home page)
    var urlParams = new URLSearchParams(window.location.search);
    var typeUrlParam = urlParams.get("type");
    if (typeUrlParam) this.newsType.push(typeUrlParam);
    this.search();
  },
  filters:{
    type(input){
      return (input == "DFATAnnouncement") ? "Announcement" : input;
    }
  },
  methods: {
    clear() {
      this.searchText = "";
      this.newsType = [];
      this.startDate = null;
      this.endDate = null; 
      this.search();
    },
    clickAnnouncement(item) {
      console.log(item);
      this.openModal = item;
    },
    closeModals() {
      this.openModal = null;
    },
    async search() {
      let ctQuery = [];

      //if empty, search all
      if (this.newsType.length == 0) {
        ctQuery.push(`ContentTypeId:${_configuration.NewsContentType}*`);
        ctQuery.push(`ContentTypeId:${_configuration.AnnouncementContentType}*`);
        ctQuery.push(`ContentTypeId:${_configuration.AdminNewsContentType}*`);
      }
      
      else this.newsType.forEach(type => {

        switch (type) {
          case 'Social':
          case 'Exec':
          case 'General':
            ctQuery.push(`NewsType:'${type}'`);
            break;
          case 'DFATAnnouncement':
            ctQuery.push(`ContentTypeId:${_configuration.AnnouncementContentType}*`);
            break;
          case 'Admin':
            ctQuery.push(`ContentTypeId:${_configuration.AdminNewsContentType}*`);
            break;
        }
      });

      console.log(ctQuery);

      var queryText = ctQuery.join(" OR ");

      //Next, process the keyword query
      queryText += this.searchText ? " *" + this.searchText + "*" : "";

      //finally, process the date range
      var dateQuery = [];
      if (this.startDate != null)
        dateQuery.push(`Created>=${this.startDate.toISOString()}`);
      if (this.endDate != null)
        dateQuery.push(`Created<=${this.endDate.toISOString()}`);
      queryText += ` ${dateQuery.join(" AND ")}`;

      const searchParams = {
        Querytext: queryText,
        RowLimit: 1000,
        TrimDuplicates: false,
        SortList: [
          {
            Property: "Created",
            Direction: SortDirection.Descending,
          },
        ],
        SelectProperties: [
          "ContentType",
          "Title",
          "DFATDescription",
          "ArticleBody",
          "NewsType",
          "Path",
          "LastModifiedTime",
          "Created",
          "Classification",
          "FileType",
          "FileRef",
          "FileLeafRef",
          "PublishingImage"
        ],
      };
      const response = await sharepoint.searchAPIQuery(searchParams);
      this.ready = true;
      this.newsItems = response.PrimarySearchResults;
    },
  },
};
</script>
