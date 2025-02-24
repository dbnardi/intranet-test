<template>
  <div class="visitors-form">
    <div class="visitors-form">
      <!-- Visitor Form: Start -->
      <el-form :model="visitorForm" :rules="visitorFormRules" ref="visitorForm">
        <div class="md-layout">
          <div class="md-layout-item">
            <div><label>Title</label></div>
            <el-form-item prop="PersonTitle">
              <el-input v-model="visitorForm.PersonTitle"></el-input>
            </el-form-item>
          </div>
          <div class="md-layout-item">
            <label>* First Name</label>
            <el-form-item prop="FirstName">
              <el-input v-model="visitorForm.FirstName"></el-input>
            </el-form-item>
          </div>
        </div>
        <div class="md-layout">
          <div class="md-layout-item">
            <label>* Last Name</label>
            <el-form-item prop="LastName">
              <el-input v-model="visitorForm.LastName"></el-input>
            </el-form-item>
          </div>
          <div class="md-layout-item">
            <label>* D.O.B</label>
            <el-form-item prop="DateOfBirth">
              <el-date-picker v-model="visitorForm.DateOfBirth" type="date" format="dd/MM/yyyy"
                placeholder="Pick a date">
              </el-date-picker>
            </el-form-item>
          </div>
        </div>
        <div class="md-layout">
          <div class="md-layout-item">
            <div><label>* Country</label></div>
            <el-form-item prop="Country">
              <el-select v-model="visitorForm.Country" filterable placeholder="Select">
                <el-option v-for="(item, index) in countries" :key="index" :label="item.name" :value="item.name">
                </el-option>
              </el-select>
            </el-form-item>
          </div>
          <div class="md-layout-item">
            <label>* Organisation</label>
            <el-form-item prop="Organisation">
              <el-input v-model="visitorForm.Organisation"></el-input>
            </el-form-item>
          </div>
        </div>
        <div class="md-layout">
          <div class="md-layout-item">
            <div><label>* Briefing</label></div>
            <el-form-item prop="Briefing">
              <el-select v-model="visitorForm.Briefing" placeholder="Select">
                <el-option v-for="(item, index) in briefings" :key="index" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </div>
        </div>
        <div class="md-layout">
          <div class="md-layout-item">
            <el-form-item prop="ForeignNational">
              <el-checkbox v-model="visitorForm.ForeignNational">Foreign National</el-checkbox>
            </el-form-item>
          </div>
          <div class="md-layout-item">
            <el-form-item prop="FiveEyes">
              <el-checkbox v-model="visitorForm.FiveEyes">Five Eyes</el-checkbox>
            </el-form-item>
          </div>
        </div>
        <div>
          <el-form-item prop="CovidAgreement">
            <div style="display: flex">
              <el-checkbox v-model="visitorForm.CovidAgreement"></el-checkbox>
              <div style="padding-left: 3px; word-break: break-word" @click="covidLabelClicked">
                <span>As escorting officer, I confirm I will undertake the </span><a class="covid-links"
                  :underline="false" :href="covidQuestionaireURL" target="_blank">COVID-19 Pre-Screening
                  Questions</a><span> with the visitor PRIOR to their arrival as per </span><a class="covid-links"
                  :href="covidAdviceURL" :underline="false" target="_blank">WHS Advice Notice: COVID-19 & External
                  Visitors</a>
              </div>
            </div>
          </el-form-item>
        </div>
        <el-button style="margin-top: 1rem" type="success" :icon="editing ? 'el-icon-refresh' : 'el-icon-plus'" plain @click="addVisitor">
          {{ editing ? "Update" : "Add" }}
        </el-button>
      </el-form>
      <!-- Visitor Form: End -->

      <div class="no-visitors-error" v-if="showOneVisitorError && visitors.length === 0">
        At least 1 visitor is required
      </div>
      <div class="current-visitors">
        <el-card v-for="(visitor, index) in visitors" :key="index">
          <span>
            {{ visitor.PersonTitle }} {{ visitor.FirstName }}
            {{ visitor.LastName }}, {{ visitor.Briefing }}
          </span>
          <el-button type="warning" icon="el-icon-edit" @click="editVisitor(visitor)">
          </el-button>
          <el-button type="danger" v-if="!visitor.TO_DELETE" icon="el-icon-delete" @click="deleteVisitor(index)">
          </el-button>
          <el-button type="success" v-if="visitor.TO_DELETE" icon="el-icon-refresh-left" @click="undeleteVisitor(visitor)">
          </el-button>
        </el-card>
      </div>

      <!-- Action Buttons: Start -->
      <div class="action-buttons">
        <el-button type="info" icon="el-icon-close" plain @click="cancel">
          Cancel
        </el-button>
        <el-button type="primary" icon="el-icon-arrow-left" plain @click="prev">
          Prev
        </el-button>
        <el-button type="primary" icon="el-icon-arrow-right" plain @click="submit">
          Next
        </el-button>
      </div>
      <!-- Action Buttons: End -->
    </div>
  </div>
</template>

<script>
import sharepoint from "@/api/sharepoint";
import Vue from "vue";
import countries from "../../../assets/json/countries.json";

export default {
  name: "visitor-form",
  props: {
    config: Object,
    visitors: [],
    editMode: false
  },
  data() {
    return {
      titles: ["Dr.", "Ms.", "Mrs.", "Mr."],
      countries: countries,
      briefings: [],
      visitorForm: {
        Id: null,
        Guid: null,
        PersonTitle: "",
        FirstName: "",
        LastName: "",
        DateOfBirth: "",
        Organisation: "",
        Country: "Australia",
        Briefing: "",
        CovidAgreement: false,
        ForeignNational: false,
        FiveEyes: false,
        PassNumber: "",
        InOrOut: false,
      },
      visitorFormRules: {
        PersonTitle: { required: false },
        FirstName: { required: true, message: "First Name is required" },
        LastName: { required: true, message: "Last Name is required" },
        DateOfBirth: { required: true, message: "DOB is required" },
        Organisation: { required: true, message: "Organisation is required" },
        Briefing: { required: true, message: "Briefing is required" },
        Country: { required: true, message: "Country is required" },
        CovidAgreement: { type: "enum", enum: ["true"], message: "Must agree to Covid Terms.", transform: value => value ? value.toString() : "false" },
      },
      editing: false,
      showOneVisitorError: false,
      covidQuestionaireURL: sharepoint.getRootDocumentURL(
        "covid-19/screening.docx"
      ),
      covidAdviceURL: sharepoint.getRootDocumentURL(
        "covid-19/Covid-advice.pdf"
      ),
    };
  },
  async created() {
    await this.fetchData();
  },
  methods: {
    fetchData: async function () {
      this.briefings = this.createOptions(
        await sharepoint.getFieldValues(
          "Briefing",
          _spPageContextInfo.siteAbsoluteUrl
        )
      );
    },
    addVisitor: function () {
      this.$refs["visitorForm"].validate((valid) => {
        if (valid) {
          if (this.visitorForm.Id || this.visitorForm.Guid) {
            var visitor = this.visitors.find(
              (visitor) => (this.visitorForm.Guid && visitor.Guid === this.visitorForm.Guid) 
              || (this.visitorForm.Id && visitor.Id === this.visitorForm.Id)
            );
            Object.keys(this.visitorForm).forEach((prop) => {
              visitor[prop] = this.visitorForm[prop];
            });
          } else {
            this.visitorForm.Guid = this.$uuid.v4();
            this.visitors.push({ ...this.visitorForm });
          }

          this.editing = false;
          this.visitorForm.Id = null;
          this.visitorForm.Guid = null;
          this.$refs["visitorForm"].resetFields();
        }
      });
    },
    editVisitor: function (visitor) {
      this.editing = true;
      Object.keys(this.visitorForm).forEach((prop) => {
        this.visitorForm[prop] = visitor[prop];
      });
    },
    deleteVisitor: function (index) {
      const visitor = this.visitors[index];
      if (this.visitorForm.Id === visitor.Id) {
        this.editing = false;
        this.visitorForm.Id = null;
        this.$refs["visitorForm"].resetFields();
      }
      if (this.editMode) {
        const visitorToUpdate = this.visitors[index]
        visitorToUpdate['TO_DELETE'] = true;
        this.visitors.splice(index, 1, visitorToUpdate);

      } else {
        this.visitors.splice(index, 1);
      }
    },
    undeleteVisitor: function(visitor){
      visitor['TO_DELETE'] = false;
    },
    submit: async function () {
      if (this.visitors.length > 0) {
        // Remove the Guid attribute because it doesn't existing in the list item
        const visitors = this.visitors.map((visitor) => {
          delete visitor.Guid;
          return visitor
        });
        this.$parent.review(visitors);
      } else {
        this.showOneVisitorError = true;
      }
    },
    cancel: function () {
      this.visitors = [];
      this.$refs["visitorForm"].resetFields();
      this.$parent.cancel();
    },
    prev: function () {
      this.$parent.prev();
    },
    createOptions: function (array) {
      let returnArray = [];
      for (const item of array) {
        returnArray.push({ value: item, label: item });
      }
      return returnArray;
    },
    covidLabelClicked: function () {
      this.visitorForm.CovidAgreement = !this.visitorForm.CovidAgreement; //toggle
    },
  },

};
</script>
