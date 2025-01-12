import type {RarityType} from "../enum/RarityType.ts";

export interface IGameItem {
  id: number;
  imageUrl: string;
  rarityType: RarityType;
}