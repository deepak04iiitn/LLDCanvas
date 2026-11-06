import type { ProblemSolution } from './types'
import { adaptSolution } from './adaptSolution'
import { ensureExtras } from './buildExtras'
import { ensureUmlGuide } from './buildUmlGuide'

import { atmMachineSolution } from './batch1/atm-machine'
import { basicCalculatorSolution } from './batch1/basic-calculator'
import { chessGameSolution } from './batch1/chess-game'
import { cronJobSchedulerSolution } from './batch1/cron-job-scheduler'
import { deckOfCardsSolution } from './batch1/deck-of-cards'
import { digitalWalletSolution } from './batch1/digital-wallet'
import { elevatorSystemSolution } from './batch1/elevator-system'
import { inMemoryFileSystemSolution } from './batch1/in-memory-file-system'
import { libraryManagementSolution } from './batch1/library-management'
import { loggingFrameworkSolution } from './batch1/logging-framework'
import { meetingRoomBookingSolution } from './batch1/meeting-room-booking'
import { parkingLotSolution } from './batch1/parking-lot'
import { pubSubSystemSolution } from './batch1/pub-sub-system'
import { quizTriviaEngineSolution } from './batch1/quiz-trivia-engine'
import { rateLimiterSolution } from './batch1/rate-limiter'
import { restaurantTableReservationSolution } from './batch1/restaurant-table-reservation'
import { snakeAndLadderSolution } from './batch1/snake-and-ladder'
import { ticTacToeSolution } from './batch1/tic-tac-toe'
import { trafficLightSystemSolution } from './batch1/traffic-light-system'
import { vendingMachineSolution } from './batch1/vending-machine'
import { amazonLockerSolution } from './batch2/amazon-locker'
import { cabBookingSolution } from './batch2/cab-booking'
import { carRentalSolution } from './batch2/car-rental'
import { couponSystemSolution } from './batch2/coupon-system'
import { cricketScoreboardSolution } from './batch2/cricket-scoreboard'
import { designPastebinSolution } from './batch2/design-pastebin'
import { flightReservationSolution } from './batch2/flight-reservation'
import { foodDeliverySolution } from './batch2/food-delivery'
import { hotelBookingSolution } from './batch2/hotel-booking'
import { inventoryManagementSolution } from './batch2/inventory-management'
import { linkedinSolution } from './batch2/linkedin'
import { movieTicketBookingSolution } from './batch2/movie-ticket-booking'
import { notificationServiceSolution } from './batch2/notification-service'
import { onlineCodeJudgeSolution } from './batch2/online-code-judge'
import { onlineStockBrokerageSolution } from './batch2/online-stock-brokerage'
import { shoppingCartSolution } from './batch2/shopping-cart'
import { splitwiseSolution } from './batch2/splitwise'
import { spotifySolution } from './batch2/spotify'
import { stackOverflowSolution } from './batch2/stack-overflow'
import { zoomSolution } from './batch2/zoom'
import { apiGatewaySolution } from './batch3/api-gateway'
import { collaborativeTextEditorSolution } from './batch3/collaborative-text-editor'
import { distributedCacheSolution } from './batch3/distributed-cache'
import { distributedMessageQueueSolution } from './batch3/distributed-message-queue'
import { facebookSolution } from './batch3/facebook'
import { googleDriveSolution } from './batch3/google-drive'
import { instagramSolution } from './batch3/instagram'
import { netflixSolution } from './batch3/netflix'
import { paymentGatewaySolution } from './batch3/payment-gateway'
import { realTimeLeaderboardSolution } from './batch3/real-time-leaderboard'
import { rideSharingBackendSolution } from './batch3/ride-sharing-backend'
import { searchAutocompleteSolution } from './batch3/search-autocomplete'
import { twitterSolution } from './batch3/twitter'
import { typeaheadSearchSolution } from './batch3/typeahead-search'
import { uberFullSolution } from './batch3/uber-full'
import { urlShortenerSolution } from './batch3/url-shortener'
import { webCrawlerSolution } from './batch3/web-crawler'
import { whatsappSolution } from './batch3/whatsapp'
import { yelpLocalSearchSolution } from './batch3/yelp-local-search'
import { youtubeSolution } from './batch3/youtube'
import { airlineBoardingSeatAssignmentSolution } from './batch4/airline-boarding-seat-assignment'
import { battleshipGameSolution } from './batch4/battleship-game'
import { cafeteriaCheckoutBillingSolution } from './batch4/cafeteria-checkout-billing'
import { coffeeVendingMachineSolution } from './batch4/coffee-vending-machine'
import { contactManagementSolution } from './batch4/contact-management'
import { ebookLendingPlatformSolution } from './batch4/ebook-lending-platform'
import { eventTicketingPlatformSolution } from './batch4/event-ticketing-platform'
import { gymMembershipClassBookingSolution } from './batch4/gym-membership-class-booking'
import { hospitalAppointmentSchedulingSolution } from './batch4/hospital-appointment-scheduling'
import { ludoBoardGameSolution } from './batch4/ludo-board-game'
import { memoryMatchingGameSolution } from './batch4/memory-matching-game'
import { onlineAuctionSystemSolution } from './batch4/online-auction-system'
import { onlineSurveyFormBuilderSolution } from './batch4/online-survey-form-builder'
import { p2pDigitalWalletSolution } from './batch4/p2p-digital-wallet'
import { restaurantPosKitchenDisplaySolution } from './batch4/restaurant-pos-kitchen-display'
import { simpleLruCacheSolution } from './batch4/simple-lru-cache'
import { stopwatchLapTimerSolution } from './batch4/stopwatch-lap-timer'
import { taskManagementSolution } from './batch4/task-management'
import { textEditorUndoRedoSolution } from './batch4/text-editor-undo-redo'
import { weatherStationObserverSolution } from './batch4/weather-station-observer'
import { airlineManagementSolution } from './batch5/airline-management'
import { cloudFileSyncClientSolution } from './batch5/cloud-file-sync-client'
import { contentDeliveryNetworkSolution } from './batch5/content-delivery-network'
import { customerSupportTicketingSolution } from './batch5/customer-support-ticketing'
import { distributedJobSchedulerSolution } from './batch5/distributed-job-scheduler'
import { distributedLockManagerSolution } from './batch5/distributed-lock-manager'
import { distributedNotificationFanoutSolution } from './batch5/distributed-notification-fanout'
import { distributedRateLimiterSolution } from './batch5/distributed-rate-limiter'
import { elevatorGroupControlSystemSolution } from './batch5/elevator-group-control-system'
import { fitnessTrackerAppSolution } from './batch5/fitness-tracker-app'
import { liveVideoStreamingPlatformSolution } from './batch5/live-video-streaming-platform'
import { loyaltyPointsRewardsProgramSolution } from './batch5/loyalty-points-rewards-program'
import { multiplayerTictactoeMatchmakingSolution } from './batch5/multiplayer-tictactoe-matchmaking'
import { newsFeedRankingSystemSolution } from './batch5/news-feed-ranking-system'
import { onlinePollingVotingPlatformSolution } from './batch5/online-polling-voting-platform'
import { podcastPlatformSolution } from './batch5/podcast-platform'
import { recipeMealPlanningSolution } from './batch5/recipe-meal-planning'
import { restaurantManagementSolution } from './batch5/restaurant-management'
import { socialEventPlanningAppSolution } from './batch5/social-event-planning-app'
import { warehouseOrderFulfillmentSolution } from './batch5/warehouse-order-fulfillment'
import { adClickTrackingBillingSolution } from './batch6/ad-click-tracking-billing'
import { courseRegistrationSolution } from './batch6/course-registration'
import { distributedMetricsMonitoringSolution } from './batch6/distributed-metrics-monitoring'
import { distributedSessionStoreSolution } from './batch6/distributed-session-store'
import { distributedTaskQueueSolution } from './batch6/distributed-task-queue'
import { distributedUniqueIdGeneratorSolution } from './batch6/distributed-unique-id-generator'
import { fraudDetectionSystemSolution } from './batch6/fraud-detection-system'
import { multiplayerGameMatchmakingSolution } from './batch6/multiplayer-game-matchmaking'
import { realtimeCollaborativeCodeEditorSolution } from './batch6/realtime-collaborative-code-editor'
import { searchEngineIndexingSystemSolution } from './batch6/search-engine-indexing-system'

/**
 * Official practice-problem solutions keyed by problem slug.
 * Native gold-schema modules register directly; legacy/scaffold modules go through adaptSolution.
 */
function registerAdapted(...raws: unknown[]): Record<string, ProblemSolution> {
  return Object.fromEntries(
    raws.map(raw => {
      const adapted = adaptSolution(raw as Record<string, unknown>)
      return [adapted.slug, adapted] as const
    }),
  )
}

const REGISTRY: Record<string, ProblemSolution> = {
  // Native gold-schema modules
  [atmMachineSolution.slug]: atmMachineSolution,
  [basicCalculatorSolution.slug]: basicCalculatorSolution,
  [chessGameSolution.slug]: chessGameSolution,
  [cronJobSchedulerSolution.slug]: cronJobSchedulerSolution,
  [deckOfCardsSolution.slug]: deckOfCardsSolution,
  [digitalWalletSolution.slug]: digitalWalletSolution,
  [elevatorSystemSolution.slug]: elevatorSystemSolution,
  [inMemoryFileSystemSolution.slug]: inMemoryFileSystemSolution,
  [libraryManagementSolution.slug]: libraryManagementSolution,
  [loggingFrameworkSolution.slug]: loggingFrameworkSolution,
  [meetingRoomBookingSolution.slug]: meetingRoomBookingSolution,
  [parkingLotSolution.slug]: parkingLotSolution,
  [pubSubSystemSolution.slug]: pubSubSystemSolution,
  [quizTriviaEngineSolution.slug]: quizTriviaEngineSolution,
  [rateLimiterSolution.slug]: rateLimiterSolution,
  [restaurantTableReservationSolution.slug]: restaurantTableReservationSolution,
  [snakeAndLadderSolution.slug]: snakeAndLadderSolution,
  [ticTacToeSolution.slug]: ticTacToeSolution,
  [trafficLightSystemSolution.slug]: trafficLightSystemSolution,
  [vendingMachineSolution.slug]: vendingMachineSolution,
  [amazonLockerSolution.slug]: amazonLockerSolution,
  [cabBookingSolution.slug]: cabBookingSolution,
  [carRentalSolution.slug]: carRentalSolution,
  [couponSystemSolution.slug]: couponSystemSolution,
  [cricketScoreboardSolution.slug]: cricketScoreboardSolution,
  [designPastebinSolution.slug]: designPastebinSolution,
  [flightReservationSolution.slug]: flightReservationSolution,
  [foodDeliverySolution.slug]: foodDeliverySolution,
  [hotelBookingSolution.slug]: hotelBookingSolution,
  [inventoryManagementSolution.slug]: inventoryManagementSolution,
  [linkedinSolution.slug]: linkedinSolution,
  [movieTicketBookingSolution.slug]: movieTicketBookingSolution,
  [notificationServiceSolution.slug]: notificationServiceSolution,
  [onlineCodeJudgeSolution.slug]: onlineCodeJudgeSolution,
  [onlineStockBrokerageSolution.slug]: onlineStockBrokerageSolution,
  [shoppingCartSolution.slug]: shoppingCartSolution,
  [splitwiseSolution.slug]: splitwiseSolution,
  [spotifySolution.slug]: spotifySolution,
  [stackOverflowSolution.slug]: stackOverflowSolution,
  [zoomSolution.slug]: zoomSolution,
  [apiGatewaySolution.slug]: apiGatewaySolution,
  [collaborativeTextEditorSolution.slug]: collaborativeTextEditorSolution,
  [distributedCacheSolution.slug]: distributedCacheSolution,
  [distributedMessageQueueSolution.slug]: distributedMessageQueueSolution,
  [facebookSolution.slug]: facebookSolution,
  [googleDriveSolution.slug]: googleDriveSolution,
  [instagramSolution.slug]: instagramSolution,
  [netflixSolution.slug]: netflixSolution,
  [paymentGatewaySolution.slug]: paymentGatewaySolution,
  [realTimeLeaderboardSolution.slug]: realTimeLeaderboardSolution,
  [rideSharingBackendSolution.slug]: rideSharingBackendSolution,
  [searchAutocompleteSolution.slug]: searchAutocompleteSolution,
  [twitterSolution.slug]: twitterSolution,
  [typeaheadSearchSolution.slug]: typeaheadSearchSolution,
  [uberFullSolution.slug]: uberFullSolution,
  [urlShortenerSolution.slug]: urlShortenerSolution,
  [webCrawlerSolution.slug]: webCrawlerSolution,
  [whatsappSolution.slug]: whatsappSolution,
  [yelpLocalSearchSolution.slug]: yelpLocalSearchSolution,
  [youtubeSolution.slug]: youtubeSolution,
  [airlineBoardingSeatAssignmentSolution.slug]: airlineBoardingSeatAssignmentSolution,
  [battleshipGameSolution.slug]: battleshipGameSolution,
  [cafeteriaCheckoutBillingSolution.slug]: cafeteriaCheckoutBillingSolution,
  [coffeeVendingMachineSolution.slug]: coffeeVendingMachineSolution,
  [contactManagementSolution.slug]: contactManagementSolution,
  [ebookLendingPlatformSolution.slug]: ebookLendingPlatformSolution,
  [eventTicketingPlatformSolution.slug]: eventTicketingPlatformSolution,
  [gymMembershipClassBookingSolution.slug]: gymMembershipClassBookingSolution,
  [hospitalAppointmentSchedulingSolution.slug]: hospitalAppointmentSchedulingSolution,
  [ludoBoardGameSolution.slug]: ludoBoardGameSolution,
  [memoryMatchingGameSolution.slug]: memoryMatchingGameSolution,
  [onlineAuctionSystemSolution.slug]: onlineAuctionSystemSolution,
  [onlineSurveyFormBuilderSolution.slug]: onlineSurveyFormBuilderSolution,
  [p2pDigitalWalletSolution.slug]: p2pDigitalWalletSolution,
  [restaurantPosKitchenDisplaySolution.slug]: restaurantPosKitchenDisplaySolution,
  [simpleLruCacheSolution.slug]: simpleLruCacheSolution,
  [stopwatchLapTimerSolution.slug]: stopwatchLapTimerSolution,
  [taskManagementSolution.slug]: taskManagementSolution,
  [textEditorUndoRedoSolution.slug]: textEditorUndoRedoSolution,
  [weatherStationObserverSolution.slug]: weatherStationObserverSolution,
  [airlineManagementSolution.slug]: airlineManagementSolution,
  [cloudFileSyncClientSolution.slug]: cloudFileSyncClientSolution,
  [contentDeliveryNetworkSolution.slug]: contentDeliveryNetworkSolution,
  [customerSupportTicketingSolution.slug]: customerSupportTicketingSolution,
  [distributedJobSchedulerSolution.slug]: distributedJobSchedulerSolution,
  [distributedLockManagerSolution.slug]: distributedLockManagerSolution,
  [distributedNotificationFanoutSolution.slug]: distributedNotificationFanoutSolution,
  [distributedRateLimiterSolution.slug]: distributedRateLimiterSolution,
  [elevatorGroupControlSystemSolution.slug]: elevatorGroupControlSystemSolution,
  [fitnessTrackerAppSolution.slug]: fitnessTrackerAppSolution,
  [liveVideoStreamingPlatformSolution.slug]: liveVideoStreamingPlatformSolution,
  [loyaltyPointsRewardsProgramSolution.slug]: loyaltyPointsRewardsProgramSolution,
  [multiplayerTictactoeMatchmakingSolution.slug]: multiplayerTictactoeMatchmakingSolution,
  [newsFeedRankingSystemSolution.slug]: newsFeedRankingSystemSolution,
  [onlinePollingVotingPlatformSolution.slug]: onlinePollingVotingPlatformSolution,
  [podcastPlatformSolution.slug]: podcastPlatformSolution,
  [recipeMealPlanningSolution.slug]: recipeMealPlanningSolution,
  [restaurantManagementSolution.slug]: restaurantManagementSolution,
  [socialEventPlanningAppSolution.slug]: socialEventPlanningAppSolution,
  [warehouseOrderFulfillmentSolution.slug]: warehouseOrderFulfillmentSolution,
  [adClickTrackingBillingSolution.slug]: adClickTrackingBillingSolution,
  [courseRegistrationSolution.slug]: courseRegistrationSolution,
  [distributedMetricsMonitoringSolution.slug]: distributedMetricsMonitoringSolution,
  [distributedSessionStoreSolution.slug]: distributedSessionStoreSolution,
  [distributedTaskQueueSolution.slug]: distributedTaskQueueSolution,
  [distributedUniqueIdGeneratorSolution.slug]: distributedUniqueIdGeneratorSolution,
  [fraudDetectionSystemSolution.slug]: fraudDetectionSystemSolution,
  [multiplayerGameMatchmakingSolution.slug]: multiplayerGameMatchmakingSolution,
  [realtimeCollaborativeCodeEditorSolution.slug]: realtimeCollaborativeCodeEditorSolution,
  [searchEngineIndexingSystemSolution.slug]: searchEngineIndexingSystemSolution,


}

function finalizeSolution(s: ProblemSolution): ProblemSolution {
  return ensureExtras(ensureUmlGuide(s))
}

export function getProblemSolution(slug: string): ProblemSolution | undefined {
  const s = REGISTRY[slug]
  if (!s) return undefined
  return finalizeSolution(s)
}

export function listSolutionSlugs(): string[] {
  return Object.keys(REGISTRY)
}

export function registerSolutions(solutions: ProblemSolution[]) {
  for (const s of solutions) REGISTRY[s.slug] = finalizeSolution(s)
}

export type { ProblemSolution }
