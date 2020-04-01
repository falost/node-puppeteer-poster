/*
 * @Descripttion: 首页模块服务
 * @version: 1.0.0
 * @Author: falost
 * @Date: 2019-12-21 16:05:44
 * @LastEditors: falost
 * @LastEditTime: 2019-12-21 20:31:50
 */
import { Service } from 'egg';

/**
 * Index Service
 */
export default class Index extends Service {

  /**
   * @name getIndex
   * @desc 获取首页信息
   * @author Falost
   * @time 2019年12月21日 20:31:29 星期六
   * @param {Object} {}
   * @return  {*}
   */
  public async getIndex(name: string) {
    return `hello ${name}`;
  }
}
