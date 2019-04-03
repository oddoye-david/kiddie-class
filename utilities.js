const XLSX = require('xlsx')
const fs = require('fs')
const puppeteer = require('puppeteer')
const _ = require('lodash')

/**
 * Reads excel sheet and returns data as map of { sheet: dataArray }[]
 *
 * @param {*} sheetPath
 * @param {string} [ALLOWED_SHEETS=[
 *     'CREATIVE ARTS',
 *     'CITIZENSHIP EDUCATION',
 *     'GA',
 *     'FRENCH',
 *     'ICT',
 *     'MATHEMATICS',
 *     'RME',
 *     'SCIENCE',
 *     'WORD STUDY'
 *   ]]
 * @returns { sheet: dataArray }[]
 */
function sheetsToArray(
  sheetPath,
  ALLOWED_SHEETS = [
    'CREATIVE ARTS',
    'CITIZENSHIP EDUCATION',
    'GA',
    'FRENCH',
    'ICT',
    'MATHEMATICS',
    'RME',
    'SCIENCE',
    'WORD STUDY'
  ]
) {
  // Read workbook
  const workbook = XLSX.readFile(sheetPath)
  // Get all sheet names
  const sheets = workbook.SheetNames
  // Massage sheet data into an array of objects
  return sheets.reduce((result, sheet) => {
    // Check if sheet name is in list of allowed names
    if (ALLOWED_SHEETS.includes(sheet)) {
      const worksheet = workbook.Sheets[sheet]
      // Parse worksheet into JSON
      const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 'A' })
      // First row is the headers (title row)
      const headers = sheetData.shift()
      const objArray = sheetData.map(row => {
        const keys = Object.keys(row)

        return keys.reduce((acc, key) => {
          const h = `${headers[key]}`.replace(/\s+/g, ' ').trim()
          acc[h] = row[key]
          return acc
        }, {})
      })

      result[sheet] = objArray
    }

    return result
  }, {})
}

/**
 * Genrates a PDF from given HTML
 *
 * @param {string} html
 * @param {string} pdfPath
 * @param {string} [format='A4']
 * @returns void
 */
function generatePDF(html, pdfPath, format = 'A4') {
  return puppeteer.launch({ headless: true }).then(browser => {
    return browser
      .newPage()
      .then(page => {
        return page.setContent(html).then(() => {
          return page.pdf({ path: pdfPath, format })
        })
      })
      .then(() => {
        return browser.close()
      })
  })
}

function getGrade(score) {
  if (score >= 80) {
    return 'A'
  }

  if (score >= 70) {
    return 'B'
  }

  if (score >= 60) {
    return 'C'
  }

  if (score >= 50) {
    return 'D'
  }

  if (score >= 40) {
    return 'E'
  }

  return 'F'
}

function formatData(rawData) {
  // generate summaries
  const summaries = _.reduce(
    rawData,
    (result, scores, subject) => {
      const listOfScores = _.map(scores, 'OVER ALL TOTAL= 50%+50%') // [1,2,3,4]
      const average = parseFloat(_.sum(listOfScores) / listOfScores.length).toFixed(4)
      const averageGrade = getGrade(average)
      const highest = _.max(listOfScores)
      const highestGrade = getGrade(highest)
      const lowest = _.min(listOfScores)
      const lowestGrade = getGrade(lowest)

      result.push({
        subject,
        average,
        averageGrade,
        highest,
        highestGrade,
        lowest,
        lowestGrade
      })

      return result
    },
    []
  )

  // Group data by student
  const mergedData = _.reduce(
    rawData,
    (result, scores, subject) => {
      const scoresWithSubject = _.map(scores, score =>
        _.merge({}, score, { subject })
      )
      return [...result, ...scoresWithSubject]
    },
    []
  )

  const groupedDataByName = _.groupBy(mergedData, 'NAME')

  return { summaries, studentData: groupedDataByName }
}

module.exports = {
  sheetsToArray,
  generatePDF,
  formatData
}
