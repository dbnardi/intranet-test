<template>
  <div class="md-layout">
    <div class="md-layout-item md-size-30">
      <div class="md-card page-section-card">
        <h3 class="card-category">Filters</h3>
        <div class="md-card-content">
          <h3>Name</h3>
          <div class="md-layout">
            <div class="md-layout-item">
              <el-input placeholder="First Name" v-model="filters.firstName.value"></el-input>
            </div>
            <div class="md-layout-item">
              <el-input placeholder="Last Name" v-model="filters.lastName.value"></el-input>
            </div>
          </div>
          <h3>Date Range</h3>
          <div class="md-layout">
            <div class="md-layout-item md-size-50">
              <el-date-picker v-model="filters.dateFrom.value" type="date" format="dd-MM-yyyy" placeholder="Date From">
              </el-date-picker>
            </div>
            <div class="md-layout-item md-size-50">
              <el-date-picker v-model="filters.dateTo.value" type="date" format="dd-MM-yyyy" placeholder="Date To">
              </el-date-picker>
            </div>
          </div>
          <div class="md-layout">
            <div class="md-layout-item md-size-50">
              <h3>Location</h3>
              <el-select v-model="filters.location.value" placeholder="Select...">
                <el-option v-for="(item, index) in locations" :key="index" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </div>
            <div class="md-layout-item md-size-50">
              <h3>Briefing</h3>
              <el-select clearable v-model="filters.briefing.value" placeholder="Select...">
                <el-option v-for="(item, index) in briefings" :key="index" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </div>
          </div>
          <div class="md-layout" style="margin-top: 1rem; margin-bottom: 1rem">
            <div class="md-layout-item">
              <el-checkbox v-model="filters.myVisitors.value">My Visitors Only</el-checkbox>
            </div>
          </div>
          <md-button class="md-primary" @click="clear()">Reset</md-button>
        </div>
      </div>
    </div>
    <div class="md-layout-item md-size-70">
      <div class="md-card page-section-card">
        <h3 class="card-category">Visitors</h3>
        <div class="md-card-content results">
          <el-table v-if="visitors.length !== 0" ref="visitorsTable" @current-change="handleRowClick" :data="visitors">
            <el-table-column prop="FirstName" label="First Name" />
            <el-table-column prop="LastName" label="Last Name" />
            <el-table-column prop="VisitLocation" label="Location" />
            <el-table-column prop="EscortingFirstName" label="Escorting Officer" />
            <el-table-column prop="EntryDate" label="Entry Date/Time">
              <template slot-scope="scope">
                {{ scope.row.EntryDate | standardDateFormat }}
              </template>
            </el-table-column>
            <el-table-column prop="Briefing" label="Briefing" />
            <el-table-column label="" width="120">
              <template slot-scope="scope">
                <div class="buttons">
                  <el-button v-if="showEditDelete(scope.row)" size="mini" type="info" icon="el-icon-edit"
                    @click.stop="showEdit(scope.row)"></el-button>
                  <el-button v-if="showEditDelete(scope.row)" size="mini" type="danger" icon="el-icon-delete"
                    @click.stop="confirmDelete(scope.row)">
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
          <div v-if="visitors.length === 0">No records to dislay</div>
        </div>
      </div>
    </div>
<!-- view dialog -->
    <el-dialog :visible.sync="dialogOpened" :before-close="handleClose" :close-on-click-modal="false" :width="'500px'">
      <div class="selected-visitor">
        <h3>Visit Details</h3>
        <div class="md-layout">
          <div class="md-layout-item">
            <p class="summary-label">Full Name</p>
            <span>{{ visitor.FirstName }} {{ visitor.LastName }}</span>
          </div>
          <div class="md-layout-item">
            <p class="summary-label">Briefing</p>
            <span>{{ visitor.Briefing }}</span>
          </div>
        </div>
        <div class="md-layout">
          <div class="md-layout-item">
            <p class="summary-label">Escorting Officer</p>
            <span>{{ visitor.EscortingFirstName }}</span>
          </div>
          <div class="md-layout-item">
            <p class="summary-label">Visit Date</p>
            <span>{{ visitor.EntryDate | formatDate }}</span>
            <br />
            <span>{{ visitor.ExitDate | formatDate }}</span>
          </div>
        </div>
        <div class="md-layout">
          <div class="md-layout-item">
            <p class="summary-label">Visit Purpose</p>
            <span>{{ visitor.VisitPurpose }}</span>
          </div>
          <div class="md-layout-item">
            <p class="summary-label">Organisation</p>
            <span>{{ visitor.Organisation }}</span>
          </div>
        </div>
        <div class="md-layout">
          <div class="md-layout-item">
            <p class="summary-label">Point of Entry</p>
            <span>{{ visitor.VisitLocation }}</span>
          </div>
          <div class="md-layout-item">
            <p class="summary-label">Red Lights</p>
            <span>{{ visitor.RedLight === true ? "Yes" : "No" }}</span>
          </div>
        </div>
        <div class="md-layout">
          <div class="md-layout-item">
            <p class="summary-label">VIP Visit</p>
            <span>{{ visitor.VIPVisit === true ? "Yes" : "No" }}</span>
          </div>
          <div class="md-layout-item">
            <p class="summary-label">Visting Directorate</p>
            <span>{{
                visitor.VistingDirectorate === true ? "Yes" : "No"
            }}</span>
          </div>
        </div>
      </div>
    </el-dialog>
<!-- edit dialog -->
    <el-dialog :visible.sync="editVisitOpened" :width="'800px'" :close-on-click-modal="false">
        <visitors :config="config" :visit="editVisitObject" :open="editVisitOpened"/>
      </el-dialog>
  </div>
</template>

<script>
import sharepoint from "@/api/sharepoint";
import Visitors from "./Visitors.vue";

export default {
  name: "visitors-list",
  components: {
    Visitors,
  },
  data() {
    return {
      currentUser: _spPageContextInfo.userId,
      from: null,
      to: null,
      filters: {
        firstName: { value: null, query: "substringof('#', FirstName)" },
        lastName: { value: null, query: "substringof('#', LastName)" },
        dateFrom: { value: this.dateFilter(), query: "EntryDate ge datetime'#'" },
        dateTo: { value: this.dateFilter(7), query: "EntryDate le datetime'#'" },
        location: { value: null, query: "VisitLocation eq '#'" },
        briefing: { value: null, query: "Briefing eq '#'" },
        myVisitors: {
          value: null,
          query: "AuthorId eq " + _spPageContextInfo.userId,
        },
      },
      visitors: [],
      locations: [],
      briefings: [],
      query: null,
      defaultQuery: null,
      visitor: {},
      dialogOpened: false,
      config: null,
      editVisitOpened: false,
      editVisitObject: null
    };
  },
  async created() {
    this.from = this.dateFilter()
    this.to = this.dateFilter(7)
    this.defaultQuery = this.createBaseFilter(this.to, this.from);
    this.query = this.defaultQuery;
    this.briefings = this.createOptions(
      await sharepoint.getFieldValues(
        "Briefing",
        _spPageContextInfo.siteAbsoluteUrl
      )
    );
    this.locations = this.createOptions(
      await sharepoint.getFieldValues(
        "VisitLocation",
        _spPageContextInfo.siteAbsoluteUrl
      )
    );
    await this.fetchData();
    this.setConfiguration();
  },
  methods: {
    setConfiguration: function () {
      if (_configuration) {
        this.config = _configuration;
        this.tourSteps = JSON.parse(_configuration.TourSteps);
      } else setTimeout(this.setConfiguration, 500);
    },
    fetchData: async function () {
      const visitors = await sharepoint.getAllListItemsPnP(
        {
          listName: "Visitors",
          select: [
            "Id",
            "Title",
            "FirstName",
            "LastName",
            "VisitLocation",
            "VistingDirectorate",
            "Organisation",
            "EntryDate",
            "ExitDate",
            "Briefing",
            "PassNumber",
            "VisitPurpose",
            "VisitHistory",
            "RedLight",
            "InOrOut",
            "VIPVisit",
            "EscortingFirstName",
            "Author/Id",
            "Author/Title",
          ],
          expand: ["Author"],
          filter: this.query,
          orderBy: "EntryDate",
          ascending: true,
        },
        `${_spPageContextInfo.siteAbsoluteUrl}/securityportal`
      );

      this.visitors = _.orderBy(visitors, "EntryDate");
    },
    closeVisitors: function () {
      this.editVisitOpened = false;
    },
    editEligibilityCheck: function (visitor) {
      return !visitor.InOrOut
        && (visitor.PassNumber === "N/A" || !visitor.PassNumber)
        && (visitor.VisitHistory === "[]" || !visitor.VisitHistory)
    },
    getVisitorsByTitle: async function (title) {
      return await sharepoint.getAllListItemsPnP(
        {
          listName: "Visitors",
          filter: `Title eq '${title}'`
        },
        `${_spPageContextInfo.siteAbsoluteUrl}/securityportal`);
    },
    confirmDelete: async function (visitor) {

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
    showEdit: function (visitor) {
      this.editVisitOpened = true;
      this.editVisitObject = visitor;
    },
    showEditDelete: function (row) {
      let show = true;
      let visitorsWithinVisit = this.visitors.filter((v) => v.Title === row.Title);
      for (let visitor of visitorsWithinVisit) {
        if (
          visitor.Author.Id !== this.currentUser || // record not created by current user
          visitor.PassNumber !== "N/A" || // pass number assigned
          visitor.InOrOut || //visitor already checked in.
          visitor.VisitHistory && visitor.VisitHistory !== "[]" // visitor has history which means they may have previously been checked in then out again
        ) {
          show = false;
          break;
        }
      }
      return show;
    },
    createOptions(array) {
      let returnArray = [];
      for (const item of array) {
        returnArray.push({ value: item, label: item });
      }
      return returnArray;
    },
    createBaseFilter: function (to, from) {
      return `(EntryDate ge datetime'${from.toISOString()}' and EntryDate le datetime'${to.toISOString()}') or (ExitDate ge datetime'${from.toISOString()}' and ExitDate le datetime'${to.toISOString()}') or (EntryDate le datetime'${from.toISOString()}' and ExitDate gt datetime'${to.toISOString()}')`;
    },
    dateFilter: function (days) {
      var date = new Date();
      if (days) {
        date.setDate(date.getDate() + days);
      }
      date.setHours(0, 0, 0, 0);
      return date;
    },
    clear: function () {
      Object.keys(this.filters).forEach((prop) => {
        this.filters[prop].value = null;
      });
    },
    handleRowClick: function (val) {
      if (val) {
        this.visitor = val;
        this.dialogOpened = true;
      }
    },
    handleClose: function () {
      this.dialogOpened = false;
      this.$refs.visitorsTable.setCurrentRow(null);
    },
  },
  watch: {
    filters: {
      deep: true,
      handler() {
        var query = [];
        Object.keys(this.filters).forEach((prop) => {
          var filter = this.filters[prop];
          if (filter.value !== null) {
            var type = typeof filter.value;
            switch (type) {
              case "boolean":
                if (filter.value === true) {
                  query.push(filter.query);
                }
                break;
              case "string":
                if (filter.value.length > 0) {
                  query.push(filter.query.replace("#", filter.value));
                }
                break;
              case "object":
                if (prop === "dateFrom") {
                  filter.value.setHours(0, 0, 0, 0);
                  this.from = filter.value;

                } else if (prop === "dateTo") {
                  filter.value.setHours(23, 59, 59, 999);
                  this.to = filter.value;
                } else {
                  query.push(
                    filter.query.replace("#", filter.value.toISOString())
                  );
                }
                break;
            }
          }
        });
        this.query = query.length > 0 ? `(${this.createBaseFilter(this.to, this.from)}) and ${query.join(" and ")}` : this.createBaseFilter(this.to, this.from);

        // if there is no date filter, then add a filter to the query so it only returns items from today onwards
        if (this.query.indexOf("datetime") === -1) {
          this.query = `${this.query
            } and EntryDate ge  datetime'${this.from.toISOString()}'`;
        }

        this.fetchData(), 300;
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.summary-label {
  font-weight: 600;
}

.el-date-editor,
.el-select {
  width: 100%;
}

.selected-visitor {
  .md-layout-item {
    padding-bottom: 0.7rem;
  }
}

.buttons {
  display: flex;
  flex-direction: row;
}
</style>