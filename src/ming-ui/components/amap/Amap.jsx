import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';
import Menu from 'ming-ui/components/Menu';
import MenuItem from 'ming-ui/components/MenuItem';
import Input from 'ming-ui/components/Input';
import Icon from 'ming-ui/components/Icon';
import MapLoader from './MapLoader';
import MapHandler from './MapHandler';
import '../less/Amap.less';

/**
 * 高德地图key = 9aedaf173cec6f03d4b9ce7c8a9159c5;
 */
export default class Amap extends Component {
  static defaultProps = {
    mapTools: false,
    mapOptions: { zoom: 15 },
    onAddressChange: () => {},
    placeholder: '请输入地址',
    inputAlign: 'left',
    autoGeolocation: false,
    mapSearch: true,
  };

  static propTypes = {
    /**
     * 地图配置
     */
    mapOptions: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array])),
    /**
     * 样式
     */
    mapStyle: PropTypes.objectOf(PropTypes.string),
    /**
     * 是否显示工具控件
     */
    mapTools: PropTypes.bool,
    /**
     * 搜索输入框的占位符
     */
    placeholder: PropTypes.string,
    /**
     * 输入框位置，默认位于左侧
     */
    inputAlign: PropTypes.oneOf(['left', 'right']),
    /**
     * 地址发生改变时等回调,接收参数({lng, lat, address）
     */
    onAddressChange: PropTypes.func,
    /**
     * 是否自动定位
     */
    autoGeolocation: PropTypes.bool,
    /**
     * 右上自定义模块
     */
    topRightElement: PropTypes.element,
    /**
     * 地图点击事件
     */
    mapClick: PropTypes.func,
    /**
     * 搜索控件的可见性
     */
    mapSearch: PropTypes.bool,
    onUpdate: PropTypes.func,
  };
  constructor(props) {
    super(props);

    this.state = {
      lng: '', // 经度
      lat: '', // 纬度
      address: '', // 地址
      searchStr: '', // 地址
      autoCompleteVisible: false, // 自动补全菜单是否可见
      autoCompleteResult: [], // 自动补全搜索结果
    };
    this._MapLoader = new MapLoader();
    const { center } = props.mapOptions;
    this._MapLoader.loadJs().then(() => {
      this.initMapObject();
      if (center && center.length && this._maphHandler) {
        this._maphHandler.addSearchMarker(center[0], center[1]);
      }
    });
    this.handleChange = this.handleChange.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleMapClick = this.handleMapClick.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.handleCurrPos = this.handleCurrPos.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { defaultAddress } = nextProps;
    const { lng, lat } = defaultAddress || {};
    if (defaultAddress && lat) {
      this.setPosition(lng, lat);
    }
  }
  componentDidUpdate() {
    if (this.props.onUpdate) {
      this.props.onUpdate();
    }
  }
  componentWillUnmount() {
    if (this._maphHandler) {
      this._maphHandler.destroyMap();
      this._maphHandler = null;
    }
  }
  initMapObject() {
    const { mapTools, mapOptions, autoGeolocation, defaultAddress } = this.props;
    this._maphHandler = new MapHandler(this._mapContainer, mapOptions);
    if (mapTools) {
      this._maphHandler.initTool(); // 初始控件
    }
    if (autoGeolocation) {
      this._maphHandler.getCurrentPos(this.handleCurrPos); // 初始定位
    }
    if (defaultAddress) {
      const { lng, lat } = defaultAddress;
      this.setPosition(lng, lat);
    }
    this._maphHandler.onClick(this.handleMapClick); // 点击地图
  }
  handleChange(value) {
    this._maphHandler.autoCompleteSearch(this.state.searchStr, (status, result) => {
      if (status === 'complete') {
        this.setState({ autoCompleteResult: result.tips, autoCompleteVisible: true });
      }

      if (status === 'no_data') {
        this.setState({ autoCompleteResult: [], autoCompleteVisible: false });
      }
    });
    this.setState({ searchStr: value });
  }
  handleKeydown(e) {
    if (e.keyCode === 13) {
      this.handleSearch();
    }
  }
  // 定位到当前位置，有可能会失败
  handleCurrPos(status, result) {
    if (status === 'complete') {
      const lat = result.position.lat;
      const lng = result.position.lng;
      this.geoLocation(lng, lat, result.formattedAddress);
    } else {
      // 定位失败
    }
  }
  // 定位并添加mark
  geoLocation(lng, lat, address, name) {
    if (this._maphHandler) {
      this._maphHandler.setPosition(lng, lat, 18);
      this._maphHandler.removeMarker('searchMarker');
      this._maphHandler.addSearchMarker(lng, lat);
      this.setState({ lng, lat, address });
      this.props.onAddressChange({ lng, lat, address, name });
    }
  }
  // 定位并添加mark
  setPosition(lng, lat) {
    if (this._maphHandler) {
      this._maphHandler.setPosition(lng, lat, 18);
      this._maphHandler.removeMarker('searchMarker');
      this._maphHandler.addSearchMarker(lng, lat);
    }
  }
  // 回车搜索或点击搜索
  handleSearch() {
    const { searchStr } = this.state;
    if (this._maphHandler) {
      this._maphHandler.getLocation(searchStr, (lng, lat, address) => {
        this.geoLocation(lng, lat, address);
      });
    }
  }
  // 选择下拉菜单
  handleSelect(item) {
    if (item.location && item.location.lng) {
      const lng = item.location.lng;
      const lat = item.location.lat;
      const address = item.address;
      const name = item.name;

      this.geoLocation(lng, lat, address, name);
    }
    this.setState({
      autoCompleteVisible: false,
      searchStr: item.address,
    });
  }
  // 点击地图
  handleMapClick(lng, lat, address) {
    this.geoLocation(lng, lat, address);
    if (this.props.mapClick) {
      this.props.mapClick();
    }
  }
  renderInput() {
    const { autoCompleteResult, autoCompleteVisible } = this.state;
    const { placeholder } = this.props;
    return (
      <div className="Amap-input">
        <span className="Amap-input-search">
          <Icon onClick={this.handleSearch} icon="search" className="Amap-input-search-icon" />
        </span>
        <Input placeholder={placeholder} value={this.state.searchStr} onKeyUp={this.handleKeydown} onChange={this.handleChange} />
        {autoCompleteResult && autoCompleteResult.length && autoCompleteVisible ? (
          <Menu className="Amap-autocomplete-list">
            {autoCompleteResult.map((item, index) => {
              if (item.address && typeof item.address === 'string') {
                return (
                  <MenuItem key={index} onClick={() => this.handleSelect(item)} className="Amap-autocomplete-list-item">
                    {item.address}
                  </MenuItem>
                );
              }
              return null;
            })}
          </Menu>
        ) : null}
      </div>
    );
  }
  render() {
    const { mapStyle, inputAlign, mapSearch } = this.props;
    const newStyle = Object.assign(
      {
        minWidth: 300,
        minHeight: 300,
      },
      mapStyle
    );
    const mapCls = classNames('ming Amap', {
      'Amap-align-right': inputAlign === 'right',
    });
    return (
      <div className={mapCls}>
        {mapSearch ? this.renderInput() : undefined}
        {this.props.topRightElement && <div className="Amap-topRightElement">{this.props.topRightElement}</div>}
        <div style={newStyle} className="AmapContainer" ref={container => (this._mapContainer = container)} />
      </div>
    );
  }
}
