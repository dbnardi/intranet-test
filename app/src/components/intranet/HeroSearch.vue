<template>
  <div class="hero-search p-relative">
    <div class="form-item form-type-textfield form-item-keys-1 pull-right">
      <input
        type="search"
        class="form-control search-box"
        placeholder="Search the Intranet"
        v-model="query"
        @input="inputChange"
        @keydown="$event.keyCode === 13 ? advanceSearch($event) : false"/>
      <div class="search-icon">
        <i class="fal fa-search" @click="advanceSearch($event)"></i>
      </div>
    </div>

    <modal v-if="showResults" @close="hideResults">
      <template slot="body">
        <div
          v-if="showResults"
          class="modal"
          aria-labelledby="Messages"
          aria-hidden="true">
          <div class="hero-search-wrapper">
            <div>
              <input
                type="search"
                v-model="query"
                class="search-box-duplicate"
                @input="inputChange"
                @keydown="$event.keyCode === 13 ? advanceSearch($event) : false"
              />
            </div>
            <div class="md-layout">
              <div class="md-layout-item main-results md-size-60">
                <div class="search-header">
                  <i class="md-icon md-icon-font md-theme-default">search</i>
                  <h2>Search Results</h2>
                </div>
                <div class="search-results">
                  <div class="results-item"  v-for="(item, index) in general" :key="index">
                    <h3><a :href="item.Path" target="_blank">{{ item.Title }} </a></h3>
                    <div class="results-highlight" v-html="formatHighlight(item.HitHighlightedSummary)"></div>
                    <small class="results-path" :title="item.Path">{{ item.Path.substring(0,80) + "..." }}</small>
                  </div>
                  <div v-if="general.length > 0" class="view-all">
                    <a :href="resultsPage + query + '*'" target="_blank">
                      <span>View all results</span>
                      <i class="md-icon md-icon-font md-theme-default">arrow_right_alt</i>
                    </a>
                  </div>
                </div>
                <i v-if="searching" class="md-icon md-icon-font md-theme-default">pending</i>
                <div v-if="!searching && general.length === 0">No results found</div>
              </div>
              <div class="md-layout-item">
                <div class="policy-header">
                  <i class="md-icon md-icon-font md-theme-default">notes</i>
                  <h2>Policies</h2> 
                </div>
                <div class="search-results">
                  <div class="results-item" v-for="(item, index) in policies" :key="index" >
                    <div class="flex-container">
                      <div class="results-item-icon">
                      <i class="md-icon md-icon-font md-theme-default">article</i>
                      </div>
                      <div class="results-item-details">
                        <h3><a :href="item.Path" class="results-item-title" target="_blank">{{ item.Title }}</a></h3>
                        <div class="flex-container">
                          <small class="doc-metadata">{{item.PolicyType}}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-if="policies.length > 0" class="view-all">
                    <a :href="policyPage + query" target="_blank">
                    <span>View all results</span>
                    <i class="md-icon md-icon-font md-theme-default">arrow_right_alt</i>
                    </a>
                  </div>
                  <i v-if="searching" class="md-icon md-icon-font md-theme-default">pending</i>
                  <div v-if="policies.length === 0">No results found</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </modal>
  </div>
</template>

<script>
  import { sp } from "@pnp/sp";
  import Modal from "../Modal.vue";
  import "@pnp/sp/search";

  /* eslint-disable */
  export default {
    name: 'hero-search',
    components: { Modal },
    data () {
      return {
        searching: false,
        showResults: false,
        query: '',
        policyQuery: 'contentTypeId:0x0101009EA8E5BBE3114E268DACFBD23CA1417A00FDDF5C2ED830402E88EB83C096E8A53F* ',
        resultsPage: _spPageContextInfo.siteAbsoluteUrl + "/pages/search.aspx?k=",
        policyPage: _spPageContextInfo.siteAbsoluteUrl + "/Policies/Pages/default.aspx?k=",
        general: [],
        policies: [],
        loadingDocs: true,
        loadingAll: true,
        documents: []
      }
    },
    methods: {
      stopProp: function(event){
        event.stopPropagation()
      },
      inputChange: _.debounce(async function () {
        if (this.query !== '') {
          this.showResults = true;
          this.searching = true;
          await this.searchGeneral(this.query);
          await this.searchPolicies(this.query);
          this.searching = false;
          document.getElementsByClassName('search-box-duplicate').item(0).focus();
        }
      }, 1000),
      searchGeneral: async function (query) {
        this.general = [];
        var results = await sp.search({
            Querytext: '*' + query + '*',
            RowLimit: 5,
            EnableInterleaving: true,
        });
        this.general = results.PrimarySearchResults;
      },
      searchPolicies: async function (query) {
        this.policies = [];
        var results = await sp.search({
            Querytext: this.policyQuery + query + '*',
            RowLimit: 5,
            SelectProperties: ['PolicyType', 'Title', 'Path'],
            EnableInterleaving: true,
        });
        this.policies = results.PrimarySearchResults;
      },
      formatHighlight: function (value) {
        return value.replace(/c0/g, 'mark').replace(/<ddd\/>/g, '...')
      },
      advanceSearch: function (event) {
        event.preventDefault()
        window.location = this.resultsPage + encodeURIComponent(this.query)
      },
      hideResults: function() {
        this.showResults = false;
        this.query = "";
      }
    }
  }
</script>