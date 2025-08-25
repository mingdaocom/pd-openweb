// 高德地图地址采用jsonp callback -->amapInitComponent
// 含插件Autocomplete，Geocoder，Geolocation，ToolBar，Scale，CitySearch
import _ from 'lodash';
import global from 'src/api/global';

export const getMapKey = keyName => {
  let mapInfo;
  const mapData = window.localStorage.getItem('MDMap');
  // 私有实时调接口
  if (!mapData || md.global.Config.IsLocal) {
    const data = global.getSystemConfiguration({}, { ajaxOptions: { sync: true } });
    safeLocalStorageSetItem('MDMap', JSON.stringify(data));
    mapInfo = _.get(data, [keyName]);
  } else {
    mapInfo = _.get(safeParse(mapData), [keyName]);
  }

  if (keyName === 'amap') {
    window._AMapSecurityConfig = {
      securityJsCode: _.get(mapInfo, 'secret'),
    };
  }

  return mapInfo;
};

export default class MapLoader {
  loadJs() {
    return new Promise(resolve => {
      // 获取地图数据
      const { key } = getMapKey('amap') || {};
      const AMAP_URL = `https://webapi.amap.com/maps?v=2.0&key=${key}&plugin=AMap.Autocomplete,AMap.PlaceSearch,AMap.Geocoder,AMap.Geolocation,AMap.ToolBar,AMap.Scale,AMap.CitySearch`;

      fetch(AMAP_URL)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.text();
        })
        .then(script => {
          eval(script);
        })
        .catch(error => {
          console.log(error);
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
