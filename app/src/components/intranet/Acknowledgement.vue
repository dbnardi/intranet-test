<template>
  <div class="dialog-container">
    <el-dialog :visible.sync="dialogOpened" :width="'500px'" :height="'500px'" :close-on-click-modal="false">
      <div class="dialog-content">
        <div class="acknowledgement-text">{{this.text}}</div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import sharepoint from '../../api/sharepoint';
export default {
  name: "acknowledgement",
  props: ['personalisation'],
  data() {
    return {
      dialogOpened: true,
    };
  },
  created: function () {
    this.text = _configuration.AcknowledgementText 
    var date = this.personalisation.acknowledgement;
    if (date) {
      this.dialogOpened = !this.isToday(new Date(date));
    } else {
      this.dialogOpened = true;
    }
    
    setTimeout(() => this.dialogOpened = false, +_configuration.AcknowledgementTime);
    this.personalisation.acknowledgement = (new Date()).toJSON();
    this.updatePersonalisationSP();
  },
  methods: {
    isToday(date) {
      var today = new Date();
      return today.toDateString() === date.toDateString();
    },
    async updatePersonalisationSP() {
      await sharepoint.updateListItemPnPByFilter(
        "Personalisation",
        {
          Title: _spPageContextInfo.userLoginName,
          Personalisation: JSON.stringify(this.personalisation),
        },
        "Title eq '" + _spPageContextInfo.userLoginName + "'",
        _spPageContextInfo.siteAbsoluteUrl + "/Configuration"
      );
    }
  }
};
</script>

<style lang="scss">
  
  .acknowledgement-text {
    font-weight: 590 !important;
    font-size: 18px !important;
    word-break: break-word;
    white-space: normal;
    color: black;
    line-height: 1.2;
    margin: -10px 0 0 40px;
  }

 .dialog-container {
    
    .el-dialog__wrapper {
      padding-top: 350px;
      padding-right: 60px;
    }

    .el-dialog__body, .el-dialog__header {
      padding: 0 !important;
    }

    .dialog-content {
      height: 414px;
      background: url('/publishingimages/acknowledgement.jpg');
      background-repeat: no-repeat;
      background-size: cover;
      padding: 165px 50px;
    }
 }
</style>
