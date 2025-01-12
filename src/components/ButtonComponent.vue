<script setup lang="ts">
</script>

<template>
  <div class="button-component">
    <slot/>
  </div>
</template>

<style scoped>
.button-component {
  display: flex;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  background-color: #646cff;
  color: white;
  height: 36px;
  box-sizing: border-box;
  align-items: center;
  font-weight: bold;
}
</style>