jest.mock('../../../app/parse-siti-payment-file/build-payment-requests')
const buildPaymentRequests = require('../../../app/processing/parsing/build-payment-requests')

jest.mock('../../../app/parse-siti-payment-file/validate')
const validate = require('../../../app/processing/parsing/validate-batch')

const { buildAndTransformParseFile } = require('../../../app/processing/parsing/get-payment-requests')
const { LUMP_SUMS, SFI_PILOT, SFI } = require('../../../app/schemes')

let fileBuffer
let schemeType

let batchHeaders
let batchPaymentRequestsSFI
let batchPaymentRequestsLumpSums

describe('SITI payment file batch header is split into batches, headers and lines', () => {
  beforeEach(async () => {
    fileBuffer = Buffer.from('B^2021-08-12^2^200^0001^SFIP^AP\r\nH^SFI00000001^01^SFIP000001^1^1000000001^GBP^100^RP00^GBP^SFIP^M12\r\nL^SFI00000001^100^2022^80001^DRD10^SIP00000000001^RP00^N^1^G00 - Gross value of claim^2022-12-01^2022-12-01^SOS27\r\nH^SFI00000002^03^SFIP000002^2^1000000002^GBP^100^RP00^GBP^SFIP^M12\r\nL^SFI00000002^100^2022^80001^DRD10^SIP00000000002^RP00^N^1^G00 - Gross value of claim^2022-12-01^2022-12-01^SOS273\r\n')
    schemeType = {
      batchId: '0001',
      scheme: SFI_PILOT
    }

    batchHeaders = [{
      batchValue: 200,
      exportDate: '2021-08-12',
      ledger: 'AP',
      numberOfPaymentRequests: 2,
      sequence: '0001',
      sourceSystem: 'SFIP'
    }]

    batchPaymentRequestsSFI = [{
      contractNumber: 'SFIP000001',
      currency: 'GBP',
      deliveryBody: 'RP00',
      frn: '1000000001',
      invoiceNumber: 'SFI00000001',
      paymentRequestNumber: 1,
      schedule: 'M12',
      value: 100,
      invoiceLines: [{
        accountCode: 'SOS27',
        agreementNumber: 'SIP00000000001',
        deliveryBody: 'RP00',
        description: 'G00 - Gross value of claim',
        dueDate: '2022-12-01',
        fundCode: 'DRD10',
        invoiceNumber: 'SFI00000001',
        marketingYear: '2022',
        schemeCode: '80001',
        value: 100
      }]
    },
    {
      contractNumber: 'SFIP000002',
      currency: 'GBP',
      deliveryBody: 'RP00',
      frn: '1000000002',
      invoiceNumber: 'SFI00000002',
      paymentRequestNumber: 3,
      schedule: 'M12',
      value: 100,
      invoiceLines: [{
        accountCode: 'SOS273',
        agreementNumber: 'SIP00000000002',
        deliveryBody: 'RP00',
        description: 'G00 - Gross value of claim',
        dueDate: '2022-12-01',
        fundCode: 'DRD10',
        invoiceNumber: 'SFI00000002',
        marketingYear: '2022',
        schemeCode: '80001',
        value: 100
      }]
    }]

    batchPaymentRequestsLumpSums = [{
      contractNumber: 'L0000001',
      currency: 'GBP',
      deliveryBody: 'RP00',
      frn: '1000000001',
      invoiceNumber: 'LSES0000001',
      paymentRequestNumber: 1,
      value: 100,
      invoiceLines: [{
        deliveryBody: 'RP00',
        description: 'G00 - Gross value of claim',
        dueDate: '2022-12-01',
        fundCode: 'DOM10',
        invoiceNumber: 'LSES0000001',
        marketingYear: '2022',
        schemeCode: '10570',
        value: 100
      }]
    },
    {
      contractNumber: 'L0000002',
      currency: 'GBP',
      deliveryBody: 'RP00',
      frn: '1000000002',
      invoiceNumber: 'LSES0000002',
      paymentRequestNumber: 2,
      value: 100,
      invoiceLines: [{
        deliveryBody: 'RP00',
        description: 'G00 - Gross value of claim',
        dueDate: '2022-12-01',
        fundCode: 'DOM10',
        invoiceNumber: 'LSES0000002',
        marketingYear: '2022',
        schemeCode: '10570',
        value: 100
      }]
    }]

    validate.mockReturnValue(true)
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('should call validate when valid fileBuffer and sequence are received', async () => {
    await buildAndTransformParseFile(fileBuffer, schemeType)
    expect(validate).toHaveBeenCalled()
  })

  test('should call validate with batchHeaders, batchPaymentRequests and sequence when valid fileBuffer and sequence are received', async () => {
    await buildAndTransformParseFile(fileBuffer, schemeType)
    expect(validate).toHaveBeenCalledWith(batchHeaders, batchPaymentRequestsSFI, schemeType.batchId)
  })

  test('should call buildPaymentRequests when valid fileBuffer and sequence are received', async () => {
    await buildAndTransformParseFile(fileBuffer, schemeType)
    expect(buildPaymentRequests).toHaveBeenCalled()
  })

  test('should call buildPaymentRequests with batchPaymentRequests when validate return true and SFI Pilot input file', async () => {
    await buildAndTransformParseFile(fileBuffer, schemeType)
    expect(buildPaymentRequests).toHaveBeenCalledWith(batchPaymentRequestsSFI, 'SFIP')
  })

  test('should call buildPaymentRequests with batchPaymentRequests when validate return true and SFI input file', async () => {
    schemeType.scheme = SFI
    await buildAndTransformParseFile(fileBuffer, schemeType)
    expect(buildPaymentRequests).toHaveBeenCalledWith(batchPaymentRequestsSFI, 'SFIP')
  })

  test('should call buildPaymentRequests with batchPaymentRequests when validate return true and Lump Sums input file', async () => {
    fileBuffer = Buffer.from('B^2021-08-12^2^200^0001^LSES^AP\r\nH^LSES0000001^001^L0000001^1000000001^1^100^RP00^GBP\r\nL^LSES0000001^100^2022^10570^DOM10^RP00^1^G00 - Gross value of claim^2022-12-01\r\nH^LSES0000002^002^L0000002^1000000002^1^100^RP00^GBP\r\nL^LSES0000002^100^2022^10570^DOM10^RP00^1^G00 - Gross value of claim^2022-12-01\r\n')
    schemeType.scheme = LUMP_SUMS

    await buildAndTransformParseFile(fileBuffer, schemeType)
    expect(buildPaymentRequests).toHaveBeenCalledWith(batchPaymentRequestsLumpSums, 'LSES')
  })

  test('should reject when any line in fileBuffer starts with a character other than "B", "H" or "L"', async () => {
    fileBuffer = Buffer.from('V^2021-08-12^2^200^0001^SFIP^AP\r\nH^SFI00000001^01^SFIP000001^1^1000000001^GBP^100^RP00^GBP^SFIP^M12\r\nL^SFI00000001^100^2022^80001^DRD10^SIP00000000001^RP00^N^1^G00 - Gross value of claim^2022-12-01^2022-12-01^SOS27\r\nH^SFI00000002^03^SFIP000002^2^1000000002^GBP^100^RP00^GBP^SFIP^M12\r\nL^SFI00000002^100^2022^80001^DRD10^SIP00000000002^RP00^N^1^G00 - Gross value of claim^2022-12-01^2022-12-01^SOS273\r\n')

    const wrapper = async () => {
      await buildAndTransformParseFile(fileBuffer, schemeType)
    }

    await expect(wrapper).rejects.toThrow()
  })

  test('should reject with Error when any line in fileBuffer starts with a character other than "B", "H" or "L"', async () => {
    fileBuffer = Buffer.from('V^2021-08-12^2^200^0001^SFIP^AP\r\nH^SFI00000001^01^SFIP000001^1^1000000001^GBP^100^RP00^GBP^SFIP^M12\r\nL^SFI00000001^100^2022^80001^DRD10^SIP00000000001^RP00^N^1^G00 - Gross value of claim^2022-12-01^2022-12-01^SOS27\r\nH^SFI00000002^03^SFIP000002^2^1000000002^GBP^100^RP00^GBP^SFIP^M12\r\nL^SFI00000002^100^2022^80001^DRD10^SIP00000000002^RP00^N^1^G00 - Gross value of claim^2022-12-01^2022-12-01^SOS273\r\n')

    const wrapper = async () => {
      await buildAndTransformParseFile(fileBuffer, schemeType)
    }

    await expect(wrapper).rejects.toThrowError(Error)
  })

  test('should reject with "Invalid file" error when any line in fileBuffer starts with a character other than "B", "H" or "L"', async () => {
    fileBuffer = Buffer.from('V^2021-08-12^2^200^0001^SFIP^AP\r\nH^SFI00000001^01^SFIP000001^1^1000000001^GBP^100^RP00^GBP^SFIP^M12\r\nL^SFI00000001^100^2022^80001^DRD10^SIP00000000001^RP00^N^1^G00 - Gross value of claim^2022-12-01^2022-12-01^SOS27\r\nH^SFI00000002^03^SFIP000002^2^1000000002^GBP^100^RP00^GBP^SFIP^M12\r\nL^SFI00000002^100^2022^80001^DRD10^SIP00000000002^RP00^N^1^G00 - Gross value of claim^2022-12-01^2022-12-01^SOS273\r\n')

    const wrapper = async () => {
      await buildAndTransformParseFile(fileBuffer, schemeType)
    }

    await expect(wrapper).rejects.toThrowError('Invalid file')
  })

  test('should reject when validate returns false', async () => {
    validate.mockReturnValue(false)

    const wrapper = async () => {
      await buildAndTransformParseFile(fileBuffer, schemeType)
    }

    await expect(wrapper).rejects.toThrow()
  })

  test('should reject with Error when validate returns false', async () => {
    validate.mockReturnValue(false)

    const wrapper = async () => {
      await buildAndTransformParseFile(fileBuffer, schemeType)
    }

    await expect(wrapper).rejects.toThrowError(Error)
  })

  test('should reject with "Invalid file" error when validate returns false', async () => {
    validate.mockReturnValue(false)

    const wrapper = async () => {
      await buildAndTransformParseFile(fileBuffer, schemeType)
    }

    await expect(wrapper).rejects.toThrowError('Invalid file')
  })

  test('should not call buildPaymentRequests when validate returns false', async () => {
    validate.mockReturnValue(false)

    try {
      await buildAndTransformParseFile(fileBuffer, schemeType)
    } catch (err) { }

    expect(buildPaymentRequests).not.toHaveBeenCalled()
  })
})
