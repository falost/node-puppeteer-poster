// This file is created by egg-ts-helper@1.25.6
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportHome from '../../../app/controller/home';
import ExportApiV1Poster from '../../../app/controller/api/v1/poster';

declare module 'egg' {
  interface IController {
    home: ExportHome;
    api: {
      v1: {
        poster: ExportApiV1Poster;
      }
    }
  }
}
