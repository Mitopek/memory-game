import type {LevelType} from "../enum/LevelType.ts";

export interface IGameHistory {
  timeText: string
  tryCount: number
  date: string
  levelType: LevelType
}