// This file is created by egg-ts-helper@1.25.6
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportTest from '../../../app/service/Test';
import ExportIndex from '../../../app/service/index';
import ExportPoster from '../../../app/service/poster';

declare module 'egg' {
  interface IService {
    test: ExportTest;
    index: ExportIndex;
    poster: ExportPoster;
  }
}
