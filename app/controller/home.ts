/*
 * @Descripttion: 主页控制器
 * @version:  1.0.0
 * @Author: falost
 * @Date: 2019-12-21 12:25:14
 * @LastEditors: falost
 * @LastEditTime: 2019-12-21 20:33:55
 */
import { Controller } from 'egg';

export default class HomeController extends Controller {
  public async index() {
    const { ctx } = this;
    ctx.body = await ctx.service.test.sayHi('falost');
  }
  public async getIndex() {
    const { ctx } = this
    ctx.body = await ctx.service.index.getIndex('world')
  }
}
