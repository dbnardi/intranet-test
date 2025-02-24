<template>
  <div class="social-line social-line-big-icons social-line-white">
    <el-input placeholder="Search" v-model="searchString" class="mb-20">
      <i slot="prefix" class="el-input__icon el-icon-search"></i>
    </el-input>
    <div class="container" v-for="(name, value) in azLinks" :key="name">
      <h1 class="text-primary">{{ value }}</h1>
      <div class="md-layout">
        <div
          class="md-layout-item md-size-20"
          v-for="(item, key) in name"
          :key="key"
          @mouseenter="enter(item)"
          @mouseleave="leave(item)"
        >
          <a :href="item.url" class="md-button md-simple md-icon md-secondary">
            <btn class="md-btn add-az hidden-md" @click.prevent="addToQuickLaunch(item)"
              title="Add to quick launch" v-if="!alreadyAdded(item)" :id="'btn-'+item.id">
              <md-icon class="text-primary">add</md-icon>
            </btn>
            <div class="md-ripple">
              <div class="md-button-content">
                <md-icon class="az-link-icon">{{ item.icon }}</md-icon>
                <span class="az-link-text">{{ item.title }}</span>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import sharepoint from "../../api/api";
export default {
  name:"AZPage",
  props:['personalisation'],
  data() {
    return {
      searchString: "",
      configWebUrl: _spPageContextInfo.siteAbsoluteUrl + "/configuration"
    };
  },
  methods:{
    addToQuickLaunch(link){
      if (link) {
        this.personalisation.azLinks.push({ ...link });
        this.updatePersonilisationSP();
        const h = this.$createElement;

        this.$notify({
          title: 'Success',
          message: h('span', { style: 'color: green' }, 'Link added to Quick Launch')
        });
      }
    },
    async updatePersonilisationSP() {
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
    alreadyAdded(item){
      return this.personalisation.azLinks.some(
            (savedLink) => savedLink.id == item.id
          )
    },
    enter(item){
      let el = document.getElementById("btn-"+item.id);
      if (el) el.classList.remove("hidden-md");
    },
    leave(item){
      let el = document.getElementById("btn-"+item.id);
      if (el) el.classList.add("hidden-md");
    }
  },
  computed: {
    azLinks() {
      let fullList = window._azLinks.filter((e) => e.title.toLowerCase().indexOf(this.searchString.toLowerCase()) > -1);
      var filtered = {};
      fullList.forEach((e) => {
        let alpha = e.title.substring(0, 1);
        if (!filtered[alpha]) filtered[alpha] = [];
        filtered[alpha].push(e)
      });
      return Object.keys(filtered).sort().reduce(
        (obj, key) => { 
          obj[key] = filtered[key]; 
          return obj;
        }, 
        {}
      );
    },
  },
};
</script>
<style lang="scss" scoped>
.container{
  display:block;
  h1{
    margin-top: 0 !important;
  }
  .add-az{
    position:absolute;
    top:0;
    right:0;
    z-index:999;
    border-radius: 50px;
    background-color: ghostwhite;
    padding-left: 11px;
    width: 45px;
    height: 45px;
    
    i{
      font-size: 2.3rem !important;
    }
  }
  .md-button-content {
    flex-direction: column;
    i {
      font-size: 3rem !important;
    }
    span {
      font-size: 1.3rem !important;
      text-transform: capitalize;
      word-wrap: break-word;
      white-space: normal;
      text-align: center;
    }
  
  }
}

</style>
