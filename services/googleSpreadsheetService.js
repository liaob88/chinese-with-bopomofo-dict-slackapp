const { GoogleSpreadsheet } = require('google-spreadsheet');
const cred = require('../google-cred.json');

class GoogleSpreadsheetService {
  constructor() {
    this.doc = new GoogleSpreadsheet(
      '1wChjNXTcf82f90nin5ys6ESGhfZznLfc8_iFUXEuoW0'
    );
    this.sheet = null;
  }

  async initSheet() {
    await this.authorizeDoc(this.doc);
    this.sheet = await this.getSheet(this.doc, 0);
  }

  async authorizeDoc(doc) {
    await doc.useServiceAccountAuth(cred);
  }

  async getSheet(doc, sheetIndex) {
    await doc.loadInfo();
    return doc.sheetsByIndex[sheetIndex];
  }

  async addToSpreadSheet(data) {
    try {
      const targetCells = await this.getTargetCells(this.sheet);
      const dataObj = this.getDataObj(data);
      this.setDataOnCells(dataObj, targetCells);
      await this.sheet.saveUpdatedCells();
    } catch (error) {
      console.log(error);
    }
  }

  async getTargetCells(sheet) {
    const targetRowNumber = await this.getTargetRowNumber(sheet);
    await this.loadTargetCells(sheet, targetRowNumber);

    const chineseCell = sheet.getCell(targetRowNumber, 1);
    const pinyinCell = sheet.getCell(targetRowNumber, 2);
    const japaneseCell = sheet.getCell(targetRowNumber, 3);

    return {
      chineseCell,
      pinyinCell,
      japaneseCell
    };
  }

  getDataObj(data) {
    const dataArray = data.split('\n');
    return {
      chinese: dataArray[0].split('の')[0],
      pinyin: dataArray[2].split('】')[1],
      japanese: dataArray[3].split('】')[1]
    };
  }

  setDataOnCells(dataObj, targetCells) {
    const { chinese, pinyin, japanese } = dataObj;
    const { chineseCell, pinyinCell, japaneseCell } = targetCells;

    chineseCell.value = chinese;
    pinyinCell.value = pinyin;
    japaneseCell.value = japanese;
  }

  async getTargetRowNumber(sheet) {
    const currentRows = await sheet.getRows();
    const lastWrittenRowNumber = currentRows.length;
    return lastWrittenRowNumber + 1;
  }

  async loadTargetCells(sheet, targetRowNumber) {
    await sheet.loadCells({
      startRowIndex: targetRowNumber,
      startColumnIndex: 0,
      endColumnIndex: 4
    });
  }
}

module.exports = GoogleSpreadsheetService;
