import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Icon from 'ming-ui/components/Icon';

export default class CalendarAddress extends Component {
  static propTypes = {
    change: PropTypes.func.isRequired, // callback
    address: PropTypes.string,
  };

  constructor(props) {
    super(props);
  }

  changeAddress(event) {
    const value = event.target.value;
    this.props.change({
      address: value,
    });
  }

  render() {
    const { address, editable, canLook } = this.props;
    return (
      <div className="calendarAddress calRow">
        <Icon icon={'location'} className="Font20 calIcon" />
        <div className="calLine">
          <div className="addressContainer">
            <input
              type="text"
              readOnly={!editable}
              className="addressBox"
              value={address}
              onChange={this.changeAddress.bind(this)}
              placeholder={editable ? _l('添加会议地点') : _l('未填写会议地点')}
            />
            {address && canLook ? (
              <a href={`http://api.map.baidu.com/geocoder?address=${address}&output=html&referer=`} target="_blank" className="pLeft15 pRight15">
                {_l('地图')}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}
