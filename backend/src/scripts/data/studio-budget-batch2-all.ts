/**
 * 102 Architecture Budget packs (orders 700–801) from 34 base tracks × 3 difficulties.
 */
import { expandAllBases } from '../seed-studio-budget-lib'
import { BUDGET_BASES } from './budget-batch2-bases'

export const BATCH2_ALL = expandAllBases(BUDGET_BASES)
