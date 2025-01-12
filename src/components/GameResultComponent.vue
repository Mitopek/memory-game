<script setup lang="ts">
import ButtonComponent from "./ButtonComponent.vue";
import GameInfoContainer from "./GameInfoContainer.vue";
import {onMounted} from "vue";

interface Props {
  time: string
  tryCount: number
}

interface Emit {
  (e: 'restart'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const endSound = new Audio('sounds/levelcomplete.wav')

onMounted(() => {
  endSound.play()
})
</script>

<template>
  <div class="game-result-container">
    <img class="image" src="https://i.ibb.co/nkBCxGS/png-transparent-computer-icons-trophy-award-prize-prize-tableware-sprite.png" alt="trophy"/>
    <div class="main-text">
      Congratulations! You won!
    </div>
    <GameInfoContainer :time="props.time" :tryCount="props.tryCount"/>
    <div class="button-wrapper">
      <ButtonComponent @click="emit('restart')">Back to menu</ButtonComponent>
    </div>
  </div>
</template>

<style scoped>
.image {
  width: 100%;
  max-width: 400px;
}

.main-text {
  font-size: 2em;
  font-weight: bold;
  text-align: center;
  color: green;
}

.game-info-container{
  display: flex;
  gap: 1em;
}

.button-wrapper{
  display: flex;
  justify-content: center;
  margin-top: 1em;
}


</style>