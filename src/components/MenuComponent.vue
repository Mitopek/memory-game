<script setup lang="ts">
import ButtonComponent from "./ButtonComponent.vue";
import OptionSelector from "./OptionSelector.vue";
import {$ref} from "@vue-macros/reactivity-transform/macros";
import {LevelType} from "../enum/LevelType.ts";
import type {IGameHistory} from "../types/IGameHistory.ts";
import HistoryPanelComponent from "./HistoryPanelComponent.vue";

interface Props {
  historyItems: IGameHistory[]
}

interface Emits {
  (e: 'start', level: LevelType): void
}

const emit = defineEmits<Emits>();
const props = defineProps<Props>();

const levels = [LevelType.Easy, LevelType.Medium, LevelType.Hard];
const chosenLevel = $ref(levels[0]);
</script>

<template>
  <div class="menu-component">
    <div class="main-container">
      <div class="left-panel">
        <h2>Memory Game</h2>
        <div class="level-select-container">
          Choose level:
          <OptionSelector :values="levels" v-model="chosenLevel"/>
        </div>
        <div class="bottom-panel">
          <ButtonComponent @click="emit('start', chosenLevel)">Start</ButtonComponent>
        </div>
      </div>
      <HistoryPanelComponent :historyItems="props.historyItems"/>
    </div>
  </div>
</template>

<style scoped>
.menu-component{
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 400px;
  background-color: #363636;
  border-radius: 10px;
}

.bottom-panel{
  display: flex;
  margin-top: 20px;
  justify-content: center;
  align-items: flex-end;
}

.left-panel{
  padding: 20px;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: 8px;
  width: 300px;
}

.main-container{
  display: grid;
  height: 100%;
  grid-template-columns: 1fr 200px;
  overflow: hidden;
}

.level-select-container{
  display: flex;
  gap: 8px;
  align-items: center;
  flex-direction: column;
}

@media (max-width: 768px) {
  .main-container{
    grid-template-columns: 1fr;
  }
}
</style>