<script setup lang="ts">
import {$computed, $ref, $, $$} from "@vue-macros/reactivity-transform/macros";
import {nextTick, onMounted, watch} from "vue";
import type {LevelType} from "../enum/LevelType.ts";
import {GameSizeByLevelTypeMap} from "../maps/GameSizeByLevelTypeMap.ts";
import {useEventListener, useWindowSize, watchDebounced} from "@vueuse/core";
import {GameItems} from "../constants/GameItems.ts";
import type {IGameItem} from "../types/IGameItem.ts";
import {GradientColorByRarityTypeMap} from "../maps/GradientColorByRarityTypeMap.ts";
import type {ITile} from "../types/ITile.ts";
import {ArrayService} from "../services/ArrayService.ts";

interface Props {
  level: LevelType;
  tryCount: number;
}

interface Emit {
  (e: 'update:tryCount', value: number): void;
  (e: 'win', value: void): void;
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const { width: windowWidth, height: windowHeight } = $(useWindowSize());
const clickSound = new Audio('sounds/item.wav');
const matchSound = new Audio('sounds/match.wav');
const defaultColor = "#656565"

const rows = $computed(() => GameSizeByLevelTypeMap.get(props.level)!.rows);
const columns = $computed(() => GameSizeByLevelTypeMap.get(props.level)!.columns);

const canvasWidth = $computed(() => {
  const containerWidth = windowWidth * 0.9;
  const maxCanvasWidth = 500;
  return Math.min(containerWidth, maxCanvasWidth);
});

const gap = $computed(() => Math.round(canvasWidth * 0.03))
const cellSize = $computed(() => (canvasWidth - (columns + 1) * gap) / columns);

const canvasHeight = $computed(() => {
  return cellSize * rows + gap * (rows + 1);
});

let tiles = $ref<ITile[]>([]);
let currentTurnTilesIndexes = $ref<number[]>([]);
let turnActionDebounce = $ref<number | null>(null);
let turnActionCallback = $ref<Function | null>(null);
const turnActionTimeout = 1000;

const allTilesDone = $computed(() => tiles.every((tile) => tile.isDone));

watchDebounced($$(allTilesDone), (isDone) => {
  if (isDone) {
    emit('win');
  }
}, {
  debounce: 1000,
})

const generateRandomTiles = () => {
  const allTilesCount = rows * columns;
  const itemsCount = allTilesCount / 2;
  const gameItems: IGameItem[] = [];
  for (let i = 0; i < itemsCount; i++) {
    let randomItem: IGameItem
    do {
      const randomIndex = Math.floor(Math.random() * GameItems.length);
      randomItem = GameItems[randomIndex];
    } while (gameItems.some((item) => item.id === randomItem.id));
    gameItems.push(randomItem, randomItem);
  }
  const arrayService = new ArrayService()
  const shuffledItems = arrayService.shuffleArray(gameItems);
  tiles = shuffledItems.map((item, index) => ({
    id: index,
    isDone: false,
    gameItem: item,
    isFlipped: false,
    isAnimating: false,
    imageUrl: item.imageUrl,
    xIndex: index % columns,
    yIndex: Math.floor(index / columns),
  }));
};

const getPositionFromIndex = (index: number) => {
  return index * (cellSize + gap) + gap;
};


const allImageUrls = GameItems.map((item) => item.imageUrl)

const preloadImages = (): Promise<Record<number, HTMLImageElement>> => {
  const promises = allImageUrls.map((url, index) => {
    return new Promise<[number, HTMLImageElement]>((resolve, reject) => {
      const img = new Image()
      img.src = url
      img.onload = () => resolve([index, img])
      img.onerror = reject
    });
  });

  return Promise.all(promises).then(results =>
      results.reduce((acc, [index, img]) => {
        acc[index] = img;
        return acc;
      }, {} as Record<number, HTMLImageElement>)
  );
};

let preloadedImages: Record<number, HTMLImageElement> = {}
const canvasRef = $ref<HTMLCanvasElement | null>(null)

onMounted(async () => {
  generateRandomTiles();
  if (canvasRef) {
    const ctx = canvasRef.getContext("2d");
    if (ctx) {
      preloadedImages = await preloadImages()
      drawGrid(ctx)
      useEventListener(canvasRef, "click", handleCanvasClick)
    }
  }
});

watch([$$(windowWidth), $$(windowHeight)], async () => {
  const ctx = canvasRef?.getContext("2d");
  if (ctx) {
    await nextTick()
    drawGrid(ctx);
  }
});

const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
};

const flipTile = (
    tile: ITile,
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number
) => {
  tile.isAnimating = true;

  const animationDuration = 500;
  const startTime = Date.now();

  const frontSprite = new Image();
  frontSprite.src = tile.imageUrl;

  const animate = () => {
    const currentTime = Date.now();
    const elapsedTime = currentTime - startTime;

    if (elapsedTime >= animationDuration) {
      tile.isFlipped = !tile.isFlipped;
      tile.isAnimating = false;
      return;
    }

    const progress = elapsedTime / animationDuration;
    const angle = Math.PI * progress;
    const scaleX = Math.abs(Math.cos(angle));
    ctx.clearRect(x - gap / 2, y - gap / 2, cellSize + gap, cellSize + gap);
    ctx.save();
    ctx.translate(x + cellSize / 2, y + cellSize / 2);
    ctx.scale(scaleX, 1);
    ctx.translate(-cellSize / 2, -cellSize / 2);
    if (!tile.isFlipped) {
      if (progress < 0.5) {
        ctx.fillStyle = defaultColor
        drawRoundedRect(ctx, 0, 0, cellSize, cellSize, 8);
      } else {
        ctx.fillStyle = getGradientStyle(tile.gameItem, ctx);
        drawRoundedRect(ctx, 0, 0, cellSize, cellSize, 8);
        if (frontSprite.complete) {
          ctx.drawImage(frontSprite, 0, 0, cellSize, cellSize);
        }
      }
    } else {
      if (progress < 0.5) {
        ctx.fillStyle = getGradientStyle(tile.gameItem, ctx);
        drawRoundedRect(ctx, 0, 0, cellSize, cellSize, 8);
        if (frontSprite.complete) {
          ctx.drawImage(frontSprite, 0, 0, cellSize, cellSize);
        }
      } else {
        ctx.fillStyle = defaultColor
        drawRoundedRect(ctx, 0, 0, cellSize, cellSize, 8);
      }
    }

    ctx.restore();
    requestAnimationFrame(animate);
  };

  animate();
};

const getGradientStyle = (gameItem: IGameItem, ctx: CanvasRenderingContext2D) => {
  const gradientStartColor = GradientColorByRarityTypeMap.get(gameItem.rarityType)!.gradientStartColor
  const gradientEndColor = GradientColorByRarityTypeMap.get(gameItem.rarityType)!.gradientEndColor
  const gradient = ctx.createLinearGradient(0, 0, 0, cellSize);
  gradient.addColorStop(0, gradientStartColor);
  gradient.addColorStop(1, gradientEndColor);
  return gradient;
}

const removeTile = (x: number, y: number, ctx: CanvasRenderingContext2D) => {
  ctx.clearRect(x - gap / 2, y - gap / 2, cellSize + gap, cellSize + gap);
};

const drawGrid = (ctx: CanvasRenderingContext2D) => {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  tiles.forEach((tile, index) => {
    const row = Math.floor(index / columns);
    const col = index % columns;

    const x = col * (cellSize + gap) + gap;
    const y = row * (cellSize + gap) + gap;

    if (!tile.isAnimating && !tile.isDone) {
      if(tile.isFlipped) {
        const gradient = getGradientStyle(tile.gameItem, ctx);
        ctx.fillStyle = gradient;
        const image = new Image();
        image.src = tile.imageUrl;
        image.onload = () => {
          ctx.drawImage(image, x, y, cellSize, cellSize);
        };
      } else {
        ctx.fillStyle = tile.isFlipped ? getGradientStyle(tile.gameItem, ctx) : defaultColor
      }
      drawRoundedRect(ctx, x, y, cellSize, cellSize, 8);
    }
  });
};

const checkTiles = (index: number, ctx: CanvasRenderingContext2D) => {
  currentTurnTilesIndexes.push(index);
  if (currentTurnTilesIndexes.length === 2) {
    const [firstIndex, secondIndex] = currentTurnTilesIndexes;
    const firstTile = tiles[firstIndex];
    const secondTile = tiles[secondIndex];
    emit('update:tryCount', props.tryCount + 1);

    if (firstTile.gameItem.id === secondTile.gameItem.id) {
      firstTile.isDone = true;
      secondTile.isDone = true;
      turnActionCallback = () => {
        const firstTileX = getPositionFromIndex(firstTile.xIndex);
        const firstTileY = getPositionFromIndex(firstTile.yIndex);
        const secondTileX = getPositionFromIndex(secondTile.xIndex);
        const secondTileY = getPositionFromIndex(secondTile.yIndex);
        removeTile(firstTileX, firstTileY, ctx);
        removeTile(secondTileX, secondTileY, ctx);
        matchSound.play();
      };
      turnActionDebounce = setTimeout(() => {
        turnActionCallback?.();
        turnActionDebounce = null;
      }, turnActionTimeout);
      currentTurnTilesIndexes = [];
    } else {
      turnActionCallback = () => {
        const firstTileX = getPositionFromIndex(firstTile.xIndex);
        const firstTileY = getPositionFromIndex(firstTile.yIndex);
        const secondTileX = getPositionFromIndex(secondTile.xIndex);
        const secondTileY = getPositionFromIndex(secondTile.yIndex);
        flipTile(firstTile, ctx, firstTileX, firstTileY);
        flipTile(secondTile, ctx, secondTileX, secondTileY);
        currentTurnTilesIndexes = [];
      };
      turnActionDebounce = setTimeout(() => {
        turnActionCallback?.();
        turnActionDebounce = null;
      }, turnActionTimeout)
    }
  }
};

const handleCanvasClick = (event: MouseEvent) => {
  const canvas = canvasRef;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  tiles.forEach((tile, index) => {
    const tileX = getPositionFromIndex(tile.xIndex);
    const tileY = getPositionFromIndex(tile.yIndex);

    if (
        x >= tileX &&
        x <= tileX + cellSize &&
        y >= tileY &&
        y <= tileY + cellSize &&
        !tile.isAnimating &&
        !tile.isDone &&
        !tile.isFlipped
    ) {
      clickSound.play();
      if(turnActionDebounce) {
        clearTimeout(turnActionDebounce);
        turnActionCallback?.();
        turnActionDebounce = null;
        turnActionCallback = null;
      }
      flipTile(tile, ctx, tileX, tileY);
      checkTiles(index, ctx);
    }
  });
};

</script>

<template>
  <div class="game-component">
    <canvas
        ref="canvasRef"
        :width="canvasWidth"
        :height="canvasHeight"
        class="game-canvas"
    ></canvas>
  </div>
</template>

<style scoped>
.game-component {
  display: flex;
  justify-content: center;
  align-items: center;
}

.game-canvas {
  border: 2px solid #4e4e4e;
  background-color: #2c2c2c;
}
</style>