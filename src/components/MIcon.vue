<script setup>

const props = defineProps({
  iconName: String,
  size: {
    type: Number,
    default: 14
  }
})
</script>

<template>
  <span
      class="material-icons"
      :style="{ minWidth: props.size + 'px' }"
      :class="'s-icon-'+props.size"
  >{{props.iconName}}</span>
</template>
