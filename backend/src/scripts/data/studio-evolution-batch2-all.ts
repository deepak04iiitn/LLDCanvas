/**
 * 102 Architecture Evolution packs (orders 600–701) from 34 base tracks × 3 difficulties.
 */
import { expandAllBases } from '../seed-studio-evolution-lib'
import { EVOLUTION_BASES } from './evolution-batch2-bases'

export const BATCH2_ALL = expandAllBases(EVOLUTION_BASES)
