/*
 * @Descripttion: api 接口路由处理
 * @version: 1.0.0
 * @Author: falost
 * @Date: 2020-04-01 16:51:31
 * @LastEditors: falost
 * @LastEditTime: 2020-04-01 17:53:45
 */

module.exports = (app, name = '/api') => {
  const { controller, router } = app
  router.get(`${name}/poster/get`, controller.api.v1.poster.getPoster)
}