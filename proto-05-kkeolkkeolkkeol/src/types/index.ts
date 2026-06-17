export type AssetType = 'us-stock' | 'kr-stock' | 'crypto'

export interface AssetOption {
  symbol: string
  name: string
  type: AssetType
}

export interface CalculationInput {
  assetType: AssetType
  asset: AssetOption
  buyDate: string  // YYYY-MM-DD
  buyAmount: number
}

export interface CalculationResult {
  asset: AssetOption
  buyAmount: number
  buyDate: string
  buyPrice: number
  currentPrice: number
  currentAmount: number
  returnRate: number  // percentage
  currency: string
}
