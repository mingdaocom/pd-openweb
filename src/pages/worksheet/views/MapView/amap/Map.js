import React from 'react';
import MapLoader from 'ming-ui/components/amap/MapLoader';
import log from './utils/log';
import { getAMapPosition, isFun, toCapitalString } from './utils/common';
import PropTypes from 'prop-types';

const Component = React.Component;
const Children = React.Children;
const containerStyle = {
  width: '100%',
  height: '100%',
};
const wrapperStyle = {
  width: '100%',
  height: '100%',
  position: 'relative',
};

// Native supported dynamic props by Amap
const NativeDynamicProps = [
  'layers',
  'zoom',
  'center',
  'labelzIndex',

  // 'lang', native error in JSSDK when 3D viewMode
  'mapStyle',
  'features',
  'cursor',
  'pitch',
];

const ExtendedDynamicProps = ['city', 'bounds', 'limitBounds', 'status', 'rotation'];

/*
 * Props below can set by 'setStatus' altogether
 */
const StatusDynamicProps = [
  'animateEnable',
  'doubleClickZoom',
  'dragEnable',
  'isHotspot',
  'jogEnable',
  'keyboardEnable',
  'resizeEnable',
  'rotateEnable',
  'scrollWheel',
  'touchZoom',
  'zoomEnable',
];

const StaticProps = [
  'view',
  'zooms',
  'showIndoorMap',
  'indoorMap',
  'expandZoomRange',
  'showBuildingBlock',
  'viewMode',
  'pitchEnable',
  'buildingAnimation',
  'skyColor',
];

const CreateProps = NativeDynamicProps.concat(StatusDynamicProps, StaticProps);

const defaultOpts = {
  MapType: {
    showRoad: false,
    showTraffic: false,
    defaultType: 0,
  },
  ToolBar: {
    position: 'RB',
    noIpLocate: true,
    locate: true,
    liteStyle: true,
    autoPosition: false,
  },
  HawkEye: {},
  ControlBar: {},
};

class Map extends Component {
  static propTypes = {
    pluginMap: PropTypes.object,
    loader: PropTypes.object,
    map: PropTypes.object,
    mapWrapper: HTMLDivElement,
  };

  constructor(props) {
    super(props);
    this.state = {
      mapLoaded: false,
    };
    if (typeof window !== 'undefined') {
      this.pluginMap = {};
      this.loader = new MapLoader().loadJs();
    }
  }

  componentWillReceiveProps(nextProps) {
    const prevProps = this.props;
    this.loader.then(() => {
      if (this.map) {
        this.updateMapProps(prevProps, nextProps);
      }
    });
  }

  componentDidMount() {
    this.loadMap();
  }

  componentDidUpdate() {
    this.loadMap();
  }

  loadMap() {
    this.loader.then(() => {
      this.initMapInstance();
      if (!this.state.mapLoaded) {
        this.setState({
          mapLoaded: true,
        });
      }
    });
  }

  renderChildren() {
    return Children.map(this.props.children, child => {
      if (child) {
        const cType = child.type;
        /* 针对下面两种组件不注入地图相关属性
         * 1. 明确声明不需要注入的
         * 2. DOM 元素
         */
        if (cType.preventAmap || typeof cType === 'string') {
          return child;
        }
        return React.cloneElement(child, {
          __map__: this.map,
          // consider to remove __ele__, because map.getContainer can also get this
          __ele__: this.mapWrapper,
        });
      }
      return child;
    });
  }

  initMapInstance() {
    if (!this.map) {
      const options = this.buildCreateOptions();
      this.map = new window.AMap.Map(this.mapWrapper, options);
      // event binding
      const events = this.exposeMapInstance();
      events && this.bindAMapEvents(events);
      // install map plugins
      this.setPlugins(this.props);
      // binding extended props
      ExtendedDynamicProps.forEach(key => {
        if (key in this.props) {
          const setterParam = this.getSetterValue(key, this.props);
          this.runMapSetter(key, setterParam);
        }
      });
    }
  }

  buildCreateOptions() {
    const props = this.props;
    const options = {};
    CreateProps.forEach(key => {
      if (key in props) {
        options[key] = this.getSetterValue(key, props);
      }
    });
    return options;
  }

  bindAMapEvents(events) {
    const list = Object.keys(events);
    list.length &&
      list.forEach(evName => {
        this.map.on(evName, events[evName]);
      });
  }

  updateMapProps(prevProps, nextProps) {
    const nextMapStatus = {};
    let statusChangeFlag = false;
    let statusPropExist = false;
    StatusDynamicProps.forEach(key => {
      if (key in nextProps) {
        statusPropExist = true;
        if (this.detectPropChanged(key, prevProps, nextProps)) {
          statusChangeFlag = true;
          nextMapStatus[key] = nextProps[key];
        }
      }
    });
    statusChangeFlag && this.map.setStatus(nextMapStatus);
    if (statusPropExist && 'status' in nextProps) {
      log.warning(
        `以下这些属性可以单独提供进行配置，也可以统一作为‘status’属性配置；但是请不要同时使用这两种方式。\n（${StatusDynamicProps.join(
          ', ',
        )}）`,
      );
    }
    NativeDynamicProps.concat(ExtendedDynamicProps).forEach(key => {
      if (key in nextProps) {
        if (this.detectPropChanged(key, prevProps, nextProps)) {
          const setterParam = this.getSetterValue(key, nextProps);
          this.runMapSetter(key, setterParam);
        }
      }
    });
    StaticProps.forEach(key => {
      if (key in nextProps) {
        if (this.detectPropChanged(key, prevProps, nextProps)) {
          log.warning(`'${key}' 是一个静态属性，地图实例创建成功后无法修改`);
        }
      }
    });
    this.setPlugins(nextProps);
  }

  runMapSetter(key, setterParam) {
    if (key === 'limitBounds' && !setterParam) {
      this.map.clearLimitBounds();
    } else {
      const setterName = this.getSetterName(key);
      this.map[setterName](setterParam);
    }
  }

  getSetterValue(key, props) {
    if (key === 'center') {
      return getAMapPosition(props.center);
    }
    return props[key];
  }

  getSetterName(key) {
    switch (key) {
      case 'labelzIndex':
        return 'setlabelzIndex';
      case 'cursor':
        return 'setDefaultCursor';
      default:
        return `set${toCapitalString(key)}`;
    }
  }

  detectPropChanged(key, prevProps, nextProps) {
    return prevProps[key] !== nextProps[key];
  }

  setPlugins(props) {
    const pluginList = ['Scale', 'ToolBar', 'MapType', 'HawkEye', 'ControlBar'];
    if ('plugins' in props) {
      const plugins = props.plugins;
      if (plugins && plugins.length) {
        plugins.forEach(p => {
          let name, config, visible;
          if (typeof p === 'string') {
            name = p;
            config = null;
            visible = true;
          } else {
            name = p.name;
            config = p.options || {};
            visible = 'visible' in config && typeof config.visible === 'boolean' ? config.visible : true;
            delete config.visible;
          }
          const idx = pluginList.indexOf(name);
          if (idx === -1) {
            log.warning(`没有 ‘${name}’ 这个插件，请检查是否拼写错误`);
          } else {
            if (visible) {
              pluginList.splice(idx, 1);
              this.installPlugin(name, config);
            }
          }
        });
      }
    }
    this.removeOrDisablePlugins(pluginList);
  }

  removeOrDisablePlugins(plugins) {
    if (plugins && plugins.length) {
      plugins.forEach(p => {
        if (p in this.pluginMap) {
          // ControlBar has no 'hide' method
          if (p === 'ControlBar') {
            this.map.removeControl(this.pluginMap[p]);
            delete this.pluginMap[p];
          } else {
            this.pluginMap[p].hide();
          }
        }
      });
    }
  }

  installPlugin(name, opts) {
    opts = opts || {};
    switch (name) {
      case 'Scale':
      case 'ToolBar':
      case 'HawkEye':
      case 'MapType':
        this.setMapPlugin(name, opts);
        break;
      case 'ControlBar':
        this.setControlBar(opts);
        break;
      default:
      // do nothing
    }
  }

  setMapPlugin(name, opts) {
    if (this.pluginMap[name]) {
      this.pluginMap[name].show();
    } else {
      const { onCreated, ...restOpts } = opts;
      const initOpts = { ...defaultOpts[name], ...restOpts };
      this.map.plugin([`AMap.${name}`], () => {
        this.pluginMap[name] = new window.AMap[name](initOpts);
        this.map.addControl(this.pluginMap[name]);
        if (isFun(onCreated)) {
          onCreated(this.pluginMap[name]);
        }
      });
    }
  }

  setControlBar(opts) {
    if (this.pluginMap.ControlBar) {
      // do nothing
    } else {
      const { onCreated, ...restOpts } = opts;
      const initOpts = { ...defaultOpts.ControlBar, ...restOpts };
      this.map.plugin(['AMap.ControlBar'], () => {
        this.pluginMap.ControlBar = new window.AMap.ControlBar(initOpts);
        this.map.addControl(this.pluginMap.ControlBar);
        if (isFun(onCreated)) {
          onCreated(this.pluginMap.ControlBar);
        }
      });
    }
  }

  // 用户可以通过 created 事件获取 map 实例
  exposeMapInstance() {
    if ('events' in this.props) {
      const events = this.props.events || {};
      if (isFun(events.created)) {
        events.created(this.map);
        delete events.created;
      }
      return events;
    }
    return false;
  }

  destroyMap() {
    this.map && this.map.destroy && this.map.destroy();
    this.map = null;
    document.getElementById('mapWrap') && document.getElementById('mapWrap').remove();
  }

  render() {
    return (
      <div id="mapWrap" style={wrapperStyle}>
        <div
          ref={div => {
            this.mapWrapper = div;
          }}
          style={containerStyle}
        >
          {this.state.mapLoaded ? null : this.props.loading || null}
        </div>
        <div>{this.state.mapLoaded ? this.renderChildren() : null}</div>
      </div>
    );
  }

  componentWillUnmount() {
    this.destroyMap();
  }
}

export default Map;
