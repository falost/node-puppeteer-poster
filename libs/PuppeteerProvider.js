/*
 * @Descripttion: 
 * @version: 
 * @Author: falost
 * @Date: 2019-08-27 09:56:56
 * @LastEditors: falost
 * @LastEditTime: 2019-08-27 11:43:21
 */
const puppeteer = require('puppeteer')
const thrityMinutes = 30000
const browserConcurrency = 3
class PuppeteerProvider {
  constructor() {
    this.browserList = []
  }

  /**
  - 初始化`puppeteer`实例
    */
  initBrowserInstance() {

    this.needBrowserInstance = true
    Array.from({ length: browserConcurrency }, () => {
      this.checkBrowserInstance();
    });

    // 每隔30分钟刷新一下浏览器
    this.refreshTimer = setTimeout(() => this.refreshOneBrowser(), thrityMinutes);
  }

  /**

- 检查是否还需要浏览器实例
  */
  async checkBrowserInstance() {

    if (this.needBrowserInstance) {
      this.browserList.push(this.launchBrowser());
    }

  }

  /**

- 定时刷新浏览器
  */
  refreshOneBrowser() {

    clearTimeout(this.refreshTimer);

    const browserInstance = this.browserList.shift();
    this.replaceBrowserInstance(browserInstance);

    this.checkBrowserInstance();
    // 每隔30分钟刷新一下浏览器
    this.refreshTimer = setTimeout(() => this.refreshOneBrowser(), thrityMinutes);

  }

  /**

- 替换单个浏览器实例
  *
- @param {String} browserInstance 浏览器promise
- @param {String} retries 重试次数，超过这个次数直接关闭浏览器
  */
  async replaceBrowserInstance(browserInstance, retries = 2) {

    const browser = await browserInstance;
    const openPages = await browser.pages();

    // 因为浏览器会打开一个空白页，如果当前浏览器还有任务在执行，一分钟后再关闭
    if (openPages && openPages.length > 1 && retries > 0) {
      const nextRetries = retries - 1;
      setTimeout(() => this.replaceBrowserInstance(browserInstance, nextRetries), oneMinute);
      return;
    }

    browser.close();
  }

  launchBrowser(opts = {}, retries = 1) {
    return puppeteer.launchBrowser(opts).then(chrome => {
      return chrome;
    }).catch(error => {
      if (retries > 0) {
        const nextRetries = retries - 1;
        return this.launchBrowser(opts, nextRetries);
      }

      throw error;
    });
  }
}
module.exports = new PuppeteerProvider()