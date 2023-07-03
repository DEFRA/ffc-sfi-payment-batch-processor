const transformInvoiceLine = (lineData) => {
  return {
    value: !isNaN(lineData[4]) ? parseFloat(lineData[4]) : undefined,
    productCode: lineData[14],
    marketingYear: !isNaN(lineData[15]) ? parseInt(lineData[15]) : undefined,
    description: lineData[22],
    exchangeRate: lineData[10],
    eventDate: lineData[17]
  }
}

module.exports = transformInvoiceLine
