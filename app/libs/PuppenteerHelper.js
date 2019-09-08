/*
 * @Descripttion: 
 * @version: 
 * @Author: falost
 * @Date: 2019-08-27 11:43:41
 * @LastEditors: falost
 * @LastEditTime: 2019-08-27 16:38:34
 */
const puppeteer = require('puppeteer')
const { mkdirsSync, formatNumber } = require('../utils/utils')

class PuppenteerHelper {
  async createImg(params) {
    const browser = await puppeteer.launch({
      headless: true, // 默认为 true 打开浏览器，设置 false 打开
    })
    const date = new Date()
    const path = `static/upload/${date.getFullYear()}/${formatNumber(date.getMonth() + 1)}`
    mkdirsSync(path)
    const page = await browser.newPage()
    await page.setViewport({
      width: params.width,
      height: params.height,
      deviceScaleFactor: params.ratio
    })
    await page.setContent(params.html)
    await this.waitForNetworkIdle(page, 50)
    let filePath
    if (params.fileType === 'path') {
      filePath = `${path}/${params.htmlRedisKey}.${params.imageType}`
      await page.screenshot({
        path: filePath,
        fullPage: false,
        omitBackground: true
      })
    } else {
      filePath = await page.screenshot({
        fullPage: false,
        omitBackground: true,
        encoding: 'base64'
      })
    }
    browser.close()
    return filePath
  }
  waitForNetworkIdle(page, timeout, maxInflightRequests = 0) {  
    page.on('request', onRequestStarted);
    page.on('requestfinished', onRequestFinished);
    page.on('requestfailed', onRequestFinished);
  
    let inflight = 0;
    let fulfill;
    let promise = new Promise(x => fulfill = x);
    let timeoutId = setTimeout(onTimeoutDone, timeout);
    return promise;
  
    function onTimeoutDone() {
      page.removeListener('request', onRequestStarted);
      page.removeListener('requestfinished', onRequestFinished);
      page.removeListener('requestfailed', onRequestFinished);
      fulfill();
    }
  
    function onRequestStarted() {
      ++inflight;
      if (inflight > maxInflightRequests)
        clearTimeout(timeoutId);
    }
  
    function onRequestFinished() {
      if (inflight === 0)
        return;
      --inflight;
      if (inflight === maxInflightRequests)
        timeoutId = setTimeout(onTimeoutDone, timeout);
    }
  }
}
module.exports = new PuppenteerHelper()