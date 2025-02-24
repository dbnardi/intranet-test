<template>
  <div>
    <div class="md-card md-card-pricing home-rollup-card md-layout-item fixed-height">
      <h3 class="card-category">Social</h3>
      <div class="md-card-content">
        <ul>
          <div 
            v-for="(item, index) in items.slice(0,2)"
            :key="index"
            @click="clickNotice(item.url)"
          >
            <announcement-item
              :title="item.Title"
              :content="item.DFATDescription"
              :date="new Date(item.Modified)"
              :url="item.url"
            />
          </div>
        </ul>
      </div>
      <div class="md-card-actions md-alignment-right">
        <div class="ml-auto">
          <a href="/news?type=Social" class="md-button md-simple view-more"  target="_blank">
                View more
                <i class="md-icon md-icon-font md-theme-default">arrow_forward</i>
          </a>
        </div>
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


