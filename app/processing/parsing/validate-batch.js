const getValueInPence = require('./get-value-in-pence')
const { convertToPence } = require('../../currency-convert')
const schema = require('./schemas/batch-header')

const validateBatch = (batchHeader, paymentRequests) => {
  if (batchHeader.length !== 1) return false

  const validSchema = isValidSchema(batchHeader[0])
  const numberOfPaymentRequestsValid = batchHeader[0].numberOfPaymentRequests === paymentRequests.length
  const batchValueTotalsValid = convertToPence(batchHeader[0].batchValue) === getValueInPence(paymentRequests, 'value')
  const invoiceLinesValuesValid = validateLineTotals(paymentRequests)
  const numberOfBatchHeadersValid = batchHeader.length === 1
  return validSchema && numberOfPaymentRequestsValid && batchValueTotalsValid && invoiceLinesValuesValid && numberOfBatchHeadersValid
}

const isValidSchema = (batchHeader) => {
  const validationResult = schema.validate(batchHeader)
  if (validationResult.error) {
    console.error(`Batch header is invalid. ${validationResult.error.message}`)
    return false
  }
  return true
}

const validateLineTotals = (paymentRequests) => {
  return paymentRequests
    .every(a => convertToPence(a.value) === getValueInPence(a.invoiceLines, 'value'))
}

module.exports = validateBatch