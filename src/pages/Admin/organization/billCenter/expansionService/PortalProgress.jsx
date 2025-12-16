import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import moment from 'moment';
import { Radio } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import Config from '../../../config';
import './style.less';

const getOptions = effectiveExternalUserCount => {
  return [
    {
      text: (
        <Fragment>
          <span className="Bold Font14 mRight6">{_l('续费')}</span>
          <span className="Gray_9e">{_l('当前使用：%0人', effectiveExternalUserCount)}</span>
        </Fragment>
      ),
      value: 'portalupgrade',
    },
    {
      text: <span className="Bold Font14">{_l('增补')}</span>,
      value: 'portaluser',
    },
  ];
};
const marks = [
  {
    value: 100,
    label: (
      <Fragment>
        <div className="Gray Font13">{_l('100人')}</div>
        <div className="Gray_75 Font12">{_l('5元/人年')}</div>
      </Fragment>
    ),
  },
  {
    value: 1000,
    label: (
      <Fragment>
        <div className="Gray Font13 ">{_l('1000人')}</div>
        <div className="Gray_75 Font12">{_l('1元/人年')}</div>
      </Fragment>
    ),
  },
  {
    value: 10000,
    label: (
      <Fragment>
        <div className="Gray Font13">{_l('10000人')}</div>
        <div className="Gray_75 Font12">{_l('0.5元/人年')}</div>
      </Fragment>
    ),
  },
  {
    value: 100000,
    label: <div className="Gray Font13">{_l('10万人')}</div>,
  },
];

// 获取基础信息
const getBaseInfo = moveX => {
  if (moveX <= 135) {
    return { itemWidth: 15, stepCount: 100, baseLeft: 0 };
  } else if (moveX > 135 && moveX <= 315) {
    return { itemWidth: 20, stepCount: 1000, baseLeft: 135 };
  } else if (moveX > 315) {
    return { itemWidth: 40, stepCount: 10000, baseLeft: 315 };
  }
};

// 根据基础信息计算用户人数，离左侧距离
const formatValue = moveX => {
  if (moveX < 0 || moveX > 675) return;
  const { itemWidth, stepCount, baseLeft } = getBaseInfo(moveX);
  const value = moveX < 15 ? 1 : Math.round((moveX - baseLeft) / itemWidth) + 1;
  return { userCount: value * stepCount, left: (value - 1) * itemWidth + baseLeft };
};

// 根据使用人数计算距离
const getMinX = formatCount => {
  let minX = 0;
  if (formatCount > 0 && formatCount <= 1000) {
    minX = (formatCount / 100 - 1) * 15;
  } else if (formatCount > 1000 && formatCount <= 10000) {
    minX = 135 + ((formatCount - 1000) / 1000) * 20;
  } else if (formatCount > 10000) {
    minX = 315 + ((formatCount - 10000) / 10000) * 40;
  }
  return minX;
};

export default class PortalProgress extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userCount: 100,
      status: false,
      initX: 0,
      moveX: 0,
      minX: 0,
    };
  }

  componentWillUnmount() {
    document.body.removeEventListener('mousemove', this.onMouseMove);
    document.body.removeEventListener('mouseup', this.onMouseUp);
  }

  componentDidMount() {
    const minX = this.props.payType === 'portalupgrade' ? getMinX(this.props.addUserCount) : 0;
    this.setState({
      userCount: this.props.addUserCount,
      moveX: minX,
      minX: minX,
    });
  }

  onMouseDown = e => {
    this.setState({
      status: true,
      initX: e.clientX - e.target.offsetLeft,
    });

    document.body.addEventListener('mousemove', this.onMouseMove);
    document.body.addEventListener('mouseup', this.onMouseUp);
  };

  onMouseMove = e => {
    const { status, initX, minX } = this.state;
    if (status) {
      const moveX = e.clientX - initX;

      if (moveX < 0 || moveX > 675 || (this.props.payType === 'portalupgrade' && moveX < minX)) return;
      const { userCount, left } = formatValue(moveX);
      this.setState({
        moveX: left,
        userCount,
      });
    }
  };

  onMouseUp = () => {
    this.setState({ status: false }, () => {
      if (this.state.userCount !== this.props.addUserCount) {
        this.props.handleChange('addUserCount', this.state.userCount);
      }
    });
    document.body.removeEventListener('mousemove', this.onMouseMove);
    document.body.removeEventListener('mouseup', this.onMouseUp);
  };

  handleClick = event => {
    event.stopPropagation();
    const $div = document.getElementById('portal-ant-slider-step');
    const tempMoveX = event.clientX - $div.getBoundingClientRect().left;
    if (this.props.payType === 'portalupgrade' && tempMoveX < this.state.minX) return;
    const { userCount, left } = formatValue(tempMoveX) || {};
    this.setState(
      {
        moveX: left,
        userCount,
      },
      () => {
        this.props.handleChange('addUserCount', this.state.userCount);
      },
    );
  };

  render() {
    const { payType, effectiveExternalUserCount, licenseInfo = {}, handleChange } = this.props;
    const { userCount, moveX } = this.state;
    const DISPLAY_OPTIONS = getOptions(effectiveExternalUserCount);
    const expandType = Config.params[3];
    return (
      <Fragment>
        <div className="portalProgressContainer">
          {expandType === 'portalupgrade' && (
            <div className="flexRow payType">
              {_l('购买方式')}
              {DISPLAY_OPTIONS.map(item => {
                return (
                  <Radio
                    className="mLeft32"
                    text={item.text}
                    checked={payType === item.value}
                    onClick={() => handleChange('payType', item.value)}
                  />
                );
              })}
            </div>
          )}
          <div className="portal-ant-slider" onMouseUp={this.onMouseUp}>
            <div className="portal-ant-slider-bg" style={{ width: `${moveX}px` }}></div>
            <div className="portal-ant-slider-step" id="portal-ant-slider-step" onClick={this.handleClick}>
              {marks.map(item => (
                <span className={cx('portal-ant-slider-dot', { active: userCount >= item.value })}></span>
              ))}
            </div>
            <Tooltip title={_l('%0人', userCount)} placement="top">
              <div
                className="portal-ant-slider-handle "
                style={{ left: `${moveX}px` }}
                onMouseDown={this.onMouseDown}
              />
            </Tooltip>
            <div className="portal-ant-slider-mark">
              {marks.map(item => {
                return (
                  <span className={cx('portal-ant-slider-mark-text', { InlineBlock: item.value <= userCount })}>
                    {item.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
        <div className="mBottom16">
          <span className="Gray_9e mRight18">{_l('购买人数：')}</span>
          <span>{_l('%0人', userCount)}</span>
        </div>
        <div className="mBottom16">
          <span className="Gray_9e mRight18">{_l('到期时间：')}</span>
          <span>{moment(licenseInfo.endDate).format('YYYY年MM月DD日')}</span>
          <span className="Gray_9e">{_l('（计费：%0天）', licenseInfo.expireDays)}</span>
        </div>
      </Fragment>
    );
  }
}
