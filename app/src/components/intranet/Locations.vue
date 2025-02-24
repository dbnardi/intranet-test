<template>
  <Map
    :countryData="mapData"
    :countries="countries"
    highColor="#ff0000"
    lowColor="#aaaaaa"
    countryStrokeColor="#909090"
    defaultCountryFillColor="#dadada"
  />
</template>

<script>
import sharepoint from "../../api/api";
import Map from "./worldmap/Map.vue";

export default {
  components: { Map },
  data() {
    return {
      searchString: "",
      configWebUrl: _spPageContextInfo.siteAbsoluteUrl + "/configuration",
      mapData: {},
      countries:[]
    };
  },
  created() {
    sharepoint
      .getAllListItemsPnP(
        {
          listName: "Locations",
          select: ["Title", "EmbassyLocation", "NavigationURL"]
        },
        this.configWebUrl
      )
      .then((res) => {
        var countries = {};
        res.forEach((e) => {
          if (this.countries.indexOf(e.EmbassyLocation) == -1) {
            this.countries.push(e.EmbassyLocation);
            countries[e.EmbassyLocation] = [];
            countries[e.EmbassyLocation].push(
              `<li><a href=${e.NavigationURL}>${e.Title}</a></li>`
            );
          } else {
            countries[e.EmbassyLocation].push(
              `<li><a href=${e.NavigationURL}>${e.Title}</a></li>`
            );
          }
        });
        this.mapData = _.mapValues(countries, (val, key) => {
            return `<ul>${val.join('')}</ul>`;
          });
      });
  },
};
</script>
