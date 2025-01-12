<script setup lang="ts">
import type {IGameHistory} from "../types/IGameHistory.ts";
import {TimeService} from "../services/TimeService.ts";

interface Props {
  historyItems: IGameHistory[]
}

const props = defineProps<Props>();

const timeService = new TimeService()
</script>

<template>
  <div class="history-panel">
    History:
    <div class="history-items">
      <div v-for="historyItem in props.historyItems" :key="historyItem.date" class="history-item">
        <div class="history-item-info">
          <div>{{timeService.getFormattedDateTextFromIsoString(historyItem.date)}}</div>
          <div class="line"/>
          <div><span class="label">Level:</span> {{historyItem.levelType}}</div>
          <div><span class="label">Total time:</span> {{historyItem.timeText}}</div>
          <div><span class="label">Try count:</span> {{historyItem.tryCount}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.history-panel{
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  background-color: #414141;
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;
}

.label{
  font-weight: bold;
}

.history-item-info{
  display: grid;
  grid-template-rows: 1fr auto 1fr 1fr 1fr;
  justify-items: flex-start;
  align-items: center;
  gap: 2px;
}

.history-items{
  display: grid;
  gap: 16px;
  overflow-y: scroll;
  max-height: 100%;
  min-height: 0;
}

.line{
  height: 1px;
  background-color: #7e7e7e;
  width: 100%;
  margin: 2px 0;
}

.history-item{
  display: grid;
  gap: 8px;
  padding: 8px;
  background-color: #4d4d4d;
  border-radius: 5px;
}

</style>