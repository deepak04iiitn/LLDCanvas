import type { FeatureBlogSeed } from './types'
import { plannrBlog } from './01-plannr'
import { dailyQuizBlog } from './02-daily-quiz'
import { roguelikeBlog } from './03-roguelike'
import { debugLabBlog } from './04-debug-lab'
import { debugAndFixBlog } from './05-debug-and-fix'
import { refactorBlog } from './06-refactor'
import { changeOneThingBlog } from './07-change-one-thing'
import { evolutionBlog } from './08-evolution'
import { budgetPressureBlog } from './09-budget-pressure'

/** All nine feature SEO posts — ready for seed-feature-blogs.ts */
export const FEATURE_BLOGS: FeatureBlogSeed[] = [
  plannrBlog,
  dailyQuizBlog,
  roguelikeBlog,
  debugLabBlog,
  debugAndFixBlog,
  refactorBlog,
  changeOneThingBlog,
  evolutionBlog,
  budgetPressureBlog,
]

export type { FeatureBlogSeed } from './types'
