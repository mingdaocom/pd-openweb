import React from 'react';
import PropTypes from 'prop-types';
import createRoot from 'src/common/theme/createRootWithAntdConfig';
import { getAMapPixel, isFun, toCapitalString } from './utils/common';
import log from './utils/log';
import { MarkerAllProps, MarkerConfigurableProps } from './utils/markerUtils';

class Marker extends React.Component {
  static propTypes = {
    map: PropTypes.object,
    element: HTMLDivElement,
    marker: PropTypes.object,
    contentWrapper: HTMLElement,
  };

  constructor(props) {
    super(props);
    if (typeof window !== 'undefined') {
      if (!props.__map__) {
        log.warning('MAP_INSTANCE_REQUIRED');
      } else {
        this.map = props.__map__;
        this.element = this.map.getContainer();
        this.createMarker(props);
      }
    }
  }

  shouldComponentUpdate(nextProps) {
    if (this.map) {
      this.refreshMarkerLayout(nextProps);
    }

    return false;
  }

  componentDidMount() {
    if (this.map) {
      this.setChildComponent(this.props);
    }
  }

  createMarker(props) {
    const options = this.buildCreateOptions(props);
    this.marker = new window.AMap.Marker(options);
    const events = this.exposeMarkerInstance(props);
    events && this.bindMarkerEvents(events);

    this.marker.render = component => this.renderComponent(component);

    this.setMarkerLayout(props);
  }

  // 在创建实例时根据传入配置，设置初始化选项
  buildCreateOptions(props) {
    let opts = {};
    MarkerAllProps.forEach(key => {
      if (key in props) {
        opts[key] = this.getSetterParam(key, props[key]);
      }
    });
    opts.map = this.map;
    return opts;
  }

  // 初始化标记的外观
  setMarkerLayout(props) {
    if ('render' in props || 'children' in props) {
      this.createContentWrapper();
      if ('className' in props && props.className) {
        // https://github.com/ElemeFE/react-amap/issues/40
        this.contentWrapper.className = props.className;
      }
    }
  }

  createContentWrapper() {
    this.contentWrapper = document.createElement('div');
    this.marker.setContent(this.contentWrapper);
  }

  renderComponent(component) {
    const child = isFun(component) ? component(this.marker.getExtData()) : component;
    this.renderChildren(child);
  }

  renderChildren(children) {
    // 同一标记复用 Root，让卡片更新和移除时能正常执行 effect 清理。
    if (!this.contentRoot) {
      this.contentRoot = createRoot(this.marker.getContent());
    }

    this.contentRoot.render(<div>{children}</div>);
  }

  setChildComponent(props) {
    if (this.contentWrapper) {
      if ('className' in props && props.className) {
        // https://github.com/ElemeFE/react-amap/issues/40
        this.contentWrapper.className = props.className;
      }

      if ('render' in props) {
        this.renderComponent(props.render);
      } else if ('children' in props) {
        const child = props.children;
        const childType = typeof child;

        if (childType !== 'undefined' && this.contentWrapper) {
          this.renderChildren(child);
        } else if (this.contentRoot) {
          this.renderChildren(null);
        }
      } else if (this.contentRoot) {
        this.renderChildren(null);
      }
    }
  }

  refreshMarkerLayout(nextProps) {
    MarkerConfigurableProps.forEach(key => {
      // 必须确定属性改变才进行刷新
      if (this.props[key] !== nextProps[key]) {
        if (key === 'visible') {
          if (nextProps[key]) {
            this.marker.show();
          } else {
            this.marker.hide();
          }
        } else {
          const setterName = this.getSetterName(key);
          const param = this.getSetterParam(key, nextProps[key]);
          this.marker[setterName](param);
        }
      }
    });
    this.setChildComponent(nextProps);
  }

  getSetterParam(key, val) {
    if (MarkerAllProps.indexOf(key) === -1) {
      return null;
    }

    // if (key === 'position') {
    //   return getAMapPosition(val);
    // }
    if (key === 'offset') {
      return getAMapPixel(val);
    }

    return val;
  }

  // 获取设置属性的方法
  getSetterName(key) {
    switch (key) {
      case 'zIndex':
        return 'setzIndex';
      default:
        return `set${toCapitalString(key)}`;
    }
  }

  exposeMarkerInstance(props) {
    if ('events' in props && props.events) {
      const events = props.events;

      if (isFun(events.created)) {
        events.created(this.marker);
      }

      delete events.created;
      return events;
    }

    return false;
  }

  bindMarkerEvents(events) {
    const list = Object.keys(events);
    list.length &&
      list.forEach(evName => {
        this.marker.on(evName, e => {
          events[evName](e, e.target);
        });
      });
  }

  render() {
    return null;
  }

  componentWillUnmount() {
    const root = this.contentRoot;
    this.contentRoot = null;
    // 独立 Root 在父树提交结束后卸载，避免 React 嵌套同步卸载。
    if (root) queueMicrotask(() => root.unmount());
    if (!this.marker) return;
    this.marker.hide();
    this.map.remove(this.marker);
    delete this.marker;
  }
}

export default Marker;
