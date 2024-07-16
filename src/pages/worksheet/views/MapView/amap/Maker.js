import React from 'react';
import { createRoot } from 'react-dom/client';
import log from './utils/log';
import { MarkerConfigurableProps, MarkerAllProps, renderMarkerComponent } from './utils/markerUtils';
import { getAMapPosition, getAMapPixel, isFun, toCapitalString } from './utils/common';
import PropTypes from 'prop-types';

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

  shouldComponentUpdate() {
    return false;
  }

  componentWillReceiveProps(nextProps) {
    if (this.map) {
      this.refreshMarkerLayout(nextProps);
    }
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

    this.marker.render = (function (marker) {
      return function (component) {
        renderMarkerComponent(component, marker);
      };
    })(this.marker);

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

  setChildComponent(props) {
    if (this.contentWrapper) {
      if ('className' in props && props.className) {
        // https://github.com/ElemeFE/react-amap/issues/40
        this.contentWrapper.className = props.className;
      }
      if ('render' in props) {
        renderMarkerComponent(props.render, this.marker);
      } else if ('children' in props) {
        const child = props.children;
        const childType = typeof child;
        if (childType !== 'undefined' && this.contentWrapper) {
          const root = createRoot(this.contentWrapper);

          root.render(<div>{child}</div>);
        }
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
    this.marker.hide();
    this.map.remove(this.marker);
    delete this.marker;
  }
}

export default Marker;
