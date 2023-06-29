const mockPublishEvent = jest.fn()

const MockEventPublisher = jest.fn().mockImplementation(() => {
  return {
    publishEvent: mockPublishEvent
  }
})

jest.mock('ffc-pay-event-publisher', () => {
  return {
    EventPublisher: MockEventPublisher
  }
})

jest.mock('../../../app/config/processing')
const processingConfig = require('../../../app/config/processing')

jest.mock('../../../app/config/message')
const messageConfig = require('../../../app/config/message')

const { sendBatchQuarantineEvent } = require('../../../app/event')
const { SOURCE } = require('../../../app/constants/source')
const { BATCH_QUARANTINED } = require('../../../app/constants/events')

let filename

describe('V2 events for batch quarantine', () => {
  beforeEach(async () => {
    processingConfig.useV2Events = true
    messageConfig.eventsTopic = 'v2-events'

    filename = 'SITIELM0001_AP_1.dat'
  })

  afterEach(async () => {
    jest.clearAllMocks()
  })

  test('should send V2 event if V2 events enabled', async () => {
    processingConfig.useV2Events = true
    await sendBatchQuarantineEvent(filename)
    expect(mockPublishEvent).toHaveBeenCalled()
  })

  test('should not send V2 event if V2 events disabled', async () => {
    processingConfig.useV2Events = false
    await sendBatchQuarantineEvent(filename)
    expect(mockPublishEvent).not.toHaveBeenCalled()
  })

  test('should send event to V2 topic', async () => {
    await sendBatchQuarantineEvent(filename)
    expect(MockEventPublisher.mock.calls[0][0]).toBe(messageConfig.eventsTopic)
  })

  test('should raise an event with batch processor source', async () => {
    await sendBatchQuarantineEvent(filename)
    expect(mockPublishEvent.mock.calls[0][0].source).toBe(SOURCE)
  })

  test('should raise quarantined event type', async () => {
    await sendBatchQuarantineEvent(filename)
    expect(mockPublishEvent.mock.calls[0][0].type).toBe(BATCH_QUARANTINED)
  })

  test('should raise an event with filename as subject', async () => {
    await sendBatchQuarantineEvent(filename)
    expect(mockPublishEvent.mock.calls[0][0].subject).toBe(filename)
  })

  test('should include error message in event data', async () => {
    await sendBatchQuarantineEvent(filename)
    expect(mockPublishEvent.mock.calls[0][0].data.message).toBe('Batch quarantined')
  })

  test('should include filename in event data', async () => {
    await sendBatchQuarantineEvent(filename)
    expect(mockPublishEvent.mock.calls[0][0].data.filename).toBe(filename)
  })
})
