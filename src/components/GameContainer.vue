<script setup lang="ts">
import MenuComponent from "./MenuComponent.vue";
import {$computed, $ref, $} from "@vue-macros/reactivity-transform/macros";
import {LevelType} from "../enum/LevelType.ts";
import GameCanvas from "./GameCanvas.vue";
import GameInfoContainer from "./GameInfoContainer.vue";
import {TimeService} from "../services/TimeService.ts";
import {useNow} from "@vueuse/core";
import GameResultComponent from "./GameResultComponent.vue";
import ButtonComponent from "./ButtonComponent.vue";
import type {IGameHistory} from "../types/IGameHistory.ts";
import {onMounted} from "vue";

let isMenuOpen = $ref(true)
let isGameEnd = $ref(false)
let levelType = $ref<LevelType>(LevelType.Easy)

let timeStart = $ref(0)
let timeEnd = $ref(0)
let tryCount = $ref(0)
let historyItems = $ref<IGameHistory[]>([])

onMounted(() => {
  const existingHistory = localStorage.getItem("gameHistory")
  historyItems = existingHistory ? JSON.parse(existingHistory) : []
  console.log(historyItems)
})

const now = $(useNow({interval: 1000}))

const onGameStart = (level: LevelType) => {
  levelType = level;
  isMenuOpen = false;
  tryCount = 0;
  timeStart = now.getTime();
}

const currentGameTime = $computed(() => {
  const duration = now.getTime() - timeStart
  const minutes = Math.floor((duration / 1000 / 60) % 60)
  const seconds = Math.floor((duration / 1000) % 60)
  const timeService = new TimeService()
  return `${timeService.formatTime(minutes)}:${timeService.formatTime(seconds)}`
})

const endTimeDuration = $computed(() => {
  const duration = timeEnd - timeStart
  const minutes = Math.floor((duration / 1000 / 60) % 60)
  const seconds = Math.floor((duration / 1000) % 60)
  const timeService = new TimeService()
  return `${timeService.formatTime(minutes)}:${timeService.formatTime(seconds)}`
})

const onGameWin = () => {
  timeEnd = now.getTime()
  isGameEnd = true
  const historyItem: IGameHistory = {
    date: new Date().toISOString(),
    timeText: endTimeDuration,
    tryCount: tryCount,
    levelType: levelType
  }
  historyItems.push(historyItem);
  localStorage.setItem("gameHistory", JSON.stringify(historyItems));
}

const onGameRestart = () => {
  isGameEnd = false
  isMenuOpen = true
}

</script>

<template>
  <div class="game-container">
    <MenuComponent v-if="isMenuOpen" @start="onGameStart" :historyItems="historyItems"/>
    <div v-else-if="!isGameEnd" class="game-content">
      <GameInfoContainer :time="currentGameTime" :tryCount="tryCount"/>
      <GameCanvas :level="levelType" v-model:tryCount="tryCount" @win="onGameWin"/>
      <div class="button-wrapper">
        <ButtonComponent @click="onGameRestart">Back to menu</ButtonComponent>
      </div>
    </div>
    <GameResultComponent :time="endTimeDuration" :tryCount="tryCount" v-else @restart="onGameRestart"/>
  </div>
</template>

<style scoped>
.game-content {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

.button-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 1em;
}

</style>