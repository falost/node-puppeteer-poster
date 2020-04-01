/*
 * @Descripttion: utils 工具类
 * @version: 1.0.0
 * @Author: falost
 * @Date: 2019-08-27 14:10:16
 * @LastEditors: falost
 * @LastEditTime: 2020-04-01 17:50:46
 */
const fs = require('fs')
const path = require('path')

export const mkdirsSync = (dirname) => {
  if (fs.existsSync(dirname)) {
    return true;
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname);
      return true;
    }
  }
}
export const formatNumber = function (n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}