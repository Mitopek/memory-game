<script setup lang="ts">
interface Props {
  time: string,
  tryCount: number
}

const props = defineProps<Props>()
</script>

<template>
  <div class="game-info-container">
    <div class="game-info-item">
      <span class="label">Time:</span>
      <span class="value">{{ props.time }}</span>
    </div>
    <div class="game-info-item">
      <span class="label">Try count:</span>
      <span class="value">{{ props.tryCount }}</span>
    </div>
  </div>
</template>

<style scoped>
.game-info-container {
  display: flex;
  justify-content: space-between;
  gap: 1em;
}

.game-info-item {
  display: flex;
  gap: 0.5em;
  font-size: 1.5em;
}

.lavel {
  font-weight: bold;
}

</style>