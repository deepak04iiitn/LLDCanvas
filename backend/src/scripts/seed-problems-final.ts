import 'dotenv/config'
import mongoose from 'mongoose'
import { Problem } from '../models/problem.model'

const MORE = [
  {
    slug: 'design-pastebin',
    title: 'Pastebin / Code Snippet Sharing',
    difficulty: 'medium',
    category: 'Developer Tools',
    description: 'Design a text/code snippet sharing service like Pastebin — create, share, and expire pastes with syntax highlighting.',
    companies: ['Pastebin', 'GitHub', 'GitLab'],
    tags: ['OOP', 'Storage', 'CDN'],
    order: 19,
    functionalRequirements: [
      'Create a paste with title, content, language, and optional expiry',
      'Generate a unique short URL for each paste',
      'Syntax highlighting for 50+ programming languages',
      'Public, unlisted, and private visibility settings',
      'View, fork, and delete pastes',
      'User accounts to manage their own pastes',
      'Search public pastes by title or content',
    ],
    nonFunctionalRequirements: [
      '10 million pastes created per day',
      'Paste read latency < 50ms via CDN caching',
      'Auto-delete expired pastes with a background job',
      'Content storage scales to petabytes cheaply',
    ],
    hints: [
      'Core entities: Paste, User, Language, Visibility. Short URL generation: base62-encode a counter from a distributed ID generator (Snowflake). Store metadata (title, userId, expiry, language) in a relational DB; store large paste content in object storage (S3/GCS) keyed by pasteId.',
      'For read performance, cache paste metadata in Redis (TTL = min(paste expiry, 1 hour)). Serve content from a CDN for public pastes. For private pastes, stream content directly from object storage after auth check.',
      'Expiry: store expiry timestamp in the DB. A background cron job (every 5 min) runs DELETE FROM pastes WHERE expiry < NOW(). Also add a lazy expiry check on reads: if paste is expired, return 410 Gone and trigger async deletion.',
    ],
  },
  {
    slug: 'cricket-scoreboard',
    title: 'Cricket Scoreboard / Live Scoring',
    difficulty: 'medium',
    category: 'Gaming',
    description: 'Design a live cricket scoring system supporting match setup, ball-by-ball scoring, innings management, and score broadcasting.',
    companies: ['Cricbuzz', 'ESPN', 'BCCI'],
    tags: ['OOP', 'Real-time', 'State Machine'],
    order: 20,
    functionalRequirements: [
      'Set up a match: teams, players, venue, format (Test, ODI, T20)',
      'Ball-by-ball scoring: runs, wickets, extras (wide, no-ball, bye)',
      'Track batting and bowling statistics per player',
      'Manage innings transitions and follow-on rules',
      'Calculate run rate, required rate, and projected score',
      'Live score broadcast to subscribed clients',
      'Scorecard display: fall of wickets, partnerships, over summary',
    ],
    nonFunctionalRequirements: [
      'Score updates broadcast to millions of viewers in < 2 seconds',
      'Ball-by-ball history immutable and append-only',
      'Support 50 concurrent live matches',
    ],
    hints: [
      'Core entities: Match, Team, Player, Inning, Over, Ball, BattingCard, BowlingCard, Extras. Match is a State Machine: Toss → FirstInning → InningBreak → SecondInning → Result. Each Ball records runs, wicket info, extras type, and bowler/batsman.',
      'BattingCard and BowlingCard are computed views derived from Ball records — never store them directly. On each ball event, recalculate the active batsman\'s and bowler\'s running totals. This makes the history immutable and stats always consistent.',
      'For live broadcast, use the Observer pattern: Match is the subject. When a Ball is added, notify all MatchObservers (WebSocket broadcaster, stats calculator, alert service). The broadcaster pushes the delta (just the new ball) to all subscribed clients rather than the full scorecard.',
    ],
  },
  {
    slug: 'yelp-local-search',
    title: 'Yelp / Local Business Search',
    difficulty: 'hard',
    category: 'Social Media',
    description: 'Design a location-based business discovery platform like Yelp — search nearby businesses, read reviews, and get recommendations.',
    companies: ['Yelp', 'Google Maps', 'TripAdvisor', 'Zomato'],
    tags: ['Geospatial', 'Search', 'Recommendation'],
    order: 19,
    functionalRequirements: [
      'Search businesses by category, name, and location (lat/lng + radius)',
      'View business details: hours, photos, contact, menu',
      'Read and write reviews with star ratings (1-5)',
      'Overall rating computed from all reviews',
      'Photo upload for businesses and reviews',
      'Business owner portal to manage their listing',
      'Personalised recommendations based on past reviews',
      'Filter by: open now, price range, rating, distance',
    ],
    nonFunctionalRequirements: [
      'Location search returns results in < 200ms',
      'Support 100 million businesses globally',
      'Review updates reflected in ratings within 30 seconds',
      'Photos served via CDN with sub-100ms load time',
    ],
    hints: [
      'Core entities: Business, Category, Review, Photo, User, Location (lat/lng), BusinessHours, Rating. Store business locations in a geospatial index (PostGIS, Elasticsearch geo_point, or Redis GEOADD). Radius search: GEORADIUSBYMEMBER or Elasticsearch geo_distance query.',
      'Rating aggregation: maintain a running (sum, count) per business. On each new review, atomically: sum += stars, count++, avg = sum/count. This avoids recomputing from all reviews. Use database transactions or a Redis HINCRBY for atomic updates.',
      'For personalised recommendations, use collaborative filtering: find users with similar review patterns (cosine similarity on their rating vectors). Recommend businesses that similar users liked but the current user hasn\'t visited. Run this offline nightly and cache per user.',
    ],
  },
]

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI env var not set')
  await mongoose.connect(uri)

  for (const p of MORE) {
    await Problem.findOneAndUpdate({ slug: p.slug }, { $set: p }, { upsert: true, new: true, setDefaultsOnInsert: true })
    console.log(`  ✓ ${p.difficulty.padEnd(6)} ${p.title}`)
  }

  const total = await Problem.countDocuments({ isActive: true })
  console.log(`\nTotal active problems: ${total}`)
  await mongoose.disconnect()
}

main().catch(err => { console.error(err); process.exit(1) })
