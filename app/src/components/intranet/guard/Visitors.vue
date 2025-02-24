<template>
  <div class="visitors">
    <div class="title" v-if="!guardMode">
      <h2 class="mt-0">{{ title }}</h2>
      <h4 class="mt-0" v-if="!showForm">
        Only showing Visitors for next 3 days
      </h4>
    </div>
    <button type="button" class="new-visitor el-button el-button--primary" v-if="!showForm && !guardMode"
      @click="register">
      New Visitor
    </button>
    <div class="modal-content">
      <el-table v-if="!showForm && !guardMode" ref="registeredTable" stripe :row-class-name="tableRowClassName"
        :data="data">
        <el-table-column prop="FirstName" label="Name">
          <template slot-scope="scope">
            {{ scope.row.FirstName }} {{ scope.row.LastName }}
          </template>
        </el-table-column>
        <el-table-column prop="Organisation" label="Organisation" />
        <el-table-column prop="RoomLocation" label="Location" />
        <el-table-column prop="EntryDate" label="Time" width="180">
          <template slot-scope="scope">
            {{ scope.row.EntryDate | formatDate }}
          </template>
        </el-table-column>
        <el-table-column prop="Briefing" label="Briefing">
          <template slot-scope="scope">
            <div :style="{ color: scope.row.briefingColour }">
              {{ scope.row.Briefing }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Actions">
          <template slot-scope="scope">
            <el-button v-if="scope.row.CanEdit" type="info" icon="el-icon-edit" plain @click="editVisit(scope.row)">
            </el-button>
            <el-button v-if="scope.row.CanEdit" type="danger" icon="el-icon-delete" plain
              @click="confirmDelete(scope.row)">
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="!showForm && !guardMode" class="text-center pt-15">
        <el-pagination background layout="prev, pager, next" @current-change="handleCurrentChange"
          :current-page.sync="currentPage" :page-size="this.pageSize" :total="length">
        </el-pagination>
      </div>
      <div class="all-visitors">
        <el-link v-if="!showForm" type="primary" :href="allVisitors" target="_blank">
          View All Visitors
        </el-link>
      </div>
      <div v-if="showForm || guardMode">
        <!-- Step: Start -->
        <div class="steps">
          <ul class="progressbar">
            <li v-bind:class="{
              active: currentStep === 1,
              completed: stepOneCompleted,
            }">
              Visit Details
            </li>
            <li v-bind:class="{
              active: currentStep === 2,
              completed: stepTwoCompleted,
            }">
              Visitors
            </li>
            <li v-bind:class="{ active: currentStep === 3, completed: completed }">
              Summary
            </li>
          </ul>
        </div>
        <!-- Step: End -->

        <!-- Forms: Start -->
        <div v-if="currentStep === 1">
          <visit-form :detailsForm="visitDetails" :guardMode="guardMode"></visit-form>
        </div>
        <div v-if="currentStep === 2">
          <visitor-form :config="config" :visitors="visitors" :editMode="editMode"></visitor-form>
        </div>
        <!-- Forms: End -->

        <!-- Summary: Start -->
        <div class="step-3" v-if="!submitted && currentStep === 3">
          <h3>Visit Details</h3>
          <div class="md-layout">
            <div class="md-layout-item">
              <p class="summary-label">Escorting Officer Name</p>
              <span>{{ visitDetails.EscortingFirstName }}</span>
            </div>
            <div class="md-layout-item">
              <p class="summary-label">Escorting Officer GAL</p>
              <span>{{ visitDetails.GAL }}</span>
            </div>
          </div>
          <div class="md-layout">
            <div class="md-layout-item">
              <p class="summary-label">Visit Purpose</p>
              <span>{{ visitDetails.VisitPurpose }}</span>
            </div>
          </div>
          <div class="md-layout">
            <div class="md-layout-item">
              <p class="summary-label">Entry</p>
              <span>{{ visitDetails.EntryDate | formatDate }}</span>
            </div>
            <div class="md-layout-item">
              <p class="summary-label">Exit</p>
              <span>{{ visitDetails.ExitDate | formatDate }}</span>
            </div>
          </div>
          <div class="md-layout">
            <div class="md-layout-item">
              <p class="summary-label">Point of Entry</p>
              <span>{{ visitDetails.VisitLocation }}</span>
            </div>
            <div class="md-layout-item">
              <p class="summary-label">Room/Office Location</p>
              <span>{{ visitDetails.RoomLocation }}</span>
            </div>
          </div>
          <div class="md-layout">
            <div class="md-layout-item">
              <p class="summary-label">Red Lights</p>
              <span>{{ visitDetails.RedLight === true ? "Yes" : "No" }}</span>
            </div>
            <div class="md-layout-item">
              <p class="summary-label">VIP Visit</p>
              <span>{{ visitDetails.VIPVisit === true ? "Yes" : "No" }}</span>
            </div>
          </div>
          <div class="md-layout">
            <div class="md-layout-item">
              <p class="summary-label">Visiting Directorate</p>
              <span>{{
                  visitDetails.VistingDirectorate === true ? "Yes" : "No"
              }}</span>
            </div>
          </div>

          <div class="summary-visitors">
            <h3>Visitors</h3>
            <div class="summary-visitors-table">
              <div class="md-layout">
                <div class="md-layout-item header">Name</div>
                <div class="md-layout-item header">Organisation</div>
                <div class="md-layout-item header">Briefing</div>
              </div>
              <div class="md-layout visitors-item" v-for="(visitor, index) in visitors" :key="index">
                <div class="md-layout-item">
                  {{ visitor.FirstName }} {{ visitor.LastName }}
                </div>
                <div class="md-layout-item">{{ visitor.Organisation }}</div>
                <div class="md-layout-item">{{ visitor.Briefing }}</div>
              </div>
            </div>
          </div>

          <div class="action-buttons">
            <el-button type="info" icon="el-icon-close" plain @click="cancel">
              Cancel
            </el-button>
            <el-button type="primary" icon="el-icon-arrow-left" plain @click="currentStep = 2">
              Prev
            </el-button>
            <el-button :disabled="savingFav" type="primary" icon="el-icon-check" plain @click="submit">
              Save
            </el-button>
            <el-tooltip class="item" effect="dark" content="Save and add the visit to your favorites"
              placement="top-start">
              <el-button type="success" icon="el-icon-star-off" plain @click="savingFav = true">
                Save & Favorite
              </el-button>
            </el-tooltip>
          </div>
          <div v-if="savingFav" class="md-layout">
            <div style="margin: auto; display: flex">
              <el-input v-model="visitName" placeholder="Give this Visit a name" class="mr-15"></el-input>
              <el-button type="primary" plain :disabled="!visitName || visitName.length === 0" @click="addToFavorite">
                Save
              </el-button>
            </div>
          </div>
        </div>
        <!-- Summary: End -->

        <div v-if="submitted && !completed" class="status-section">
          <i class="el-icon-loading"></i>
        </div>
        <div v-if="completed" class="completed">
          <div class="status-section">
            <i class="el-icon-check"></i>
          </div>
          <h2>Visitors Registered</h2>
          <el-button type="info" plain @click="close"> Close </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import sharepoint from "@/api/sharepoint";
import VisitForm from "./VisitForm.vue";
import VisitorForm from "./VisitorForm.vue";

export default {
  name: "visitors",
  components: {
    "visit-form": VisitForm,
    "visitor-form": VisitorForm,
  },
  props: {
    config: Object,
    guardMode: Boolean,
    visit: Object,
    open: Boolean,
    duplicate: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      title: "Upcoming Visitors",
      registered: [],
      data: [],
      length: 0,
      pageSize: 10,
      showForm: false,
      currentStep: 1,
      stepOneCompleted: false,
      stepTwoCompleted: false,
      currentUser: null,
      submitted: false,
      completed: false,
      savingFav: false,
      visitName: null,
      editMode: false,
      visitDetails: {
        EscortingFirstName: "",
        GAL: "",
        VisitPurpose: "",
        EntryDate: new Date(),
        ExitDate: new Date(),
        VisitLocation: "",
        RoomLocation: "",
        RedLight: false,
        VIPVisit: false,
        VistingDirectorate: false,
      },
      visitors: [],
      personalisation: { ..._personalisation },
      configWebUrl: _spPageContextInfo.siteAbsoluteUrl + "/configuration",
      allVisitors: `${_spPageContextInfo.siteAbsoluteUrl}/Pages/Visitors.aspx`,
      currentPage: 1,
    };
  },
  async created() {
    await this.fetchData();
    if (Object.keys(_personalisation).length === 0) {
      const blankData = {
        quickLinks: [],
        azLinks: [],
        dismissedAlerts: [],
        visitors: [],
      };
      this.personalisation = blankData;
      const blankTemplate = {
        Title: _spPageContextInfo.userLoginName,
        Personalisation: JSON.stringify(blankData),
      };
      sharepoint.createListItemPnP(
        "Personalisation",
        blankTemplate,
        null,
        this.configWebUrl
      );
    }
    this.visit ? this.editVisit(this.visit, true) : null;


  },
  beforeUnmount() {
    this.data = [];
  },
  watch: {
    visit: function (val, oldVal) {
      if (val) {
        this.editVisit(val, true);
      }
    },
    open: function (val, oldVal) {
      if (!val) {
        this.reset();
      } else {
        this.editVisit(this.visit, true);
      }
    }
  },
  methods: {
    register: function () {
      this.title = "Register Visitors";
      this.showForm = true;
    },
    fetchData: async function () {
      this.data = [];
      var from = new Date();
      from.setHours(0, 0, 0, 0);
      var to = new Date();
      to.setDate(to.getDate() + 2);
      this.currentUser = await sharepoint.getCurrentUser();
      const visitors = await sharepoint.getAllListItemsPnP(
        {
          listName: "Visitors",
          filter: `(EntryDate ge datetime'${from.toISOString()}' and EntryDate le datetime'${to.toISOString()}') or (ExitDate ge datetime'${from.toISOString()}' and ExitDate le datetime'${to.toISOString()}') or (EntryDate le datetime'${from.toISOString()}' and ExitDate gt datetime'${to.toISOString()}')`,
          orderBy: "EntryDate",
          ascending: true,
        },
        `${_spPageContextInfo.siteAbsoluteUrl}/securityportal`
      );

      this.registered = this.processListVisitor(visitors);

      this.length = visitors.length;
      const index =
        this.currentPage === 1 ? 0 : (this.currentPage - 1) * this.pageSize;
      this.data = [...this.registered].splice(index, this.pageSize);
    },
    confirmDelete: async function (visitor) { // should make this into a composable function or something in the future.

      const relatedVisitors = await this.getVisitorsByTitle(visitor.Title);
      const canStillEdit = relatedVisitors ? relatedVisitors.every(this.editEligibilityCheck) : false;
      if (canStillEdit) {

        this.$confirm(
          `You are about to remove visitor ${visitor.FirstName} ${visitor.LastName}. Do you wish to continue?`,
          "Warning",
          {
            confirmDeleteButtonText: "Delete",
            cancelButtonText: "Cancel",
            type: "warning",
          }
        ).then(async () => {
          await sharepoint.deleteListItemById(
            "Visitors",
            visitor.Id,
            `${_spPageContextInfo.siteAbsoluteUrl}/securityportal`
          );
          this.fetchData();
          this.$notify({
            type: "success",
            message: `Visitor ${visitor.FirstName} ${visitor.LastName} has been removed`,
            title: "Visitor removed",
          });
        });
      } else {
        this.fetchData();
        this.notifyNoLongerCanEdit();
      }
    },
    editEligibilityCheck: function (visitor) {
      return !visitor.InOrOut
        && (visitor.PassNumber === "N/A" || !visitor.PassNumber)
        && (visitor.VisitHistory === "[]" || !visitor.VisitHistory)
    },
    processListVisitor: function (visitors) {
      return visitors.map((visitor) => {
        const colourConfig = this.config[visitor.Briefing];
        visitor.briefingColour = colourConfig;
        for (let key in visitor) { // remove all props that are of type object or keys that starts with '__' we could probably query the content type's field rather than doing this.
          if (typeof visitor[key] === 'object' || key.startsWith('__')) {
            delete visitor[key];
          }
          delete visitor['FileSystemObjectType'];
          delete visitor['ServerRedirectedEmbedUrl'];
          delete visitor['FileSystemObjectType'];
        }

        visitor.CanEdit = false;

        const eligibleVisits = visitors.filter(
          (sameVisit) => {
            return sameVisit.Title === visitor.Title
              && sameVisit.AuthorId === this.currentUser.Id
          }); // author is current user and share the same Title as current Visit

        if (eligibleVisits.length > 0) {
          visitor.CanEdit = eligibleVisits.every(this.editEligibilityCheck)
        }
        return visitor;
      })
    },
    getVisitorsByTitle: async function (title) {
      return this.processListVisitor(await sharepoint.getAllListItemsPnP(
        {
          listName: "Visitors",
          filter: `Title eq '${title}'`
        },
        `${_spPageContextInfo.siteAbsoluteUrl}/securityportal`));
    },
    editVisit: async function (row, fetchFromList = false) {
      this.title = "Edit Visit";
      this.editMode = true;
      let relatedVisitors = [];
      if (fetchFromList) {
        relatedVisitors = await this.getVisitorsByTitle(row.Title);
      } else {
        relatedVisitors = this.registered.filter(visitor => visitor.Title === row.Title);
      }
      if (relatedVisitors.length > 0) { // should probably show a message here but shouldn't be happening i.e. editing a visit where the visitor was not found.
        this.visitDetails = _.clone(relatedVisitors[0]);
        this.visitors = relatedVisitors;
      }
      this.showForm = true;

    },
    next: function (visitDetails, visitors) {
      // we set the visitors her because it might be a fav visit
      this.visitDetails = visitDetails;
      // this prevents the visitors from being removed when using the prev button
      this.visitors = visitors && visitors.length > 0 ? visitors : this.visitors;
      this.currentStep = 2;
      this.stepOneCompleted = true;
    },
    prev: function () {
      this.currentStep = 1;
    },
    review: function (visitors) {
      this.visitors = visitors;
      this.currentStep = 3;
      this.stepTwoCompleted = true;
    },
    submit: async function () {
      this.submitted = true;
      const visitId = this.editMode && !this.duplicate ? this.visitDetails.Title : this.$uuid.v4(); // use current title if in edit mode else new id.
      const visitDetailPatch = {}
      //visitDetailPatch was created for edits/duplication where we want to apply any update to the visit detail across all the visitor's items.
      if (this.editMode) {
        visitDetailPatch.EscortingFirstName = this.visitDetails.EscortingFirstName
        visitDetailPatch.GAL = this.visitDetails.GAL
        visitDetailPatch.VisitPurpose = this.visitDetails.VisitPurpose
        visitDetailPatch.RedLight = this.visitDetails.RedLight
        visitDetailPatch.VIPVisit = this.visitDetails.VIPVisit
        visitDetailPatch.VistingDirectorate = this.visitDetails.VistingDirectorate
        visitDetailPatch.VisitLocation = this.visitDetails.VisitLocation
        visitDetailPatch.RoomLocation = this.visitDetails.RoomLocation
        visitDetailPatch.EntryDate = this.visitDetails.EntryDate
        visitDetailPatch.ExitDate = this.visitDetails.ExitDate

        //remove TO_DELETE from visit details
        // delete this.visitDetails['TO_DELETE']
      }

      //can still edit check
      let canStillEdit = true;
      if (this.editMode && !this.duplicate && !this.guardMode) {
        const refreshedVisitors = await this.getVisitorsByTitle(this.visitors[0].Title);
        canStillEdit = refreshedVisitors ? refreshedVisitors.every(this.editEligibilityCheck) : false;
      }

      if (canStillEdit) {

        delete this.visitDetails.PersonTitle; // remove here to prevent records with no title being set with the first record's title
        
        for (let visitor of this.visitors) {
          if (visitor['TO_DELETE']) {
            if (!this.duplicate) { // only delete if this is in edit mode and not in duplicate mode
              await sharepoint.deleteListItemById(
                "Visitors",
                visitor.Id,
                `${_spPageContextInfo.siteAbsoluteUrl}/securityportal`
              );
            } else { // in duplicate mode just skip over this visitor.
              continue;
            }
          } else {
            delete visitor['TO_DELETE'];
            delete visitor.Id;
            
            var payload = { ...this.visitDetails, ...visitor, ...visitDetailPatch };
            payload.Title = visitId;
            payload.PassNumber = "N/A";
            delete payload.TO_DELETE;// this data is not stored and only exists in edit mode
            delete payload.CanEdit; // this data is not stored and only exists in edit mode
            delete payload.briefingColour; // this data is not stored and only exists in edit mode
            if (this.duplicate) {
              payload.VisitHistory = ""; // don't duplicate visit history
              payload.PassNumber = "N/A";
              payload.InOrOut = false;
            }
            if (visitor.ID && !this.duplicate) {
              await sharepoint.updateListItemPnP(
                "Visitors",
                payload,
                visitor.ID,
                null,
                `${_spPageContextInfo.siteAbsoluteUrl}/securityportal`
              );
            } else {
              delete payload.ID;
              delete payload.Id;
              await sharepoint.createListItemPnP(
                "Visitors",
                payload,
                null,
                `${_spPageContextInfo.siteAbsoluteUrl}/securityportal`
              );
            }
          }
        }

        this.completed = true;
      } else {
        this.notifyNoLongerCanEdit();
        this.close();
      }
      await this.fetchData();
    },
    notifyNoLongerCanEdit: function () {
      this.$notify({
        type: "error",
        message: `Visit failed to save as some visitors appears to have been checked-in`,
        title: "Edit Visitor Failed",
      });
    },
    addToFavorite: async function () {
      const visitors = _.cloneDeep(this.visitors);
      const favVisitors = visitors.map((visitor) => {
        delete visitor.PassNumber;
        delete visitor.Id;
        delete visitor.InOrOut;
        return visitor;
      });

      const visit = {
        name: this.visitName,
        details: _.cloneDeep(this.visitDetails),
        visitors: favVisitors,
      };
      if (this.guardMode) {
        await sharepoint.createListItemPnP("Favourite Visits", {
          Title: this.visitName,
          VisitJSON: JSON.stringify(visit),
        });
      } else {
        this.personalisation.visitors = this.personalisation.visitors
          ? [...this.personalisation.visitors, visit]
          : [visit];
        _personalisation.visitors = this.personalisation.visitors;
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
      this.resetSavingFav();

      await this.submit();
    },
    resetSavingFav: function () {
      this.savingFav = false; // reset this flag
      this.visitName = "";
    },
    close: function () {
      this.reset();
      this.$parent.$parent.closeVisitors();
    },
    cancel: function () {
      this.reset();
      this.$parent.$parent.closeVisitors();
    },
    reset: function () {
      this.title = "Visitors";
      this.currentStep = 1;
      this.submitted = false;
      this.showForm = false;
      this.stepOneCompleted = false;
      this.stepTwoCompleted = false;
      this.editMode = false;
      this.completed = false;
      this.visitors = [];
      Object.keys(this.visitDetails).forEach(
        (prop) => (this.visitDetails[prop] = null)
      );
      this.showForm = false;
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      const index =
        this.currentPage === 1 ? 0 : (this.currentPage - 1) * this.pageSize;
      this.data = [...this.registered].splice(index, this.pageSize);
    },
    tableRowClassName({ row, rowIndex }) {
      if (row && row.ForeignNational) {
        return 'foreign-national'
      }

      return '';
    }
  },
};
</script>