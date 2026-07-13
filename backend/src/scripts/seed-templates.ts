/**
 * Seed script — inserts the 5 V1 LLD problem templates into MongoDB.
 *
 * Run from the backend directory:
 *   npx ts-node src/scripts/seed-templates.ts
 *
 * Safe to re-run: existing templates with the same title are skipped.
 */

import 'dotenv/config'
import mongoose from 'mongoose'
import { Diagram } from '../models/diagram.model'

const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/lldcanvas'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function cls(id: string, name: string, x: number, y: number, attrs: string[], methods: string[]) {
  return {
    id,
    type: 'class',
    position: { x, y },
    data: {
      nodeType: 'class',
      name,
      attributes: attrs.map(a => {
        const [vis, ...rest] = a
        const [n, t] = rest.join('').split(':').map(s => s.trim())
        return { visibility: vis, name: n, type: t ?? '' }
      }),
      methods: methods.map(m => {
        const [vis, ...rest] = m
        const sig = rest.join('')
        const [nameParams, ret] = sig.split(':').map(s => s.trim())
        const parenIdx = nameParams.indexOf('(')
        const mName = parenIdx >= 0 ? nameParams.slice(0, parenIdx).trim() : nameParams
        const params = parenIdx >= 0 ? nameParams.slice(parenIdx + 1, nameParams.indexOf(')')).trim() : ''
        return { visibility: vis, name: mName, params, returnType: ret ?? 'void' }
      }),
    },
  }
}

function iface(id: string, name: string, x: number, y: number, methods: string[]) {
  return {
    id,
    type: 'interface',
    position: { x, y },
    data: {
      nodeType: 'interface',
      name,
      attributes: [],
      methods: methods.map(m => {
        const [vis, ...rest] = m
        const sig = rest.join('')
        const [nameParams, ret] = sig.split(':').map(s => s.trim())
        const parenIdx = nameParams.indexOf('(')
        const mName = parenIdx >= 0 ? nameParams.slice(0, parenIdx).trim() : nameParams
        const params = parenIdx >= 0 ? nameParams.slice(parenIdx + 1, nameParams.indexOf(')')).trim() : ''
        return { visibility: vis, name: mName, params, returnType: ret ?? 'void' }
      }),
    },
  }
}

function edge(id: string, source: string, target: string, type: string) {
  return { id, source, target, type, data: { relationshipType: type } }
}

// ─── Template 1: Parking Lot ──────────────────────────────────────────────────
const parkingLot = {
  title: 'Parking Lot System',
  nodes: [
    cls('parking-lot', 'ParkingLot', 40, 40, ['-levels: List<Level>', '-capacity: int'], ['+addLevel(l: Level): void', '+getAvailableSpot(v: Vehicle): ParkingSpot']),
    cls('level', 'Level', 40, 280, ['-levelNo: int', '-spots: List<ParkingSpot>'], ['+getAvailableSpots(): List<ParkingSpot>']),
    cls('parking-spot', 'ParkingSpot', 40, 500, ['-spotId: String', '-type: SpotType', '-occupied: boolean'], ['+assign(v: Vehicle): Ticket', '+vacate(): void']),
    cls('vehicle', 'Vehicle', 420, 500, ['-licensePlate: String', '-type: VehicleType'], ['+getType(): VehicleType']),
    cls('ticket', 'Ticket', 420, 40, ['-ticketId: String', '-entryTime: Date', '-spot: ParkingSpot', '-vehicle: Vehicle'], ['+getEntryTime(): Date']),
    iface('fee-strategy', 'FeeStrategy', 800, 40, ['+calculate(ticket: Ticket): double']),
    cls('hourly-fee', 'HourlyFeeStrategy', 800, 260, [], ['+calculate(ticket: Ticket): double']),
  ],
  edges: [
    edge('e1', 'parking-lot', 'level', 'composition'),
    edge('e2', 'level', 'parking-spot', 'composition'),
    edge('e3', 'parking-spot', 'vehicle', 'association'),
    edge('e4', 'ticket', 'parking-spot', 'association'),
    edge('e5', 'ticket', 'vehicle', 'association'),
    edge('e6', 'hourly-fee', 'fee-strategy', 'realization'),
    edge('e7', 'parking-lot', 'fee-strategy', 'association'),
  ],
}

// ─── Template 2: Elevator System ─────────────────────────────────────────────
const elevatorSystem = {
  title: 'Elevator System',
  nodes: [
    cls('elevator-ctrl', 'ElevatorController', 40, 40, ['-elevators: List<Elevator>'], ['+addElevator(e: Elevator): void', '+requestElevator(req: Request): Elevator', '+scheduleElevator(req: Request): void']),
    cls('elevator', 'Elevator', 40, 300, ['-elevatorId: int', '-currentFloor: int', '-direction: Direction', '-requests: Queue<Request>'], ['+addRequest(r: Request): void', '+move(): void', '+openDoor(): void', '+closeDoor(): void']),
    cls('request', 'Request', 420, 300, ['-floor: int', '-direction: Direction'], ['+getFloor(): int', '+getDirection(): Direction']),
    {
      id: 'direction-enum',
      type: 'enum',
      position: { x: 420, y: 40 },
      data: { nodeType: 'enum', name: 'Direction', attributes: [{ visibility: '+', name: 'UP', type: '' }, { visibility: '+', name: 'DOWN', type: '' }, { visibility: '+', name: 'IDLE', type: '' }], methods: [] },
    },
    cls('elevator-btn', 'ElevatorButton', 700, 300, ['-floor: int', '-direction: Direction'], ['+pressButton(): void']),
  ],
  edges: [
    edge('e1', 'elevator-ctrl', 'elevator', 'composition'),
    edge('e2', 'elevator', 'request', 'association'),
    edge('e3', 'elevator', 'direction-enum', 'dependency'),
    edge('e4', 'elevator-btn', 'elevator-ctrl', 'association'),
  ],
}

// ─── Template 3: ATM ──────────────────────────────────────────────────────────
const atm = {
  title: 'ATM Machine',
  nodes: [
    cls('atm', 'ATM', 40, 40, ['-atmId: String', '-location: String', '-cashDispenser: CashDispenser', '-authService: AuthService'], ['+insertCard(card: Card): void', '+authenticate(pin: String): boolean', '+withdraw(amount: double): boolean', '+deposit(amount: double): void', '+checkBalance(): double']),
    cls('card', 'Card', 420, 40, ['-cardNumber: String', '-expiryDate: String', '-cardType: CardType'], ['+getAccount(): Account']),
    cls('account', 'Account', 420, 280, ['-accountId: String', '-balance: double', '-owner: String'], ['+debit(amount: double): void', '+credit(amount: double): void', '+getBalance(): double']),
    cls('transaction', 'Transaction', 40, 480, ['-transId: String', '-type: TransactionType', '-amount: double', '-timestamp: Date'], ['+getDetails(): String']),
    cls('auth-service', 'AuthService', 700, 40, [], ['+validatePin(card: Card, pin: String): boolean', '+validateCard(card: Card): boolean']),
    cls('cash-dispenser', 'CashDispenser', 700, 280, ['-cashAvailable: double'], ['+dispenseCash(amount: double): boolean', '+hasSufficientCash(amount: double): boolean']),
  ],
  edges: [
    edge('e1', 'atm', 'card', 'association'),
    edge('e2', 'card', 'account', 'association'),
    edge('e3', 'atm', 'transaction', 'dependency'),
    edge('e4', 'atm', 'auth-service', 'association'),
    edge('e5', 'atm', 'cash-dispenser', 'composition'),
  ],
}

// ─── Template 4: BookMyShow ───────────────────────────────────────────────────
const bookMyShow = {
  title: 'BookMyShow (Movie Booking)',
  nodes: [
    cls('theater', 'Theater', 40, 40, ['-theaterId: String', '-name: String', '-location: String', '-screens: List<Screen>'], ['+addScreen(s: Screen): void', '+getScreens(): List<Screen>']),
    cls('screen', 'Screen', 40, 300, ['-screenId: String', '-totalSeats: int', '-seats: List<Seat>'], ['+addShow(show: Show): void', '+getShows(): List<Show>']),
    cls('show', 'Show', 400, 300, ['-showId: String', '-movie: String', '-startTime: Date', '-screen: Screen'], ['+getAvailableSeats(): List<Seat>']),
    cls('seat', 'Seat', 700, 300, ['-seatId: String', '-seatType: SeatType', '-price: double', '-booked: boolean'], ['+book(): void', '+cancel(): void']),
    cls('booking', 'Booking', 400, 40, ['-bookingId: String', '-user: User', '-seats: List<Seat>', '-show: Show', '-status: BookingStatus'], ['+confirm(): void', '+cancel(): void']),
    cls('user', 'User', 700, 40, ['-userId: String', '-name: String', '-email: String'], ['+getBookings(): List<Booking>']),
    cls('payment', 'Payment', 40, 560, ['-paymentId: String', '-amount: double', '-status: PaymentStatus'], ['+processPayment(): boolean']),
  ],
  edges: [
    edge('e1', 'theater', 'screen', 'composition'),
    edge('e2', 'screen', 'show', 'composition'),
    edge('e3', 'show', 'seat', 'association'),
    edge('e4', 'booking', 'show', 'association'),
    edge('e5', 'booking', 'seat', 'association'),
    edge('e6', 'booking', 'user', 'association'),
    edge('e7', 'booking', 'payment', 'association'),
  ],
}

// ─── Template 5: LRU Cache ────────────────────────────────────────────────────
const lruCache = {
  title: 'LRU Cache',
  nodes: [
    iface('cache-iface', 'CacheInterface', 300, 40, ['+get(key: int): int', '+put(key: int, value: int): void']),
    cls('lru-cache', 'LRUCache', 300, 280, ['-capacity: int', '-map: HashMap<int, Node>', '-head: Node', '-tail: Node'], ['+get(key: int): int', '+put(key: int, value: int): void', '-addNode(n: Node): void', '-removeNode(n: Node): void', '-removeLRU(): void']),
    cls('dll-node', 'Node', 700, 280, ['+key: int', '+value: int', '+prev: Node', '+next: Node'], []),
    cls('dll', 'DoublyLinkedList', 700, 80, ['-head: Node', '-tail: Node', '-size: int'], ['+addFirst(n: Node): void', '+removeLast(): Node', '+remove(n: Node): void']),
  ],
  edges: [
    edge('e1', 'lru-cache', 'cache-iface', 'realization'),
    edge('e2', 'lru-cache', 'dll-node', 'composition'),
    edge('e3', 'lru-cache', 'dll', 'composition'),
    edge('e4', 'dll', 'dll-node', 'aggregation'),
  ],
}

// ─── Seed logic ───────────────────────────────────────────────────────────────
const TEMPLATES = [parkingLot, elevatorSystem, atm, bookMyShow, lruCache]

async function seed() {
  await mongoose.connect(MONGO_URI)
  console.log('Connected to MongoDB:', MONGO_URI)

  let inserted = 0
  let skipped = 0

  for (const tpl of TEMPLATES) {
    const existing = await Diagram.findOne({ isTemplate: true, title: tpl.title })
    if (existing) {
      console.log(`  SKIP  "${tpl.title}" (already exists)`)
      skipped++
      continue
    }

    await Diagram.create({
      userId: new mongoose.Types.ObjectId(), // placeholder — templates have no owner
      title: tpl.title,
      isTemplate: true,
      diagramData: {
        version: 1,
        nodes: tpl.nodes,
        edges: tpl.edges,
        meta: { theme: 'light', zoom: 1, panX: 0, panY: 0 },
      },
    })

    console.log(`  INSERT "${tpl.title}"`)
    inserted++
  }

  console.log(`\nDone. Inserted: ${inserted}  Skipped: ${skipped}`)
  await mongoose.disconnect()
}

seed().catch(err => { console.error(err); process.exit(1) })
