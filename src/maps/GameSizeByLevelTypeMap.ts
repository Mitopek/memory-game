import {LevelType} from "../enum/LevelType.ts";
import type {IGameSize} from "../types/IGameSize.ts";

export const GameSizeByLevelTypeMap = new Map<LevelType, IGameSize>([
  [LevelType.Easy, {columns: 3, rows: 2}],
  [LevelType.Medium, {columns: 4, rows: 3}],
  [LevelType.Hard, {columns: 4, rows: 4}],
]);