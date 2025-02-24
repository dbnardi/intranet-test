<template>
  <div class="container">
    <div class="input-container">
      <md-icon>account_box</md-icon>
      <md-autocomplete
        ref="searchBox"
        :md-options="users"
        :disabled="disabled"
        v-model="searchTerm"
        @md-selected="selectUser"
        @md-changed="changed"
        :class="{ 'md-invalid': invalid }"
      >
        <label>{{ label }}{{requiredAsterisk}}</label>
        <template slot="md-autocomplete-item" slot-scope="{ item, term }">
          <md-highlight-text :md-term="term">{{
            item.Title
          }}</md-highlight-text>
        </template>
      </md-autocomplete>
    </div>
    <span class="md-error">{{ errors[0] }}</span>
    <div v-if="multi" class="chip-container">
      <div class="chip-content" v-for="user in selectedUsers" :key="user.Id">
        <div class="avatar-container md-elevation-5">
          <img
            v-if="getPictureUrl(user)"
            class="avatar"
            :src="getPictureUrl(user)"
          />
          <md-icon v-else>account_box</md-icon>
        </div>
        <md-chip
          @md-delete="deleteUser(user)"
          class="md-primary"
          :md-duplicated="duplicateChip === user.Id"
          :md-deletable="!disabled"
          :md-clickable="!disabled"
        >
          <span class="user-label">{{ user.Title }}</span>
        </md-chip>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "PeoplePicker",
  props: {
    label: {},
    value: {},
    errors: {},
    disabled: { type: Boolean, default: false },
    invalid: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    defaultCurrentUser: { type: Boolean, default: false },
    multi: { type: Boolean, default: false }
  },
  data: () => {
    return {
      selectedUsers: [],
      duplicateChip: null
    };
  },
  created: function() {
    this.$store.dispatch("fetchUsers");
  },
  mounted: function() {
    this.selectedUsers = this.value ? this.value : [];
  },
  methods: {
    ...mapActions(["fetchUserPictureUrl"]),
    getPictureUrl(user) {
      if (user.properties !== undefined) {
        return user.properties.PictureUrl;
      } else {
        this.fetchUserPictureUrl(user);
      }
    },
    selectUser(u) {
      if (u) {
        if (this.multi) {
          if (this.selectedUsers.some(user => user.Id === u.Id)) {
            this.duplicateChip = u.Id;
          } else {
            this.selectedUsers = [...this.selectedUsers, u];
            this.duplicateChip = null;
          }
          this.$emit("input", this.selectedUsers);
          this.$refs.searchBox.searchTerm = "";
        } else {
          this.selectedUsers = [u];
          this.$emit("input", u);
        }
      }
    },
    changed(value) {
      if (!this.multi && !value) {
        this.selectedUsers = [];
        this.$emit("input", "");
      }
    },
    deleteUser(user) {
      const index = this.selectedUsers.indexOf(user);
      const tempArr = [...this.selectedUsers];
      tempArr.splice(index, 1);
      this.selectedUsers = tempArr;
      this.$emit("input", this.selectedUsers);
    }
  },
  computed: {
    ...mapGetters(["siteUsers", "getUserPictureUrlById", "currentUser"]),
    requiredAsterisk(){
      return this.required? "*" : "";
    },
    searchTerm: {
      get() {
        if (!this.multi) {
          if (this.value) {
            return this.value.Title;
          } else {
            if (this.defaultCurrentUser) {
              this.selectUser(this.currentUser);
              return this.currentUser.Title;
            }
          }
        }

        return "";
      },
      set(newSearchTerm) {
        return newSearchTerm;
      }
    },
    users() {
      const users = this.siteUsers;

      // if (!this.includeGroups) {
      //   users = users.filter((i) => i.UserId);
      // }
      // if (this.containsEmailOnly) {
      //   users = users.filter((i) => i.Email);
      // }
      // return [users[0].DisplayName];
      return users;
    }
  }
};
</script>
<style lang="scss">
.md-menu-content {
  z-index: 100 !important;
}
span.md-highlight-text-match {
  color: #00966c !important;
  padding: 0px !important;
}
.md-ripple {
  display: flex;
  flex-direction: row;
}
</style>

<style lang="scss" scoped>
@import "@/assets/scss/material-kit/colors";

.md-error {
  font-size: 0.75rem;
  color: #ff1744;
}

.md-duplicated {
  animation-name: shake;
  animation-duration: 0.5s;
}

@keyframes shake {
  0% {
    transform: translate(15px);
  }
  20% {
    transform: translate(-15px);
  }
  40% {
    transform: translate(7px);
  }
  60% {
    transform: translate(-7px);
  }
  80% {
    transform: translate(3px);
  }
  100% {
    transform: translate(0px);
  }
}

.container {
  padding: 0px;
  align-items: center;
  flex-direction: column;
  align-items: flex-start;
  // flex-direction:row-reverse !important;
}
.container > .md-icon {
  margin: 0 10px 0 0;
}
.input-container {
  display: flex;
  flex-direction: row;
  width: 100%;
}
.md-autocomplete {
  margin-bottom: 0px;
}
.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}
.avatar-container {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  text-align: center;
  vertical-align: middle;
  margin-right: -25px;
  margin-top: 5px;
  z-index: 10;
}

.list-avatar-container {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 5px;
  vertical-align: middle;
  z-index: 10;
}
.chip-content {
  display: flex;
  flex-direction: row;
  margin-right: 5px;
}
.chip-container {
  display: flex;
  flex-direction: row;
}
.user-label {
  padding-left: 25px;
}
</style>
