/*
 * @Descripttion: 入口文件
 * @version: 1.0.0
 * @Author: falost
 * @Date: 2019-08-27 10:54:32
 * @LastEditors: falost
 * @LastEditTime: 2019-09-08 18:20:41
 */
const SnapshotController = require('./libs/SnapshotController')

const Koa = require('koa')

const controller = new SnapshotController()

const app = new Koa()

app.use(async ctx => {
  console.log(this)
  return await controller.postSnapshotJson(ctx)
})
app.listen(3000)