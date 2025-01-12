import type {IGameItem} from "./IGameItem.ts";

export interface ITile {
  id: number
  isDone: boolean
  gameItem: IGameItem
  isFlipped: boolean
  isAnimating: boolean
  imageUrl: string
  xIndex: number
  yIndex: number
}