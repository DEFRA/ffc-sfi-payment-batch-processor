const { GBP } = require('../../../../app/currency')
const { Q4 } = require('../../../../app/schedules')
const { sfiPilot } = require('../../../../app/schemes')

jest.mock('uuid')
const { v4: uuidv4 } = require('uuid')

jest.mock('../../../../app/currency-convert')
const { convertToPence, getTotalValueInPence } = require('../../../../app/currency-convert')

jest.mock('../../../../app/processing/siti-agri/schemas/payment-request')
const paymentRequestSchema = require('../../../../app/processing/siti-agri/schemas/payment-request')

jest.mock('../../../../app/processing/siti-agri/handle-known-defects')
const handleKnownDefects = require('../../../../app/processing/siti-agri/handle-known-defects')

jest.mock('../../../../app/processing/siti-agri/build-invoice-lines')
const { buildInvoiceLines, isInvoiceLineValid } = require('../../../../app/processing/siti-agri/build-invoice-lines')

const buildPaymentRequests = require('../../../../app/processing/siti-agri/build-payment-requests')

describe('Build payment requests', () => {
  let sourceSystem
  let invoiceLines

  let paymentRequest
  let paymentRequests

  let mappedPaymentRequest
  let mappedPaymentRequests

  beforeEach(() => {
    sourceSystem = sfiPilot.sourceSystem

    invoiceLines = [{
      schemeCode: 'SITIELM',
      accountCode: 'ABC123',
      fundCode: 'ABC12',
      description: 'G00 - Gross value of claim',
      value: 100
    }]

    paymentRequest = {
      sourceSystem,
      frn: 1234567890,
      paymentRequestNumber: 1,
      invoiceNumber: 'SITI1234567',
      contractNumber: 'S1234567',
      currency: GBP,
      schedule: Q4,
      value: 100000,
      deliveryBody: 'RP00',
      invoiceLines
    }

    paymentRequests = [paymentRequest]

    mappedPaymentRequest = {
      ...paymentRequest,
      marketingYear: paymentRequest.invoiceLines[0].marketingYear,
      agreementNumber: paymentRequest.invoiceLines[0].agreementNumber,
      dueDate: paymentRequest.invoiceLines[0].dueDate,
      correlationId: '70cb0f07-e0cf-449c-86e8-0344f2c6cc6c'
    }

    mappedPaymentRequests = [mappedPaymentRequest]

    uuidv4.mockReturnValue('70cb0f07-e0cf-449c-86e8-0344f2c6cc6c')
    buildInvoiceLines.mockReturnValue(invoiceLines)
    handleKnownDefects.mockImplementation((x) => { return x })
    paymentRequestSchema.validate.mockReturnValue({ value: mappedPaymentRequest })
    isInvoiceLineValid.mockReturnValue(true)
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('should call uuidv4 when valid paymentRequests and sourceSystem are given', async () => {
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(uuidv4).toBeCalled()
  })

  test('should call uuidv4 once when valid paymentRequests and sourceSystem are given', async () => {
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(uuidv4).toBeCalledTimes(1)
  })

  test('should call uuidv4 twice when paymentRequests has 2 payment requests and sourceSystem are given', async () => {
    paymentRequests = [paymentRequest, paymentRequest]
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(uuidv4).toBeCalledTimes(2)
  })

  test('should not call uuidv4 when an empty paymentRequests array and valid sourceSystem are given', async () => {
    buildPaymentRequests([], sourceSystem)
    expect(uuidv4).not.toBeCalled()
  })

  test('should call buildInvoiceLines when valid paymentRequests and sourceSystem are given', async () => {
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(buildInvoiceLines).toBeCalled()
  })

  test('should call buildInvoiceLines once when valid paymentRequests and sourceSystem are given', async () => {
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(buildInvoiceLines).toBeCalledTimes(1)
  })

  test('should call buildInvoiceLines with paymentRequest.invoiceLines when valid paymentRequests and sourceSystem are given', async () => {
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(buildInvoiceLines).toBeCalledWith(paymentRequest.invoiceLines)
  })

  test('should call buildInvoiceLines twice when paymentRequests has 2 payment requests and sourceSystem are given', async () => {
    paymentRequests = [paymentRequest, paymentRequest]
    buildPaymentRequests([paymentRequest, paymentRequest], sourceSystem)
    expect(buildInvoiceLines).toBeCalledTimes(2)
  })

  test('should call buildInvoiceLines with each paymentRequests.invoiceLines when paymentRequests has 2 payment requests and sourceSystem are given', async () => {
    paymentRequests = [paymentRequest, paymentRequest]
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(buildInvoiceLines).toHaveBeenNthCalledWith(1, paymentRequests[0].invoiceLines)
    expect(buildInvoiceLines).toHaveBeenNthCalledWith(2, paymentRequests[1].invoiceLines)
  })

  test('should not call buildInvoiceLines when an empty paymentRequests array and valid sourceSystem are given', async () => {
    buildPaymentRequests([], sourceSystem)
    expect(buildInvoiceLines).not.toBeCalled()
  })

  test('should call handleKnownDefects when valid paymentRequests and sourceSystem are given', async () => {
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(handleKnownDefects).toBeCalled()
  })

  test('should call handleKnownDefects once when valid paymentRequests and sourceSystem are given', async () => {
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(handleKnownDefects).toBeCalledTimes(1)
  })

  test('should call handleKnownDefects with mappedPaymentRequest when valid paymentRequests and sourceSystem are given', async () => {
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(handleKnownDefects).toBeCalledWith(mappedPaymentRequest)
  })

  test('should call handleKnownDefects twice when paymentRequests has 2 payment requests and sourceSystem are given', async () => {
    paymentRequests = [paymentRequest, paymentRequest]
    mappedPaymentRequests = [mappedPaymentRequest, mappedPaymentRequest]

    buildPaymentRequests([paymentRequest, paymentRequest], sourceSystem)

    expect(handleKnownDefects).toBeCalledTimes(2)
  })

  test('should call handleKnownDefects with each mappedPaymentRequests when paymentRequests has 2 payment requests and sourceSystem are given', async () => {
    paymentRequests = [paymentRequest, paymentRequest]
    mappedPaymentRequests = [mappedPaymentRequest, mappedPaymentRequest]

    buildPaymentRequests(paymentRequests, sourceSystem)

    expect(handleKnownDefects).toHaveBeenNthCalledWith(1, mappedPaymentRequests[0])
    expect(handleKnownDefects).toHaveBeenNthCalledWith(2, mappedPaymentRequests[1])
  })

  test('should not call handleKnownDefects when an empty paymentRequests array and valid sourceSystem are given', async () => {
    buildPaymentRequests([], sourceSystem)
    expect(handleKnownDefects).not.toBeCalled()
  })

  test('should call paymentRequestSchema.validate when valid paymentRequests and sourceSystem are given', async () => {
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(paymentRequestSchema.validate).toBeCalled()
  })

  test('should call paymentRequestSchema.validate once when valid paymentRequests and sourceSystem are given', async () => {
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(paymentRequestSchema.validate).toBeCalledTimes(1)
  })

  test('should call paymentRequestSchema.validate with mappedPaymentRequest and { abortEarly: false } when valid paymentRequests and sourceSystem are given', async () => {
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(paymentRequestSchema.validate).toBeCalledWith(mappedPaymentRequest, { abortEarly: false })
  })

  test('should call paymentRequestSchema.validate twice when paymentRequests has 2 payment requests and sourceSystem are given', async () => {
    paymentRequests = [paymentRequest, paymentRequest]
    mappedPaymentRequests = [mappedPaymentRequest, mappedPaymentRequest]

    buildPaymentRequests([paymentRequest, paymentRequest], sourceSystem)

    expect(paymentRequestSchema.validate).toBeCalledTimes(2)
  })

  test('should call paymentRequestSchema.validate with each mappedPaymentRequests and { abortEarly: false } when paymentRequests has 2 payment requests and sourceSystem are given', async () => {
    paymentRequests = [paymentRequest, paymentRequest]
    mappedPaymentRequests = [mappedPaymentRequest, mappedPaymentRequest]

    buildPaymentRequests(paymentRequests, sourceSystem)

    expect(paymentRequestSchema.validate).toHaveBeenNthCalledWith(1, mappedPaymentRequests[0], { abortEarly: false })
    expect(paymentRequestSchema.validate).toHaveBeenNthCalledWith(2, mappedPaymentRequests[1], { abortEarly: false })
  })

  test('should not call paymentRequestSchema.validate when an empty paymentRequests array and valid sourceSystem are given', async () => {
    buildPaymentRequests([], sourceSystem)
    expect(paymentRequestSchema.validate).not.toBeCalled()
  })

  test('should call isInvoiceLineValid when valid paymentRequests and sourceSystem are given', async () => {
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(isInvoiceLineValid).toBeCalled()
  })

  test('should call isInvoiceLineValid once when valid paymentRequests and sourceSystem are given', async () => {
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(isInvoiceLineValid).toBeCalledTimes(1)
  })

  test('should call isInvoiceLineValid with mappedPaymentRequest.invoiceLines[0] when valid paymentRequests and sourceSystem are given', async () => {
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(isInvoiceLineValid).toBeCalledWith(mappedPaymentRequest.invoiceLines[0])
  })

  test('should call isInvoiceLineValid twice when paymentRequests has 2 payment requests and sourceSystem are given', async () => {
    paymentRequests = [paymentRequest, paymentRequest]
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(isInvoiceLineValid).toBeCalledTimes(2)
  })

  test('should call isInvoiceLineValid with each mappedPaymentRequests.invoiceLines[0] when paymentRequests has 2 payment requests and sourceSystem are given', async () => {
    paymentRequests = [paymentRequest, paymentRequest]
    mappedPaymentRequests = [mappedPaymentRequest, mappedPaymentRequest]

    buildPaymentRequests(paymentRequests, sourceSystem)

    expect(isInvoiceLineValid).toHaveBeenNthCalledWith(1, mappedPaymentRequests[0].invoiceLines[0])
    expect(isInvoiceLineValid).toHaveBeenNthCalledWith(2, mappedPaymentRequests[1].invoiceLines[0])
  })

  test('should call isInvoiceLineValid twice when paymentRequest has 2 invoiceLines and valid sourceSystem are given', async () => {
    invoiceLines.push(invoiceLines[0])
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(isInvoiceLineValid).toBeCalledTimes(2)
  })

  test('should call isInvoiceLineValid with each paymentRequest.invoiceLines when paymentRequest has 2 invoiceLines and valid sourceSystem are given', async () => {
    invoiceLines.push(invoiceLines[0])

    buildPaymentRequests(paymentRequests, sourceSystem)

    expect(isInvoiceLineValid).toHaveBeenNthCalledWith(1, paymentRequest.invoiceLines[0])
    expect(isInvoiceLineValid).toHaveBeenNthCalledWith(2, paymentRequest.invoiceLines[1])
  })

  test('should not call isInvoiceLineValid when an empty paymentRequests array and valid sourceSystem are given', async () => {
    buildPaymentRequests([], sourceSystem)
    expect(isInvoiceLineValid).not.toBeCalled()
  })

  test('should call convertToPence when valid paymentRequests and sourceSystem are given', async () => {
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(convertToPence).toBeCalled()
  })

  test('should call convertToPence once when valid paymentRequests and sourceSystem are given', async () => {
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(convertToPence).toBeCalledTimes(1)
  })

  test('should call convertToPence with paymentRequest.value when valid paymentRequests and sourceSystem are given', async () => {
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(convertToPence).toBeCalledWith(paymentRequest.value)
  })

  test('should call convertToPence twice when paymentRequests has 2 payment requests and sourceSystem are given', async () => {
    paymentRequests = [paymentRequest, paymentRequest]
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(convertToPence).toBeCalledTimes(2)
  })

  test('should call convertToPence with each paymentRequests.value when paymentRequests has 2 payment requests and sourceSystem are given', async () => {
    paymentRequests = [paymentRequest, paymentRequest]

    buildPaymentRequests(paymentRequests, sourceSystem)

    expect(convertToPence).toHaveBeenNthCalledWith(1, paymentRequests[0].value)
    expect(convertToPence).toHaveBeenNthCalledWith(2, paymentRequests[1].value)
  })

  test('should not call convertToPence when an empty paymentRequests array and valid sourceSystem are given', async () => {
    buildPaymentRequests([], sourceSystem)
    expect(convertToPence).not.toBeCalled()
  })

  test('should call getTotalValueInPence when valid paymentRequests and sourceSystem are given', async () => {
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(getTotalValueInPence).toBeCalled()
  })

  test('should call getTotalValueInPence once when valid paymentRequests and sourceSystem are given', async () => {
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(getTotalValueInPence).toBeCalledTimes(1)
  })

  test('should call getTotalValueInPence with mappedPaymentRequest.invoiceLines and "value" when valid paymentRequests and sourceSystem are given', async () => {
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(getTotalValueInPence).toBeCalledWith(mappedPaymentRequest.invoiceLines, 'value')
  })

  test('should call getTotalValueInPence twice when paymentRequests has 2 payment requests and sourceSystem are given', async () => {
    paymentRequests = [paymentRequest, paymentRequest]
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(getTotalValueInPence).toBeCalledTimes(2)
  })

  test('should call getTotalValueInPence with each mappedPaymentRequests.invoiceLines and "value" when paymentRequests has 2 payment requests and sourceSystem are given', async () => {
    paymentRequests = [paymentRequest, paymentRequest]
    mappedPaymentRequests = [mappedPaymentRequest, mappedPaymentRequest]

    buildPaymentRequests(paymentRequests, sourceSystem)

    expect(getTotalValueInPence).toHaveBeenNthCalledWith(1, mappedPaymentRequests[0].invoiceLines, 'value')
    expect(getTotalValueInPence).toHaveBeenNthCalledWith(2, mappedPaymentRequests[1].invoiceLines, 'value')
  })

  test('should call getTotalValueInPence once when paymentRequest has 2 invoiceLines and valid sourceSystem are given', async () => {
    invoiceLines.push(invoiceLines[0])
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(getTotalValueInPence).toBeCalledTimes(1)
  })

  test('should call getTotalValueInPence with paymentRequest.invoiceLines and "value" when paymentRequest has 2 invoiceLines and valid sourceSystem are given', async () => {
    invoiceLines.push(invoiceLines[0])
    buildPaymentRequests(paymentRequests, sourceSystem)
    expect(getTotalValueInPence).toHaveBeenCalledWith(paymentRequest.invoiceLines, 'value')
  })

  test('should not call getTotalValueInPence when an empty paymentRequests array and valid sourceSystem are given', async () => {
    buildPaymentRequests([], sourceSystem)
    expect(getTotalValueInPence).not.toBeCalled()
  })
})
