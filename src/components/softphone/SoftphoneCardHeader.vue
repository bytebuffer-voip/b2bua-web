<template>
  <div class="softphone-card-header" :style="{ background: gradient }">
    <div class="header-decoration"></div>
    <div class="header-content">
      <div class="header-icon">
        <span class="material-icons">{{ icon }}</span>
      </div>
      <div class="header-text">
        <h3 class="header-title">{{ title }}</h3>
        <p class="header-subtitle">{{ subtitle }}</p>
      </div>
      <div class="header-actions" v-if="$slots.default">
        <slot/>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  icon: { type: String, default: 'phone_in_talk' },
  gradient: { type: String, default: 'linear-gradient(135deg, #18a058 0%, #0d7a45 100%)' },
});
</script>

<style scoped>
.softphone-card-header {
  padding: 20px 24px;
  position: relative;
  overflow: hidden;
}

.header-decoration {
  position: absolute;
  top: -30px;
  right: -30px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
}

.header-decoration::after {
  content: '';
  position: absolute;
  top: 20px;
  left: 20px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 14px;
  position: relative;
  z-index: 1;
}

.header-text { flex: 1; }

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.header-icon {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  flex-shrink: 0;
}

.header-icon .material-icons {
  color: #fff;
  font-size: 22px;
}

.header-title {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  letter-spacing: -0.3px;
}

.header-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  margin: 2px 0 0 0;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
</style>
