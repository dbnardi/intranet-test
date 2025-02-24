<template>
  <div class="md-layout mt-40">
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
    <div class="md-layout-item md-size-20">
      <div class="md-card page-section-card">
        <h3 class="card-category">Filters</h3>
        <div class="md-card-content">
          <md-field>
            <label>Search text</label>
            <md-input v-model="searchText" v-on:keyup.enter="search"></md-input>
            <i class="md-icon md-icon-font md-theme-default">search</i>
          </md-field>

          <div class="title">
            <h3>Type</h3>
          </div>
          <md-checkbox style="width:100%;" v-for="option in PolicyTypes" :key="option.value" v-model="policyTypes" :value="option.value">{{option.label}}</md-checkbox>
          <div class="title">
            <h3>Category</h3>
          </div>
          <el-select clearable v-model="categoryValue" placeholder="Select">
            <el-option
              v-for="item in PolicyCategories"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
          <div class="title">
            <h3>Branch</h3>
          </div>
          <el-select clearable v-model="branchValue" placeholder="Select">
            <el-option
              v-for="item in OwnerBranches"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
          <br />
          <div class="mt-20">
            <md-button class="md-primary" @click="clear">Reset</md-button>
            <md-button class="md-primary" @click="search">Search</md-button>
          </div>
        </div>
      </div>
    </div>
    <div class="md-layout-item">
      <div class="md-card page-section-card">
        <h3 class="card-category">Policies</h3>
        <div class="md-card-content">
          <div class="md-layout news-portal-container pb-20" style="flex-wrap: nowrap; cursor: pointer">
            <h4 v-if="searchData.length == 0">No policy items found.</h4>
            <el-table @row-click="clickRow" v-if="searchData.length != 0" :data="searchData" class="policies-table">
              <el-table-column sortable prop="Title" label="Title" />
              <el-table-column sortable prop="OwnerBranch" label="Branch" />
              <el-table-column sortable prop="PolicyCategory" label="Category" />
              <el-table-column sortable prop="PolicyType" label="Type" />
              <el-table-column sortable prop="FileType" label="File Type" :width="100"/>
              <el-table-column sortable :sort-method="dateSort" label="Modified" :width="110">
                <template slot-scope="scope">
                  {{ scope.row.LastModifiedTime |  standardDateNoTime}}
                </template>
              </el-table-column>
              <el-table-column sortable :sort-method="dateSort" label="Expiry Date" :width="110">
                <template slot-scope="scope">
                  <div :class="{ 'expired': scope.row.Expired }">
                    {{ scope.row.ContentExpirationDate |  standardDateNoTime}}
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import sharepoint from "@/api/sharepoint";

export default {
  data() {
    return {
      searchData: [],
      PolicyCategories: [],
      PolicyTypes: [],
      OwnerBranches: [],
      categoryValue: "",
      branchValue: "",
      policyTypes: [],
      ready: false,
      response: {},
      searchText: "",
      infiniteId: 1,
    };
  },
  async created() {
    this.PolicyCategories = this.createOptions(
      await sharepoint.getFieldValues("PolicyCategory", _spPageContextInfo.siteAbsoluteUrl)
    );
    this.OwnerBranches = this.createOptions(
      await sharepoint.getFieldValues("OwnerBranch", _spPageContextInfo.siteAbsoluteUrl)
    );
    this.PolicyTypes = this.createOptions(
      await sharepoint.getFieldValues("PolicyType", _spPageContextInfo.siteAbsoluteUrl)
    );

    //check for type querystring (i.e. navigation from home page)
    var urlParams = new URLSearchParams(window.location.search);
    var typeUrlParam = urlParams.get("type");
    if (typeUrlParam) this.policyTypes.push(typeUrlParam);
    await this.search();
  },
  methods: {
    clear() {
      this.searchText = "";
      this.branchValue = "";
      this.policyTypes = [];
      this.categoryValue = "";
      this.search();
    },
    clickRow(val) {
      window.open(val.Path + "?web=1", "_blank");
    },
    createOptions(array) {
      let returnArray = [];
      for (const item of array) {
        returnArray.push({ value: item, label: item });
      }
      return returnArray;
    },
    async search() {
      var types = _.map(this.policyTypes, e=> `PolicyType="${e}"`);
      var typeString = `(${types.join(" OR ")})`;
      const Querytext =
        "ContentTypeId:0x0101009EA8E5BBE3114E268DACFBD23CA1417A00FDDF5C2ED830402E88EB83C096E8A53F*" +
        (this.searchText ? " *" + this.searchText + "*" : "") +
        (this.policyTypes.length > 0 ? ` ${typeString}` : "") +
        (this.categoryValue
          ? ' PolicyCategory="' + this.categoryValue + '"'
          : "") +
        (this.branchValue ? ' OwnerBranch="' + this.branchValue + '"' : "");
      const searchParams = {
        Querytext,
        RowLimit: 1000,
        TrimDuplicates: false,
        SelectProperties: [
          "Title",
          "PolicyType",
          "PolicyCategory",
          "OwnerBranch",
          "Path",
          "LastModifiedTime",
          "ContentExpirationDate",
          "FileType",
          "FileRef",
          "FileLeafRef",
        ],
      };
      const response = await sharepoint.searchAPIQuery(searchParams);
      this.ready = true;
      this.searchData = response.PrimarySearchResults;

      this.searchData.forEach((item) => {
        let today = new Date();
        item.Expired = new Date(item.ContentExpirationDate) < today
      });
    },
    dateSort(a,b){
      return moment(a.LastModifiedTime).format('YYYYMMDD') - moment(b.LastModifiedTime).format('YYYYMMDD')
    }
  }
};
</script>
<style lang="scss" scoped>
  .expired {
    color: #D0342C;
    font-weight: 600;
  }
</style>
