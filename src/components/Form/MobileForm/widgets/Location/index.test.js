const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, 'index.jsx'), 'utf8');

assert.ok(source.includes("import Amap from 'ming-ui/components/amap/Amap'"), '高德静态图失败时应保留 Amap 回退');
assert.ok(!source.includes('ming-ui/components/amap/MapHandler'), 'H5 定位字段应复用表单级定位实例');
assert.ok(!source.includes('ming-ui/components/amap/MapLoader'), 'H5 定位字段应复用表单级地图加载器');
assert.ok(
  source.includes("import { Gmap } from 'ming-ui/components/amap/components/GoogleMap'"),
  'Google 地图应保持原展示逻辑',
);
assert.ok(
  source.includes("import { getCurrentPos } from '../../../core/mapUtils'"),
  'H5 主动定位应继续使用表单共享定位方法',
);
assert.ok(source.includes('wgs84togcj02'), '高德地图展示应保留原 WGS84 坐标转换');
assert.ok(source.includes('wgs84togcj02(location.x, location.y)'), 'WGS84 坐标应继续在定位控件中转换');
assert.ok(source.includes("import StaticMap from './StaticMap'"), 'H5 定位字段应使用本地 StaticMap 展示地图');
assert.ok(source.includes('<StaticMap'), '开启显示地图时应渲染 StaticMap');
assert.ok(source.includes('onError={this.handleStaticMapError}'), '高德静态图失败时应通知定位字段切换旧地图');
assert.ok(source.includes('staticMapFallbackValue: this.props.value'), '静态图失败状态应绑定当前定位值');
assert.ok(source.includes('const shouldRenderAmap = staticMapFallbackValue === value'), '新定位值应重新尝试静态图');
assert.ok(source.includes(') : shouldRenderAmap ? ('), '高德静态图失败时应进入旧地图渲染');
assert.ok(source.includes('this.renderAmapPreview(locationForShow)'), '高德静态图失败时应调用旧地图渲染');
assert.ok(!source.includes('fallback={() => ('), 'StaticMap 不应承担旧地图回退渲染');
assert.ok(source.includes('<Amap'), '高德静态图失败时应渲染 Amap');
assert.ok(source.includes('<Gmap'), 'Google 地图配置下应继续渲染 Gmap');
assert.ok(source.includes('lat={locationForShow.y}'), 'Google 地图应继续使用原 locationForShow 坐标');
assert.ok(source.includes('lng={locationForShow.x}'), 'Google 地图应继续使用原 locationForShow 坐标');
assert.ok(source.includes('<MDMap'), 'H5 定位字段应保留 MDMap 选点弹层');

console.log('Mobile location rendering tests passed');
