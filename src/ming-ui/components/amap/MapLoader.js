// 高德地图地址采用jsonp callback -->amapInitComponent
// 含插件Autocomplete，Geocoder，Geolocation，ToolBar，Scale，CitySearch
import global from 'src/api/global';

const getMapData = () => {
  const mapData = window.localStorage.getItem('MapData');
  if (!mapData) {
    const data = global.getSystemConfiguration({}, { ajaxOptions: { sync: true } });
    safeLocalStorageSetItem('MapData', JSON.stringify(data.amap));
    return data.amap;
  }
  return safeParse(mapData);
};

export default class MapLoader {
  constructor() {
    const { secret } = getMapData() || {};
    window._AMapSecurityConfig = {
      securityJsCode: secret,
    };
  }
  loadJs() {
    return new Promise((resolve, reject) => {
      // 获取地图数据
      const { key } = getMapData() || {};
      const AMAP_URL = `https://webapi.amap.com/maps?v=2.0&key=${key}&plugin=AMap.Autocomplete,AMap.PlaceSearch,AMap.Geocoder,AMap.Geolocation,AMap.ToolBar,AMap.Scale,AMap.CitySearch`;

      $.ajax({
        url: AMAP_URL,
        dataType: 'script',
      });
      const aMapTimer = setInterval(() => {
        if (window.AMap && window.AMap.Map) {
          resolve(window.AMap);
          clearInterval(aMapTimer);
        }
      }, 500);
    });
  }
}
