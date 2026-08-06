// 高德地图地址采用jsonp callback -->amapInitComponent
// 含插件Autocomplete，Geocoder，Geolocation，ToolBar，Scale，CitySearch
import _ from 'lodash';
import global from 'src/api/global';

export const getMapKey = keyName => {
  let mapInfo;
  const mapData = window.localStorage.getItem('MDMap');

  // 私有实时调接口
  if (!mapData || window.platformENV.isOverseas || window.platformENV.isLocal) {
    const data = global.getSystemConfiguration({}, { ajaxOptions: { sync: true } });
    safeLocalStorageSetItem('MDMap', JSON.stringify(data));
    mapInfo = _.get(data, [keyName]);
  } else {
    mapInfo = _.get(safeParse(mapData), [keyName]);
  }

  if (keyName === 'amap') {
    window._AMapSecurityConfig = {
      ...(_.get(mapInfo, 'host')
        ? { serviceHost: _.get(mapInfo, 'host') }
        : { securityJsCode: _.get(mapInfo, 'secret') }),
    };
  }

  return mapInfo;
};

const isPluginsReady = () => window.AMap && window.AMap.Map && window.AMap.Geocoder && window.AMap.Geolocation;

export default class MapLoader {
  loadJs() {
    if (isPluginsReady()) {
      return Promise.resolve(window.AMap);
    }

    return new Promise(resolve => {
      // 获取地图数据
      const { key } = getMapKey('amap') || {};
      const AMAP_URL = `https://webapi.amap.com/maps?v=2.0&key=${key}&plugin=AMap.Autocomplete,AMap.PlaceSearch,AMap.Geocoder,AMap.Geolocation,AMap.ToolBar,AMap.Scale,AMap.CitySearch`;

      const existingScript = document.querySelector('script[data-amap-script]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.setAttribute('data-amap-script', 'true');
        script.src = AMAP_URL;
        document.head.appendChild(script);
      }

      const aMapTimer = setInterval(() => {
        if (isPluginsReady()) {
          resolve(window.AMap);
          clearInterval(aMapTimer);
        }
      }, 500);
    });
  }
}
