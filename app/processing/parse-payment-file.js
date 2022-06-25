const getPaymentRequestsFromFile = require('./get-payment-requests-from-file')
const { sendBatchProcessedEvents, sendBatchErrorEvent } = require('../event')
const { sendPaymentBatchMessage } = require('../messaging')

const parsePaymentFile = async (filename, fileBuffer, scheme, sequence) => {
  try {
    const { paymentRequests, batchExportDate } = await getPaymentRequestsFromFile(fileBuffer, scheme)
    await sendBatchProcessedEvents(filename, paymentRequests, sequence, batchExportDate)
    await sendPaymentBatchMessage(paymentRequests)
    return true
  } catch (err) {
    await sendBatchErrorEvent(filename, err)
    console.error(err)
  }
  return false
}

module.exports = parsePaymentFile