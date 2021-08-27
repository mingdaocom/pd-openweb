import React, { Component } from 'react';
import { string, shape, array } from 'prop-types';
import cx from 'classnames';
import placeholderPic from 'src/common/mdcss/images/thirdAppPlaceholder.png';
import { Icon } from 'ming-ui';

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
      <span data-tip={isTop ? _l('取消置顶') : _l('置顶')}>
        <Icon
          icon="set_top"
          onClick={e => {
            e.stopPropagation();
            onSetTopClick(!isTop, { appId, projectId });
          }}
          className={cx({ active: isTop })}
        />
      </span>
      {/*
      <span data-tip={_l('设置')}>
        <Icon
          icon="settings"
          onClick={e => {
            e.stopPropagation();
            window.open(settingUrl);
          }}
        />
      </span>
      */}
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
