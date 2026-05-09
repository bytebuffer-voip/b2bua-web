<script setup>

const props = defineProps({
  link: String,
  size: { type: Number, default: 46 },
  name: { type: String, default: '' },
  textSize: { type: Number, default: 24 }
})

const getAvatarText = (name) => {
  if (!name) return '';
  return name.charAt(0).toUpperCase();
}
</script>

<template>
  <n-avatar class="avatar-border" v-if="props.link" :src="props.link" round :size="props.size"></n-avatar>
  <n-avatar class="avatar-border" v-else round :size="props.size">
    <span :style="'font-size: ' + props.textSize + 'px'">{{getAvatarText(props.name)}}</span>
  </n-avatar>
</template>

<style scoped>
.avatar-border{ border: 2px solid var(--color-border); }
</style>
