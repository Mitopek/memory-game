import {RarityType} from "../enum/RarityType.ts";
import type {IGradientData} from "../types/IGradientData.ts";

export const GradientColorByRarityTypeMap = new Map<RarityType, IGradientData>([
  [RarityType.Common, {gradientStartColor: '#FFD700', gradientEndColor: '#FF8C00'}],
  [RarityType.Rare, {gradientStartColor: '#FF8C00', gradientEndColor: '#FF0000'}],
  [RarityType.Legendary, {gradientStartColor: '#FF0000', gradientEndColor: '#2b1eff'}],
]);

