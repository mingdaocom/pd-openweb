// 引入高德地图JSAP
// <script src="//webapi.amap.com/maps?v=1.3&key=您申请的key值"></script>

// 高德地图地址采用jsonp callback -->amapInitComponent
// 含插件Autocomplete，Geocoder，Geolocation，ToolBar，Scale
// 引入高德地图JSAP
// <script src="//webapi.amap.com/maps?v=1.3&key=您申请的key值"></script>

// 高德地图地址采用jsonp callback -->amapInitComponent
// 含插件Autocomplete，Geocoder，Geolocation，ToolBar，Scale
// 引入高德地图JSAP
// <script src="//webapi.amap.com/maps?v=1.3&key=您申请的key值"></script>

// 高德地图地址采用jsonp callback -->amapInitComponent
// 含插件Autocomplete，Geocoder，Geolocation，ToolBar，Scale
// 引入高德地图JSAP
// <script src="//webapi.amap.com/maps?v=1.3&key=您申请的key值"></script>

// 高德地图地址采用jsonp callback -->amapInitComponent
// 含插件Autocomplete，Geocoder，Geolocation，ToolBar，Scale
const AMAP_URL =
  'https://webapi.amap.com/maps?v=1.3&key=9aedaf173cec6f03d4b9ce7c8a9159c5&plugin=AMap.Autocomplete,AMap.PlaceSearch,AMap.Geocoder,AMap.Geolocation,AMap.ToolBar,AMap.Scale'; // eslint-disable-line

let map;

export default class MapLoader {
  loadJs() {
    if (map) {
      return map;
    } else {
      return new Promise((resolve, reject) => {
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
}
