/*
 * @Descripttion: 海报渲染控制器
 * @version: 1.0.0
 * @Author: falost
 * @Date: 2019-12-30 09:10:05
 * @LastEditors: falost
 * @LastEditTime: 2020-04-01 17:54:47
 */
import { Controller } from 'egg';

export default class PosterController extends Controller {
  public async getPoster() {
    const { ctx } = this;
    ctx.body = await ctx.service.poster.getPoster()
  }
}