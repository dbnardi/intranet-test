<template>
  <md-card
    class="md-card-pricing"
    :class="{
      [cardColor]: true,
      'md-card-plain': cardPlain
    }"
    :style="bgFullCards(cardImage)"
  >
    <md-card-content v-if="$slots.cardContent">
      <slot name="cardCategory"></slot>
      <slot name="cardContent"></slot>
    </md-card-content>
    <md-card-actions v-if="$slots.cardAction">
      <slot name="cardAction"></slot>
    </md-card-actions>
  </md-card>
</template>

<script>
export default {
  name: "pricing-card",
  props: {
    cardPlain: Boolean,
    cardBg: String,
    cardImage: String
  },
  computed: {
    cardColor() {
      return this.cardBg ? `bg-${this.cardBg}` : "";
    }
  },
  methods: {
    bgFullCards(cardImage) {
      if (this.cardImage) {
        return {
          backgroundImage: `url(${cardImage})`
        };
      }
    }
  }
};
</script>


