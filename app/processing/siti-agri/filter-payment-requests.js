const buildPaymentRequests = require('./build-payment-requests')
const { convertToPence, getTotalValueInPence } = require('../../currency-convert')

const paymentRequestSchema = require('./schemas/payment-request')
const { isInvoiceLineValid } = require('./build-invoice-lines')

const filterPaymentRequest = (paymentRequests, sourceSystem) => {
  const paymentRequestsCollection = { successfulPaymentRequests: [], unsuccessfulPaymentRequests: [] }
  buildPaymentRequests(paymentRequests, sourceSystem)
    .map(x => handlePaymentRequest(x, paymentRequestsCollection))
  return paymentRequestsCollection
}

const handlePaymentRequest = (paymentRequest, paymentRequestsCollection) => {
  validatePaymentRequest(paymentRequest)
    ? paymentRequestsCollection.successfulPaymentRequests.push(paymentRequest)
    : paymentRequestsCollection.unsuccessfulPaymentRequests.push(paymentRequest)
}

const validatePaymentRequest = (paymentRequest) => {
  const paymentRequestValid = isPaymentRequestValid(paymentRequest)
  const lineTotalsValid = validateLineTotals(paymentRequest)

  const invoiceLinesValid = paymentRequest.invoiceLines.map(x => isInvoiceLineValid(x))
  const invoiceLinesError = invoiceLinesValid.map(x => x.result === false ? x.errorMessage : '').filter(x => x !== '').join(' ')
  const invoiceLinesErrorObject = { result: invoiceLinesError === '', invoiceLinesError }

  const validationArray = [paymentRequestValid, lineTotalsValid, invoiceLinesErrorObject]
  validationArray.filter(x => x.result === false).forEach(x => addErrorMessage(x.paymentRequest, x.errorMessage))

  return paymentRequestValid.result && lineTotalsValid.result && invoiceLinesErrorObject.result
}

const isPaymentRequestValid = (paymentRequest) => {
  const validationResult = paymentRequestSchema.validate(paymentRequest, { abortEarly: false })
  if (validationResult.error) {
    console.error(`Payment request is invalid. ${validationResult.error.message} `)
    return { result: false, errorMessage: `${validationResult.error.message}. `, paymentRequest }
  }
  return { result: true }
}

const validateLineTotals = (paymentRequest) => {
  const validationResult = convertToPence(paymentRequest.value) === getTotalValueInPence(paymentRequest.invoiceLines, 'value')
  if (!validationResult) {
    const errorMessage = 'Payment request total value does not match invoice line total value. '
    console.error(`Payment request is invalid. ${errorMessage}`)
    return { result: false, errorMessage, paymentRequest }
  }
  return { result: true }
}

const addErrorMessage = (paymentRequest, errorMessage) => {
  paymentRequest.errorMessage ? paymentRequest.errorMessage += errorMessage : paymentRequest.errorMessage = errorMessage
  return paymentRequest
}

module.exports = filterPaymentRequest
