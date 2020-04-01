/*
 * @Descripttion: 海报渲染服务
 * @version: 1.0.0
 * @Author: falost
 * @Date: 2019-08-27 17:45:32
 * @LastEditors: falost
 * @LastEditTime: 2020-04-01 17:51:45
 */
import { Service } from 'egg'
import { createHash } from 'crypto'
import PuppenteerHelper from '../libs/heleper/PuppenteerHelper'
import { formatNumber } from "../utils/utils";
/**
 * Index Service
 */
export default class Poster extends Service {
  oneDay = 24 * 60 * 60
  /**
   * @name getPoster
   * @desc 获取首页信息
   * @author Falost
   * @time 2019年12月21日 20:31:29 星期六
   * @param {Object} {}
   * @return  {*}
   */
  public async getPoster() {
    
    const result = await this.handleSnapshot()

    return {code: 10000, message: 'ok', entity: result}
  }
  async handleSnapshot () {
    let html = this.ctx.query.html
    let htmlRedisKey = createHash('sha256').update(html).digest('hex')
    return await this.generateSnapshot(htmlRedisKey)
  }
  async generateSnapshot(htmlRedisKey) {
    let poster
    let date = new Date()
    const {
      html,
      width = 375,
      height = 667,
      quality = 80,
      ratio = 2,
      type: imageType = 'jpeg',
    } = this.ctx.query
    let path = `${this.app.config.static.dir}/upload/${date.getFullYear()}/${formatNumber(date.getMonth() + 1)}`
    try {
      poster = await new PuppenteerHelper().createImg({
        html,
        width,
        height,
        quality,
        ratio,
        imageType,
        fileType: 'path',
        htmlRedisKey,
        path
      })
    } catch (err) {
      // logger
      console.log(err)
    }
    poster = poster && poster.replace(this.app.config.static.dir, `${this.app.config.staticPath}/public`)
    return {
      img: poster || ''
    }
  }
}