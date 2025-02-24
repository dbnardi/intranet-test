<template>
  <li :class="{'alert-message': alert, 'foreign-message': foreign, 'pointer':true}">
    <time class="time-icon">
      <span class="bold">{{date | dayOfMonth}}</span>
      <p>{{date | month}}</p>
    </time>
    <div class="content">
      <a class="bold" :href="url"><span>{{title}}</span></a>
      <p v-if="title.length < 50">{{content | charLimit}}</p>
    </div>
  </li>
</template>

<script>
export default {
  name: "AnnouncementItem",
  props: {
    title: String,
    alert: Boolean,
    foreign: Boolean,
    date: String,
    content: String,
    url: String
  }
};
</script>

<style lang="scss" scoped>
  
  .content p{
    margin-top: 0 !important;
  }
  .visibility {
    position: absolute;
    right: 25px;
    opacity: 0.8;
    font-size: 0.8rem;
  }
</style>




