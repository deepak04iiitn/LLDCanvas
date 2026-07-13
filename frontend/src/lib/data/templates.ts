import type { LucideIcon } from 'lucide-react'
import {
  ParkingCircle, ArrowUpDown, CreditCard, Film,
  Crown, UtensilsCrossed, Car, Database,
  DollarSign, Gamepad2, BookOpen, FileText, Bell,
} from 'lucide-react'

export interface DiagramTemplate {
  id: string
  Icon: LucideIcon
  label: string
  description: string
  category: 'Classic OOD' | 'Booking & Commerce' | 'Systems & Infra'
  /**
   * Exact `title` of the matching seed document in
   * `backend/src/scripts/seed-templates.ts` (Diagram.isTemplate === true).
   * Only 5 of the 13 templates listed here are actually seeded on the
   * backend — the rest are roadmap entries with no real diagram behind
   * them yet. Omitting this field is how a template gets marked
   * unavailable in the UI instead of erroring when clicked; see
   * useSeededTemplates.ts, which resolves this to a real Mongo `_id`.
   */
  seedTitle?: string
}

// Single source of truth for the LLD problem starters — used by both the
// "New Diagram" modal (compact grid) and the /dashboard/templates gallery
// (full cards with descriptions). Previously duplicated only inside
// NewDiagramModal, so the two could silently drift.
export const TEMPLATES: DiagramTemplate[] = [
  {
    id: 'parking-lot',
    Icon: ParkingCircle,
    label: 'Parking Lot',
    description: 'Levels, spots, tickets, and a pluggable fee strategy.',
    category: 'Classic OOD',
    seedTitle: 'Parking Lot System',
  },
  {
    id: 'elevator',
    Icon: ArrowUpDown,
    label: 'Elevator System',
    description: 'A controller dispatching multiple elevators against a request queue.',
    category: 'Classic OOD',
    seedTitle: 'Elevator System',
  },
  {
    id: 'atm',
    Icon: CreditCard,
    label: 'ATM',
    description: 'Card, account, transaction, and cash-dispenser boundaries.',
    category: 'Classic OOD',
    seedTitle: 'ATM Machine',
  },
  {
    id: 'chess',
    Icon: Crown,
    label: 'Chess',
    description: 'Board, pieces, and move validation modeled as a class hierarchy.',
    category: 'Classic OOD',
  },
  {
    id: 'snake-ladder',
    Icon: Gamepad2,
    label: 'Snake & Ladder',
    description: 'Board, players, dice, and turn sequencing.',
    category: 'Classic OOD',
  },
  {
    id: 'library',
    Icon: BookOpen,
    label: 'Library System',
    description: 'Catalog, members, and lending rules with due dates.',
    category: 'Classic OOD',
  },
  {
    id: 'bookmyshow',
    Icon: Film,
    label: 'BookMyShow',
    description: 'Theaters, shows, seat locking, and payment flow.',
    category: 'Booking & Commerce',
    seedTitle: 'BookMyShow (Movie Booking)',
  },
  {
    id: 'food-delivery',
    Icon: UtensilsCrossed,
    label: 'Food Delivery',
    description: 'Restaurants, orders, riders, and delivery assignment.',
    category: 'Booking & Commerce',
  },
  {
    id: 'ride-sharing',
    Icon: Car,
    label: 'Ride Sharing',
    description: 'Riders, drivers, matching, and fare calculation.',
    category: 'Booking & Commerce',
  },
  {
    id: 'splitwise',
    Icon: DollarSign,
    label: 'Splitwise',
    description: 'Groups, expenses, and balance-settling between members.',
    category: 'Booking & Commerce',
  },
  {
    id: 'lru-cache',
    Icon: Database,
    label: 'LRU / LFU Cache',
    description: 'A cache interface backed by a doubly linked list + hash map.',
    category: 'Systems & Infra',
    seedTitle: 'LRU Cache',
  },
  {
    id: 'logger',
    Icon: FileText,
    label: 'Logger',
    description: 'Log levels, appenders, and formatters behind one interface.',
    category: 'Systems & Infra',
  },
  {
    id: 'notification',
    Icon: Bell,
    label: 'Notification Service',
    description: 'Channels (SMS, email, push) unified behind a single sender.',
    category: 'Systems & Infra',
  },
]

export const TEMPLATE_CATEGORIES = ['Classic OOD', 'Booking & Commerce', 'Systems & Infra'] as const
