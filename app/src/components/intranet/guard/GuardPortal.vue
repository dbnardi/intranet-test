<template>
  <div class="guard-portal">
    <div class="md-layout">
      <div class="md-layout-item md-size-25">
        <div class="md-card page-section-card filters">
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
            <h3>Location</h3>
            <el-select clearable v-model="filters.visitLocation.value" multiple placeholder="Select...">
              <el-option v-for="(item, index) in locations" :key="index" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
            <h3>Date Range</h3>
            <div class="md-layout">
              <div class="md-layout-item">
                <el-date-picker v-model="filters.dateFrom.value" type="date" format="dd-MM-yyyy"
                  placeholder="Date From">
                </el-date-picker>
              </div>
              <div class="md-layout-item">
                <el-date-picker v-model="filters.dateTo.value" type="date" format="dd-MM-yyyy" placeholder="Date To">
                </el-date-picker>
              </div>
            </div>
            <div class="md-layout">
              <div class="md-layout-item">
                <el-checkbox v-model="todayOnly" @change="todayOnlyChange($event)">Today only</el-checkbox>
              </div>
              <div class="md-layout-item">
                <el-checkbox v-model="filters.inOnly.checked">In only</el-checkbox><br />
              </div>
              <div class="md-layout-item">
                <el-checkbox v-model="filters.noPass.checked">Pass Unassigned</el-checkbox><br />
              </div>
            </div>
            <h3>Briefing</h3>
            <el-select clearable v-model="filters.briefing.value" placeholder="Select...">
              <el-option v-for="(item, index) in briefings" :key="index" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
            <md-button class="md-primary" @click="clear()">Reset</md-button>
          </div>
        </div>
      </div>
      <div class="md-layout-item md-size-75">
        <div class="md-card page-section-card">
          <h3 class="card-category">Visitors</h3>
          <div class="md-card-content">
            <div>
              <download-excel class="el-button el-button--primary" :data="allResults" :fields="fields" type="csv"
                name="visitors.xls">
                Export to Excel
              </download-excel>
              <el-button style="margin-top: -6px" type="primary" @click.stop="newVisit()">New Visit
              </el-button>
              <!-- end visitors registration form modal -->
            </div>
            <div class="md-layout news-portal-container pb-20" style="flex-wrap: nowrap; cursor: pointer">
              <h4 v-if="visitors.length == 0">No visitors found.</h4>
              <el-table v-if="visitors.length != 0" ref="visitorsTable" :data="data" :span-method="colSpan"
                :row-class-name="rowClass" @row-click="handleRowClick">
                <el-table-column prop="FullName" label="Name" />
                <el-table-column prop="VisitLocation" label="Location" />
                <el-table-column prop="Organisation" label="Organisation" />
                <el-table-column prop="EntryDate" label="Entry Date/Time">
                  <template slot-scope="scope">
                    <div style="width: 180px; font-size: 13px">
                      {{ scope.row.EntryDate | standardDateFormat }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="RedLight" label="Red Lights">
                  <template slot-scope="scope" v-if="scope.row.RedLight !== undefined">
                    {{ scope.row.RedLight === true ? "Yes" : "No" }}
                  </template>
                </el-table-column>
                <el-table-column prop="Briefing" label="Briefing" />
                <el-table-column prop="PassNumber" label="Pass No." />
                <el-table-column label="Actions">
                  <template slot-scope="scope">
                    <div class="row-buttons" style="display: flex">
                      <div style="display:flex; flex-direction:column;">
                        <el-button v-if="
                          scope.row.AllIn ||
                          scope.row.AllOut === false ||
                          (!scope.row.GroupRow && scope.row.InOrOut)
                        " size="mini" type="success" @click.stop="checkIn(scope.row, false)">check-out</el-button>
                        <el-button v-if="
                          scope.row.AllOut ||
                          scope.row.AllIn === false ||
                          (!scope.row.GroupRow && !scope.row.InOrOut)
                        " size="mini" type="warning" @click.stop="checkIn(scope.row, true)">check-in</el-button>
                      </div>
                      <div style="margin-left: 5px">
                        <el-popover placement="top" width="160" trigger="manual" v-model="scope.row.showPopover">
                          <div class="popover-menu">
                            <p style="margin:0px">Actions</p>
                            <el-button v-if="scope.row.GroupRow" size="mini" type="primary" class="popover-button"
                              style="margin: 1rem 0 0 0" @click.stop="showEdit(scope.row)">
                              <i class="el-icon-edit"></i> Edit
                            </el-button>
                            <el-button v-if="scope.row.GroupRow" size="mini" type="primary" class="popover-button"
                              style="margin: 1rem 0 0 0" @click.stop="showEdit(scope.row, true)">
                              <i class="el-icon-document-copy"></i> Duplicate
                            </el-button>
                          </div>
                          <el-button v-if="scope.row.GroupRow" slot="reference"
                            @click.stop="scope.row.showPopover = !scope.row.showPopover" size="mini" type="info"
                            style="width: 40px">
                            <i class="el-icon-more"></i>
                          </el-button>
                        </el-popover>

                        <el-button v-if="!scope.row.GroupRow" size="mini" type="primary" style="width: 40px"
                          @click.stop="showHistory(scope.row)">
                          <i class="el-icon-time"></i>
                        </el-button>
                      </div>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-dialog :visible.sync="dialogOpened" :before-close="handleClose" :close-on-click-modal="false" :width="'500px'">
      <div class="selected-group">
        <h3>Visit Details</h3>
        <div class="md-layout">
          <div class="md-layout-item">
            <div class="summary-label">Escorting Officer</div>
            {{ `${selectedGroup.EscortingFirstName} (GAL: ${selectedGroup.GAL})` }}
          </div>
          <div class="md-layout-item">
            <div class="summary-label">Visit Date</div>
            {{ selectedGroup.EntryDate | formatDate }}
          </div>
        </div>
        <div class="md-layout">
          <div class="md-layout-item">
            <div class="summary-label">Visit Purpose</div>
            {{ selectedGroup.VisitPurpose }}
          </div>
          <div class="md-layout-item">
            <div class="summary-label">Exit Date</div>
            {{ selectedGroup.ExitDate | formatDate }}
          </div>
         
        </div>
        <div class="md-layout">
          <div class="md-layout-item">
            <div class="summary-label">Point of Entry</div>
            {{ selectedGroup.VisitLocation }}
          </div>
          <div class="md-layout-item">
            <div class="summary-label">Room/Office Location</div>
            {{ selectedGroup.RoomLocation }}
          </div>
        </div>
        <div class="md-layout">
          <div class="md-layout-item">
            <div class="summary-label">Red Lights</div>
            {{ selectedGroup.RedLight === true ? "Yes" : "No" }}
          </div>
          <div class="md-layout-item">
            <div class="summary-label">VIP Visit</div>
            {{ selectedGroup.VIPVisit === true ? "Yes" : "No" }}
          </div>
        </div>
        <div class="md-layout">
          <div class="md-layout-item">
              <div class="summary-label">Visiting Directorate</div>
              {{ selectedGroup.VistingDirectorate === true ? "Yes" : "No" }}
            </div>
        </div>
      </div>
      <div class="selected-visitors">
        <h3>Visitors</h3>
        <div class="md-layout">
          <div class="md-layout-item summary-label">Name</div>
          <div class="md-layout-item summary-label">Pass Number</div>
        </div>
        <div class="md-layout" v-for="(visitor, index) in selectedVisitors" :key="index">
          <div class="md-layout-item">
            {{ visitor.PersonTitle }} {{ visitor.FullName }}
            <div><small>DOB: {{visitor.DateOfBirth | standardDateNoTime}}</small></div>
            <div><small>Org: {{visitor.Organisation}}</small></div>
            <div><small>Briefing: {{visitor.Briefing}}</small></div>
          </div>
          <div class="md-layout-item">
            <el-input v-model="visitor.PassNumber"></el-input>
          </div>
        </div>
      </div>
      <div class="visit-detail-bottom-row">
        <div class="visit-detail-bottom-row-right">
          <el-button style="margin-top: 1rem" type="info" icon="el-icon-close" plain @click="handleClose">
            Cancel
          </el-button>
          <el-button style="margin-top: 1rem" type="success" icon="el-icon-check" plain @click="updatePasses">
            Save
          </el-button>
        </div>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="historyOpened" :width="'500px'" :close-on-click-modal="false">
      <h3>Check-in history</h3>
      <el-table v-if="selectedVisitor" ref="historyTable" :data="selectedVisitor.VisitHistory" max-height="350">
        <el-table-column prop="time" label="Date Time" width="190">
          <template slot-scope="scope">
            {{ scope.row.time | standardDateFormat }}
          </template>
        </el-table-column>
        <el-table-column prop="event" label="Type"> </el-table-column>
        <el-table-column label="">
          <template slot-scope="scope">
            <el-popconfirm title="Are you sure to delete this?" confirm-button-text="Yes" cancel-button-text="Cancel"
              @onConfirm="deleteHistory(scope.$index)">
              <el-button slot="reference" size="mini" type="danger">
                <i class="el-icon-delete"></i>
              </el-button>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <div class="new-history-section">
        <h4>Add new entry</h4>
        <div class="md-layout mb-10">
          <div class="md-layout-item">
            <el-date-picker v-if="editHistoryItem" v-model="editHistoryItem.time" type="datetime"
              placeholder="Select date and time">
            </el-date-picker>
          </div>
          <div class="md-layout-item">
            <el-select v-model="editHistoryItem.event" placeholder="Type">
              <el-option :label="'checked in'" :value="'checked in'"></el-option>
              <el-option :label="'checked out'" :value="'checked out'"></el-option>
            </el-select>
          </div>
        </div>
        <el-button type="primary" :disabled="!editHistoryItem.time || !editHistoryItem.event"
          @click.stop="addHistory()">
          Save
        </el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="visitOpened" :width="'800px'" :close-on-click-modal="false">
      <visitors :config="config" :guardMode="true" :visit="editVisitObject" :open="visitOpened"
        :duplicate="duplicateMode" />
    </el-dialog>
  </div>
</template>

<script>
import Vue from "vue";
import sharepoint from "@/api/sharepoint";
import Visitors from "./Visitors.vue";

export default {
  components: {
    Visitors,
  },
  data() {
    return {
      select: [
        "Id",
        "Title",
        "EscortingFirstName",
        "GAL",
        "FirstName",
        "LastName",
        "PersonTitle",
        "VisitPurpose",
        "VisitLocation",
        "RoomLocation",
        "InOrOut",
        "EntryDate",
        "ExitDate",
        "Briefing",
        "RedLight",
        "PassNumber",
        "VisitHistory",
        "Organisation",
        "DateOfBirth"
      ],
      fields: {
        Title: "PersonTitle",
        "First Name": "FirstName",
        "Last Name": "LastName",
        Briefing: "Briefing",
        Organisation: "Organisation",
        "Escorting Officer": "EscortingOfficer",
        "Visit Purpose": "VisitPurpose",
        "Red Light": "RedLight",
        "Point of Entry": "VisitLocation",
        "Entry Date": {
          field: "EntryDate",
          callback: (value) => {
            return Vue.filter("standardDateFormat")(value);
          },
        },
        "Is Visitor Check-In?": {
          field: "InOrOut",
          callback: (value) => {
            return value === true ? "Yes" : "No";
          },
        },
        "Pass Number": {
          field: "PassNumber",
          callback: (value) => {
            return value === "N/A" ? "" : value;
          },
        },
      },
      allResults: [],
      briefings: [],
      locations: [],
      visitors: [],
      selectedGroup: {},
      selectedVisitors: [],
      selectedVisitor: null,
      dialogOpened: false,
      historyOpened: false,
      visitOpened: false,
      todayOnly: false,
      editHistoryItem: {},
      filters: {
        firstName: { value: null, field: "FirstName", operator: "substringof" },
        lastName: { value: null, field: "LastName", operator: "substringof" },
        visitLocation: { value: null, field: "VisitLocation", operator: "eq" },
        dateFrom: {
          value: this.dateFilter(),
        },
        dateTo: {
          value: this.dateFilter(4),
        },
        briefing: { value: null, field: "Briefing", operator: "eq" },

        inOnly: { value: 1, field: "InOrOut", operator: "eq", checked: false },
        noPass: {
          value: `'N/A'`,
          field: "PassNumber",
          operator: "eq",
          checked: false,
        },
      },
      filter: null,
      polling: null,
      config: _configuration,
      editVisitObject: null,
      duplicateMode: false
    };
  },
  async created() {
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
    this.polling = setInterval(() => this.query(), +this.config.PollingInterval);
  },
  methods: {
    showEdit: function (visitor, duplicate = false) {
      visitor.showPopover = false;
      this.duplicateMode = duplicate;
      this.visitOpened = true;
      this.editVisitObject = visitor;
      this.editVisitObject.Title = visitor.Id;
    },
    newVisit: function () {
      this.editVisitObject = null;
      this.visitOpened = true;
    },
    fetchData: async function () {
      var from = new Date();
      from.setHours(0, 0, 0, 0);
      var to = new Date();
      to.setDate(to.getDate() + 4);
      this.filter = `(EntryDate ge datetime'${from.toISOString()}' and EntryDate le datetime'${to.toISOString()}') or (ExitDate ge datetime'${from.toISOString()}' and ExitDate le datetime'${to.toISOString()}') or (EntryDate le datetime'${from.toISOString()}' and ExitDate gt datetime'${to.toISOString()}')`;
      this.query();
    },
    createOptions(array) {
      let returnArray = [];
      for (const item of array) {
        returnArray.push({ value: item, label: item });
      }
      return returnArray;
    },
    checkIn: async function (row, val) {
      if (row.GroupRow) {
        this.visitors
          .filter(
            (visitor) => visitor.Title === row.Id && visitor.InOurOut != val
          )
          .forEach(async (visitor) => {
            visitor.InOrOut = val;
            var history = this.getHistory(visitor.VisitHistory);
            history.push({
              event: val === true ? "checked in" : "checked out",
              time: new Date(),
            });
            visitor.VisitHistory = JSON.stringify(history);
            await sharepoint.updateListItemPnP(
              "Visitors",
              visitor,
              visitor.Id,
              ["InOrOut", "VisitHistory"]
            );
          });
      } else {
        row.InOrOut = val;
        var history = this.getHistory(row.VisitHistory);
        history.push({
          event: val === true ? "checked in" : "checked out",
          time: new Date(),
        });
        row.VisitHistory = JSON.stringify(history);
        await sharepoint.updateListItemPnP("Visitors", row, row.Id, [
          "InOrOut",
          "VisitHistory",
        ]);
      }

      setTimeout(() => this.query(), 500);
    },
    todayOnlyChange: function (checked) {
      if (checked) {
        this.filters.dateFrom.value = this.dateFilter();
        this.filters.dateTo.value = this.dateFilter();
      } else {
        this.filters.dateFrom.value = this.dateFilter();
        this.filters.dateTo.value = this.dateFilter(4);
      }
    },
    updatePasses: async function () {
      for (let visitor of this.selectedVisitors) {
        if (visitor.PassNumber === "") {
          visitor.PassNumber = "N/A";
        }
        await sharepoint.updateListItemPnP("Visitors", visitor, visitor.Id, [
          "PassNumber",
        ]);
      }

      await this.query();
      this.dialogOpened = false;
      this.$refs.visitorsTable.setCurrentRow(null);

      this.$notify({
        title: "Visitors updated",
        message: "Pass Numbers for selected visitors have been updated",
        type: "success",
      });
    },
    handleRowClick: async function (val) {
      var selectedVisitors = [];
      // this function triggers again as part of setting the selection to null
      if (!val) {
        return;
      }

      if (val.GroupRow) {
        this.selectedGroup = val;
        selectedVisitors = this.visitors.filter(
          (visitor) => visitor.Title === val.Id
        );
        if (selectedVisitors.length > 0) {
          this.selectedGroup.ExitDate = selectedVisitors[0].ExitDate;
          this.selectedGroup.EscortingFirstName = selectedVisitors[0].EscortingFirstName;
          this.selectedGroup.GAL = selectedVisitors[0].GAL;
        }
      } else {
        this.selectedGroup = val;
        selectedVisitors.push(val);
      }

      this.selectedVisitors = _.cloneDeep(selectedVisitors).map((visitor) => {
        if (visitor.PassNumber === "N/A") {
          visitor.PassNumber = "";
        }
        return visitor;
      });

      this.dialogOpened = true;
    },
    query: async function () {
      this.allResults = (
        await sharepoint.getAllListItemsPnP({
          listName: "Visitors",
          select: this.select,
          filter: this.filter,
          orderBy: "EntryDate",
          ascending: true,
        })
      ).map((visitor) => {
        visitor.FullName = `${visitor.FirstName} ${visitor.LastName}`;
        return visitor;
      });

      this.processRecords(this.allResults);
    },
    clear: function () {
      Object.keys(this.filters).forEach((prop) => {
        if (this.filters[prop].checked) {
          this.filters[prop].checked = false;
        } else if (!"checked" in this.filters[prop]) {
          this.filters[prop].value = null;
        }
        if (prop === "dateFrom") {
          this.filters[prop].value = this.dateFilter();
        } else if (prop === "dateTo") {
          this.filters[prop].value = this.dateFilter(4);
        } else {
          this.filters[prop].value = null;
        }
      });
      this.todayOnly = false;

      this.fetchData();
    },
    handleClose: function () {
      this.dialogOpened = false;
      this.$refs.visitorsTable.setCurrentRow(null);
    },
    colSpan: function ({ row, column, rowIndex, columnIndex }) {
      if (row.GroupRow) {
        if (columnIndex === 0 || columnIndex === 7) {
          return [1, 7];
        }
        return [1, 0];
      }
      return [1, 1];
    },
    rowClass: function ({ row }) {
      if (row.GroupRow) {
        var groupVisitors = this.visitors.filter(
          (visitor) => visitor.Title === row.Id
        );
        var allIn = groupVisitors.filter(
          (visitor) => visitor.InOrOut === true
        ).length;

        var allOut = groupVisitors.filter(
          (visitor) => visitor.InOrOut === false && visitor.VisitHistory && visitor.VisitHistory !== '[]'
        ).length;
        
        // in-row: visitor is in (pale orange)
        // not-in-row: visitor has not checked in (pale blue)
        // out-row: visitor checked in and out (pale green)

        // To avoid creating yet another field - we're using the VisitHistory to check if a visitor has checked in and out
        // (can't have history without having checked in first)

        var allNotIn = groupVisitors.filter(
          (visitor) => visitor.InOrOut === false && (!visitor.VisitHistory || visitor.VisitHistory === '[]')
        ).length;
        
        return groupVisitors.length === allIn
          ? "group-header in-row"
          : groupVisitors.length === allOut
            ? "group-header out-row"
            : (groupVisitors.length === allNotIn ? "group-header not-in-row" : "group-header mix");
          
      } else {
        return row.InOrOut ? "in-row" : (row.VisitHistory && row.VisitHistory !== "[]" ? "out-row": "not-in-row");
      }
    },
    dateFilter: function (days) {
      var date = new Date();
      if (days) {
        date.setDate(date.getDate() + days);
      }
      date.setHours(0, 0, 0, 0);
      return date;
    },
    processRecords: function (results) {
      var data = [];
      var grouped = _.groupBy(results, "Title");
      Object.keys(grouped).forEach((id) => {
        var records = grouped[id];
        var group = {};
        group.GroupRow = true;
        group.Id = records[0].Title;
        group.FullName = `Escorting Officer: ${records[0].EscortingFirstName} (GAL: ${records[0].GAL}) - ${records.length} ${records.length > 1 ? "Visitors" : "Visitor"}`;
        group.EntryDate = records[0].EntryDate;
        group.VisitLocation = records[0].VisitLocation;
        group.RoomLocation = records[0].RoomLocation;
        group.VisitPurpose = records[0].VisitPurpose;
        group.RedLight = records[0].RedLight;
        group.VIPVisit = records[0].VIPVisit;
        group.VistingDirectorate = records[0].VistingDirectorate;
        group.showPopover = false;

        // this logic check if all the records under a group have the same status
        group.AllOut =
          records.length ===
          records.filter((record) => record.InOrOut === false).length;
        group.AllIn =
          records.length ===
          records.filter((record) => record.InOrOut === true).length;

        data.push(group);
        data.push(...records);
      });

      this.visitors = data;
    },
    beforeDestroy: function () {
      clearInterval(this.polling);
    },
    showHistory: function (row) {
      this.selectedVisitor = row;
      var history = this.getHistory(row.VisitHistory);
      this.selectedVisitor.VisitHistory = _.orderBy(history, "time", "desc");
      this.historyOpened = true;
    },
    deleteHistory: async function (index) {
      this.selectedVisitor.VisitHistory.splice(index, 1);
      var record = _.clone(this.selectedVisitor);
      record.VisitHistory = JSON.stringify(record.VisitHistory);
      await sharepoint.updateListItemPnP("Visitors", record, record.Id, [
        "VisitHistory",
      ]);
    },
    getHistory: function (history) {
      if (Array.isArray(history)) {
        return history;
      } else if (history && history.length > 0) {
        return JSON.parse(history);
      }

      return [];
    },
    addHistory: async function () {
      const val = _.clone(this.editHistoryItem);
      val.time = this.getLocalISOString(val.time);
      var history = _.orderBy(
        [...this.selectedVisitor.VisitHistory, val],
        "time",
        "desc"
      );
      
      this.selectedVisitor.VisitHistory = history;
      var record = _.clone(this.selectedVisitor);
      record.InOrOut = history[0].event === "checked in";
      record.VisitHistory = JSON.stringify(record.VisitHistory);
      await sharepoint.updateListItemPnP("Visitors", record, record.Id, [
        "VisitHistory",
        "InOrOut"
      ]);
      this.editHistoryItem = {};
      setTimeout(() => this.query(), 500);
    },
    getLocalISOString: function (date) {
      const offset = date.getTimezoneOffset();
      const offsetAbs = Math.abs(offset);
      const isoString = new Date(
        date.getTime() - offset * 60 * 1000
      ).toISOString();
      return `${isoString.slice(0, -1)}${offset > 0 ? "-" : "+"}${String(
        Math.floor(offsetAbs / 60)
      ).padStart(2, "0")}:${String(offsetAbs % 60).padStart(2, "0")}`;
    },
    createBaseFilter: function (to, from) {
      return `(EntryDate ge datetime'${from.toISOString()}' and EntryDate le datetime'${to.toISOString()}') or (ExitDate ge datetime'${from.toISOString()}' and ExitDate le datetime'${to.toISOString()}') or (EntryDate le datetime'${from.toISOString()}' and ExitDate gt datetime'${to.toISOString()}')`;
    },
    closeVisitors: function () {
      this.visitOpened = false;
      this.query();
    },
  },
  watch: {
    filters: {
      deep: true,
      handler() {
        var query = [];
        var from = new Date();
        from.setHours(0, 0, 0, 0);
        var to = new Date();
        to.setDate(to.getDate() + 4);
        Object.keys(this.filters).forEach((prop) => {
          var filter = this.filters[prop];
          if (filter.checked === undefined && filter.value) {
            if (Array.isArray(filter.value) && filter.value.length > 0) {
              let querystring = ``
              for (let index in filter.value) {
                let filterValue = filter.value[index]
                if (index == 0) {
                  querystring += `(${filter.field} eq '${filterValue}'`
                } else {
                  querystring += ` or ${filter.field} eq '${filterValue}'`
                }

                if (index == filter.value.length - 1) { //last one
                  querystring += ")"
                }

              }
              query.push(querystring);
            }
            else if (typeof filter.value === "object") {
              if (prop === "dateFrom") {
                filter.value.setHours(0, 0, 0, 0);
                from = filter.value;
              } else if (prop === "dateTo") {
                filter.value.setHours(23, 59, 59, 999);
                to = filter.value;
              }
            } else if (filter.operator === "substringof") {
              query.push(`substringof('${filter.value}', ${filter.field})`)
            }
            else if (prop !== "dateFrom" && prop !== "dateTo") {
              query.push(
                `${filter.field} ${filter.operator} '${filter.value}'`
              );
            }
          } else if (filter.checked === true) {
            query.push(`${filter.field} ${filter.operator} ${filter.value}`);
          }
        });
        this.filter = this.createBaseFilter(to, from);
        if (query.length > 0) {
          this.filter = `(${this.filter}) and ${query.join(" and ")}`;
        }
        this.query();
      },
    },
  },
  computed: {
    data() {
      return this.visitors;
    },
  },
};
</script>
<style scoped>
.visit-detail-bottom-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.popover-menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0px;
}

.popover-button {
  width: 90px;
}

</style>