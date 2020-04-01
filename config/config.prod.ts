/*
 * @Descripttion: 生产环境配置
 * @version: 1.0.0
 * @Author: falost
 * @Date: 2019-12-21 12:25:14
 * @LastEditors: falost
 * @LastEditTime: 2020-04-01 17:56:16
 */
import { EggAppConfig, PowerPartial } from 'egg';

export default () => {
  const config: PowerPartial<EggAppConfig> = {};

  config.staticPath = '';
  return config;
};
