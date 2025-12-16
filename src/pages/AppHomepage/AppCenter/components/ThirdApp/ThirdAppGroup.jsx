import React, { Component } from 'react';
import cx from 'classnames';
import { array, shape, string } from 'prop-types';
import { Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import placeholderPic from '../../assets/thirdAppPlaceholder.png';

const TYPE_TO_TITLE = {
  account: _l('个人应用'),
  top: _l('置顶应用'),
};

const ThirdAppItem = ({ onSetTopClick, appId, projectId, appName, avatar, isTop, settingUrl, oauthUrl }) => (
  <div className="thirdAppItem" onClick={() => window.open(oauthUrl)}>
    <div className="logo">
      <img src={avatar || placeholderPic} alt={appName} />
    </div>
    <div className="name">{appName}</div>
    <div className="operatorIconWrap">
      <Tooltip title={isTop ? _l('取消置顶') : _l('置顶')}>
        <span>
          <Icon
            icon="set_top"
            onClick={e => {
              e.stopPropagation();
              onSetTopClick(!isTop, { appId, projectId });
            }}
            className={cx({ active: isTop })}
          />
        </span>
      </Tooltip>
      <Tooltip title={_l('设置')}>
        <span>
          <Icon
            icon="settings"
            onClick={e => {
              e.stopPropagation();
              window.open(settingUrl);
            }}
          />
        </span>
      </Tooltip>
    </div>
  </div>
);
export default class ThirdAppGroup extends Component {
  static propTypes = {
    data: shape({
      apps: array,
      companyName: string,
      type: string,
    }),
  };
  render() {
    const {
      data: { apps = [], companyName, type = '' },
      ...rest
    } = this.props;

    return (
      <div className="thirdAppGroupWrap">
        <div className="title">{companyName || TYPE_TO_TITLE[type]}</div>
        <div className="thirdAppItemWrap">
          {apps.map((item, index) => (
            <ThirdAppItem key={`${item.appId}-${index}`} {...rest} {...item} />
          ))}
        </div>
      </div>
    );
  }
}
