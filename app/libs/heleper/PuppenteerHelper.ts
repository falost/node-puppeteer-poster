/*
 * @Descripttion: 创建生成图片
 * @version: 1.0.0
 * @Author: falost
 * @Date: 2019-08-27 11:43:41
 * @LastEditors: falost
 * @LastEditTime: 2020-04-01 17:25:49
 */
import { launch } from "puppeteer";
import { mkdirsSync } from "../../utils/utils";

export default class PuppenteerHelper {
  async createImg(params) {
    const browser = await launch({
      headless: true, // 默认为 true 打开浏览器，设置 false 不打开
      // args: [
      //   '–disable-gpu',
      //   '–disable-dev-shm-usage',
      //   '–disable-setuid-sandbox',
      //   '–no-first-run',
      //   '–no-sandbox',
      //   '–no-zygote',
      //   '–single-process'
      // ]
    })
    mkdirsSync(params.path)
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
      filePath = `${params.path}/${params.htmlRedisKey}.${params.imageType}`
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