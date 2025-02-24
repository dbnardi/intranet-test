<template>
  <div class="md-layout">
    <div class="md-layout-item">
      <div class="wrapper">
        <div id="notifications">
          <div v-for="(alert, index) in alertBanners" :key="index" class="alert mb-0"
            :class="`alert-${alert.AlertType} mb-20`">
            <div class="container">
              <button v-if="alert.IsDismissable" type="button" aria-hidden="true" class="close"
                @click="removeAlert(alert)">
                <md-icon>clear</md-icon>
              </button>
              <div class="alert-icon">
                <md-icon>info_outline</md-icon>
              </div>
              {{ alert.Title }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import sharepoint from '../../api/sharepoint';
export default {
  data() {
    return {
      alertBanners: [],
      personalisation: null
    }
  },
  created: async function () {
    this.setPersonalisation();
  },
  methods: {
    async removeAlert(alert) {
      if (!this.personalisation.dismissedAlerts.includes(alert.ID)) {
        this.personalisation.dismissedAlerts.push(alert.ID);
        await this.updatePersonilisationSP();
        await this.getAlerts();
      }
    },
    setPersonalisation() {
      if (_personalisation) {
        this.personalisation = _personalisation
        this.getAlerts();
      }
      else
        setTimeout(this.setPersonalisation, 500);
    },
    async updatePersonilisationSP() {
      await sharepoint.updateListItemPnPByFilter(
        "Personalisation",
        {
          Title: _spPageContextInfo.userLoginName,
          Personalisation: JSON.stringify(this.personalisation),
        },
        "Title eq '" + _spPageContextInfo.userLoginName + "'",
        _spPageContextInfo.siteAbsoluteUrl + "/Configuration"
      );
    },
    async getAlerts() {
      // Generate CAML Query for getting latest 3 messages from alert banners excluding already dismissed alerts
      let excludeDismissed = "";
      let closeAnds = "";
      if (this.personalisation.dismissedAlerts?.length > 0) {
        for (const [i, id] of this.personalisation.dismissedAlerts.entries()) {
          excludeDismissed = excludeDismissed + "<And><Neq> <FieldRef  Name='ID'/> <Value Type='Text'>" + id + "</Value> </Neq>"
          closeAnds = closeAnds + "</And>";
        }
      }

      const getAlertQuery = "<Where>\
        "+ excludeDismissed + "\
        <Geq>\
          <FieldRef Name='ContentExpirationDate' />\
          <Value Type='DateTime'>\
            <Today/>\
          </Value>\
        </Geq>\
        "+ (excludeDismissed ? closeAnds : "") + "\
      </Where> \
      <OrderBy> \
        <FieldRef Name='Modified' Ascending='FALSE' /> \
      </OrderBy> \
      ";
      this.alertBanners = await sharepoint.getListItemsByCaml('Alert Banners', getAlertQuery, _spPageContextInfo.siteAbsoluteUrl, 3);
    }
  }
};
</script>
