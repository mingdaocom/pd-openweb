export default class MapHandler {
  constructor(container, mapOptions = {}) {
    this.searchMarker = null; // 搜索结果点标记
    this.rangeCircle = null; // 圆形范围
    // 创建地图实例
    this.map = new AMap.Map(container, {
      // 地图容器DIV的ID值或者DIV对象
      resizeEnable: true, // 是否监控地图容器尺寸变化，默认值为false
      ...mapOptions, // 地图初始化参数对象
    });
  }
  // 销毁地图
  destroyMap() {
    this.map = null;
    this.searchMarker = null;
    this.rangeCircle = null;
  }
  // 指定地图显示位置
  setPosition(lng, lat, zoom = 15) {
    // map地图实例,lng经度,lat纬度,zoom缩放级别
    // 创建中心点坐标
    this.map.setZoomAndCenter(zoom, [lng, lat]);
  }
  // 初始化控件
  initTool() {
    this.map.addControl(new AMap.ToolBar());
    this.map.addControl(new AMap.Scale());
  }
  // 事件绑定
  _bindListener(map, name, callback) {
    map.on(name, callback);
  }
  // 解除绑定
  _unBindListener(map, name, callback) {
    map.off(name, callback);
  }
  // 监听地图点击
  onClick(callback) {
    const map = this.map;
    this._bindListener(map, 'click', (e) => {
      const lng = e.lnglat.getLng(); // 经度
      const lat = e.lnglat.getLat(); // 纬度
      this.getAddress(lng, lat, (address, name) => {
        // 获取经纬度,以及地址
        callback(lng, lat, address, name);
      });
    });
  }
  // 监听地图移动
  moveEnd(callback) {
    const map = this.map;
    this._bindListener(map, 'moveend', () => {
      const { lng, lat } = map.getCenter();
      callback(lng, lat);
    });
  }
  // 根据输入关键字提示匹配信息
  autoCompleteSearch(keyword, callback) {
    const auto = new AMap.Autocomplete({});
    auto.search(keyword, callback);
  }
  // 添加搜索后的结果---点标记
  addSearchMarker(lng, lat) {
    const map = this.map;

    // 实例化点标记
    this.searchMarker = new AMap.Marker({
      icon: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png', // 红色点标记
      position: [lng, lat],
      map,
    });
  }
  // 清空点标记
  removeMarker(marker) {
    if (this[marker]) {
      this[marker].setMap(null);
      this[marker] = null;
    }
  }
  // 添加范围--圆形覆盖物
  addRangeCircle(lng, lat, radius = 300) {
    // 实例化圆形覆盖物
    this.rangeCircle = new AMap.Circle({
      center: [lng, lat],
      radius,
    });
  }
  // 清除圆形范围
  removeRangeCircle() {
    if (this.rangeCircle) {
      this.rangeCircle = null;
    }
  }
  // 获取当前位置
  getCurrentPos(callback) {
    const geolocation = new AMap.Geolocation({
      timeout: 100000000, // 超过10秒后停止定位，默认：无穷大
      zoomToAccuracy: true, // 定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
    });
    geolocation.getCurrentPosition(callback);
  }
  // 根据经纬度,获得地址
  getAddress(lng, lat, callback) {
    const geocoder = new AMap.Geocoder({
      city: '全国', // 城市
    });
    // 逆地理编码
    geocoder.getAddress([lng, lat], (status, result) => {
      if (status === 'complete' && result.info === 'OK') {
        // 获得了有效的地址信息: 即，result.regeocode.formattedAddress
        const name = result.regeocode.addressComponent.building;
        const address = result.regeocode.formattedAddress;
        callback(address, name);
      } else {
        callback('', '');
      }
    });
  }
  // 根据地址,查询经纬度
  getLocation(address, callback) {
    const geocoder = new AMap.Geocoder({
      city: '全国', // 城市
    });
    // 地理编码
    geocoder.getLocation(address, (status, result) => {
      if (status === 'complete' && result.info === 'OK') {
        const lng = result.geocodes[0].location.lng;
        const lat = result.geocodes[0].location.lat;
        const formattedAddress = result.geocodes[0].formattedAddress;
        callback(lng, lat, formattedAddress);
      } else {
        // 获取经纬度失败
      }
    });
  }
}
