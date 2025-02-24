<template>
  <div class="visitors">
    <!-- Tabstrip: start -->
    <div style="display: flex" class="mb-10">
      <el-radio-group v-model="type" @change="typeChanged($event)" style="margin: auto">
        <el-radio-button label="new">New Visit</el-radio-button>
        <el-radio-button label="favorite">Favorite Visits</el-radio-button>
      </el-radio-group>
    </div>

    <!-- Favorite Visitors: Start -->
    <div v-if="type === 'favorite'">
      <el-table ref="registeredTable" stripe :data="favVisitsTableData">
        <el-table-column prop="name" label="Visit Name"></el-table-column>
        <el-table-column label="">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-check" plain @click="setFavourite(scope.row)">
              Select
            </el-button>

            <el-button type="danger" icon="el-icon-delete" @click="deleteFavourite(scope.$index)" plain>
              Delete
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="text-center pt-15">
        <el-pagination background layout="prev, pager, next" @current-change="handlePageChange"
          :current-page.sync="currentPage" :page-size="this.pageSize" :total="length">
        </el-pagination>
      </div>
    </div>
    <!-- Favorite Visitors: End -->

    <div class="visit-form" v-if="type === 'new'">
      <el-form :model="detailsForm" :rules="detailsFormRules" ref="detailsForm">
        <div class="md-layout">
          <div class="md-layout-item">
            <label>* Escorting Officer Name(s)</label>
            <el-form-item prop="EscortingFirstName">
              <el-input v-model="detailsForm.EscortingFirstName"></el-input>
            </el-form-item>
          </div>
          <div class="md-layout-item">
            <label>* Escorting Officer GAL(s)</label>
            <el-form-item prop="GAL">
              <el-input v-model="detailsForm.GAL"></el-input>
            </el-form-item>
          </div>
        </div>
        <div class="md-layout">
          <div class="md-layout-item">
            <el-form-item prop="VisitPurpose">
              <label>* Visit Purpose</label>
              <el-input type="textarea" v-model="detailsForm.VisitPurpose">
              </el-input>
            </el-form-item>
          </div>
        </div>
        <div class="md-layout">
          <div class="md-layout-item">
            <div><label>* Entry</label></div>
            <el-form-item prop="EntryDate">
              <VueCtkDateTimePicker minute-interval="5" v-model="detailsForm.EntryDate" format="YYYY-MM-DDTHH:mm:ssZ" :no-label="true" @input="entryDTChanged" />
            </el-form-item>
          </div>
          <div class="md-layout-item">
            <div><label>* Exit</label></div>
            <el-form-item prop="ExitDate">
              <VueCtkDateTimePicker minute-interval="5" v-model="detailsForm.ExitDate" format="YYYY-MM-DDTHH:mm:ssZ" :no-label="true" @validate="validateDate" />
            </el-form-item>
          </div>
        </div>
        <div class="md-layout">
          <div class="md-layout-item">
            <div><label>* Point of Entry</label></div>
            <el-form-item prop="VisitLocation">
              <el-select v-model="detailsForm.VisitLocation" placeholder="Select">
                <el-option v-for="(item, index) in locations" :key="index" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </div>
          <div class="md-layout-item">
            <label>* Room/Office Location</label>
            <el-form-item prop="RoomLocation">
              <el-input v-model="detailsForm.RoomLocation"></el-input>
            </el-form-item>
          </div>
        </div>
        <div class="md-layout">
          <div class="md-layout-item">
            <el-form-item prop="RedLight">
              <el-checkbox v-model="detailsForm.RedLight">Red Lights</el-checkbox>
            </el-form-item>
          </div>
          <div class="md-layout-item">
            <el-form-item prop="VIPVisit">
              <el-checkbox v-model="detailsForm.VIPVisit">VIP</el-checkbox>
            </el-form-item>
          </div>
          <div class="md-layout-item">
            <el-form-item prop="VistingDirectorate">
              <el-checkbox v-model="detailsForm.VistingDirectorate">Visiting Directorate</el-checkbox>
            </el-form-item>
          </div>
        </div>
      </el-form>
      <!-- Action Buttons: Start -->
      <div class="action-buttons">
        <el-button type="info" icon="el-icon-close" plain @click="cancel">
          Cancel
        </el-button>
        <el-button type="primary" icon="el-icon-arrow-right" plain @click="submit">
          Next
        </el-button>
      </div>
      <!-- Action Buttons: Ends -->
    </div>
  </div>
</template>

<script>
import sharepoint from "@/api/sharepoint";

export default {
  name: "visit-form",
  props: {
    config: Object,
    guardMode: Boolean,
    detailsForm: {
      EscortingFirstName: "",
      GAL: "",
      VisitPurpose: "",
      EntryDate: "",
      ExitDate: "",
      VisitLocation: "",
      RoomLocation: "",
      RedLight: false,
      VIPVisit: false,
      VistingDirectorate: false,
    },
  },
  data() {
    return {
      type: "new",
      guardVisits: [],
      favVisits: [],
      favVisitsTableData: [],
      favVisitors: [],
      briefings: [],
      locations: [],
      pageSize: 7,
      length: 0,
      currentPage: 1,
      detailsFormRules: {
        EscortingFirstName: {
          required: true,
          message: "Escorting Officer Name is required",
        },
        GAL: { required: true, message: "GAL is required" },
        VisitPurpose: { required: true, message: "Visit Purpose is required" },
        EntryDate: { required: true, message: "Entry Date Time is required" },
        ExitDate: [
          { required: true, message: "Exit Date Time is required" },
          { validator: this.validateDate, trigger: "blur" },
        ],
        VisitLocation: {
          required: true,
          message: "Point Of Entry is required",
        },
        RoomLocation: {
          required: true,
          message: "Room/Office Location is required",
        },
      },
      personalisation: { ..._personalisation },
      configWebUrl: _spPageContextInfo.siteAbsoluteUrl + "/configuration",
    };
  },
  async created() {
    await this.fetchFavVisits();
    await this.fetchData();
  },
  methods: {
    fetchFavVisits: async function () {
      if (this.guardMode) {
        this.guardVisits = await sharepoint.getAllListItemsPnP(
          { listName: "Favourite Visits" },
          `${_spPageContextInfo.siteAbsoluteUrl}/securityportal`
        );
        this.favVisits = this.guardVisits.map((visit) =>
          JSON.parse(visit.VisitJSON)
        );
      } else {
        this.favVisits = _personalisation.visitors;
      }
      this.length = this.favVisits.length;
      const index = this.currentPage === 1 ? 0 : (this.currentPage - 1) * this.pageSize;
      this.favVisitsTableData = [...this.favVisits].splice(
        index,
        this.pageSize
      );
    },
    typeChanged: async function (value) {
      if (value === "favorite") {
        await this.fetchFavVisits();
      }
    },
    entryDTChanged: async function(value){
      if (!this.detailsForm.ExitDate) this.$set(this.detailsForm, "ExitDate", value);
    },
    fetchData: async function () {
      this.locations = this.createOptions(
        await sharepoint.getFieldValues(
          "VisitLocation",
          _spPageContextInfo.siteAbsoluteUrl
        )
      );
    },
    submit: function () {
      this.$refs["detailsForm"].validate((valid) => {
        if (valid) {
          this.$parent.next(this.detailsForm, this.favVisitors);
        }
      });
    },
    cancel: function () {
      this.$refs["detailsForm"].resetFields();
      this.$parent.cancel();
    },
    createOptions: function (array) {
      let returnArray = [];
      for (const item of array) {
        returnArray.push({ value: item, label: item });
      }
      return returnArray;
    },
    validateDate: function (rule, value, callback) {
      if (!callback) return;
      if (moment(value).isSameOrBefore(moment(this.detailsForm.EntryDate))) {
        callback(new Error("Exit date must be after Entry date"));
      } else {
        callback();
      }
    },
    setFavourite: function (record) {
      this.type = "new";
      Object.keys(record.details).forEach((prop) => {
        if (prop !== "EntryDate" && prop !== "ExitDate") {
          this.detailsForm[prop] = record.details[prop];
        }
      });

      this.favVisitors = record.visitors;
    },
    handlePageChange(val) {
      this.currentPage = val;
      const index = this.currentPage === 1 ? 0 : (this.currentPage - 1) * this.pageSize;
      this.favVisitsTableData = [...this.favVisits].splice(
        index,
        this.pageSize
      );
    },
    deleteFavourite: async function (index) {
      this.$confirm(
          `Are you sure you want to delete this favourite visit?`,
          "Warning",
          {
            confirmDeleteButtonText: "Delete",
            cancelButtonText: "Cancel",
            type: "warning",
          }
        ).then(async () => {
          
      if (this.guardMode) {
        var record = this.guardVisits[index];
        await sharepoint.deleteListItemById(
          "Favourite Visits",
          record.Id,
          `${_spPageContextInfo.siteAbsoluteUrl}/securityportal`
        );
      } else {
        this.personalisation.visitors = this.favVisits;
        await sharepoint.updateListItemPnPByFilter(
          "Personalisation",
          {
            Title: _spPageContextInfo.userLoginName,
            Personalisation: JSON.stringify(this.personalisation),
          },
          "Title eq '" + _spPageContextInfo.userLoginName + "'",
          this.configWebUrl
        );
      }
      this.favVisits.splice(index, 1);
          this.favVisitsTableData = [...this.favVisits].splice(
            index,
            this.pageSize
          );
      this.$notify({
            type: "success",
            message: `Favourite visit has been removed`,
            title: "Visitor removed",
          });
        });
    },
  },
};
</script>
<style lang="scss">
input[type="button"],
input[type="reset"],
input[type="submit"],
button {
  min-width: inherit;
  margin-left: inherit;
}
</style>