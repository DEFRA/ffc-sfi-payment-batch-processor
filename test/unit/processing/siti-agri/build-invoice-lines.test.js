const { buildInvoiceLines, isInvoiceLineValid } = require('../../../../app/processing/siti-agri/build-invoice-lines')

global.console.error = jest.fn()

describe('Build invoice lines', () => {
  let invoiceLines

  beforeEach(() => {
    invoiceLines = [{
      schemeCode: 'SITIELM',
      accountCode: 'ABC123',
      fundCode: 'ABC12',
      agreementNumber: 'A00000001',
      description: 'G00 - Gross value of claim',
      value: 100,
      convergence: true,
      deliveryBody: 'RP00'
    }]
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('build invoice lines', async () => {
    const invoiceLinesParse = buildInvoiceLines(invoiceLines)
    expect(invoiceLinesParse).toMatchObject([
      {
        schemeCode: 'SITIELM',
        accountCode: 'ABC123',
        fundCode: 'ABC12',
        description: 'G00 - Gross value of claim',
        value: 100,
        convergence: true,
        deliveryBody: 'RP00'
      }
    ])
  })

  test('Successful validation of invoice lines', async () => {
    const invoiceLineIsValid = isInvoiceLineValid(invoiceLines[0])
    expect(invoiceLineIsValid.result).toBe(true)
  })

  test('Failed validation of invoice lines for schemeCode', async () => {
    invoiceLines[0].schemeCode = 123
    const invoiceLineIsValid = isInvoiceLineValid(invoiceLines[0])
    expect(console.error).toHaveBeenLastCalledWith('Invoice line is invalid. "schemeCode" must be a string')
    expect(invoiceLineIsValid.result).toBe(false)
  })

  test('Failed validation of invoice lines for accountCode', async () => {
    invoiceLines[0].accountCode = 'ABC'
    const invoiceLineIsValid = isInvoiceLineValid(invoiceLines[0])
    expect(console.error).toHaveBeenLastCalledWith('Invoice line is invalid. "accountCode" with value "ABC" fails to match the required pattern: /^[A-Z]{3}\\d{3}$/')
    expect(invoiceLineIsValid.result).toBe(false)
  })

  test('Failed validation of invoice lines for fundCode', async () => {
    invoiceLines[0].fundCode = 'ABC'
    const invoiceLineIsValid = isInvoiceLineValid(invoiceLines[0])
    expect(console.error).toHaveBeenLastCalledWith('Invoice line is invalid. "fundCode" with value "ABC" fails to match the required pattern: /^[A-Z]{3}\\d{2}$/')
    expect(invoiceLineIsValid.result).toBe(false)
  })

  test('Failed validation of invoice lines for agreementNumber', async () => {
    invoiceLines[0].agreementNumber = 1234
    const invoiceLineIsValid = isInvoiceLineValid(invoiceLines[0])
    expect(console.error).toHaveBeenLastCalledWith('Invoice line is invalid. "agreementNumber" must be a string')
    expect(invoiceLineIsValid.result).toBe(false)
  })

  test('Failed validation of invoice lines for description', async () => {
    invoiceLines[0].description = 'Gross value of claim'
    const invoiceLineIsValid = isInvoiceLineValid(invoiceLines[0])
    expect(console.error).toHaveBeenLastCalledWith('Invoice line is invalid. "description" with value "Gross value of claim" fails to match the required pattern: /^[A-Z]{1}\\d{2}\\s-\\s.+$/')
    expect(invoiceLineIsValid.result).toBe(false)
  })

  test('Failed validation of invoice lines for value', async () => {
    invoiceLines[0].value = 'ABC'
    const invoiceLineIsValid = isInvoiceLineValid(invoiceLines[0])
    expect(console.error).toHaveBeenLastCalledWith('Invoice line is invalid. "value" must be a number')
    expect(invoiceLineIsValid.result).toBe(false)
  })

  test('Failed validation of invoice lines for convergence', async () => {
    invoiceLines[0].convergence = 'Y'
    const invoiceLineIsValid = isInvoiceLineValid(invoiceLines[0])
    expect(console.error).toHaveBeenLastCalledWith('Invoice line is invalid. "convergence" must be a boolean')
    expect(invoiceLineIsValid.result).toBe(false)
  })

  test('Failed validation of invoice lines for deliveryBody', async () => {
    invoiceLines[0].deliveryBody = 'RP'
    const invoiceLineIsValid = isInvoiceLineValid(invoiceLines[0])
    expect(console.error).toHaveBeenLastCalledWith('Invoice line is invalid. "deliveryBody" with value "RP" fails to match the required pattern: /^[A-Z]{2}\\d{2}$/')
    expect(invoiceLineIsValid.result).toBe(false)
  })
})
