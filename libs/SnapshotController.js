/*
 * @Descripttion: 调取 puppenter 来生成接收到的html 数据生成图片
 * @version: 1.0.0
 * @Author: falost
 * @Date: 2019-08-27 09:55:52
 * @LastEditors: falost
 * @LastEditTime: 2019-09-08 18:20:56
 */
const crypto = require('crypto');
const PuppenteerHelper = require('./PuppenteerHelper');

const oneDay = 24 * 60 * 60;

class SnapshotController {
  /**

- 截图接口
  *
- @param {Object} ctx 上下文
  */
  async postSnapshotJson(ctx) {
    console.log(ctx)
    const result = await this.handleSnapshot()

    ctx.body = {code: 10000, message: 'ok', result}
  }

  async handleSnapshot() {
    const { ctx } = this
    // const { html } = ctx.request.body
    const html = `<div id="app"></div>`
    // 根据 html 做 sha256 的哈希作为 Redis Key
    const htmlRedisKey = crypto.createHash('sha256').update(html).digest('hex');

    try {
      // 首先看海报是否有绘制过的
      let result = await this.findImageFromCache(htmlRedisKey);

      // 命中缓存失败
      if (!result) {
        result = await this.generateSnapshot(htmlRedisKey);
      }

      return result;
    } catch (error) {
      console.log(error)
      ctx.status = 500;
      return ctx.throw(500, error.message);
    }

  }

  /**

- 判断kv中是否有缓存
  *
- @param {String} htmlRedisKey kv存储的key
  */
  async findImageFromCache(htmlRedisKey) {
    return false
  }

  /**

- 生成截图
  *
- @param {String} htmlRedisKey kv存储的key
  */
  async generateSnapshot(htmlRedisKey) {
    const { ctx } = this
    const {
      html,
      width = 375,
      height = 667,
      quality = 80,
      ratio = 2,
      type: imageType = 'jpeg',
    } = {
      html: `<html><head><meta charset="utf-8"><title>Falost 的小窝 - 非著名前端技术博客，记录生活中的点滴！</title><link rel="stylesheet" type="text/css" href="//at.alicdn.com/t/font_504579_jfvnovnnc.css"><link href="https://falost.cc/static/css/app.510d82c1417823c1973789e1b812c455.css" rel="stylesheet" type="text/css" ><style type="text/css">
* {
padding: 0;
margin: 0;
-webkit-transition: all .3s;
transition: all .3s;
}
body, html {
background-color: #f7f7f7;
}
a:focus, a:hover {
color: #007046;
text-decoration: none;
}
a {
color: #19a2de;
}
.hover:hover,
.active {
color: #007046;
border-color: #007046 !important;
}
.content-wrapper {
padding-top: 40pt;
}
.box {
width: 1200px;
margin: 0 auto;
}
.flex-center {
-webkit-box-pack: center;
-ms-flex-pack: center;
    justify-content: center;
-webkit-box-align: center;
-ms-flex-align: center;
    align-items: center;
display: -webkit-box;
display: -ms-flexbox;
display: flex;
}
@media (max-width: 768px) {
.box {
  width: 100%;
}
}

/*# sourceURL=/Users/falost/my/alblog/alblog-web/src/template/web/layout.vue */
/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9mYWxvc3QvbXkvYWxibG9nL2FsYmxvZy13ZWIvc3JjL3RlbXBsYXRlL3dlYi9sYXlvdXQudnVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQTtFQUNFLFdBQVc7RUFDWCxVQUFVO0VBQ1YsNEJBQTRCO0VBQzVCLG9CQUFvQjtDQUNyQjtBQUNEO0VBQ0UsMEJBQTBCO0NBQzNCO0FBQ0Q7RUFDRSxlQUFlO0VBQ2Ysc0JBQXNCO0NBQ3ZCO0FBQ0Q7RUFDRSxlQUFlO0NBQ2hCO0FBQ0Q7O0VBRUUsZUFBZTtFQUNmLGlDQUFpQztDQUNsQztBQUNEO0VBQ0Usa0JBQWtCO0NBQ25CO0FBQ0Q7RUFDRSxjQUFjO0VBQ2QsZUFBZTtDQUNoQjtBQUNEO0VBQ0UseUJBQXlCO0VBQ3pCLHNCQUFzQjtNQUNsQix3QkFBd0I7RUFDNUIsMEJBQTBCO0VBQzFCLHVCQUF1QjtNQUNuQixvQkFBb0I7RUFDeEIscUJBQXFCO0VBQ3JCLHFCQUFxQjtFQUNyQixjQUFjO0NBQ2Y7QUFDRDtBQUNBO0lBQ0ksWUFBWTtDQUNmO0NBQ0EiLCJmaWxlIjoibGF5b3V0LnZ1ZSIsInNvdXJjZXNDb250ZW50IjpbIlxuKiB7XG4gIHBhZGRpbmc6IDA7XG4gIG1hcmdpbjogMDtcbiAgLXdlYmtpdC10cmFuc2l0aW9uOiBhbGwgLjNzO1xuICB0cmFuc2l0aW9uOiBhbGwgLjNzO1xufVxuYm9keSwgaHRtbCB7XG4gIGJhY2tncm91bmQtY29sb3I6ICNmN2Y3Zjc7XG59XG5hOmZvY3VzLCBhOmhvdmVyIHtcbiAgY29sb3I6ICMwMDcwNDY7XG4gIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcbn1cbmEge1xuICBjb2xvcjogIzE5YTJkZTtcbn1cbi5ob3Zlcjpob3Zlcixcbi5hY3RpdmUge1xuICBjb2xvcjogIzAwNzA0NjtcbiAgYm9yZGVyLWNvbG9yOiAjMDA3MDQ2ICFpbXBvcnRhbnQ7XG59XG4uY29udGVudC13cmFwcGVyIHtcbiAgcGFkZGluZy10b3A6IDQwcHQ7XG59XG4uYm94IHtcbiAgd2lkdGg6IDEyMDBweDtcbiAgbWFyZ2luOiAwIGF1dG87XG59XG4uZmxleC1jZW50ZXIge1xuICAtd2Via2l0LWJveC1wYWNrOiBjZW50ZXI7XG4gIC1tcy1mbGV4LXBhY2s6IGNlbnRlcjtcbiAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAtd2Via2l0LWJveC1hbGlnbjogY2VudGVyO1xuICAtbXMtZmxleC1hbGlnbjogY2VudGVyO1xuICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgZGlzcGxheTogLXdlYmtpdC1ib3g7XG4gIGRpc3BsYXk6IC1tcy1mbGV4Ym94O1xuICBkaXNwbGF5OiBmbGV4O1xufVxuQG1lZGlhIChtYXgtd2lkdGg6IDc2OHB4KSB7XG4uYm94IHtcbiAgICB3aWR0aDogMTAwJTtcbn1cbn1cbiJdLCJzb3VyY2VSb290IjoiIn0= */</style><style type="text/css">
.header[data-v-7352f2d0] {
position: fixed;
top: 0;
left: 0;
width: 100%;
z-index: 999;
}
.header span.line[data-v-7352f2d0] {
  display: block;
  width: 100%;
  height: 2px;
  background: #19a2de;
}
.header nav[data-v-7352f2d0] {
  width: 100%;
  height: 40pt;
  background-color: #ffffff;
  border-bottom: 1pt solid #cccccc;
  -webkit-box-shadow: 0 1px 17px 0 #cccccc;
          box-shadow: 0 1px 17px 0 #cccccc;
}
.header nav ul li[data-v-7352f2d0] {
    float: left;
    padding: 5pt 10pt;
    line-height: 30pt;
    font-size: 18pt;
    font-family: Handlee,"huawenxingkai","Microsoft Yahei",arial,sans-serif;
}

/*# sourceURL=/Users/falost/my/alblog/alblog-web/src/template/web/common/header.vue */
/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9mYWxvc3QvbXkvYWxibG9nL2FsYmxvZy13ZWIvc3JjL3RlbXBsYXRlL3dlYi9jb21tb24vaGVhZGVyLnZ1ZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0E7RUFDRSxnQkFBZ0I7RUFDaEIsT0FBTztFQUNQLFFBQVE7RUFDUixZQUFZO0VBQ1osYUFBYTtDQUNkO0FBQ0Q7SUFDSSxlQUFlO0lBQ2YsWUFBWTtJQUNaLFlBQVk7SUFDWixvQkFBb0I7Q0FDdkI7QUFDRDtJQUNJLFlBQVk7SUFDWixhQUFhO0lBQ2IsMEJBQTBCO0lBQzFCLGlDQUFpQztJQUNqQyx5Q0FBeUM7WUFDakMsaUNBQWlDO0NBQzVDO0FBQ0Q7TUFDTSxZQUFZO01BQ1osa0JBQWtCO01BQ2xCLGtCQUFrQjtNQUNsQixnQkFBZ0I7TUFDaEIsd0VBQXdFO0NBQzdFIiwiZmlsZSI6ImhlYWRlci52dWUiLCJzb3VyY2VzQ29udGVudCI6WyJcbi5oZWFkZXJbZGF0YS12LTczNTJmMmQwXSB7XG4gIHBvc2l0aW9uOiBmaXhlZDtcbiAgdG9wOiAwO1xuICBsZWZ0OiAwO1xuICB3aWR0aDogMTAwJTtcbiAgei1pbmRleDogOTk5O1xufVxuLmhlYWRlciBzcGFuLmxpbmVbZGF0YS12LTczNTJmMmQwXSB7XG4gICAgZGlzcGxheTogYmxvY2s7XG4gICAgd2lkdGg6IDEwMCU7XG4gICAgaGVpZ2h0OiAycHg7XG4gICAgYmFja2dyb3VuZDogIzE5YTJkZTtcbn1cbi5oZWFkZXIgbmF2W2RhdGEtdi03MzUyZjJkMF0ge1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIGhlaWdodDogNDBwdDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmZmZmO1xuICAgIGJvcmRlci1ib3R0b206IDFwdCBzb2xpZCAjY2NjY2NjO1xuICAgIC13ZWJraXQtYm94LXNoYWRvdzogMCAxcHggMTdweCAwICNjY2NjY2M7XG4gICAgICAgICAgICBib3gtc2hhZG93OiAwIDFweCAxN3B4IDAgI2NjY2NjYztcbn1cbi5oZWFkZXIgbmF2IHVsIGxpW2RhdGEtdi03MzUyZjJkMF0ge1xuICAgICAgZmxvYXQ6IGxlZnQ7XG4gICAgICBwYWRkaW5nOiA1cHQgMTBwdDtcbiAgICAgIGxpbmUtaGVpZ2h0OiAzMHB0O1xuICAgICAgZm9udC1zaXplOiAxOHB0O1xuICAgICAgZm9udC1mYW1pbHk6IEhhbmRsZWUsXCJodWF3ZW54aW5na2FpXCIsXCJNaWNyb3NvZnQgWWFoZWlcIixhcmlhbCxzYW5zLXNlcmlmO1xufVxuIl0sInNvdXJjZVJvb3QiOiIifQ== */</style><style type="text/css">
#nprogress {
pointer-events: none;
}
#nprogress .bar {
background: #29d;

position: fixed;
z-index: 1031;
top: 0;
left: 0;

width: 100%;
height: 2px;
}

/* Fancy blur effect */
#nprogress .peg {
display: block;
position: absolute;
right: 0px;
width: 100px;
height: 100%;
-webkit-box-shadow: 0 0 10px #29d, 0 0 5px #29d;
        box-shadow: 0 0 10px #29d, 0 0 5px #29d;
opacity: 1.0;

-webkit-transform: rotate(3deg) translate(0px, -4px);
        transform: rotate(3deg) translate(0px, -4px);
}

/* Remove these to get rid of the spinner */
#nprogress .spinner {
display: block;
position: fixed;
z-index: 1031;
top: 15px;
right: 15px;
}
#nprogress .spinner-icon {
width: 18px;
height: 18px;
-webkit-box-sizing: border-box;
        box-sizing: border-box;

border: solid 2px transparent;
border-top-color: #29d;
border-left-color: #29d;
border-radius: 50%;

-webkit-animation: nprogress-spinner 400ms linear infinite;
        animation: nprogress-spinner 400ms linear infinite;
}
.nprogress-custom-parent {
overflow: hidden;
position: relative;
}
.nprogress-custom-parent #nprogress .spinner,
.nprogress-custom-parent #nprogress .bar {
position: absolute;
}
@-webkit-keyframes nprogress-spinner {
0%   { -webkit-transform: rotate(0deg);
}
100% { -webkit-transform: rotate(360deg);
}
}
@keyframes nprogress-spinner {
0%   { -webkit-transform: rotate(0deg); transform: rotate(0deg);
}
100% { -webkit-transform: rotate(360deg); transform: rotate(360deg);
}
}

/*# sourceURL=/Users/falost/my/alblog/alblog-web/src/template/web/common/header.vue */
/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9mYWxvc3QvbXkvYWxibG9nL2FsYmxvZy13ZWIvc3JjL3RlbXBsYXRlL3dlYi9jb21tb24vaGVhZGVyLnZ1ZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0E7RUFDRSxxQkFBcUI7Q0FDdEI7QUFDRDtFQUNFLGlCQUFpQjs7RUFFakIsZ0JBQWdCO0VBQ2hCLGNBQWM7RUFDZCxPQUFPO0VBQ1AsUUFBUTs7RUFFUixZQUFZO0VBQ1osWUFBWTtDQUNiOztBQUVELHVCQUF1QjtBQUN2QjtFQUNFLGVBQWU7RUFDZixtQkFBbUI7RUFDbkIsV0FBVztFQUNYLGFBQWE7RUFDYixhQUFhO0VBQ2IsZ0RBQWdEO1VBQ3hDLHdDQUF3QztFQUNoRCxhQUFhOztFQUViLHFEQUFxRDtVQUM3Qyw2Q0FBNkM7Q0FDdEQ7O0FBRUQsNENBQTRDO0FBQzVDO0VBQ0UsZUFBZTtFQUNmLGdCQUFnQjtFQUNoQixjQUFjO0VBQ2QsVUFBVTtFQUNWLFlBQVk7Q0FDYjtBQUNEO0VBQ0UsWUFBWTtFQUNaLGFBQWE7RUFDYiwrQkFBK0I7VUFDdkIsdUJBQXVCOztFQUUvQiw4QkFBOEI7RUFDOUIsdUJBQXVCO0VBQ3ZCLHdCQUF3QjtFQUN4QixtQkFBbUI7O0VBRW5CLDJEQUEyRDtVQUNuRCxtREFBbUQ7Q0FDNUQ7QUFDRDtFQUNFLGlCQUFpQjtFQUNqQixtQkFBbUI7Q0FDcEI7QUFDRDs7RUFFRSxtQkFBbUI7Q0FDcEI7QUFDRDtBQUNBLE9BQU8sZ0NBQWdDO0NBQ3RDO0FBQ0QsT0FBTyxrQ0FBa0M7Q0FDeEM7Q0FDQTtBQUNEO0FBQ0EsT0FBTyxnQ0FBZ0MsQ0FBQyx3QkFBd0I7Q0FDL0Q7QUFDRCxPQUFPLGtDQUFrQyxDQUFDLDBCQUEwQjtDQUNuRTtDQUNBIiwiZmlsZSI6ImhlYWRlci52dWUiLCJzb3VyY2VzQ29udGVudCI6WyJcbiNucHJvZ3Jlc3Mge1xuICBwb2ludGVyLWV2ZW50czogbm9uZTtcbn1cbiNucHJvZ3Jlc3MgLmJhciB7XG4gIGJhY2tncm91bmQ6ICMyOWQ7XG5cbiAgcG9zaXRpb246IGZpeGVkO1xuICB6LWluZGV4OiAxMDMxO1xuICB0b3A6IDA7XG4gIGxlZnQ6IDA7XG5cbiAgd2lkdGg6IDEwMCU7XG4gIGhlaWdodDogMnB4O1xufVxuXG4vKiBGYW5jeSBibHVyIGVmZmVjdCAqL1xuI25wcm9ncmVzcyAucGVnIHtcbiAgZGlzcGxheTogYmxvY2s7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgcmlnaHQ6IDBweDtcbiAgd2lkdGg6IDEwMHB4O1xuICBoZWlnaHQ6IDEwMCU7XG4gIC13ZWJraXQtYm94LXNoYWRvdzogMCAwIDEwcHggIzI5ZCwgMCAwIDVweCAjMjlkO1xuICAgICAgICAgIGJveC1zaGFkb3c6IDAgMCAxMHB4ICMyOWQsIDAgMCA1cHggIzI5ZDtcbiAgb3BhY2l0eTogMS4wO1xuXG4gIC13ZWJraXQtdHJhbnNmb3JtOiByb3RhdGUoM2RlZykgdHJhbnNsYXRlKDBweCwgLTRweCk7XG4gICAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoM2RlZykgdHJhbnNsYXRlKDBweCwgLTRweCk7XG59XG5cbi8qIFJlbW92ZSB0aGVzZSB0byBnZXQgcmlkIG9mIHRoZSBzcGlubmVyICovXG4jbnByb2dyZXNzIC5zcGlubmVyIHtcbiAgZGlzcGxheTogYmxvY2s7XG4gIHBvc2l0aW9uOiBmaXhlZDtcbiAgei1pbmRleDogMTAzMTtcbiAgdG9wOiAxNXB4O1xuICByaWdodDogMTVweDtcbn1cbiNucHJvZ3Jlc3MgLnNwaW5uZXItaWNvbiB7XG4gIHdpZHRoOiAxOHB4O1xuICBoZWlnaHQ6IDE4cHg7XG4gIC13ZWJraXQtYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICAgICAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuXG4gIGJvcmRlcjogc29saWQgMnB4IHRyYW5zcGFyZW50O1xuICBib3JkZXItdG9wLWNvbG9yOiAjMjlkO1xuICBib3JkZXItbGVmdC1jb2xvcjogIzI5ZDtcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xuXG4gIC13ZWJraXQtYW5pbWF0aW9uOiBucHJvZ3Jlc3Mtc3Bpbm5lciA0MDBtcyBsaW5lYXIgaW5maW5pdGU7XG4gICAgICAgICAgYW5pbWF0aW9uOiBucHJvZ3Jlc3Mtc3Bpbm5lciA0MDBtcyBsaW5lYXIgaW5maW5pdGU7XG59XG4ubnByb2dyZXNzLWN1c3RvbS1wYXJlbnQge1xuICBvdmVyZmxvdzogaGlkZGVuO1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG59XG4ubnByb2dyZXNzLWN1c3RvbS1wYXJlbnQgI25wcm9ncmVzcyAuc3Bpbm5lcixcbi5ucHJvZ3Jlc3MtY3VzdG9tLXBhcmVudCAjbnByb2dyZXNzIC5iYXIge1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG59XG5ALXdlYmtpdC1rZXlmcmFtZXMgbnByb2dyZXNzLXNwaW5uZXIge1xuMCUgICB7IC13ZWJraXQtdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7XG59XG4xMDAlIHsgLXdlYmtpdC10cmFuc2Zvcm06IHJvdGF0ZSgzNjBkZWcpO1xufVxufVxuQGtleWZyYW1lcyBucHJvZ3Jlc3Mtc3Bpbm5lciB7XG4wJSAgIHsgLXdlYmtpdC10cmFuc2Zvcm06IHJvdGF0ZSgwZGVnKTsgdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7XG59XG4xMDAlIHsgLXdlYmtpdC10cmFuc2Zvcm06IHJvdGF0ZSgzNjBkZWcpOyB0cmFuc2Zvcm06IHJvdGF0ZSgzNjBkZWcpO1xufVxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ== */</style><style type="text/css">
@charset "UTF-8";
#bubble[data-v-6702df62] {
position: fixed;
left: 0;
top: 0;
width: 100%;
height: 100%;
}
.mask[data-v-6702df62] {
display: block;
position: fixed;
top: 0;
left: 0;
z-index: 0;
width: 100%;
height: 100%;
background: url(https://falost.cc/static/img/bg9.2527ea8.jpg);
background-position: center;
background-size: cover;
}
.mask.zoom-show[data-v-6702df62] {
  -webkit-mask-image: url(data:image/png;base64,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);
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  -webkit-mask-size: 300%;
  -webkit-animation: circle_zoom 1.5s;
}
.mask[data-v-6702df62]:before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyNpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MDNGMUY5MUI1RTIwMTFFNThCMkZCNzc4RkVEN0I4Q0YiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MDNGMUY5MUE1RTIwMTFFNThCMkZCNzc4RkVEN0I4Q0YiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6OTYxQUJDRjk1RTFGMTFFNThCMkZCNzc4RkVEN0I4Q0YiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6OTYxQUJDRkE1RTFGMTFFNThCMkZCNzc4RkVEN0I4Q0YiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4wHI2DAAAAFUlEQVR42mJgYGCQYsADpAhzAAIMAA14AGmJYjBIAAAAAElFTkSuQmCC);
}
section[data-v-6702df62] {
overflow: hidden;
min-height: 90vh;
}
section .box section > p[data-v-6702df62] {
  line-height: 20px;
  font-size: 12pt;
}
section.home[data-v-6702df62] {
  position: relative;
  z-index: 2;
  text-align: center;
  background: rgba(255, 255, 255, 0.5);
}
section.home div.box[data-v-6702df62] {
    -webkit-transform: translate(-50%, -50%);
            transform: translate(-50%, -50%);
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
}
section.home div.box section[data-v-6702df62] {
      padding: 25vh 0 25vh;
}
section.home div.box section h1[data-v-6702df62] {
        width: 100pt;
        height: 100pt;
        border-radius: 50%;
        margin: auto;
}
section.home div.box section h1 a[data-v-6702df62] {
          position: relative;
          z-index: 2;
}
section.home div.box section h1 a img[data-v-6702df62] {
            width: 100%;
            height: 100%;
            border-radius: 50%;
}
section.home div.box section h1 span.bg[data-v-6702df62] {
          position: relative;
          top: -100%;
          width: 100%;
          height: 100%;
          display: inline-block;
}
section.home div.box section h1 span.bg .radar[data-v-6702df62] {
            position: absolute;
            top: 50%;
            left: 50%;
            border-radius: 50%;
            border: 10px solid #fff;
            -webkit-transform: translate(-50%, -50%);
                    transform: translate(-50%, -50%);
            -webkit-animation: radar-data-v-6702df62 2s infinite;
                    animation: radar-data-v-6702df62 2s infinite;
            opacity: 0;
}
section.home div.box section h1 span.bg .radar[data-v-6702df62]:nth-child(2) {
              -webkit-animation-delay: .2s;
                      animation-delay: .2s;
}
section.home div.box section h1 span.bg .radar[data-v-6702df62]:nth-child(3) {
              -webkit-animation-delay: .5s;
                      animation-delay: .5s;
}
section.home div.box section h2[data-v-6702df62] {
        font-size: 25pt;
        font-family: Handlee,"huawenxingkai","Microsoft Yahei",arial,sans-serif;
}
section.home div.box section p[data-v-6702df62] {
        line-height: 15pt;
}
section.home div.box section div.tag span[data-v-6702df62] {
        position: relative;
        padding: 8px 10px;
        display: inline-block;
        margin: 10px 5px 10px 0;
        color: #ffffff;
        opacity: .8;
        border-radius: 3px;
        background: #19a2de;
        cursor: pointer;
        font-weight: 700;
        border: 1px solid transparent;
}
section.home div.box section div.tag span[data-v-6702df62]:hover {
          -webkit-box-shadow: 0 0 12px 6px #ffffff;
                  box-shadow: 0 0 12px 6px #ffffff;
          opacity: 1;
          z-index: 99;
}
section.home div.box section[data-v-6702df62]:before {
        content: '';
        position: absolute;
        width: 0;
        height: 0;
        bottom: -1px;
        left: 0;
        border-style: solid;
        border-width: 3rem 50vw 0;
        border-color: transparent rgba(255, 255, 255, 0.6);
}
section.intr[data-v-6702df62], section.skill[data-v-6702df62], section.case[data-v-6702df62], section.contact[data-v-6702df62] {
  position: relative;
  z-index: 2;
  padding: 15vh 0;
  text-align: center;
  background: rgba(255, 255, 255, 0.8);
}
section.intr .main > div[data-v-6702df62], section.skill .main > div[data-v-6702df62], section.case .main > div[data-v-6702df62], section.contact .main > div[data-v-6702df62] {
    position: relative;
    float: left;
    width: 33.3%;
    min-height: 300px;
    padding: 20pt;
}
section.intr .main > div:hover a[data-v-6702df62], section.skill .main > div:hover a[data-v-6702df62], section.case .main > div:hover a[data-v-6702df62], section.contact .main > div:hover a[data-v-6702df62] {
      color: #fff;
      background-color: #19A2B4;
}
section.intr .main > div:hover:nth-child(2) a[data-v-6702df62], section.skill .main > div:hover:nth-child(2) a[data-v-6702df62], section.case .main > div:hover:nth-child(2) a[data-v-6702df62], section.contact .main > div:hover:nth-child(2) a[data-v-6702df62] {
      color: #fff;
      background-color: #5cb85c;
}
section.intr .main > div:hover:nth-child(3) a[data-v-6702df62], section.skill .main > div:hover:nth-child(3) a[data-v-6702df62], section.case .main > div:hover:nth-child(3) a[data-v-6702df62], section.contact .main > div:hover:nth-child(3) a[data-v-6702df62] {
      color: #fff;
      background-color: #CE6664;
}
section.intr .main > div h3[data-v-6702df62], section.skill .main > div h3[data-v-6702df62], section.case .main > div h3[data-v-6702df62], section.contact .main > div h3[data-v-6702df62] {
      text-align: center;
      font-size: 25pt;
      color: #19A2B4;
}
section.intr .main > div:nth-child(2) h3[data-v-6702df62], section.skill .main > div:nth-child(2) h3[data-v-6702df62], section.case .main > div:nth-child(2) h3[data-v-6702df62], section.contact .main > div:nth-child(2) h3[data-v-6702df62] {
      color: #5cb85c;
}
section.intr .main > div:nth-child(3) h3[data-v-6702df62], section.skill .main > div:nth-child(3) h3[data-v-6702df62], section.case .main > div:nth-child(3) h3[data-v-6702df62], section.contact .main > div:nth-child(3) h3[data-v-6702df62] {
      color: #CE6664;
}
section.intr .main > div p[data-v-6702df62], section.skill .main > div p[data-v-6702df62], section.case .main > div p[data-v-6702df62], section.contact .main > div p[data-v-6702df62] {
      text-align: left;
      text-indent: 35px;
      line-height: 30px;
      font-size: 16px;
}
section.intr .main > div a[data-v-6702df62], section.skill .main > div a[data-v-6702df62], section.case .main > div a[data-v-6702df62], section.contact .main > div a[data-v-6702df62] {
      position: absolute;
      bottom: 0;
      color: #19A2B4;
      padding: 10px 15px;
      border: 1px solid;
      border-radius: 3px;
      margin-left: -31.5px;
      text-decoration: none;
      font-weight: 700;
      -webkit-transition: all .6s;
      transition: all .6s;
}
section.intr .main > div:nth-child(2) a[data-v-6702df62], section.skill .main > div:nth-child(2) a[data-v-6702df62], section.case .main > div:nth-child(2) a[data-v-6702df62], section.contact .main > div:nth-child(2) a[data-v-6702df62] {
      color: #5cb85c;
}
section.intr .main > div:nth-child(3) a[data-v-6702df62], section.skill .main > div:nth-child(3) a[data-v-6702df62], section.case .main > div:nth-child(3) a[data-v-6702df62], section.contact .main > div:nth-child(3) a[data-v-6702df62] {
      color: #CE6664;
}
section.skill[data-v-6702df62] {
  margin-top: 20px;
}
section.skill .main[data-v-6702df62] {
    width: 790px;
    margin: 0 auto;
    height: auto;
}
section.skill .main .left[data-v-6702df62] {
      width: 400px;
      height: 400px;
      min-height: 400px;
      -webkit-transform: translate(0%, 25%);
              transform: translate(0%, 25%);
}
section.skill .main .left > div[data-v-6702df62] {
        width: 100%;
        height: 100%;
        margin-top: 10%;
        left: 50%;
        top: 50%;
        -webkit-transform: translate(-50%, -50%);
                transform: translate(-50%, -50%);
}
section.skill .main .right .skill_list[data-v-6702df62] {
      width: 300px;
}
section.skill .main .right .skill_list li[data-v-6702df62] {
        margin: 8px 0;
        text-align: left;
}
section.skill .main .right .skill_list li span[data-v-6702df62] {
          display: inline-block;
          min-width: 50px;
          width: 50px;
          line-height: 26px;
          color: #333;
          text-align: center;
          border-radius: 4px;
          -webkit-transition: all .6s;
          transition: all .6s;
}
section.skill .main .right .skill_list li span[data-v-6702df62]:first-child {
            color: #fff;
}
section.skill .main .right .skill_list li span[data-v-6702df62]:last-child {
            display: inline-block;
            padding: 0 5px;
            line-height: 26px;
}
section.skill p[data-v-6702df62]:last-child {
    position: absolute;
    bottom: 40px;
    left: 50%;
    -webkit-transform: translateX(-50%);
            transform: translateX(-50%);
    color: #BDBDBC;
}
section.case[data-v-6702df62] {
  display: none;
}
section.footprint[data-v-6702df62] {
  position: relative;
  padding: 10vh 0;
  background: #4a6ebc;
  overflow: hidden;
  color: #fff;
}
section.footprint .main[data-v-6702df62] {
    padding-top: 5vh;
}
section.contact[data-v-6702df62] {
  color: #ffffff;
  background-color: #363941;
}
section.contact .box .main[data-v-6702df62] {
    padding: 15vh 0;
}
section.contact .box .main a.btn[data-v-6702df62] {
      position: relative;
      -webkit-transition: all 0.15s ease-in;
      transition: all 0.15s ease-in;
      width: 80px;
      height: 80px;
      display: inline-block;
      padding: 10px;
      margin: 5px 5px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.7);
      color: #333;
      line-height: 60px;
      text-align: center;
      text-decoration: none;
}
section.contact .box .main a.btn[data-v-6702df62]:after {
        border-width: 2px;
        border-radius: 50%;
}
section.contact .box .main a.btn[data-v-6702df62]:hover {
        background: rgba(255, 255, 255, 0);
        color: #fff;
}
section.contact .box .main a.btn[data-v-6702df62]:hover:after {
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 1;
}
section.contact .box .main .btn[data-v-6702df62]:after {
      -webkit-transition: all 0.15s ease-in;
      transition: all 0.15s ease-in;
      position: absolute;
      top: 10px;
      left: 10px;
      right: 10px;
      bottom: 10px;
      content: ' ';
      opacity: 0;
      border: 1px solid #fff;
}
@media (max-width: 768px) {
/* index */
.box[data-v-6702df62] {
  width: 100%;
}
section.home div.box section[data-v-6702df62] {
  padding: 15vh 0 25vh;
}
section.home div.box section .tag[data-v-6702df62] {
    padding: 5px;
}
section.intr[data-v-6702df62] {
  padding: 0;
  padding-top: 3vh;
}
section.intr .main > div[data-v-6702df62] {
    width: 100%;
    min-height: 200px;
    padding: 20px;
    background-color: rgba(25, 162, 180, 0.1);
}
section.intr .main > div h3[data-v-6702df62] {
      margin: 0;
}
section.intr .main > div a[data-v-6702df62] {
      bottom: 10px;
}
section.intr .main > div[data-v-6702df62]:nth-child(2) {
      background-color: rgba(223, 240, 215, 0.1);
}
section.intr .main > div[data-v-6702df62]:nth-child(3) {
      background-color: rgba(206, 102, 100, 0.1);
}
section.skill[data-v-6702df62] {
  margin-top: 20px;
  padding: 5vh 0;
}
section.skill .main[data-v-6702df62] {
    width: 100%;
    height: auto;
}
section.skill .main .left[data-v-6702df62] {
      width: 100vw;
      height: 80vw;
      min-height: 300px;
      padding: 0 20pt;
      -webkit-transform: translate(0, 0);
              transform: translate(0, 0);
}
section.skill .main .right[data-v-6702df62] {
      width: 100%;
      padding: 0 20pt;
}
section.skill .main .right .skill_list[data-v-6702df62] {
        width: 100%;
}
section.skill p[data-v-6702df62]:last-child {
    bottom: 0px;
}
/* blog */
.content-detail[data-v-6702df62],
.content-comment[data-v-6702df62] {
  width: 100%;
  padding: 15px;
}
.content-detail .digg[data-v-6702df62] {
  margin-top: 15px;
}
.content-detail .digg span[data-v-6702df62] {
    width: 40px;
    height: 40px;
    line-height: 35px;
    font-size: 22px;
}
.content-detail header .title[data-v-6702df62] {
  margin: 5px 0;
  font-size: 16px;
}
.content-detail header .time[data-v-6702df62] {
  display: inline-block;
  margin-right: 5px;
}
.content-detail header .name[data-v-6702df62] {
  font-size: 14px;
}
.content-comment .author[data-v-6702df62],
.replybox .author[data-v-6702df62] {
  margin-right: 0;
  min-width: 50px;
  max-width: 80px;
}
.content-comment .author .photo[data-v-6702df62],
  .replybox .author .photo[data-v-6702df62] {
    width: 35px;
    margin: auto;
}
.content-comment .editbox .placeholder[data-v-6702df62],
.replybox .editbox .placeholder[data-v-6702df62] {
  font-size: 14px;
}
.content-comment .list .author[data-v-6702df62],
.replybox .list .author[data-v-6702df62] {
  margin-right: 0;
  min-width: 35px;
}
.content-comment .list .author .photo[data-v-6702df62],
  .replybox .list .author .photo[data-v-6702df62] {
    width: 35px;
    margin: auto;
}
/* 弹框 */
div[data-v-6702df62] .model-box,
div[data-v-6702df62] .replybox {
  width: 90%;
}
div[data-v-6702df62] .model-box .el-dialog__body,
  div[data-v-6702df62] .replybox .el-dialog__body {
    padding: 10px 10px;
}
.barBox[data-v-6702df62] {
  width: 50px;
  height: 50px;
}
.barBox div span[data-v-6702df62] {
    font-size: 50px;
    line-height: 50px;
}
.barBox div span[data-v-6702df62]:last-child {
      font-size: 12px;
}
}
/*广播扩散效果*/
@keyframes radar-data-v-6702df62 {
0% {
  width: 150px;
  height: 150px;
  border: 40px solid #fff;
  opacity: 0;
}
50% {
  opacity: .1;
}
90% {
  width: 650px;
  height: 650px;
}
90%, 100% {
  border: 2px solid #fff;
  opacity: 0;
}
100% {
  width: 1300px;
  height: 1300px;
}
}
@-webkit-keyframes radar-data-v-6702df62 {
0% {
  width: 150px;
  height: 150px;
  border: 40px solid #fff;
  opacity: 0;
}
50% {
  opacity: .1;
}
90% {
  width: 650px;
  height: 650px;
}
90%, 100% {
  border: 2px solid #fff;
  opacity: 0;
}
100% {
  width: 1300px;
  height: 1300px;
}
}
/*广播扩散效果end*/

/*# sourceURL=/Users/falost/my/alblog/alblog-web/src/template/web/index.vue */
/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9mYWxvc3QvbXkvYWxibG9nL2FsYmxvZy13ZWIvc3JjL3RlbXBsYXRlL3dlYi9pbmRleC52dWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLGlCQUFpQjtBQUNqQjtFQUNFLGdCQUFnQjtFQUNoQixRQUFRO0VBQ1IsT0FBTztFQUNQLFlBQVk7RUFDWixhQUFhO0NBQ2Q7QUFDRDtFQUNFLGVBQWU7RUFDZixnQkFBZ0I7RUFDaEIsT0FBTztFQUNQLFFBQVE7RUFDUixXQUFXO0VBQ1gsWUFBWTtFQUNaLGFBQWE7RUFDYiwwQ0FBMkM7RUFDM0MsNEJBQTRCO0VBQzVCLHVCQUF1QjtDQUN4QjtBQUNEO0lBQ0ksd25VQUF3blU7SUFDeG5VLCtCQUErQjtJQUMvQiw4QkFBOEI7SUFDOUIsd0JBQXdCO0lBQ3hCLG9DQUFvQztDQUN2QztBQUNEO0lBQ0ksWUFBWTtJQUNaLG1CQUFtQjtJQUNuQixRQUFRO0lBQ1IsT0FBTztJQUNQLFlBQVk7SUFDWixhQUFhO0lBQ2IsMENBQTRDO0NBQy9DO0FBQ0Q7RUFDRSxpQkFBaUI7RUFDakIsaUJBQWlCO0NBQ2xCO0FBQ0Q7SUFDSSxrQkFBa0I7SUFDbEIsZ0JBQWdCO0NBQ25CO0FBQ0Q7SUFDSSxtQkFBbUI7SUFDbkIsV0FBVztJQUNYLG1CQUFtQjtJQUNuQixxQ0FBcUM7Q0FDeEM7QUFDRDtNQUNNLHlDQUF5QztjQUNqQyxpQ0FBaUM7TUFDekMsbUJBQW1CO01BQ25CLFNBQVM7TUFDVCxVQUFVO01BQ1YsWUFBWTtDQUNqQjtBQUNEO1FBQ1EscUJBQXFCO0NBQzVCO0FBQ0Q7VUFDVSxhQUFhO1VBQ2IsY0FBYztVQUNkLG1CQUFtQjtVQUNuQixhQUFhO0NBQ3RCO0FBQ0Q7WUFDWSxtQkFBbUI7WUFDbkIsV0FBVztDQUN0QjtBQUNEO2NBQ2MsWUFBWTtjQUNaLGFBQWE7Y0FDYixtQkFBbUI7Q0FDaEM7QUFDRDtZQUNZLG1CQUFtQjtZQUNuQixXQUFXO1lBQ1gsWUFBWTtZQUNaLGFBQWE7WUFDYixzQkFBc0I7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O0NBQ2Y7QUFDRDtJQUNJLGFBQWE7SUFDYixjQUFjO0NBQ2pCO0FBQ0Q7SUFDSSx1QkFBdUI7SUFDdkIsV0FBVztDQUNkO0FBQ0Q7SUFDSSxjQUFjO0lBQ2QsZUFBZTtDQUNsQjtDQUNBO0FBQ0QsYUFBYSIsImZpbGUiOiJpbmRleC52dWUiLCJzb3VyY2VzQ29udGVudCI6WyJcbkBjaGFyc2V0IFwiVVRGLThcIjtcbiNidWJibGVbZGF0YS12LTY3MDJkZjYyXSB7XG4gIHBvc2l0aW9uOiBmaXhlZDtcbiAgbGVmdDogMDtcbiAgdG9wOiAwO1xuICB3aWR0aDogMTAwJTtcbiAgaGVpZ2h0OiAxMDAlO1xufVxuLm1hc2tbZGF0YS12LTY3MDJkZjYyXSB7XG4gIGRpc3BsYXk6IGJsb2NrO1xuICBwb3NpdGlvbjogZml4ZWQ7XG4gIHRvcDogMDtcbiAgbGVmdDogMDtcbiAgei1pbmRleDogMDtcbiAgd2lkdGg6IDEwMCU7XG4gIGhlaWdodDogMTAwJTtcbiAgYmFja2dyb3VuZDogdXJsKH5hc3NldHMvaW1hZ2VzL2JnL2JnOS5qcGcpO1xuICBiYWNrZ3JvdW5kLXBvc2l0aW9uOiBjZW50ZXI7XG4gIGJhY2tncm91bmQtc2l6ZTogY292ZXI7XG59XG4ubWFzay56b29tLXNob3dbZGF0YS12LTY3MDJkZjYyXSB7XG4gICAgLXdlYmtpdC1tYXNrLWltYWdlOiB1cmwoZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFNZ0FBQURJQ0FZQUFBQ3RXSzZlQUFBQUdYUkZXSFJUYjJaMGQyRnlaUUJCWkc5aVpTQkpiV0ZuWlZKbFlXUjVjY2xsUEFBQUhkaEpSRUZVZU5yc25ZMlM0eUFPaEFYMit6L3hHSzd1cXZiS3l5S3BXNENUVEhDVk40bVRtWjNZZkc2MXhFK3F0Y3JlOXJhMy9uYis5NStVMGo0VDY3WUVIa08zQ2g3YjJ5eEE5allWaEdTQWtBaUl2TVpmamRkMWc3TUJlU2NZMGlSUUlncmlnVkUzTkJ1UVZ3R1JIb1prQkk2NmdkbUFySUxDQWlJRkZHVTJJSjVpZU1jMkxCc1FHQW9MREJhVVZ3T0NnT0ZCc3dIWlVQd0RnUWNHb3k0Q2hGdTk0NGc1WjVUREE2UDMrdXVWNWZ4eU1Dd0F2UGNZUUdhb2lLY2VFVUMwWTk3bk55QmZCSWEzbytDZ2tMQ2dNTWFjaFFONXovcVpEY2d2QzZPeTBlQXpDWWNYZWpGS0VnbXhVQVZCQWVoOXBoaWZMZDhRZnAxZkFFWjB6NlNpTUtETU1Pa2pZR2pIV3lDU0FWVDZCbFU1dnhpTUhIeVBnWU1GeEZNUTFwU3o0Vk0yVktNNjcvMUtVTTVmQ2tjR0czNmVBQTVxNEtObW5USG5qQkV2SkNTbFVZM2lRTFFCZVdQVnNFRElCRENza2xnaEZwdnk5WlNqQndXckZob3cyUW0zN3JBVThWUEhHNUEzQ3FjeThUd0hJSXFFWGFoUlIwTXNSajJRdmR5QUtRb2tTWUdqQlNVcDZySUJlWU53eW9JQWVZK0ZKQlBoMW9oWlo4MTU3MWdCNFdpZmx3YVFaRUNqUWZLeFlkZjV3V0NrSUFBWmhJUUp4V1lvU0Zya1B6enYwV3ZJZHppMHh6c1V5WUhrWThPdVR3VEV1c3V6WU15QUpRb0ttK3BGK2xzeElWVUVpcnVLOUk2MXFpS0dvbXhBSGxRTkJJRHN2TWVDZ3NBU1RmZk9TTytpeW9FOHRzcHhoeU0xRUtUbXZWWkZTcE1nMklCTTlocWVTb3krOXFCNWhZbzhvUjUzR0RRd1VnY09DeFp4d3JDMzl5YWZBQWdhTm1YbkdIb2NWUlVHbEhjQXBJRHFZVDN2Z1ZLYTcxcWIxNlVCcHFlQVpRTVNENmtZcGZDT1ovRHpNeUVSNDNrVWtKSHdpb0ZEQTZRSGhnWklMK1R5UXNVTlNEQ2tpalQrQ0NCUFFQS1Vnb3pBNFFIQ2dGT2E3MXdVSmFrYkVBNk8yV0Fjd2ZCTEE0YnQzRGdiRUtiem9RYUVCb0YyL0pLeGpxQ2xBMHBiZDltQWdINWpOZ2pIZ3BDTGdjU3FoU0NRb0FxQ1pLM1lrS3F0ZjR5Q1U0enZXRFlnT2h5b2FoekFzU01BU0g0QklJbFFqcFdBbEFBZ1Y5UG9MK1VjZUpGRFQwMitIcEEwb0JvSENNSVJVQmJHbDZ6MElTdjhCK28zTGdDUVN3R2pmUzBEYWxLL0ZaQkVHSEFXZ0NNQUVodDJXV3FDOVBCbFBRamJjN2Nvb0tEcWtSVlFrdlA4RG9iMlBJSGYrYVVqRjg4M2h3T0J3anAyZ0QrSHdHTFZTa2I3WjdFZUpOTHZDcTF4OU5TakJjV0M0akxBME5MY3ZmUHc1Lzk5S1NUbm04Q0JobEllREVjQUZDL3NRa0l0elk4SXFDSWpIcVFkSjg0QWNqOTJBZXFSYnUrMXNQUWVMOEhuRHhNbjdIb0pKT2VidzNFUWp6T0JZVTA3WXRoSE1sbW9RWThDMG5ZcHVhdElicDVmQUJBOTliZ2NhSkR0Y1VqT040VkRVd29OQXUwekNDeGUyTVZrdFZhbGVrY3lXTkdzVlF0RWJvN2x4cUFuQlpZL3o1SHZuTjROa2xjQU1xSWFIaGdSY0hKQVRhTFpMQ1RFRUtVQk1CNWtCSkFlRUFXRXdnS2pCMHEwSmxSK0l5QklmUU9GUWp2R0FOUCtmZ1lTdEM2Q1pySm1lQkF2ZzRVYTg2dzh2NE9RT3luZFpMeldRSWtrS25KSFRUNGVrRjU4YnNHQkFISU12SStFWFJva1dqRXowcnQzdEE0U0FVU0Q1SkwrbUkvcjlsMnZEaHk1azc2OUZPTjlPV0VWa3ZydGRiWC9hRUFRM3pHaUdPZytDeElHRURhVHhYb1FKSU9GQU5MQ29Ya05CSTRFUUhGdkcxY2cxWDFYa0xReTNEb2ZnQ05QZ0dQbTdvVmNWbzNFU3ZsYW1TeFpDSWdJMTdXa2w5cjE0TWdkVUJBNDBnQThDQ0RMUGNuNUFCeU1nckJ3bkpOQThmd0lZdGc5czk2RGhBVkVnNE1aTFdpbGR1OUtvaWxJRkF3WmdLRWFpWXQ3cUZVL0RSQ3QrbndNZ0hFK0FFcWs1MjhFa0pFczFneEFQSU91S1VnVWpBZ3NGVERzeTBLdFZZQ3dIUTRqWUp3Z0pDZm9aNklGUkxSM0wxSUhTV1FHUzRUdnZZdkNvWUdoblFNTGppVGpLMnloYXl1V2R3Y2tBUm1yWGtoakFYTUN6eGxvRURpUTRxRTNpSXBOOVVaTnVwZkY4aURKZ1A5Z1ZVU0RBLzIrMmp4YTJySno3YkRmdHdRRW1VRGhjSURJQUJ4bkFKNlJVTXZMWnMycWhjd0NCSzJCdENiZDhoK2pVNjh5My9Vd29PbWRrN3pLdEo4dlZvK0lJYmVBOFFCQndxM1JxanBiVFdmcklHd1ZIVEhwdmVwNXo1eDdZWlZJckxkeUJUeUhHT2RobVlyTUJHUjBIRGtDQmZvWVVaT0lXV2U2bkx6U3BIdmp5N1h1SkY1WXhYYklITW5ZZVFzQjVZNkJMKzhDU0NMVHVpTXAzUkZvUnNNc3JSN3lLU0ZXcjJ1N0JRY2JYczAyM3g0c1BUWHBUWXY2Tm9Ba0VncXRXSWltZGM4QUlMUERMR1lxSUNzRVlmcGlJWXZpV0pCa3NUc25zdUdWa0tyaHJlOSs5eUsxNDBzc1FOcHc2K1dBZUpOSFcxa3JOSzJyQWNHQWdxaEp0R0RJS01ocUQ4S21lSHRkMnRtaVlEU2NRbFBhN2ZjOUZHWEpUYmhWUnlFNUo4QmhqZEZHVXJ4bzk1SzJvYmR3ekFDRXJZY2dhZDdzK0k4WlhVMUtNTTE3U1grRUlBTEdpTjlnWm9vOEdpalFsYk5TVTBpc3J3SWtCZUNJcEhoYk1EUTRaZ0d5MHFUUEFtVFVwR3ZxVVdSOC9ST2tLbDRObjNFWTZzRkFNaFJxblpQZ2lFN1RnNmlINWtFOE9HYVk5WkZLK2pzQjRoVUpXZlVZTmVmVmdVTlRFUlNTYVg1a0JpQ1IyUkRabnJzOUlBNHk1TElNZS81aVFMVHg1VWtKb1RYL2xFZ2doTWhROWFESW9JcmtFUzl5VG9LREhmT1JqVkFtQWt6RWo5eC8xd3BBWG1IUzh3SkFpaEkxUkZLNmFIM2ovbjBPNVRVU2F0M2JaUWlTTXdoSEZuMzVzMGcvckJualBGZy9NaVBFR3EyaXI1b1hxMTJNVTV1MUJBSGtVdnhtUkQyaWV3K1UzZzBoZGFBWU11em5nSG93eGNGakFoZ251RnQrWkdhcWQ3U0tIcTJESU5YMDNrcTExdFErMm13a1NFZkVrVzBVbE1NSnVkS29ZVDhud1JHWmVYM1Z3Q2hQUmJ6ZngwNERoSVpZYkpFd1dpenN3YUd0QnFYTm8xc213RkVYN3JtaklubEZWbXNVRU1hSEhETFdId3RWa3lPWThzMERJZFk3enMxckxkK3NxY2dGaEZWc0tqY0tUZ0hhQ2hKdTllQllBZ2dhV28zMDRzMFQxT1NjRkdLdE5PZ3pGQVJwYkwwbG1xM3g0ZHE4VmtLRWhSRUY2UTMyT29KS1VqcHFFZzYxWm9SWW80dmR6SnE5eE92ZWprQ0NWdEVqazFjakJqMDVkMkoyQXV2VXFFbVMvamgwQ3hKUFJWQnZ4RXlSZXBCcVlpbEo3bVMxWU8vRUFJTE1ROHNBRXpIc0o2Z1d6S2pEaUlMTXpGNnRYS013ZFJwSGRUeklKZmlNSXhVRVdvUmZ4K1Rld0E4SGxEYWtiT0hvaFZzWitZNG5vUndDaEZpSkNLdXNvdUdzVU9zUXYyZHZIZ0JrZEF6SWpBNTlWallyZFdMeUtud1gvRVQrYlNQTFVoL0s4K3lFWFZtQm95Z2hsaUJoMWhrTXJaTEVPeW8rT1dFY295U1JQbGlyeG44SUdINVpDcEpJTHlLQ1RSVTZBZ2NDaFFaS0FkdFU2WVNVMWZqZXc0QjRXYXVSTkMrNjVzY3hDUkowVEFnN0RoMlpLRzdtbGpvK3dKcElyaTBFaXN3WlE4NHFoOWNWNXVnQWNTaHFnbm9TcllBSVFYSUcxUU5aS2ptaUlDdGdRRDlqemJSaWZkL2s5RlY2WWtzZFdGTFRBSHN6c2x1L2h3SEU2MGZGcnRtdWdaTURLcEtOTGlqRGdLQzlPZG1PaXBGbEQyWjVFMjlXZUtiMm9mbU9WMjZwRTE1cGtDQVR2ZldnT0J3dkpPS1BVVG1hcmpDSG9TSnRPeW5DaDFyZVhtY3FpSmZCWWdxSHpMSnF5T1J2RVVXeVJqeWlVL3k4MjlhYThpTDlvYTdzcEc3SWJQTlpTZFVlaGpvZ0lWWVJiQWd3QzRtTUtJZzQzc1ByajVYRVg1U1RXVkVxeTloazFRZmhpYnpVN3J2QzBidUd1WUZGUk8rdGF4WDllc05ka2FLZTVUVjZrRmh3M0Y4blJUMlNBMG0rQVI1U0VFWTVacXh2am5UNU9BWmdRZGNRWWJ6SHAyeHQyQ1dHRDJIU3pvZmdZK1FQTUxSQ2dJbDZFVTlKNml4QXZBVXJSeXZyYkJyWU8yNE45V1VuWi9nME9DdzFZZXN2UGRVNG5MQXFFNkZWQkFJdjFDckc2eUZBQklBRERhMlljZXJJMm9HSDBkQ1JpU0c4cElIbFBUNTl1MmV4c2hOZVZRVU1VU0NwMHU5UWlLUnhzeE5LNVVBYkt4MHdORWdvRDVLQTZybFZMUFJXWTRwQWNvQ0tNTkoxM2JzQXYybkw0cS9CWVlWUGh3R0pwaUphU01YQ2diU3oxQUVsT1ZYMWYxU0VDYkU4V0xKd015c2VKQ1NJd3FDTGdpSUZ3ZDhNaHpUSkYybnVzRjZZSlVhWVphVmwwZFJ0NzNOSTZHV0IwYjRXUkVWT0lIdVZ3SEFMblVBT1hla1d5VEF4SGlTNi8xWTRlcENJa2NFUzZROUNRajFJRDRCV1JTd1F2SGJrbFJxS1lKMUlYUVh4bEFPcHFxTXA0QkVUZjB4U0krL2tmOE5tS1VjV2Y1YVJyS2dJVzgrSUdIS2tuWGtqSkZXejdvVllURFVkVlJCMnpVSW0zQm85NGZsRDA3Z3p6WHR1NFBBS2d1MGpXdm1PaEZHV3o3VVVKRHl2RjZJZ2FHaVZ4Ty9abXdLTmRkWHVxZDgzYmxueEl0ckVDQWdnbzllRU1lbEkrMFM2bnJnS2tnTGhsZ1VIR21LTkdQd1pVcDIvVURtc2NLdDJxczRqZ0VTTU5uUGRJZ1BZVEJVNXdmUXVveWhvOXhQRXo4eFVHS1lQMmJjRElrcTRWWlYwS1FwSUdyaGVVYzhiWFRhdW9uV1FpQStKVGlnM0U0b2tYTGVSRFlkK3ZiMnBkWExBZUkrMEE2U05zY3RVZDY5L0JzR1FBZlZJays3K2FGSElDKytzdjN0di80WmEzaERyMFdzemVxTk1BeXJpdFhuS3BMTWhXQ2FQTTVreDVFUkZRTm5idjZGVzduaVI5blV4aW5QZXRZdTBoV2k3UXR1d3FTQTlzNUlrNWs4eTBmZ2pLcElDSVZUYWNJUlN2eU1ENXRLZ2VzeG9aOTQwc04zMm40MDNyVWtIUmd3OCsrVzkrZ3A3MGFnQk0zdWpoMXd6UXlQWWE1K0ZuNDhNbVVSRG5Wd2pFeWVGU1psRmpGUzBjc3Fldkx6VlkwaEZjdkFtR09sWk1kcW1VckE5aTZZZ2lheUx6TmdqTXVyZHRYTDBoT3h0NklhWlFRVmh3KzhWN1U2YzlxNHFDT3Yybjl6enhNL0tCaVJVRzNuaTJxU0ZVQ0JHM1RYcFloeTNsdUNhcVJ4SWdTODUyYXl0SHMrclNDSUtlYU50Z1ZVSmRGb2p5S1N6YVYwV0ZBRlBScFkxMHJvQmlRRXlPM3JJSUFnejJoWXpXZDVmSVZZeVRnWkMyc3pNbDhpNnNHc3J5RE1LTW5KOVJCWmxwTWpJNkgvSGtCRExpOVVnRWhmZEFaQy9iZnVPWi95SVBIam5SOXNaMDM3ZEVFdklSaFdwc0l0am1xd0NEanBVRXEyYzdtMU1SZEJ6eXhicUV0QkdtSFptaGRSdWU4cGtHSVVzUklsbUNFWmtGZWtxQUhWRzI5dXdINUhBTlJtdGVyT2ZaVy8rSWs2aE1DcTNTTGptclozQm5yQlJjUFkyMTZoTDhMcXhQeU5PZTVzU1ZtZkh6Q1R3amlIRWwwYnY3Z240MGdtNHV5RnA3TDNGYm96b3VmZXVHM0lzRGJRMXBnMy85VE9lQjBHa2xXbDR6SmRHWkJFRmNhdkcrcXlXQU5ja0VUL0wzRXlSQ0FlRjJDd1VqdHgxMHdRd2tOK1pBdi9mVnBIWHFRZHkzZExFTmpPejNRNTVFQ2JFRXNjME1UNEZNVjdXLzdlM3VaQjRkK05JUWdlSld0QTJOK1JETXRoNFVwQk9sbXIyZlJTSURjWmFVQkp4VFZhMGcyajdjOXQ4WG5CSGlmNXg2V0hZOXZaTTZEWHIrcVlKYlc1SVFWQXBYUkd5TUhGdFdnangzdGFmVHlTRHRiSjlVZTA0Nyt1OHQ3MnRNZWw3Mjl2WEE0S3VIekc2VmVONEJUOGIvVC8yOXV6NXJNQTFYdG0rcUhhY0h6eFpsWHc5K245dUlONExtRG9CcE5FMk42UWdkZUNQZmVva0luK0hkN2ZZMjN3b0tuRk5WclNEV2REOTgxNWVjSEo2dTlXQU5jbTFGcW0zL2s4RW1MM05EMWtFdUNhVnZNN2kvQTZrelEzZEpIT0F1c2pucWdOR0JlODg2QmQrSXE3ZGNPRG4zTHR1ZFdLYm1kbHUxVldGS3ZGSHMzOE04cVU5aGFqRTNhTUNKM052TVZDUWM0NWNOK1Q2bzJDZ1VRN1U3clBUMEN2d1J5SW5KL0tsdldNb3hGczlYcThpM25WRFE2dG9XMlBhOEY4L2t5ZWRLRFFkNjhXZHlKZjJma2JBbjk5YlhEV0V1RWFycmpWaXdJZVROQm04Szh3d1hqWHcyVXBlaUFyZU1mWTJENVFSY0NLUVNPQ3pTTGdPWjdIUVg2STF4cGxmR0lVSitheDNCOW9iNXp2UWM0dTJnWmszVkNZY045dFRKck5HaVBGQ0ROS0lPcUNmWmU4WWU0dUYxWkhyTU91NkkwWWNiYjlkRGpJUXY2SGhsd1N5VFRPa3VBU2tlNnZJZU5acTFmV0p0aGV2L1huSmhxNmlaWkxFSis3OHBUbXBJd0Jzby82c1FSOEZxQmpYZTRVU3VaRVBFbUo1cEVWUFduRWF2L1orTVU1czJRcnlGZ3BTakJ0ZG1kZ1dHSFdKUkVhUVNmZXlRay91WmVKbnR4OFo5eDJycnMycUhWVkROYzFiQjA3UVNLTXZ3a3V4ZGFMTFZwR1hxSWQzUGRqUXVTeUV5Vk1RczdQaWJGT0ZmTkhpN05ySlJqN3JYYXk5K1hBVTRKeGExNk9Bbnkxa2UxbGgrdisvbllzelV1akpZNVdtQUhlaFAwc1QzNWNsL3JPM245M2oxVG4xc0FCQUZDUjY3ZEdiNExUTVYzYlN0cEVpVFEzS0tISTNLYUNDRlBELzN5ckNxUWNDQUtJZ0pYRHRaM2thRVg4b0JtM1MyWXI1TEg5UWpaTnFaYStLY2JleTdrQjdzK0d3enFWMUhRcjQrYnE0WGFGdFdEUkFJbjFzRVBOY2duY09Cb3d5QUViWmdIUUJLUU9nRkJLVVNGc29nOGtBcjgzLzVVRVFVR1pscU1xRUUrUHQrZlpjbTU2eWREeko5aU44Q0JXNVBpUHRZR2FteTh6aW5nWVlJMGJjTStjei9ZaTEzeUhJbmYvcnovdHlBMFcrSEJJdk1USnlvNXZoTzlEczVtZzNGMWRCaEV5WkZlT09FMG5sV3Z2VktBUUNTS3NrMG1TMXlpM3MvSFpBMk91Qjd0ZkVOdUJCaklaV1psM2tETlpBU3VlTzdFSEMzRUZtWFJRTGtQc3hhVlNreUhkT3F1ZXBmbG04UjlzSENrY1JzaFp5T25lU2FOMmpPSkRVZ0VKb3FtR3BpUWVJTkk5M0ZmazJQK0laN3RtcWNRVVVwanB3ek9xelJTbUlDRmZIWUx4STlJVG5CZ3dOcURzWWw5anI0SlhPdWZpV2NLc0c3dWdYMmVBdklzeGlQTXFJNTNVSFRLRWVSSWhRQ3kzbVZWQTkvcnpPeG50RkFhQTlidmtRYmZ2dGtOU0pDbkUxdXdmVEJZS0d0Q09rQnpoU0Z4RUVFRVJKV2pobUdHMExnR0tBa1kzL0l6V1A3YVl0K1BJTnh0MjdibDdqUjFUaENvUmJrZkRMRzFkU0dPVmc2aUNvWW1UQWxGY0NtQjRFMlFpeHRGckhaWVJZMW1xOXZXTy95YmlQRnUwdVJRMDhGZEhVNHlLQVFOb1pveWh3SFFUSmFMVXdaQ0Ryd1pweVRTR3VEaVRwMW5oNzZ0RlRFRy85dkQvZlBUZWhWcEhQWHpHWHJXUDBHcTdYMkh1cW95bE9GQktralZVaXd5V01naURHUElQS0VqWGhQU0R1VU9RR0RNK0R0TUI0WVpZb29WZis0R0lpVXhtL2pJWnVOWGJ0c3oxWUxzSERzR2lWblIxRU53V1F0anQ1WGdDQkZsSWxRMFdTazZtNkJodFg3aWhRK2pEVlFKVGRDNXVROXk5SGJTd1ZtZ1VQT2pRaUJFaWJ6ZXIxVzJvaDhVSXRMWlJDZ2JrVUZmSDJTN2lsbzN2OWRITHovRlBVQkJtVDRZVlNCVlNEQ0N3SUVGYm94WllhZWgxVVF5RldSRW1ZVUF1Qnd3dXRXdlhRd2kwUmZQSFI2bmlSMUdTNjhwdXFDZFBESVdLK0VWUHVnVlFJaitLWmRxWVBHVHpzK2h5RVE0TWswby9xTXRTaUIwVlBQYktpRW0zRHZrQXdlbnR1d0tqSzMvSk80UlRqUFFyUnFIdjdENkVpbnFwRSszTXhjTlFWQ2xLVU8zZlVpL1RVd1hxMHdpc0IwcmllY25pemxQY2dTVTI5NUVsWWVpbExhNnhFQVdzZUpRakFUMEI1a0pBczZqMjhxcnJNQkVUekltMi9KdytNQklaWUxDQUpUT09pZ0xUcUlRb2tkMUM4UGw4emdCRGhSM2NpeHR3QzVHY2hERWlJRmNsd0lWWDFJVURFT2ZHcFV4Y1pVUkRMYTdDQW9KN2p2L3R4ZTMwNGpTOTFIcFBpUjZKZXlBTllnSjRPRVVDMEVPakhBT05uQWhob0dwZ05yYnorV0RJTEVER1VwRFNoVmxJS2RwYWg5a0JoVklOcGhFZmc3cHdhRlVuTmN5dnNpMERpTFFqRFR1czVhczUvQXBDdzNxUUF4bDlURldRS1c1a0ppQ2hBYUZQc3RNTmR2VENyZEtyaUtCUldRNHMweEtONXpMZm5MU0FWQ0s4UVNIcC9JekxUdmdnLzVaTG5QVHhJUENYNWFRRDZjWDZHeVloRlo3N1J6b2ZNQkVRY3M5NTdqbmlTWHFyMk1nREpZQ1Bzd2VHTnN6K1V4M3BMTitkT1NJa0FZbm1SRkZDUFdkNWpSRUZXZUpNQ0tFUjBzZzk2UnMxekFod3RLTmtBeEt0NmE3V05GQWl0a0lhbWVSRU5FdFNMTUlBd0lkWXFRSkNxdGhaU2VXb3hJdzE4RWRCNGsyZFRrSXdxaUJadTlaVGtDcWhKQkFUMmpteVo5RU5Sai92ZTlpYUloRmdSQlVIOUIxUDdRQlJFZzBRTHRYNGNlSDVJQU5EZXZxSE9pYXRDTEcxcW5haVNqT3dTZ0tOWENMUTh5RDI4eW9vSFkwSS9NYnE4ZUg4N1V6V3Z3ZlN1QjRrR3lvcDZTVFRNZWdRUUp0VHFEWGR0Ui9kZEV4dS9USUNqNXpzc0ZXa2hhVVBNaUZGSE00bXpzbGZSN2lVL2hvcjhnUHRJRnhaVVJjSndqQURTemlWVnBEOHh0QmR1cFltS0VpMnFpZE9kQkEyeFBEaXNZYjVzU1Bpa1FTOU9hQlQxSWlOZ1JDYVV1NzllQ29pQS9zTWIyVGNDeW1qMXViMlQ1QUZBMEVxL0RGVFdLNmdpWlJFZ1NIclhTL095MEJTeFJ4NmlNNkFNemI5OERvWXNXamNUYjZyUDNtZy9yUjlWTW93NHF4NWFpSGhzUUVJOWVKRXdxL2N6TERCc1Y1TnA2OERNQUtRTnVRUlFFZTI1T0lWQVZrR2kwNmplZmNlZjF4WWM3dzdJYUI4c0pwdmwrUkhXcUNQajExRWxlUlNRU0ZZTEFlTXk0R0JUdVpGbEczSURpZ1dKQlVqYkJUOHRBS1RlZWpsNEUwNGpHYXd5RVJETmp5Q1ZkV1lLb2FsWnF4V0FhSWJkZzBRVWJ5SVRERzBVRUVzOVNpRE1lcFZKajlaQVJsSzliTWpGRkF6UkVLdk9NT1l6QVJFbHpPcEIwZ3VWTHFDNkhBMnAySXJ6SFE1RVBWZ1BFaWtXc2tYQ2lBZXh1cGFqWTBKK2dxQXd3SGpEZ2EwSjVPU1ZnS0IrUk9UZjBYeld0RHhhQTBva0dDTCtkS2xIQnhSTlBZNG10R0lWWkhhSXhTcElGWHRpdHNoWTh4L3lFYTJrZXpPckxQRWRLd0ZwaTRiaVpLZ3VwNm9jSFdRMGFzN3ZrT1JHUWNvRWs2NTlMNnMzNzhnWUVNYWt6ekRyVVZoR0sralRsOVdiQllnMDNTMmtFMjZKK0RPUHlPQmRGYzN3SU9IVkhRN0VmNkJkOUZkN0VMYUtQaXZNUWdGaFlCbFpscTNNYU5RekFkRkNHUkY4b21nWjhDRE1oTnVSOE9vQU0xanZIR0paWTBGR3d5eEVUVVlVaEsya3k3c0NVanFOdlNnTlh4czBkQkdOaGszald1RlZ1NzVoZHJKWVNKcjNGWUN3eXk1ZndDUGI4ZkFuQUE4eUh1UVNmNzdudHdYRVVoRnhZdTgwQVE2bThSUkZOZG9RcXdRcjZlMXJwRkNZZ0F5V2RrTW9NdDRYQzRHRG1lbmtSL2lCVnRaa2RZK3F4eXBBeElqL1pwbHZGZzR0cktvR0pJai9pSFkxZWRxa1Iyb2hJNkhXN05HR1RQZDIrUVJBclBxSTV6bVkzeTJrY2xRRGpBZ2NvNEN3SWRaS1FKQ0M0V3hRbUE2TDFwU2owNVhqS1VEYU9YdkZDYmZTQUlnUk1EVC8wWU9qVi85QVF5eVJ0VjFOSWlFV1VnOWhzbG96OThpYWhSOEhpRGpwdHJRWUJBUU16My8wVEhvaUFaRUhUTHFRZ0REWkxFdEJpc3laTEc1MFRxeTZxZ0d2QmtSRW4yYUY3VUp5RE1EVDh4MDlCZW5CVVl6TVZTVEZPM05NK2tnMXZUd0VDZk0rQzBkZENjZFRnSWowRjl4aHg0OWJVQnhPRnUwd1VycGF4c3J5SUN0cUlFeGZySm0xRUdROVFYU2REdytLNkF6djFrQW8rUTJBdEptdFRINjVua2s5bElhU2pkZHRiOTJxK0E2MmVoNnRvbzlrc1VUd2F2cG9WUjFkNkNieXVwQndMTXRZdlJvUUNWQmZnVERqNkx6V0FNbGlkeWRCdXJaSEFVSHFJS3dIa1FXQWVFdXNNYkF3SzBxeHE5bktid1ZFUUVncTJWZ09Bb29lRUdoYUYrMS85ZW9SaGRGK1dVd0JzUUNLY0JFL3ozUkkvSldBc0pBZ1FCek9zZDc0Y3JUbTRhVjJQVUNZRE5hb0I1RUJRS3BnQzliTUFLWUV3WGdjamxjQm9rSGl6WDZuM1QxRi9Ba1hlaU1FNzVNeGFCMFN2YTd0a2VVWW5wZ1hDd1VFTmV4czJJWEFnQ3o1WEY4Snh5c0I2VUdpR1hldE80a1dYdldtRGIzRFVBMG9VR1BlQXlPYXdYcHlibDRrM1l1dWxWNENJRERyb0w4Y2psY0Qwb01FU2YxV0J3d0xpdDQwUGtoMzl0SHMxU3ZtNW8yWTlRbzI0QWdBSTh1bzFWYzEwRmNEMGw3c1JCWUFlK0dWTjNVb01vMW90TzR4a3NHS2VoQWtreFd0aTBRVXhRdlBIaC8wOU9tQXRNWEVjcnZvbVFETUE4VURCS21XcndSa1phcVhBYVJLZkdiMWtiVThlbitmYkVEK2hTUUYxVVFESllPQUpNRjY2NDdBc1dJSnRpZ2tTRy9mdWdnRUQ4NzZMZzN5M1FDNUZ4TTFOYWtUZGdRT1R6V2U4QjhyZlVqVWw4d0dvNzRySE84S3lCMlN0a0cxWVpmVktES3hwNGZobURFZTVDbEk2cUFxSUdyeGNqUCthWUJvNWowMTcyV3hsMFpEd1VtTDRIZ0hCUm1GcEE2Q2dDaEdlZGRHK002QVdMNmtWUlFQa0NMOXhUY2pnRVRYVFh3MUlNeW9RMFpSYWtBcDNqYWsra1JBMnBCTHE1S0xBa2l2cTMwUGxBS29CclBpN2toNmQyYTZsOGxxellDbWdxcFIzeDJPVHdLa0RhdGFWZEc2bVdpd2pJRHh0SHE4UWtVcTBkaVJ6NGZXS04rQWpJVmNkelc1aDF4SmVid3JSMUtBNlQxR2xBTlJEMlE1aHdyVVFsaFF5a0pZdk4vM0Vhcng2WUMwb1pSMFlMRTZMVWFnMElEd1ppNUI0SmdSWXZYQUVNR25YbzNBZ3I3M0VWN2p0d0hTOHlZV0pIYzE2U2xNRHc1azFkcVpDdEllcXdZb0l3b1NnWVNCWU9vQ05odVF1V3JTZ3lRMW9HalEzTDNJS0J3OUdKajEwUkVGNllFUkJjUUx2UmdZeW04QTR6Y0JZb1ZkeVFDbEJhU0ZwTGRLbHJjb3prei9NZE9IQ0FDRTkxNFJMbVQ3RmR0dkFrUUx1NUlDUk80QTBvTWtHY0I0L2ExWTc0R0dXQXdnSXhrdTVyMWZveHEvSFpCZTJPWEJ3a0Fpd25kS25EbUxKR1BXUmJCaEFpd0F2eDZNM3c2SUZuWmxvNEhuRGtCQ21uRVBESytidTZjZ0hoZ3NLTkV3N0UrNlhYNHJHTjhDU051b3JvQ2lpTVE2SWpMcUVmRWdyQjhSRW82dlU0dHZCZ1FKdjFBUVJ1Qmd3Qmd4Nnd3a0xEaGZ0WDBqSUVqV3l6UGVMQ0NvLzJCQ3JJaHA5MEl2QzZDdjNMNFprRjdEOGhxL0J3T3pmUFdvU1JmQlpwNWtNMTN5cldxeEFjRlZSVWlWUUpUakZZQXdvTWlHWWdNeW9pd3lxQm9yQVltcXlZWmlBeklkRnM5OHI0SmpCaVFiaUEzSVM0QVpCWU5KODBaQjJkc0c1TzJnMFJyL1RBWFpJQ3pjL2lQQUFGZUlVdHJTdmVyd0FBQUFBRWxGVGtTdVFtQ0MpO1xuICAgIC13ZWJraXQtbWFzay1yZXBlYXQ6IG5vLXJlcGVhdDtcbiAgICAtd2Via2l0LW1hc2stcG9zaXRpb246IGNlbnRlcjtcbiAgICAtd2Via2l0LW1hc2stc2l6ZTogMzAwJTtcbiAgICAtd2Via2l0LWFuaW1hdGlvbjogY2lyY2xlX3pvb20gMS41cztcbn1cbi5tYXNrW2RhdGEtdi02NzAyZGY2Ml06YmVmb3JlIHtcbiAgICBjb250ZW50OiAnJztcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgbGVmdDogMDtcbiAgICB0b3A6IDA7XG4gICAgd2lkdGg6IDEwMCU7XG4gICAgaGVpZ2h0OiAxMDAlO1xuICAgIGJhY2tncm91bmQ6IHVybCh+YXNzZXRzL2ltYWdlcy9tYXNrX2JnLnBuZyk7XG59XG5zZWN0aW9uW2RhdGEtdi02NzAyZGY2Ml0ge1xuICBvdmVyZmxvdzogaGlkZGVuO1xuICBtaW4taGVpZ2h0OiA5MHZoO1xufVxuc2VjdGlvbiAuYm94IHNlY3Rpb24gPiBwW2RhdGEtdi02NzAyZGY2Ml0ge1xuICAgIGxpbmUtaGVpZ2h0OiAyMHB4O1xuICAgIGZvbnQtc2l6ZTogMTJwdDtcbn1cbnNlY3Rpb24uaG9tZVtkYXRhLXYtNjcwMmRmNjJdIHtcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgei1pbmRleDogMjtcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjUpO1xufVxuc2VjdGlvbi5ob21lIGRpdi5ib3hbZGF0YS12LTY3MDJkZjYyXSB7XG4gICAgICAtd2Via2l0LXRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIC01MCUpO1xuICAgICAgICAgICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAtNTAlKTtcbiAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgIHRvcDogNTAlO1xuICAgICAgbGVmdDogNTAlO1xuICAgICAgd2lkdGg6IDEwMCU7XG59XG5zZWN0aW9uLmhvbWUgZGl2LmJveCBzZWN0aW9uW2RhdGEtdi02NzAyZGY2Ml0ge1xuICAgICAgICBwYWRkaW5nOiAyNXZoIDAgMjV2aDtcbn1cbnNlY3Rpb24uaG9tZSBkaXYuYm94IHNlY3Rpb24gaDFbZGF0YS12LTY3MDJkZjYyXSB7XG4gICAgICAgICAgd2lkdGg6IDEwMHB0O1xuICAgICAgICAgIGhlaWdodDogMTAwcHQ7XG4gICAgICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgICAgICAgIG1hcmdpbjogYXV0bztcbn1cbnNlY3Rpb24uaG9tZSBkaXYuYm94IHNlY3Rpb24gaDEgYVtkYXRhLXYtNjcwMmRmNjJdIHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgICAgICAgIHotaW5kZXg6IDI7XG59XG5zZWN0aW9uLmhvbWUgZGl2LmJveCBzZWN0aW9uIGgxIGEgaW1nW2RhdGEtdi02NzAyZGY2Ml0ge1xuICAgICAgICAgICAgICB3aWR0aDogMTAwJTtcbiAgICAgICAgICAgICAgaGVpZ2h0OiAxMDAlO1xuICAgICAgICAgICAgICBib3JkZXItcmFkaXVzOiA1MCU7XG59XG5zZWN0aW9uLmhvbWUgZGl2LmJveCBzZWN0aW9uIGgxIHNwYW4uYmdbZGF0YS12LTY3MDJkZjYyXSB7XG4gICAgICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICAgICAgICB0b3A6IC0xMDAlO1xuICAgICAgICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICAgICAgICBoZWlnaHQ6IDEwMCU7XG4gICAgICAgICAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG59XG5zZWN0aW9uLmhvbWUgZGl2LmJveCBzZWN0aW9uIGgxIHNwYW4uYmcgLnJhZGFyW2RhdGEtdi02NzAyZGY2Ml0ge1xuICAgICAgICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgICAgICAgIHRvcDogNTAlO1xuICAgICAgICAgICAgICBsZWZ0OiA1MCU7XG4gICAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICAgICAgICAgICAgYm9yZGVyOiAxMHB4IHNvbGlkICNmZmY7XG4gICAgICAgICAgICAgIC13ZWJraXQtdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgLTUwJSk7XG4gICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgLTUwJSk7XG4gICAgICAgICAgICAgIC13ZWJraXQtYW5pbWF0aW9uOiByYWRhci1kYXRhLXYtNjcwMmRmNjIgMnMgaW5maW5pdGU7XG4gICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiByYWRhci1kYXRhLXYtNjcwMmRmNjIgMnMgaW5maW5pdGU7XG4gICAgICAgICAgICAgIG9wYWNpdHk6IDA7XG59XG5zZWN0aW9uLmhvbWUgZGl2LmJveCBzZWN0aW9uIGgxIHNwYW4uYmcgLnJhZGFyW2RhdGEtdi02NzAyZGY2Ml06bnRoLWNoaWxkKDIpIHtcbiAgICAgICAgICAgICAgICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogLjJzO1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAuMnM7XG59XG5zZWN0aW9uLmhvbWUgZGl2LmJveCBzZWN0aW9uIGgxIHNwYW4uYmcgLnJhZGFyW2RhdGEtdi02NzAyZGY2Ml06bnRoLWNoaWxkKDMpIHtcbiAgICAgICAgICAgICAgICAtd2Via2l0LWFuaW1hdGlvbi1kZWxheTogLjVzO1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uLWRlbGF5OiAuNXM7XG59XG5zZWN0aW9uLmhvbWUgZGl2LmJveCBzZWN0aW9uIGgyW2RhdGEtdi02NzAyZGY2Ml0ge1xuICAgICAgICAgIGZvbnQtc2l6ZTogMjVwdDtcbiAgICAgICAgICBmb250LWZhbWlseTogSGFuZGxlZSxcImh1YXdlbnhpbmdrYWlcIixcIk1pY3Jvc29mdCBZYWhlaVwiLGFyaWFsLHNhbnMtc2VyaWY7XG59XG5zZWN0aW9uLmhvbWUgZGl2LmJveCBzZWN0aW9uIHBbZGF0YS12LTY3MDJkZjYyXSB7XG4gICAgICAgICAgbGluZS1oZWlnaHQ6IDE1cHQ7XG59XG5zZWN0aW9uLmhvbWUgZGl2LmJveCBzZWN0aW9uIGRpdi50YWcgc3BhbltkYXRhLXYtNjcwMmRmNjJdIHtcbiAgICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICAgICAgcGFkZGluZzogOHB4IDEwcHg7XG4gICAgICAgICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICAgICAgICAgIG1hcmdpbjogMTBweCA1cHggMTBweCAwO1xuICAgICAgICAgIGNvbG9yOiAjZmZmZmZmO1xuICAgICAgICAgIG9wYWNpdHk6IC44O1xuICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDNweDtcbiAgICAgICAgICBiYWNrZ3JvdW5kOiAjMTlhMmRlO1xuICAgICAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgICAgICBmb250LXdlaWdodDogNzAwO1xuICAgICAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHRyYW5zcGFyZW50O1xufVxuc2VjdGlvbi5ob21lIGRpdi5ib3ggc2VjdGlvbiBkaXYudGFnIHNwYW5bZGF0YS12LTY3MDJkZjYyXTpob3ZlciB7XG4gICAgICAgICAgICAtd2Via2l0LWJveC1zaGFkb3c6IDAgMCAxMnB4IDZweCAjZmZmZmZmO1xuICAgICAgICAgICAgICAgICAgICBib3gtc2hhZG93OiAwIDAgMTJweCA2cHggI2ZmZmZmZjtcbiAgICAgICAgICAgIG9wYWNpdHk6IDE7XG4gICAgICAgICAgICB6LWluZGV4OiA5OTtcbn1cbnNlY3Rpb24uaG9tZSBkaXYuYm94IHNlY3Rpb25bZGF0YS12LTY3MDJkZjYyXTpiZWZvcmUge1xuICAgICAgICAgIGNvbnRlbnQ6ICcnO1xuICAgICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgICB3aWR0aDogMDtcbiAgICAgICAgICBoZWlnaHQ6IDA7XG4gICAgICAgICAgYm90dG9tOiAtMXB4O1xuICAgICAgICAgIGxlZnQ6IDA7XG4gICAgICAgICAgYm9yZGVyLXN0eWxlOiBzb2xpZDtcbiAgICAgICAgICBib3JkZXItd2lkdGg6IDNyZW0gNTB2dyAwO1xuICAgICAgICAgIGJvcmRlci1jb2xvcjogdHJhbnNwYXJlbnQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjYpO1xufVxuc2VjdGlvbi5pbnRyW2RhdGEtdi02NzAyZGY2Ml0sIHNlY3Rpb24uc2tpbGxbZGF0YS12LTY3MDJkZjYyXSwgc2VjdGlvbi5jYXNlW2RhdGEtdi02NzAyZGY2Ml0sIHNlY3Rpb24uY29udGFjdFtkYXRhLXYtNjcwMmRmNjJdIHtcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgei1pbmRleDogMjtcbiAgICBwYWRkaW5nOiAxNXZoIDA7XG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC44KTtcbn1cbnNlY3Rpb24uaW50ciAubWFpbiA+IGRpdltkYXRhLXYtNjcwMmRmNjJdLCBzZWN0aW9uLnNraWxsIC5tYWluID4gZGl2W2RhdGEtdi02NzAyZGY2Ml0sIHNlY3Rpb24uY2FzZSAubWFpbiA+IGRpdltkYXRhLXYtNjcwMmRmNjJdLCBzZWN0aW9uLmNvbnRhY3QgLm1haW4gPiBkaXZbZGF0YS12LTY3MDJkZjYyXSB7XG4gICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICBmbG9hdDogbGVmdDtcbiAgICAgIHdpZHRoOiAzMy4zJTtcbiAgICAgIG1pbi1oZWlnaHQ6IDMwMHB4O1xuICAgICAgcGFkZGluZzogMjBwdDtcbn1cbnNlY3Rpb24uaW50ciAubWFpbiA+IGRpdjpob3ZlciBhW2RhdGEtdi02NzAyZGY2Ml0sIHNlY3Rpb24uc2tpbGwgLm1haW4gPiBkaXY6aG92ZXIgYVtkYXRhLXYtNjcwMmRmNjJdLCBzZWN0aW9uLmNhc2UgLm1haW4gPiBkaXY6aG92ZXIgYVtkYXRhLXYtNjcwMmRmNjJdLCBzZWN0aW9uLmNvbnRhY3QgLm1haW4gPiBkaXY6aG92ZXIgYVtkYXRhLXYtNjcwMmRmNjJdIHtcbiAgICAgICAgY29sb3I6ICNmZmY7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6ICMxOUEyQjQ7XG59XG5zZWN0aW9uLmludHIgLm1haW4gPiBkaXY6aG92ZXI6bnRoLWNoaWxkKDIpIGFbZGF0YS12LTY3MDJkZjYyXSwgc2VjdGlvbi5za2lsbCAubWFpbiA+IGRpdjpob3ZlcjpudGgtY2hpbGQoMikgYVtkYXRhLXYtNjcwMmRmNjJdLCBzZWN0aW9uLmNhc2UgLm1haW4gPiBkaXY6aG92ZXI6bnRoLWNoaWxkKDIpIGFbZGF0YS12LTY3MDJkZjYyXSwgc2VjdGlvbi5jb250YWN0IC5tYWluID4gZGl2OmhvdmVyOm50aC1jaGlsZCgyKSBhW2RhdGEtdi02NzAyZGY2Ml0ge1xuICAgICAgICBjb2xvcjogI2ZmZjtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzVjYjg1Yztcbn1cbnNlY3Rpb24uaW50ciAubWFpbiA+IGRpdjpob3ZlcjpudGgtY2hpbGQoMykgYVtkYXRhLXYtNjcwMmRmNjJdLCBzZWN0aW9uLnNraWxsIC5tYWluID4gZGl2OmhvdmVyOm50aC1jaGlsZCgzKSBhW2RhdGEtdi02NzAyZGY2Ml0sIHNlY3Rpb24uY2FzZSAubWFpbiA+IGRpdjpob3ZlcjpudGgtY2hpbGQoMykgYVtkYXRhLXYtNjcwMmRmNjJdLCBzZWN0aW9uLmNvbnRhY3QgLm1haW4gPiBkaXY6aG92ZXI6bnRoLWNoaWxkKDMpIGFbZGF0YS12LTY3MDJkZjYyXSB7XG4gICAgICAgIGNvbG9yOiAjZmZmO1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjQ0U2NjY0O1xufVxuc2VjdGlvbi5pbnRyIC5tYWluID4gZGl2IGgzW2RhdGEtdi02NzAyZGY2Ml0sIHNlY3Rpb24uc2tpbGwgLm1haW4gPiBkaXYgaDNbZGF0YS12LTY3MDJkZjYyXSwgc2VjdGlvbi5jYXNlIC5tYWluID4gZGl2IGgzW2RhdGEtdi02NzAyZGY2Ml0sIHNlY3Rpb24uY29udGFjdCAubWFpbiA+IGRpdiBoM1tkYXRhLXYtNjcwMmRmNjJdIHtcbiAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgICAgICBmb250LXNpemU6IDI1cHQ7XG4gICAgICAgIGNvbG9yOiAjMTlBMkI0O1xufVxuc2VjdGlvbi5pbnRyIC5tYWluID4gZGl2Om50aC1jaGlsZCgyKSBoM1tkYXRhLXYtNjcwMmRmNjJdLCBzZWN0aW9uLnNraWxsIC5tYWluID4gZGl2Om50aC1jaGlsZCgyKSBoM1tkYXRhLXYtNjcwMmRmNjJdLCBzZWN0aW9uLmNhc2UgLm1haW4gPiBkaXY6bnRoLWNoaWxkKDIpIGgzW2RhdGEtdi02NzAyZGY2Ml0sIHNlY3Rpb24uY29udGFjdCAubWFpbiA+IGRpdjpudGgtY2hpbGQoMikgaDNbZGF0YS12LTY3MDJkZjYyXSB7XG4gICAgICAgIGNvbG9yOiAjNWNiODVjO1xufVxuc2VjdGlvbi5pbnRyIC5tYWluID4gZGl2Om50aC1jaGlsZCgzKSBoM1tkYXRhLXYtNjcwMmRmNjJdLCBzZWN0aW9uLnNraWxsIC5tYWluID4gZGl2Om50aC1jaGlsZCgzKSBoM1tkYXRhLXYtNjcwMmRmNjJdLCBzZWN0aW9uLmNhc2UgLm1haW4gPiBkaXY6bnRoLWNoaWxkKDMpIGgzW2RhdGEtdi02NzAyZGY2Ml0sIHNlY3Rpb24uY29udGFjdCAubWFpbiA+IGRpdjpudGgtY2hpbGQoMykgaDNbZGF0YS12LTY3MDJkZjYyXSB7XG4gICAgICAgIGNvbG9yOiAjQ0U2NjY0O1xufVxuc2VjdGlvbi5pbnRyIC5tYWluID4gZGl2IHBbZGF0YS12LTY3MDJkZjYyXSwgc2VjdGlvbi5za2lsbCAubWFpbiA+IGRpdiBwW2RhdGEtdi02NzAyZGY2Ml0sIHNlY3Rpb24uY2FzZSAubWFpbiA+IGRpdiBwW2RhdGEtdi02NzAyZGY2Ml0sIHNlY3Rpb24uY29udGFjdCAubWFpbiA+IGRpdiBwW2RhdGEtdi02NzAyZGY2Ml0ge1xuICAgICAgICB0ZXh0LWFsaWduOiBsZWZ0O1xuICAgICAgICB0ZXh0LWluZGVudDogMzVweDtcbiAgICAgICAgbGluZS1oZWlnaHQ6IDMwcHg7XG4gICAgICAgIGZvbnQtc2l6ZTogMTZweDtcbn1cbnNlY3Rpb24uaW50ciAubWFpbiA+IGRpdiBhW2RhdGEtdi02NzAyZGY2Ml0sIHNlY3Rpb24uc2tpbGwgLm1haW4gPiBkaXYgYVtkYXRhLXYtNjcwMmRmNjJdLCBzZWN0aW9uLmNhc2UgLm1haW4gPiBkaXYgYVtkYXRhLXYtNjcwMmRmNjJdLCBzZWN0aW9uLmNvbnRhY3QgLm1haW4gPiBkaXYgYVtkYXRhLXYtNjcwMmRmNjJdIHtcbiAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICBib3R0b206IDA7XG4gICAgICAgIGNvbG9yOiAjMTlBMkI0O1xuICAgICAgICBwYWRkaW5nOiAxMHB4IDE1cHg7XG4gICAgICAgIGJvcmRlcjogMXB4IHNvbGlkO1xuICAgICAgICBib3JkZXItcmFkaXVzOiAzcHg7XG4gICAgICAgIG1hcmdpbi1sZWZ0OiAtMzEuNXB4O1xuICAgICAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XG4gICAgICAgIGZvbnQtd2VpZ2h0OiA3MDA7XG4gICAgICAgIC13ZWJraXQtdHJhbnNpdGlvbjogYWxsIC42cztcbiAgICAgICAgdHJhbnNpdGlvbjogYWxsIC42cztcbn1cbnNlY3Rpb24uaW50ciAubWFpbiA+IGRpdjpudGgtY2hpbGQoMikgYVtkYXRhLXYtNjcwMmRmNjJdLCBzZWN0aW9uLnNraWxsIC5tYWluID4gZGl2Om50aC1jaGlsZCgyKSBhW2RhdGEtdi02NzAyZGY2Ml0sIHNlY3Rpb24uY2FzZSAubWFpbiA+IGRpdjpudGgtY2hpbGQoMikgYVtkYXRhLXYtNjcwMmRmNjJdLCBzZWN0aW9uLmNvbnRhY3QgLm1haW4gPiBkaXY6bnRoLWNoaWxkKDIpIGFbZGF0YS12LTY3MDJkZjYyXSB7XG4gICAgICAgIGNvbG9yOiAjNWNiODVjO1xufVxuc2VjdGlvbi5pbnRyIC5tYWluID4gZGl2Om50aC1jaGlsZCgzKSBhW2RhdGEtdi02NzAyZGY2Ml0sIHNlY3Rpb24uc2tpbGwgLm1haW4gPiBkaXY6bnRoLWNoaWxkKDMpIGFbZGF0YS12LTY3MDJkZjYyXSwgc2VjdGlvbi5jYXNlIC5tYWluID4gZGl2Om50aC1jaGlsZCgzKSBhW2RhdGEtdi02NzAyZGY2Ml0sIHNlY3Rpb24uY29udGFjdCAubWFpbiA+IGRpdjpudGgtY2hpbGQoMykgYVtkYXRhLXYtNjcwMmRmNjJdIHtcbiAgICAgICAgY29sb3I6ICNDRTY2NjQ7XG59XG5zZWN0aW9uLnNraWxsW2RhdGEtdi02NzAyZGY2Ml0ge1xuICAgIG1hcmdpbi10b3A6IDIwcHg7XG59XG5zZWN0aW9uLnNraWxsIC5tYWluW2RhdGEtdi02NzAyZGY2Ml0ge1xuICAgICAgd2lkdGg6IDc5MHB4O1xuICAgICAgbWFyZ2luOiAwIGF1dG87XG4gICAgICBoZWlnaHQ6IGF1dG87XG59XG5zZWN0aW9uLnNraWxsIC5tYWluIC5sZWZ0W2RhdGEtdi02NzAyZGY2Ml0ge1xuICAgICAgICB3aWR0aDogNDAwcHg7XG4gICAgICAgIGhlaWdodDogNDAwcHg7XG4gICAgICAgIG1pbi1oZWlnaHQ6IDQwMHB4O1xuICAgICAgICAtd2Via2l0LXRyYW5zZm9ybTogdHJhbnNsYXRlKDAlLCAyNSUpO1xuICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKDAlLCAyNSUpO1xufVxuc2VjdGlvbi5za2lsbCAubWFpbiAubGVmdCA+IGRpdltkYXRhLXYtNjcwMmRmNjJdIHtcbiAgICAgICAgICB3aWR0aDogMTAwJTtcbiAgICAgICAgICBoZWlnaHQ6IDEwMCU7XG4gICAgICAgICAgbWFyZ2luLXRvcDogMTAlO1xuICAgICAgICAgIGxlZnQ6IDUwJTtcbiAgICAgICAgICB0b3A6IDUwJTtcbiAgICAgICAgICAtd2Via2l0LXRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIC01MCUpO1xuICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgLTUwJSk7XG59XG5zZWN0aW9uLnNraWxsIC5tYWluIC5yaWdodCAuc2tpbGxfbGlzdFtkYXRhLXYtNjcwMmRmNjJdIHtcbiAgICAgICAgd2lkdGg6IDMwMHB4O1xufVxuc2VjdGlvbi5za2lsbCAubWFpbiAucmlnaHQgLnNraWxsX2xpc3QgbGlbZGF0YS12LTY3MDJkZjYyXSB7XG4gICAgICAgICAgbWFyZ2luOiA4cHggMDtcbiAgICAgICAgICB0ZXh0LWFsaWduOiBsZWZ0O1xufVxuc2VjdGlvbi5za2lsbCAubWFpbiAucmlnaHQgLnNraWxsX2xpc3QgbGkgc3BhbltkYXRhLXYtNjcwMmRmNjJdIHtcbiAgICAgICAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgICAgICAgICAgIG1pbi13aWR0aDogNTBweDtcbiAgICAgICAgICAgIHdpZHRoOiA1MHB4O1xuICAgICAgICAgICAgbGluZS1oZWlnaHQ6IDI2cHg7XG4gICAgICAgICAgICBjb2xvcjogIzMzMztcbiAgICAgICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDRweDtcbiAgICAgICAgICAgIC13ZWJraXQtdHJhbnNpdGlvbjogYWxsIC42cztcbiAgICAgICAgICAgIHRyYW5zaXRpb246IGFsbCAuNnM7XG59XG5zZWN0aW9uLnNraWxsIC5tYWluIC5yaWdodCAuc2tpbGxfbGlzdCBsaSBzcGFuW2RhdGEtdi02NzAyZGY2Ml06Zmlyc3QtY2hpbGQge1xuICAgICAgICAgICAgICBjb2xvcjogI2ZmZjtcbn1cbnNlY3Rpb24uc2tpbGwgLm1haW4gLnJpZ2h0IC5za2lsbF9saXN0IGxpIHNwYW5bZGF0YS12LTY3MDJkZjYyXTpsYXN0LWNoaWxkIHtcbiAgICAgICAgICAgICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICAgICAgICAgICAgICBwYWRkaW5nOiAwIDVweDtcbiAgICAgICAgICAgICAgbGluZS1oZWlnaHQ6IDI2cHg7XG59XG5zZWN0aW9uLnNraWxsIHBbZGF0YS12LTY3MDJkZjYyXTpsYXN0LWNoaWxkIHtcbiAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgIGJvdHRvbTogNDBweDtcbiAgICAgIGxlZnQ6IDUwJTtcbiAgICAgIC13ZWJraXQtdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC01MCUpO1xuICAgICAgICAgICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTUwJSk7XG4gICAgICBjb2xvcjogI0JEQkRCQztcbn1cbnNlY3Rpb24uY2FzZVtkYXRhLXYtNjcwMmRmNjJdIHtcbiAgICBkaXNwbGF5OiBub25lO1xufVxuc2VjdGlvbi5mb290cHJpbnRbZGF0YS12LTY3MDJkZjYyXSB7XG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgIHBhZGRpbmc6IDEwdmggMDtcbiAgICBiYWNrZ3JvdW5kOiAjNGE2ZWJjO1xuICAgIG92ZXJmbG93OiBoaWRkZW47XG4gICAgY29sb3I6ICNmZmY7XG59XG5zZWN0aW9uLmZvb3RwcmludCAubWFpbltkYXRhLXYtNjcwMmRmNjJdIHtcbiAgICAgIHBhZGRpbmctdG9wOiA1dmg7XG59XG5zZWN0aW9uLmNvbnRhY3RbZGF0YS12LTY3MDJkZjYyXSB7XG4gICAgY29sb3I6ICNmZmZmZmY7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzM2Mzk0MTtcbn1cbnNlY3Rpb24uY29udGFjdCAuYm94IC5tYWluW2RhdGEtdi02NzAyZGY2Ml0ge1xuICAgICAgcGFkZGluZzogMTV2aCAwO1xufVxuc2VjdGlvbi5jb250YWN0IC5ib3ggLm1haW4gYS5idG5bZGF0YS12LTY3MDJkZjYyXSB7XG4gICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgICAgLXdlYmtpdC10cmFuc2l0aW9uOiBhbGwgMC4xNXMgZWFzZS1pbjtcbiAgICAgICAgdHJhbnNpdGlvbjogYWxsIDAuMTVzIGVhc2UtaW47XG4gICAgICAgIHdpZHRoOiA4MHB4O1xuICAgICAgICBoZWlnaHQ6IDgwcHg7XG4gICAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgICAgICAgcGFkZGluZzogMTBweDtcbiAgICAgICAgbWFyZ2luOiA1cHggNXB4O1xuICAgICAgICBib3JkZXItcmFkaXVzOiA1MCU7XG4gICAgICAgIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC43KTtcbiAgICAgICAgY29sb3I6ICMzMzM7XG4gICAgICAgIGxpbmUtaGVpZ2h0OiA2MHB4O1xuICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcbn1cbnNlY3Rpb24uY29udGFjdCAuYm94IC5tYWluIGEuYnRuW2RhdGEtdi02NzAyZGY2Ml06YWZ0ZXIge1xuICAgICAgICAgIGJvcmRlci13aWR0aDogMnB4O1xuICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbn1cbnNlY3Rpb24uY29udGFjdCAuYm94IC5tYWluIGEuYnRuW2RhdGEtdi02NzAyZGY2Ml06aG92ZXIge1xuICAgICAgICAgIGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMCk7XG4gICAgICAgICAgY29sb3I6ICNmZmY7XG59XG5zZWN0aW9uLmNvbnRhY3QgLmJveCAubWFpbiBhLmJ0bltkYXRhLXYtNjcwMmRmNjJdOmhvdmVyOmFmdGVyIHtcbiAgICAgICAgICAgIHRvcDogMDtcbiAgICAgICAgICAgIGxlZnQ6IDA7XG4gICAgICAgICAgICByaWdodDogMDtcbiAgICAgICAgICAgIGJvdHRvbTogMDtcbiAgICAgICAgICAgIG9wYWNpdHk6IDE7XG59XG5zZWN0aW9uLmNvbnRhY3QgLmJveCAubWFpbiAuYnRuW2RhdGEtdi02NzAyZGY2Ml06YWZ0ZXIge1xuICAgICAgICAtd2Via2l0LXRyYW5zaXRpb246IGFsbCAwLjE1cyBlYXNlLWluO1xuICAgICAgICB0cmFuc2l0aW9uOiBhbGwgMC4xNXMgZWFzZS1pbjtcbiAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICB0b3A6IDEwcHg7XG4gICAgICAgIGxlZnQ6IDEwcHg7XG4gICAgICAgIHJpZ2h0OiAxMHB4O1xuICAgICAgICBib3R0b206IDEwcHg7XG4gICAgICAgIGNvbnRlbnQ6ICcgJztcbiAgICAgICAgb3BhY2l0eTogMDtcbiAgICAgICAgYm9yZGVyOiAxcHggc29saWQgI2ZmZjtcbn1cbkBtZWRpYSAobWF4LXdpZHRoOiA3NjhweCkge1xuICAvKiBpbmRleCAqL1xuLmJveFtkYXRhLXYtNjcwMmRmNjJdIHtcbiAgICB3aWR0aDogMTAwJTtcbn1cbnNlY3Rpb24uaG9tZSBkaXYuYm94IHNlY3Rpb25bZGF0YS12LTY3MDJkZjYyXSB7XG4gICAgcGFkZGluZzogMTV2aCAwIDI1dmg7XG59XG5zZWN0aW9uLmhvbWUgZGl2LmJveCBzZWN0aW9uIC50YWdbZGF0YS12LTY3MDJkZjYyXSB7XG4gICAgICBwYWRkaW5nOiA1cHg7XG59XG5zZWN0aW9uLmludHJbZGF0YS12LTY3MDJkZjYyXSB7XG4gICAgcGFkZGluZzogMDtcbiAgICBwYWRkaW5nLXRvcDogM3ZoO1xufVxuc2VjdGlvbi5pbnRyIC5tYWluID4gZGl2W2RhdGEtdi02NzAyZGY2Ml0ge1xuICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICBtaW4taGVpZ2h0OiAyMDBweDtcbiAgICAgIHBhZGRpbmc6IDIwcHg7XG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1LCAxNjIsIDE4MCwgMC4xKTtcbn1cbnNlY3Rpb24uaW50ciAubWFpbiA+IGRpdiBoM1tkYXRhLXYtNjcwMmRmNjJdIHtcbiAgICAgICAgbWFyZ2luOiAwO1xufVxuc2VjdGlvbi5pbnRyIC5tYWluID4gZGl2IGFbZGF0YS12LTY3MDJkZjYyXSB7XG4gICAgICAgIGJvdHRvbTogMTBweDtcbn1cbnNlY3Rpb24uaW50ciAubWFpbiA+IGRpdltkYXRhLXYtNjcwMmRmNjJdOm50aC1jaGlsZCgyKSB7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjIzLCAyNDAsIDIxNSwgMC4xKTtcbn1cbnNlY3Rpb24uaW50ciAubWFpbiA+IGRpdltkYXRhLXYtNjcwMmRmNjJdOm50aC1jaGlsZCgzKSB7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjA2LCAxMDIsIDEwMCwgMC4xKTtcbn1cbnNlY3Rpb24uc2tpbGxbZGF0YS12LTY3MDJkZjYyXSB7XG4gICAgbWFyZ2luLXRvcDogMjBweDtcbiAgICBwYWRkaW5nOiA1dmggMDtcbn1cbnNlY3Rpb24uc2tpbGwgLm1haW5bZGF0YS12LTY3MDJkZjYyXSB7XG4gICAgICB3aWR0aDogMTAwJTtcbiAgICAgIGhlaWdodDogYXV0bztcbn1cbnNlY3Rpb24uc2tpbGwgLm1haW4gLmxlZnRbZGF0YS12LTY3MDJkZjYyXSB7XG4gICAgICAgIHdpZHRoOiAxMDB2dztcbiAgICAgICAgaGVpZ2h0OiA4MHZ3O1xuICAgICAgICBtaW4taGVpZ2h0OiAzMDBweDtcbiAgICAgICAgcGFkZGluZzogMCAyMHB0O1xuICAgICAgICAtd2Via2l0LXRyYW5zZm9ybTogdHJhbnNsYXRlKDAsIDApO1xuICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKDAsIDApO1xufVxuc2VjdGlvbi5za2lsbCAubWFpbiAucmlnaHRbZGF0YS12LTY3MDJkZjYyXSB7XG4gICAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgICBwYWRkaW5nOiAwIDIwcHQ7XG59XG5zZWN0aW9uLnNraWxsIC5tYWluIC5yaWdodCAuc2tpbGxfbGlzdFtkYXRhLXYtNjcwMmRmNjJdIHtcbiAgICAgICAgICB3aWR0aDogMTAwJTtcbn1cbnNlY3Rpb24uc2tpbGwgcFtkYXRhLXYtNjcwMmRmNjJdOmxhc3QtY2hpbGQge1xuICAgICAgYm90dG9tOiAwcHg7XG59XG4gIC8qIGJsb2cgKi9cbi5jb250ZW50LWRldGFpbFtkYXRhLXYtNjcwMmRmNjJdLFxuICAuY29udGVudC1jb21tZW50W2RhdGEtdi02NzAyZGY2Ml0ge1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIHBhZGRpbmc6IDE1cHg7XG59XG4uY29udGVudC1kZXRhaWwgLmRpZ2dbZGF0YS12LTY3MDJkZjYyXSB7XG4gICAgbWFyZ2luLXRvcDogMTVweDtcbn1cbi5jb250ZW50LWRldGFpbCAuZGlnZyBzcGFuW2RhdGEtdi02NzAyZGY2Ml0ge1xuICAgICAgd2lkdGg6IDQwcHg7XG4gICAgICBoZWlnaHQ6IDQwcHg7XG4gICAgICBsaW5lLWhlaWdodDogMzVweDtcbiAgICAgIGZvbnQtc2l6ZTogMjJweDtcbn1cbi5jb250ZW50LWRldGFpbCBoZWFkZXIgLnRpdGxlW2RhdGEtdi02NzAyZGY2Ml0ge1xuICAgIG1hcmdpbjogNXB4IDA7XG4gICAgZm9udC1zaXplOiAxNnB4O1xufVxuLmNvbnRlbnQtZGV0YWlsIGhlYWRlciAudGltZVtkYXRhLXYtNjcwMmRmNjJdIHtcbiAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gICAgbWFyZ2luLXJpZ2h0OiA1cHg7XG59XG4uY29udGVudC1kZXRhaWwgaGVhZGVyIC5uYW1lW2RhdGEtdi02NzAyZGY2Ml0ge1xuICAgIGZvbnQtc2l6ZTogMTRweDtcbn1cbi5jb250ZW50LWNvbW1lbnQgLmF1dGhvcltkYXRhLXYtNjcwMmRmNjJdLFxuICAucmVwbHlib3ggLmF1dGhvcltkYXRhLXYtNjcwMmRmNjJdIHtcbiAgICBtYXJnaW4tcmlnaHQ6IDA7XG4gICAgbWluLXdpZHRoOiA1MHB4O1xuICAgIG1heC13aWR0aDogODBweDtcbn1cbi5jb250ZW50LWNvbW1lbnQgLmF1dGhvciAucGhvdG9bZGF0YS12LTY3MDJkZjYyXSxcbiAgICAucmVwbHlib3ggLmF1dGhvciAucGhvdG9bZGF0YS12LTY3MDJkZjYyXSB7XG4gICAgICB3aWR0aDogMzVweDtcbiAgICAgIG1hcmdpbjogYXV0bztcbn1cbi5jb250ZW50LWNvbW1lbnQgLmVkaXRib3ggLnBsYWNlaG9sZGVyW2RhdGEtdi02NzAyZGY2Ml0sXG4gIC5yZXBseWJveCAuZWRpdGJveCAucGxhY2Vob2xkZXJbZGF0YS12LTY3MDJkZjYyXSB7XG4gICAgZm9udC1zaXplOiAxNHB4O1xufVxuLmNvbnRlbnQtY29tbWVudCAubGlzdCAuYXV0aG9yW2RhdGEtdi02NzAyZGY2Ml0sXG4gIC5yZXBseWJveCAubGlzdCAuYXV0aG9yW2RhdGEtdi02NzAyZGY2Ml0ge1xuICAgIG1hcmdpbi1yaWdodDogMDtcbiAgICBtaW4td2lkdGg6IDM1cHg7XG59XG4uY29udGVudC1jb21tZW50IC5saXN0IC5hdXRob3IgLnBob3RvW2RhdGEtdi02NzAyZGY2Ml0sXG4gICAgLnJlcGx5Ym94IC5saXN0IC5hdXRob3IgLnBob3RvW2RhdGEtdi02NzAyZGY2Ml0ge1xuICAgICAgd2lkdGg6IDM1cHg7XG4gICAgICBtYXJnaW46IGF1dG87XG59XG4gIC8qIOW8ueahhiAqL1xuZGl2W2RhdGEtdi02NzAyZGY2Ml0gLm1vZGVsLWJveCxcbiAgZGl2W2RhdGEtdi02NzAyZGY2Ml0gLnJlcGx5Ym94IHtcbiAgICB3aWR0aDogOTAlO1xufVxuZGl2W2RhdGEtdi02NzAyZGY2Ml0gLm1vZGVsLWJveCAuZWwtZGlhbG9nX19ib2R5LFxuICAgIGRpdltkYXRhLXYtNjcwMmRmNjJdIC5yZXBseWJveCAuZWwtZGlhbG9nX19ib2R5IHtcbiAgICAgIHBhZGRpbmc6IDEwcHggMTBweDtcbn1cbi5iYXJCb3hbZGF0YS12LTY3MDJkZjYyXSB7XG4gICAgd2lkdGg6IDUwcHg7XG4gICAgaGVpZ2h0OiA1MHB4O1xufVxuLmJhckJveCBkaXYgc3BhbltkYXRhLXYtNjcwMmRmNjJdIHtcbiAgICAgIGZvbnQtc2l6ZTogNTBweDtcbiAgICAgIGxpbmUtaGVpZ2h0OiA1MHB4O1xufVxuLmJhckJveCBkaXYgc3BhbltkYXRhLXYtNjcwMmRmNjJdOmxhc3QtY2hpbGQge1xuICAgICAgICBmb250LXNpemU6IDEycHg7XG59XG59XG4vKuW5v+aSreaJqeaVo+aViOaenCovXG5Aa2V5ZnJhbWVzIHJhZGFyLWRhdGEtdi02NzAyZGY2MiB7XG4wJSB7XG4gICAgd2lkdGg6IDE1MHB4O1xuICAgIGhlaWdodDogMTUwcHg7XG4gICAgYm9yZGVyOiA0MHB4IHNvbGlkICNmZmY7XG4gICAgb3BhY2l0eTogMDtcbn1cbjUwJSB7XG4gICAgb3BhY2l0eTogLjE7XG59XG45MCUge1xuICAgIHdpZHRoOiA2NTBweDtcbiAgICBoZWlnaHQ6IDY1MHB4O1xufVxuOTAlLCAxMDAlIHtcbiAgICBib3JkZXI6IDJweCBzb2xpZCAjZmZmO1xuICAgIG9wYWNpdHk6IDA7XG59XG4xMDAlIHtcbiAgICB3aWR0aDogMTMwMHB4O1xuICAgIGhlaWdodDogMTMwMHB4O1xufVxufVxuQC13ZWJraXQta2V5ZnJhbWVzIHJhZGFyLWRhdGEtdi02NzAyZGY2MiB7XG4wJSB7XG4gICAgd2lkdGg6IDE1MHB4O1xuICAgIGhlaWdodDogMTUwcHg7XG4gICAgYm9yZGVyOiA0MHB4IHNvbGlkICNmZmY7XG4gICAgb3BhY2l0eTogMDtcbn1cbjUwJSB7XG4gICAgb3BhY2l0eTogLjE7XG59XG45MCUge1xuICAgIHdpZHRoOiA2NTBweDtcbiAgICBoZWlnaHQ6IDY1MHB4O1xufVxuOTAlLCAxMDAlIHtcbiAgICBib3JkZXI6IDJweCBzb2xpZCAjZmZmO1xuICAgIG9wYWNpdHk6IDA7XG59XG4xMDAlIHtcbiAgICB3aWR0aDogMTMwMHB4O1xuICAgIGhlaWdodDogMTMwMHB4O1xufVxufVxuLyrlub/mkq3mianmlaPmlYjmnpxlbmQqL1xuIl0sInNvdXJjZVJvb3QiOiIifQ== */</style><style type="text/css">
.footer[data-v-e3285aaa] {
position: relative;
background-color: rgba(255, 255, 255, 0.6);
}
.footer.bottom[data-v-e3285aaa] {
  position: fixed;
  bottom: 0;
  width: 100%;
}
.footer .toolbar[data-v-e3285aaa] {
  position: fixed;
  right: 5%;
  bottom: 20%;
  z-index: 999;
}
.footer .toolbar .go-top[data-v-e3285aaa] {
    border-radius: 50%;
    height: 30px;
    width: 30px;
    line-height: 30px;
    overflow: hidden;
    cursor: pointer;
    -webkit-box-shadow: 0 0 5px 1px #ccc;
            box-shadow: 0 0 5px 1px #ccc;
}

/*# sourceURL=/Users/falost/my/alblog/alblog-web/src/template/web/common/footer.vue */
/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9mYWxvc3QvbXkvYWxibG9nL2FsYmxvZy13ZWIvc3JjL3RlbXBsYXRlL3dlYi9jb21tb24vZm9vdGVyLnZ1ZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0E7RUFDRSxtQkFBbUI7RUFDbkIsMkNBQTJDO0NBQzVDO0FBQ0Q7SUFDSSxnQkFBZ0I7SUFDaEIsVUFBVTtJQUNWLFlBQVk7Q0FDZjtBQUNEO0lBQ0ksZ0JBQWdCO0lBQ2hCLFVBQVU7SUFDVixZQUFZO0lBQ1osYUFBYTtDQUNoQjtBQUNEO01BQ00sbUJBQW1CO01BQ25CLGFBQWE7TUFDYixZQUFZO01BQ1osa0JBQWtCO01BQ2xCLGlCQUFpQjtNQUNqQixnQkFBZ0I7TUFDaEIscUNBQXFDO2NBQzdCLDZCQUE2QjtDQUMxQyIsImZpbGUiOiJmb290ZXIudnVlIiwic291cmNlc0NvbnRlbnQiOlsiXG4uZm9vdGVyW2RhdGEtdi1lMzI4NWFhYV0ge1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC42KTtcbn1cbi5mb290ZXIuYm90dG9tW2RhdGEtdi1lMzI4NWFhYV0ge1xuICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICBib3R0b206IDA7XG4gICAgd2lkdGg6IDEwMCU7XG59XG4uZm9vdGVyIC50b29sYmFyW2RhdGEtdi1lMzI4NWFhYV0ge1xuICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICByaWdodDogNSU7XG4gICAgYm90dG9tOiAyMCU7XG4gICAgei1pbmRleDogOTk5O1xufVxuLmZvb3RlciAudG9vbGJhciAuZ28tdG9wW2RhdGEtdi1lMzI4NWFhYV0ge1xuICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgICAgaGVpZ2h0OiAzMHB4O1xuICAgICAgd2lkdGg6IDMwcHg7XG4gICAgICBsaW5lLWhlaWdodDogMzBweDtcbiAgICAgIG92ZXJmbG93OiBoaWRkZW47XG4gICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICAtd2Via2l0LWJveC1zaGFkb3c6IDAgMCA1cHggMXB4ICNjY2M7XG4gICAgICAgICAgICAgIGJveC1zaGFkb3c6IDAgMCA1cHggMXB4ICNjY2M7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9 */</style></head><body><div id="app"><div class="wrapper"><header data-v-7352f2d0="" id="header" class="header"><span data-v-7352f2d0="" class="line"></span> <nav data-v-7352f2d0=""><ul data-v-7352f2d0="" class="box"><li data-v-7352f2d0=""><a data-v-7352f2d0="" href="/" class="router-link-exact-active router-link-active">Falost Home</a></li><li data-v-7352f2d0=""><a data-v-7352f2d0="" href="/blog" class="">博客</a></li><li data-v-7352f2d0=""><a data-v-7352f2d0="" target="_blank" href="https://www.fedte.cc">小窝</a></li></ul></nav></header> <section class="content-wrapper" style="min-height: 542px;"><section data-v-6702df62=""><div data-v-6702df62="" class="mask"></div> <canvas data-v-6702df62="" id="bubble" width="300" height="255"></canvas> <section data-v-6702df62="" class="home"><div data-v-6702df62="" class="box"><section data-v-6702df62=""><h1 data-v-6702df62=""><a data-v-6702df62="" href=""><img data-v-6702df62="" src="https://falost.cc/static/img/tuxiang.963f11c.jpg" alt="I'm falost"></a> <span data-v-6702df62="" class="bg"><span data-v-6702df62="" class="radar"></span> <span data-v-6702df62="" class="radar"></span> <span data-v-6702df62="" class="radar"></span></span></h1> <h2 data-v-6702df62="">I'M Falost</h2> <p data-v-6702df62="">专注于前端开发，前端安全研究！</p> <div data-v-6702df62="" class="tag"><span data-v-6702df62="" style="background-color: rgb(92, 184, 92);">javaScript</span><span data-v-6702df62="" style="background-color: rgb(74, 74, 74);">jQury</span><span data-v-6702df62="" style="background-color: rgb(212, 63, 58);">HTML(5)</span><span data-v-6702df62="" style="background-color: rgb(213, 133, 18);">CSS(3)</span><span data-v-6702df62="" style="background-color: rgb(212, 63, 58);">NodeJs</span><span data-v-6702df62="" style="background-color: rgb(27, 140, 49);">Bootstrap</span><span data-v-6702df62="" style="background-color: rgb(76, 174, 76);">Vue</span><span data-v-6702df62="" style="background-color: rgb(25, 162, 180);">wxapp</span></div></section></div></section> <section data-v-6702df62="" class="intr"><div data-v-6702df62="" class="box"><div data-v-6702df62=""><h2 data-v-6702df62="">Falost's Introduce</h2> <p data-v-6702df62="">梦想若在，路就在前方，踏上实现梦想的征途！</p> <div data-v-6702df62="" class="main"><div data-v-6702df62=""><h3 data-v-6702df62=""><span data-v-6702df62="" class="glyphicon glyphicon-map-marker"></span></h3> <p data-v-6702df62="">一名有节操的90后前端程序员。家乡位于陕南美丽的山水太极城，汉水之滨的小山村中。</p> <a data-v-6702df62="" href="javascript:void(0)">More</a></div> <div data-v-6702df62=""><h3 data-v-6702df62=""><span data-v-6702df62="" class="glyphicon glyphicon-star"></span></h3> <p data-v-6702df62="">虽然身体有点胖，但是还是喜欢户外运动，正所谓，生命在于运动。喜欢出没于各大技术圈子中。</p> <a data-v-6702df62="" href="javascript:void(0)">More</a></div> <div data-v-6702df62=""><h3 data-v-6702df62=""><span data-v-6702df62="" class="glyphicon glyphicon-heart"></span></h3> <p data-v-6702df62="">一直希望和家人一起是去旅游，行走在山水之间。或沉寂于家乡山野之中，远离繁华喧嚣的都市，安安静静！</p> <a data-v-6702df62="" href="javascript:void(0)">More</a></div></div></div></div></section> <section data-v-6702df62="" class="skill"><div data-v-6702df62="" class="box"><div data-v-6702df62=""><h2 data-v-6702df62="">Get's Skill</h2> <p data-v-6702df62="">追梦若冷，就用希望去暖!</p> <div data-v-6702df62="" class="main"><div data-v-6702df62="" class="left"><div data-v-6702df62="" id="skill" class="flex-center" _echarts_instance_="ec_1566891633504" style="-webkit-tap-highlight-color: transparent; user-select: none; position: relative; background: transparent;"><div style="position: relative; overflow: hidden; width: 321px; height: 300px; padding: 0px; margin: 0px; border-width: 0px;"><canvas width="642" height="600" data-zr-dom-id="zr_0" style="position: absolute; left: 0px; top: 0px; width: 321px; height: 300px; user-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); padding: 0px; margin: 0px; border-width: 0px;"></canvas></div><div></div></div></div> <div data-v-6702df62="" class="right"><ul data-v-6702df62="" class="skill_list"><li data-v-6702df62=""><span data-v-6702df62="" style="background-color: rgb(212, 63, 58);"></span><span data-v-6702df62="" style="display: none;">99点</span></li><li data-v-6702df62=""><span data-v-6702df62="" style="background-color: rgb(76, 174, 76);"></span><span data-v-6702df62="" style="display: none;">95点</span></li><li data-v-6702df62=""><span data-v-6702df62="" style="background-color: rgb(212, 63, 58);"></span><span data-v-6702df62="" style="display: none;">96点</span></li><li data-v-6702df62=""><span data-v-6702df62="" style="background-color: rgb(76, 174, 76);"></span><span data-v-6702df62="" style="display: none;">95点</span></li><li data-v-6702df62=""><span data-v-6702df62="" style="background-color: rgb(212, 63, 58);"></span><span data-v-6702df62="" style="display: none;">86点</span></li><li data-v-6702df62=""><span data-v-6702df62="" style="background-color: rgb(212, 63, 58);"></span><span data-v-6702df62="" style="display: none;">85点</span></li><li data-v-6702df62=""><span data-v-6702df62="" style="background-color: rgb(86, 126, 149);"></span><span data-v-6702df62="" style="display: none;">80点</span></li><li data-v-6702df62=""><span data-v-6702df62="" style="background-color: rgb(212, 63, 58);"></span><span data-v-6702df62="" style="display: none;">80点</span></li><li data-v-6702df62=""><span data-v-6702df62="" style="background-color: rgb(212, 63, 58);"></span><span data-v-6702df62="" style="display: none;">65点</span></li><li data-v-6702df62=""><span data-v-6702df62="" style="background-color: rgb(217, 83, 79);"></span><span data-v-6702df62="" style="display: none;">50点</span></li><li data-v-6702df62=""><span data-v-6702df62="" style="background-color: rgb(3, 103, 23);"></span><span data-v-6702df62="" style="display: none;">45点</span></li><li data-v-6702df62=""><span data-v-6702df62="" style="background-color: rgb(74, 74, 74);"></span><span data-v-6702df62="" style="display: none;">44点</span></li><li data-v-6702df62=""><span data-v-6702df62="" style="background-color: rgb(27, 140, 49);"></span><span data-v-6702df62="" style="display: none;">40点</span></li><li data-v-6702df62=""><span data-v-6702df62="" style="background-color: rgb(212, 63, 58);"></span><span data-v-6702df62="" style="display: none;">40点</span></li><li data-v-6702df62=""><span data-v-6702df62="" style="background-color: rgb(25, 162, 180);"></span><span data-v-6702df62="" style="display: none;">25点</span></li></ul></div></div> <p data-v-6702df62="" class="tac">注：技能成熟点仅供参考！</p></div></div></section> <section data-v-6702df62="" class="case"><div data-v-6702df62="" class="box"><div data-v-6702df62=""><h2 data-v-6702df62="">Get's Skill</h2> <p data-v-6702df62="">如果你没有倒下，那么梦想依旧存在，继续追着Ta!</p> <div data-v-6702df62="" id="" class="main"></div></div></div></section> <section data-v-6702df62="" class="footprint tac"><h2 data-v-6702df62="">The Corner of the World</h2> <p data-v-6702df62="">Call from the world!</p> <div data-v-6702df62="" id="world" class="main"><div style="margin: 0px auto; width: 375px; height: 187.5px; position: relative; cursor: default;"><canvas width="750" height="375" style="width: 375px; height: 187.5px; position: absolute; top: 0px; left: 0px;"></canvas><canvas width="750" height="375" style="width: 375px; height: 187.5px; position: absolute; top: 0px; left: 0px;"></canvas><canvas width="750" height="375" style="width: 375px; height: 187.5px; position: absolute; top: 0px; left: 0px;"></canvas><canvas width="750" height="375" style="width: 375px; height: 187.5px; position: absolute; top: 0px; left: 0px;"></canvas></div></div></section> <section data-v-6702df62="" class="contact"><div data-v-6702df62="" class="box"><div data-v-6702df62=""><h2 data-v-6702df62="">Contact Me</h2> <p data-v-6702df62="">如果你没有倒下，那么梦想依旧存在，继续追着Ta!</p> <div data-v-6702df62="" class="main"><a data-v-6702df62="" href="http://weibo.com/falost" target="_blank" class="btn">微博</a> <a data-v-6702df62="" href="http://wpa.qq.com/msgrd?v=3&amp;uin=869432476&amp;site=www.fedte.cc&amp;menu=yes" target="_blank" class="btn">QQ</a> <a data-v-6702df62="" class="btn">Wechat</a> <a data-v-6702df62="" href="mailto:falost.cc@gmail.com" class="btn">Mail</a> <a data-v-6702df62="" href="https://github.com/falost" target="_blank" class="btn">Github</a> <a data-v-6702df62="" href="https://twitter.com/falost_cc" target="_blank" class="btn">Twitter</a> <a data-v-6702df62="" href="https://www.facebook.com/falost.cc" target="_blank" class="btn">Facebook</a> <a data-v-6702df62="" href="https://www.linkedin.com/in/falost" target="_blank" class="btn">LinkedIn</a></div></div></div></section></section></section> <footer data-v-e3285aaa="" id="footer" class="footer ptb20 mt15"><div data-v-e3285aaa="" class="copyRight c-999 tac"><span data-v-e3285aaa="">Copyright © 2011 - 2018 code &amp; design by </span> <a data-v-e3285aaa="" href="https://github.com/falost" target="_blank">Falost</a> <span data-v-e3285aaa=""> Powered by </span> <a data-v-e3285aaa="" href="https://github.com/fedte/alblog" target="_blank">Alblog.</a></div> <div data-v-e3285aaa="" class="expressGratitude mt10 tac"><span data-v-e3285aaa="">感谢</span> <a data-v-e3285aaa="" href="https://portal.qiniu.com/signup?code=3lpzf4df56ogi" target="_blank">七牛云</a> <span data-v-e3285aaa="">提供静态储存,API服务托管于</span> <a data-v-e3285aaa="" href="https://s.click.taobao.com/t?e=m%3D2%26s%3DO2MYoKPuhjMcQipKwQzePCperVdZeJviEViQ0P1Vf2kguMN8XjClAh%2BCBB4KsQrduN7SIkF%2FOPrEkAMOsPieoaOK6aiYzIS%2BCQR0RvYlGHPmLsgZ5JksZTDVuRn8ddiDsEVVC24eqozO54LQ%2FVw1L9X5LHh3Z8M%2BWS6ALZVeqlk9XUfbPSJC%2F06deTzTIbffYpyF7ku%2BxKhmP4RbR9G21%2FOCIjQ5MjhgxgxdTc00KD8%3D" target="_blank">阿里云</a> <span data-v-e3285aaa="">ESC,前端页面储存在</span> <a data-v-e3285aaa="" href="https://github.com/falost/falost.github.io" target="_blank">Github.</a></div> <div data-v-e3285aaa="" class="icp"></div> <div data-v-e3285aaa="" class="toolbar"><div data-v-e3285aaa="" title="返回顶部" class="go-top tac hLh30 bgc-fff" style="display: none;"><span data-v-e3285aaa="" class="fui-font fui-gotop c-999"></span> <span data-v-e3285aaa="">TOP</span></div></div></footer></div></div></div></body></html>`
    };

    // this.validator
    //   .required(html, '缺少必要参数 html')
    //   .required(operatorId, '缺少必要参数 operatorId');

    let imgBuffer;
    try {
      imgBuffer = await PuppenteerHelper.createImg({
        html,
        width,
        height,
        quality,
        ratio,
        imageType,
        fileType: 'path',
        htmlRedisKey
      });
    } catch (err) {
      // logger
      console.log(err)
    }
    console.log(1111, imgBuffer)
    let imgUrl;

    try {
      // imgUrl = await this.uploadImage(imgBuffer, operatorId);
      // 将海报图片存在 Redis 里
      // await ctx.kvdsClient.setex(htmlRedisKey, oneDay, imgUrl);
    } catch (err) {
    }

    return {
      img: imgBuffer || ''
    }

  }

  /**

- 上传图片到七牛
  *
- @param {Buffer} imgBuffer 图片buffer
  */
  async uploadImage(imgBuffer) {

    // upload image to cdn and return cdn url

  }
}

module.exports = SnapshotController  