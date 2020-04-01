/*
 * @Descripttion: 路由暴露入口
 * @version: 1.0.0
 * @Author: falost
 * @Date: 2019-12-21 12:25:14
 * @LastEditors: falost
 * @LastEditTime: 2020-04-01 17:54:10
 */
import { Application } from 'egg'
export default (app: Application) => {
  const { controller, router } = app
  router.get('/', controller.home.index)
  router.get('/hello', controller.home.getIndex)
  
  require('./api')(app, '/api')
}
