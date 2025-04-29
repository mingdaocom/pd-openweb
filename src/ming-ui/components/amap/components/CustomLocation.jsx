import React, { Component, Fragment } from 'react';
import { Input } from 'antd';
import { Button } from 'ming-ui';
import { browserIsMobile, toFixed } from 'src/util';

const DISPLAY_OPTIONS = [
  { title: _l('纬度'), key: 'lat' },
  { title: _l('经度'), key: 'lng' },
  { title: _l('名称'), key: 'name' },
  { title: _l('详细地址'), key: 'address' },
];

export default class CustomLocation extends Component {
  constructor(props) {
    super(props);

    this.state = {
      customLocation: null,
    };
  }

  formatCurrent() {
    const { currentLocation } = this.props;
    if (currentLocation) {
      return {
        lng: currentLocation.position.lng,
        lat: currentLocation.position.lat,
        address: currentLocation.formattedAddress,
        name: (currentLocation.addressComponent || {}).building,
      };
    }
    return null;
  }

  formatDefault() {
    const { defaultAddress } = this.props;
    if (defaultAddress) {
      return {
        lng: defaultAddress.x,
        lat: defaultAddress.y,
        address: defaultAddress.address,
        name: defaultAddress.title,
      };
    }
    return null;
  }

  componentDidMount() {
    this.setState({
      customLocation: this.props.customLocation || this.formatDefault() || this.formatCurrent() || null,
    });
  }

  componentWillReceiveProps(nextProps) {
    // 经纬度不同才赋值，防止name被冲掉
    if (
      nextProps.customLocation &&
      (!this.state.customLocation ||
        (this.state.customLocation &&
          toFixed(nextProps.customLocation.lat, 6) !== toFixed(this.state.customLocation.lat, 6) &&
          toFixed(nextProps.customLocation.lng, 6) !== toFixed(this.state.customLocation.lng, 6)))
    ) {
      this.setState({ customLocation: nextProps.customLocation });
    }
  }

  render() {
    const { allowCustom, setPosition = () => {} } = this.props;
    const customLocation = this.state.customLocation || {};
    const { lng = '', lat = '' } = customLocation;
    const filterOptions = allowCustom
      ? DISPLAY_OPTIONS
      : DISPLAY_OPTIONS.filter(i => _.includes(['lat', 'lng'], i.key)).map(i => ({ ...i, disabled: true }));
    const isMobile = browserIsMobile();

    return (
      <Fragment>
        <div className="MDMapCustom">
          <div className="Font17 bold">{_l('添加当前位置')}</div>
          {filterOptions.map(item => {
            const isLatLng = _.includes(['lat', 'lng'], item.key);
            return (
              <Fragment>
                <div className="mBottom4 mTop16 bold Gray_75">{item.title}</div>
                <Input
                  disabled={item.disabled}
                  value={
                    isLatLng && customLocation[item.key]
                      ? toFixed(customLocation[item.key], 6)
                      : customLocation[item.key] || ''
                  }
                  onChange={e =>
                    this.setState({
                      customLocation: {
                        ...customLocation,
                        [item.key]: e.target.value,
                      },
                    })
                  }
                  onBlur={() => {
                    if (isLatLng && lat && lng) {
                      setPosition(lng, lat);
                    }
                  }}
                />
              </Fragment>
            );
          })}
          {!isMobile && (
            <Button
              fullWidth={true}
              disabled={!(lng && lat)}
              onClick={() => {
                this.props.onAddressChange(customLocation);
              }}
            >
              {_l('确定')}
            </Button>
          )}
        </div>
        {isMobile && (
          <Button
            className="mTop7 mLeft15 mRight15"
            style={{ width: 'unset!important' }}
            radius
            fullWidth={true}
            disabled={!(lng && lat)}
            onClick={() => {
              this.props.onAddressChange(customLocation);
            }}
          >
            {_l('确定')}
          </Button>
        )}
      </Fragment>
    );
  }
}
