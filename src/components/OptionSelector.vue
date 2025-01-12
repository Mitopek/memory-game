<script setup lang="ts">
interface Props {
  values: string[]
  modelValue: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

</script>

<template>
  <div class="option-selector">
    <div v-for="value in props.values" :key="value" :class="['option-item', {'is-selected': value === props.modelValue}]" @click="emit('update:modelValue', value)">
      {{ value }}
    </div>
  </div>
</template>

<style scoped lang="scss">
.option-selector {
  display: flex;
  gap: 4px;
  height: 40px;
}

.option-item {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 0 8px;
  background-color: #656565;
  color: white;
  border-radius: 10px;
  cursor: pointer;
  box-sizing: border-box;
  border: 2px solid transparent;
  &.is-selected {
    border: 2px solid #646cff;
  }
}
</style>