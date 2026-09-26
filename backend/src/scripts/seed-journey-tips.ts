import 'dotenv/config'
import { connectDB } from '../config/db'
import { JourneyTip } from '../models/journey/journey-tip.model'

const tips = [
  // ── Starting ──────────────────────────────────────────────────────────────
  { moment: 'starting', order: 1, status: 'published',
    title: 'Clarify Before You Design',
    body: `The biggest mistake in LLD interviews is immediately starting to draw classes. Before touching the whiteboard, spend 2-3 minutes asking focused questions about scope, scale, and key behaviors. "What vehicle types should we support?" is more valuable than 20 minutes of designing the wrong system.` },

  { moment: 'starting', order: 2, status: 'published',
    title: 'The Nouns Are Your Classes',
    body: `Read the problem statement and circle every noun. Those nouns are usually your classes. "A user books a movie ticket at a theater" → User, Ticket, Movie, Theater, Booking. Start here before writing any code. This simple technique prevents you from missing key entities.` },

  { moment: 'starting', order: 3, status: 'published',
    title: 'Define What\'s In Scope',
    body: `Explicitly agree on the system boundary before designing. "For this session, I'll design the core ride matching and tracking. Payments and user authentication are out of scope." This prevents you from over-engineering and running out of time. Interviewers respect boundary awareness.` },

  { moment: 'starting', order: 4, status: 'published',
    title: 'State Your Assumptions Aloud',
    body: `You will need to make assumptions. Always say them out loud: "I'm assuming flat hourly pricing for now — we can extend to dynamic pricing later." Silent assumptions are design risks. Explicit assumptions are design decisions. Interviewers can correct your assumptions early if they're wrong.` },

  { moment: 'starting', order: 5, status: 'published',
    title: 'Identify the 3 Core User Flows',
    body: `Before sketching classes, identify the 3-4 most important user journeys. For a parking lot: (1) vehicle enters and gets assigned a spot, (2) vehicle exits and pays, (3) check availability. These flows drive your entity identification and tell you which relationships actually matter.` },

  // ── Designing ─────────────────────────────────────────────────────────────
  { moment: 'designing', order: 1, status: 'published',
    title: 'One Class, One Job',
    body: `If you need to use "and" to describe what a class does, it probably violates the Single Responsibility Principle. "UserService handles authentication AND sends emails AND logs activity" — that's three services. Split them. One reason to change = one class.` },

  { moment: 'designing', order: 2, status: 'published',
    title: 'Favor Composition Over Inheritance',
    body: `When in doubt between inheritance (is-a) and composition (has-a), prefer composition. Inheritance creates tight coupling and can break with requirement changes. A User HAS-A Plan is more flexible than PremiumUser extends User — because a user's plan can change, but their type can't.` },

  { moment: 'designing', order: 3, status: 'published',
    title: 'Don\'t Abstract Prematurely',
    body: `Only introduce an interface or abstraction when you can see at least 2 concrete variations that would implement it. A PaymentProcessor interface makes sense when you have Stripe and PayPal. A single ILogger interface when you only have one logger might be over-engineering for a 45-minute session.` },

  { moment: 'designing', order: 4, status: 'published',
    title: 'Every Piece of Data Needs an Owner',
    body: `For every field in your design, ask: "Which class is responsible for this data?" The borrowDate, dueDate, and fine for a library loan belong to a BookLoan class — not the Book and not the Member. Relationship entities often exist precisely to own data about a relationship.` },

  { moment: 'designing', order: 5, status: 'published',
    title: 'Think About Lifecycle When Choosing Relationships',
    body: `Composition vs Aggregation comes down to lifecycle. "If I delete a Hotel, do its Rooms still make sense?" No → Composition. "If I delete a Department, do Employees still exist?" Yes → Aggregation. This question also drives your database schema and cascade delete rules.` },

  // ── Patterns ──────────────────────────────────────────────────────────────
  { moment: 'patterns', order: 1, status: 'published',
    title: 'Explain the Problem First',
    body: `Never just say "I used Strategy here." Say: "Payment methods vary frequently and we need to add new ones without touching existing code. So I introduced a PaymentStrategy interface." Name the problem before naming the solution. This shows you understand WHY the pattern exists, not just WHAT it is.` },

  { moment: 'patterns', order: 2, status: 'published',
    title: 'Don\'t Force Patterns',
    body: `Patterns are solutions to recurring problems — not vocabulary tests. Only use a pattern when there is a real design pressure it resolves. Ask yourself: "What problem does this pattern solve?" If you can't name a specific problem in your current design, the pattern probably doesn't belong here.` },

  { moment: 'patterns', order: 3, status: 'published',
    title: 'Name the Concrete Benefit',
    body: `After explaining a pattern, always finish with: "...which means [specific benefit for this design]." For Observer: "...which means that adding a WhatsApp notification service requires zero changes to OrderService." Concrete benefits are more convincing than abstract principles.` },

  { moment: 'patterns', order: 4, status: 'published',
    title: 'Strategy vs State — Know the Difference',
    body: `They look similar but solve different problems. Strategy: the caller picks the algorithm (sorting strategy, pricing strategy). State: the object manages its own lifecycle (Order knows if it's pending, confirmed, shipped). If the behavior depends on lifecycle position → State. If the caller chooses the behavior → Strategy.` },

  { moment: 'patterns', order: 5, status: 'published',
    title: 'When to Use Factory',
    body: `Use Factory when: (1) object creation involves configuration the caller shouldn't know about, (2) you choose which type to create based on a condition, or (3) creation logic might change or grow. Don't use Factory for simple new SomeClass() — that's over-engineering. Factory shines when creation itself is the complexity.` },

  // ── Follow-ups ────────────────────────────────────────────────────────────
  { moment: 'followups', order: 1, status: 'published',
    title: 'Understand the Change Before Modifying',
    body: `When a follow-up arrives, resist the urge to immediately redesign. First, repeat the requirement back: "So we need to support monthly parking passes, is that right?" Confirm your understanding. A 10-second pause to think is far better than 10 minutes redesigning the wrong thing.` },

  { moment: 'followups', order: 2, status: 'published',
    title: 'Find the Blast Radius First',
    body: `Before touching any code, trace which classes the change affects. "Adding surge pricing affects: PricingService (calculation logic), maybe ParkingTicket (to store the rate at time of entry). That's it." A focused blast radius is a sign of good design. A wide blast radius signals the design needs better extension points.` },

  { moment: 'followups', order: 3, status: 'published',
    title: 'Surgical Changes Signal Good Design',
    body: `The mark of a well-designed system: follow-up requirements result in new classes, not modifications to existing ones. "Adding PayPal means I just create a new PayPalStrategy. Nothing else changes." If every follow-up requires touching 5 existing files, the design's abstractions are in the wrong places.` },

  { moment: 'followups', order: 4, status: 'published',
    title: 'Interfaces Are Blast Radius Shields',
    body: `Parts of the system behind interfaces absorb change far better than direct class dependencies. If OrderService depends on IPaymentProcessor (not StripePaymentService), then swapping payment providers is contained entirely to the implementing class. The interface acts as a firewall.` },

  { moment: 'followups', order: 5, status: 'published',
    title: 'Re-Verify Existing Behavior After Changes',
    body: `After making a change for a follow-up, trace the original user flows to confirm nothing broke. "I added VIP spots — does the standard allocation for regular vehicles still work? Yes, because I only added a new condition to the filter, I didn't change the interface." Proactively verifying existing behavior impresses interviewers.` },

  // ── Explaining ────────────────────────────────────────────────────────────
  { moment: 'explaining', order: 1, status: 'published',
    title: 'Use the PDTB Framework',
    body: `For every major design decision, structure your explanation as: Problem → Decision → Trade-off → Benefit. "The problem was X. So I decided to do Y. The trade-off is Z. The benefit is W." This framework makes your reasoning clear, complete, and memorable. Practice until it feels natural.` },

  { moment: 'explaining', order: 2, status: 'published',
    title: 'Never Say "I Followed Best Practices"',
    body: `"I used dependency injection because it's best practice" tells the interviewer nothing. Always say WHY it's a best practice for THIS situation. "I injected the email service because if I hardcode it, switching email providers means touching OrderService — which shouldn't know about email providers."` },

  { moment: 'explaining', order: 3, status: 'published',
    title: 'Acknowledge Trade-offs Proactively',
    body: `Don't wait for the interviewer to challenge your design. Mention trade-offs yourself: "This approach adds a layer of indirection, which makes tracing the flow slightly harder. But it gives us the flexibility to add new notification channels without any changes to the core service." Self-awareness about trade-offs is a sign of maturity.` },

  { moment: 'explaining', order: 4, status: 'published',
    title: 'Link Every Decision to a Requirement',
    body: `Every design decision should trace back to a specific requirement or design pressure. "I introduced IPricingStrategy because the product requirement says pricing models will be A/B tested frequently." Decisions without requirements sound arbitrary. Decisions grounded in requirements sound reasoned.` },

  { moment: 'explaining', order: 5, status: 'published',
    title: 'Narrate Continuously While Designing',
    body: `Don't design in silence. As you add each class or relationship, say why: "I'm creating a Booking class here because the relationship between User and Room has its own data — check-in date, check-out date, price paid. Neither User nor Room should own all of that." Running commentary turns a silent test into a collaborative conversation.` },
]

async function main() {
  await connectDB()
  await JourneyTip.deleteMany({})
  await JourneyTip.insertMany(tips)
  console.log(`Seeded ${tips.length} journey tips`)
  process.exit(0)
}

main().catch(err => { console.error(err); process.exit(1) })
