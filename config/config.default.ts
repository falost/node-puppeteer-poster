/*
 * @Descripttion: 默认配置文件
 * @version: 1.0.0
 * @Author: falost
 * @Date: 2019-12-21 12:25:14
 * @LastEditors: falost
 * @LastEditTime: 2020-04-01 17:55:46
 */
import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';

export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>;

  // override config from framework / plugin
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1576902305610_6542';

  // add your egg config in here
  config.middleware = [];
  // add your special config in here
  const bizConfig = {
    sourceUrl: `https://github.com/eggjs/examples/tree/master/${appInfo.name}`,
  };

  // the return config will combines to EggAppConfig
  return {
    ...config,
    ...bizConfig,
  };
};
