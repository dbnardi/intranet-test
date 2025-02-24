<template>
  <div class="md-card md-card-pricing home-rollup-card exec-messages md-layout-item">
    <h3 class="card-category">{{config.ExecMessagesTitle || 'Executive Messages'}}</h3>
    <div class="md-card-content">
      <ul>
        <div 
          v-for="(item, index) in items.slice(0,3)"
          :key="index"
          @click="clickNotice(item.url)"
        >
          <announcement-item
            :title="item.Title"
            :content="item.DFATDescription"
            :date="new Date(item.Created)"
            :url="item.url"
          />
        </div>
      </ul>
    </div>
    <div class="md-card-actions md-alignment-right">
      <div class="ml-auto">
        <a href="/news?type=Exec" class="md-button md-simple view-more"  target="_blank">
              View more
              <i class="md-icon md-icon-font md-theme-default">arrow_forward</i>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import AnnouncementItem from '@/components/Common/AnnouncementItem'
export default {
  components: {
    AnnouncementItem
  },
  props: {
    items: Array,
    config: Object
  },
  data() {
    return {};
  },
  methods: {
    clickNotice(url) {
      window.location.href = url;
    }
  }
};
</script>


