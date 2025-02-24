<template>
  <div class="social-line social-line-big-icons social-line-white">
    <h3  class="text-primary">Filters</h3>
    <md-form class="flex" style="width:1000px;">
      <md-field class="pr-15">
        <label for="search">Search</label>
        <el-input placeholder="Search name or section" v-model="searchString" id="search" @input="currentPage = 1">
          <i slot="prefix" class="el-input__icon el-icon-search"></i>
        </el-input>
      </md-field>
      <md-field class="pr-15">
        <label for="section">Filter by team</label>
        <md-select v-model="sectionFilter" name="Section" id="section" @md-selected="currentPage = 1">
          <md-option value="Any">Any</md-option>
          <md-option value="Unassigned">Unassigned</md-option>
          <md-option v-for="section in sections" :key="section" :value="section">{{section}}</md-option>
        </md-select>
      </md-field>
      <md-checkbox class="mt-30" v-model="unallocated" id="usage" @change="currentPage = 1" style="width:80%;">Unallocated (available for use by any team)</md-checkbox>
      <button @click.prevent="clearSearch" class="md-button md-secondary mt-20">Clear search</button>
    </md-form>

    <ul class="md-list nav-tabs md-theme-default">
      <li :class="{'md-list-item':true, 'active':alphaFilter==alpha}" v-for="alpha in alphabet" :key="alpha">
        <button type="button" class="md-list-item-button md-list-item-container md-button-clean" @click="alphaFilter = alpha; currentPage=1">
          <div class="md-list-item-content md-ripple">{{ alpha }}</div>
        </button>
      </li>
    </ul>
    <hr/>

    <div class="container">
      <vs-pagination class="paginator" :current-page="currentPage" :total-pages="totalPages" @change="p=>currentPage = p"/>
      <div class="md-layout">
        <div
          class="md-layout-item md-elevation-2 m-10 md-size-17"
          v-for="(item, key) in caveats"
          :key="key"
        >
          <i v-if="!item.rsection && item.status == 'Unallocated'" class="md-icon md-icon-font cw-available">check_circle</i>
          <div class="md-ripple">
            <div class="md-button-content">
              <p class="az-link-text">{{ item.name.toUpperCase() }}</p>
              <span v-if="item.rsection" class="md-subhead">{{item.rsection}}</span>
            </div>
          </div>
        </div>
      </div>
      <vs-pagination class="paginator" :current-page="currentPage" :total-pages="totalPages" @change="p=>currentPage = p"/>
    </div>
</template>

<script>
import sharepoint from "@/api/api";
import VsPagination from "@vuesimple/vs-pagination";
export default {
  name: "CaveatNavigator",
  components: {
    VsPagination,
  },
  data() {
    return {
      searchString: "",
      allCaveats: [],
      alphaFilter: "All",
      sectionFilter: "Any",
      unallocated: true,
      paginationLimit: parseInt(_configuration.CaveatPaginationLimit),
      totalPages: 1,
      currentPage: 1,
      alphabet: [
        "All",
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "V",
        "W",
        "X",
        "Y",
        "Z",
      ],
    };
  },
  async created() {
    let item = await sharepoint.getListItemById("Caveats", 1);
    this.allCaveats = JSON.parse(item.XMLBody.trim().replace(/(\r\n|\n|\r|\t)/gm, "")).codewords;
  },
  methods: {
    clearSearch() {
      this.searchString = "";
      this.alphaFilter = "All";
      this.sectionFilter = "Any";
      this.unallocated = true;
      this.currentPage = 1;
    },
  },
  computed: {
    caveats() {
      let fullList = [...this.allCaveats];
      //these filters should be combined but for the sake of readability I've left them separate
      //Search string
      if (this.searchString) {
        fullList = this.allCaveats.filter(
          (e) =>
            e.name.toLowerCase().indexOf(this.searchString.toLowerCase()) >
              -1 ||
            e.rsection.toLowerCase().indexOf(this.searchString.toLowerCase()) >
              -1
        );
      }

      //Alpha filter
      if (this.alphaFilter != "All") {
        fullList = fullList.filter(
          (e) =>
            e.name.substring(0, 1).toLowerCase() ==
            this.alphaFilter.toLowerCase()
        );
      }

      //Section filter
      if (this.sectionFilter != "Any") {
        fullList = fullList.filter((e) =>
          this.sectionFilter == "Unassigned"
            ? !e.rsection
            : e.rsection.toLowerCase() == this.sectionFilter.toLowerCase()
        );
      }

      //Unallocated filter
      fullList = fullList.filter((e) =>
        this.unallocated ? e.status == "Unallocated" : true
      );

      //pagination
      this.totalPages = Math.ceil(fullList.length / this.paginationLimit);
      let start = (this.currentPage - 1) * this.paginationLimit;
      let end = start + this.paginationLimit;

      return fullList
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(start, end);
    },
    sections() {
      let sections = this.allCaveats
        .filter((e) => e.rsection)
        .map((e) => e.rsection);
      return [...new Set(sections)];
    },
  },
};
</script>
<style lang="scss" scoped>
.md-list {
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -ms-flex-flow: initial;
  flex-flow: initial;
  padding: 0 15px;

  .md-list-item {
    height: auto;
    position: relative;
    z-index: 2;
    list-style: none;
  }
  .md-list-item.active {
    background-color: #00966c;
    .md-ripple {
      color: white;
    }
  }
}
.md-button {
  width: 0;
  padding: 10px;
  min-width: fit-content;
  height: fit-content;
}
.md-field:after,
.md-field:before {
  content: none;
}

.container {
  display: block;
  .paginator {
    height: inherit;
    padding-left: inherit;
    background: none !important;
    box-shadow: none;
    display: inherit;
  }
  h1 {
    margin-top: 0 !important;
  }
  .md-size-17 {
    min-width: 18%;
    max-width: 18%;
    flex: 0 1 18%;
  }
  .md-layout-item {
    position: relative;
  }
  i {
    font-size: 2rem !important;
    color: #00966c;
    position: absolute;
    top: -10px;
    left: 210px;
  }
  .md-button-content {
    flex-direction: column;
    padding: 10px 0 !important;

    .az-link-text {
      font-size: 1.3rem !important;
      word-wrap: break-word;
      white-space: normal;
    }
  }
}
</style>
