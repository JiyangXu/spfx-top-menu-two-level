import { IConfiguration } from '../models';

export class ConfigService {
  private static _headers: IConfiguration[] = <IConfiguration[]>[
    {
      "name":"theHub - Top Navigation - Test",
      "id":"8d9feb79-7d2b-43f2-a489-2f95921ff14d"
    }
];
  public static getItemByName(headerName: string): IConfiguration {
      return this._headers.filter((headers: IConfiguration) => headers.name === headerName)[0];
    }
  public static getItems(){
    return this._headers;
  }
} // class MissionService