// 物価レベルの定義とユーティリティ関数

export type CostOfLivingLevel = 
  | "very-low"
  | "low"
  | "average-low"
  | "average"
  | "average-high"
  | "high"
  | "very-high"

export interface CostOfLivingOption {
  value: CostOfLivingLevel
  label: string
  minAmount?: number
  maxAmount?: number
}

// 物価レベルの定義（細かく分類）
export const costOfLivingOptions: CostOfLivingOption[] = [
  { 
    value: "very-low", 
    label: "月10万円以下",
    minAmount: 0,
    maxAmount: 100000
  },
  { 
    value: "low", 
    label: "月10～15万円",
    minAmount: 100000,
    maxAmount: 150000
  },
  { 
    value: "average-low", 
    label: "月15～20万円",
    minAmount: 150000,
    maxAmount: 200000
  },
  { 
    value: "average", 
    label: "月20～25万円",
    minAmount: 200000,
    maxAmount: 250000
  },
  { 
    value: "average-high", 
    label: "月25～30万円",
    minAmount: 250000,
    maxAmount: 300000
  },
  { 
    value: "high", 
    label: "月30～35万円",
    minAmount: 300000,
    maxAmount: 350000
  },
  { 
    value: "very-high", 
    label: "月35万円以上",
    minAmount: 350000,
    maxAmount: undefined
  },
]

// 物価レベルのラベルを取得する関数
export const getCostOfLivingLabel = (value: CostOfLivingLevel | string): string => {
  const option = costOfLivingOptions.find(opt => opt.value === value)
  return option?.label || value
}

// すべての物価レベルのラベルのマップ
export const costOfLivingLabels: Record<string, string> = {
  "very-low": "月10万円以下",
  "low": "月10～15万円",
  "average-low": "月15～20万円",
  "average": "月20～25万円",
  "average-high": "月25～30万円",
  "high": "月30～35万円",
  "very-high": "月35万円以上",
}

// 物価レベルが範囲内かどうかをチェックする関数
export const isCostOfLivingInRange = (
  reviewCostOfLiving: string | undefined,
  filterCostOfLiving: CostOfLivingLevel[]
): boolean => {
  if (!reviewCostOfLiving) return true // 物価レベルが設定されていない場合は表示
  if (filterCostOfLiving.length === 0) return true // フィルターが選択されていない場合はすべて表示
  
  return filterCostOfLiving.includes(reviewCostOfLiving as CostOfLivingLevel)
}

// 物価レベルの順序（低い順）
export const costOfLivingOrder: CostOfLivingLevel[] = [
  "very-low",
  "low",
  "average-low",
  "average",
  "average-high",
  "high",
  "very-high"
]

// 最大物価レベル以下のレビューかどうかをチェックする関数
export const isCostOfLivingBelowMax = (
  reviewCostOfLiving: string | undefined,
  maxCostOfLiving: CostOfLivingLevel | null
): boolean => {
  if (!reviewCostOfLiving) return true // 物価レベルが設定されていない場合は表示
  if (!maxCostOfLiving) return true // フィルターが設定されていない場合はすべて表示
  
  const reviewIndex = costOfLivingOrder.indexOf(reviewCostOfLiving as CostOfLivingLevel)
  const maxIndex = costOfLivingOrder.indexOf(maxCostOfLiving)
  
  // インデックスが見つからない場合は表示
  if (reviewIndex === -1 || maxIndex === -1) return true
  
  // レビューの物価レベルが最大物価レベル以下の場合は表示
  return reviewIndex <= maxIndex
}

