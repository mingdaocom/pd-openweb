import React, { Fragment, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv } from 'ming-ui';
import accountSettingApi from 'src/api/accountSetting';
import * as actions from 'src/pages/chat/redux/actions';
import common from 'src/pages/Personal/common';
import Base from './Base';
import Toolbar from './Toolbar';

const Wrap = styled.div`
  .nav {
    width: 180px;
    background-color: #fafafa;
  }
  .content {
    min-width: 0;
  }
  .navItem {
    font-size: 14px;
    padding: 10px 20px;
    position: relative;
    &.active {
      color: #1677ff;
      font-weight: bold;
      background-color: #fff;
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        height: 16px;
        width: 3px;
        border-radius: 3px;
        transform: translateY(-50%);
        background: currentColor;
      }
    }
  }
  .divider {
    width: 100%;
    height: 1px;
    background-color: #eaeaea;
    margin: 0 auto;
  }
  .widthMaxContent {
    width: max-content;
  }
  .RadioGroup--vertical .Radio {
    margin-bottom: 10px;
  }
`;

const navs = [
  {
    value: 'base',
    name: _l('基础'),
  },
  {
    value: 'toolbar',
    name: _l('工具栏'),
  },
];

const Setting = props => {
  const { defaultNavType, onClose, setToolbarConfig } = props;
  const [navType, setNavType] = useState(defaultNavType || navs[0].value);
  const [accountSettings, setAccountSettings] = useState({});
  const [loading, setLoading] = useState(true);

  const handleSureSettings = (settingNum, value, successCallback) => {
    accountSettingApi
      .editAccountSetting({
        settingType: common.settingOptions[settingNum],
        settingValue: value,
      })
      .then(data => {
        if (data) {
          alert(_l('设置成功'));
          if (_.isFunction(successCallback)) {
            successCallback();
          }
        } else {
          alert(_l('操作失败'), 2);
        }
      })
      .catch();
  };

  const handleChangeAccountSettings = param => {
    setAccountSettings(values => ({ ...values, ...param }));
    setToolbarConfig(param);
  };

  useEffect(() => {
    accountSettingApi.getAccountSettings({}).then(data => {
      const settings = _.pick(data, [
        'joinFriendMode',
        'isPrivateMobile',
        'isPrivateEmail',
        'isOpenMessageSound',
        'isOpenMessageTwinkle',
        'isOpenMingoAI',
        'isOpenMessage',
        'isOpenSearch',
        'isOpenFavorite',
        'isShowToolName',
        'isOpenMessageList',
        'isOpenCommonApp',
        'commonAppShowType',
        'commonAppOpenType',
        'messageListShowType',
      ]);
      setAccountSettings({
        ...settings,
        backHomepageWay: data.backHomepageWay || 1,
      });
      setLoading(false);
    });
  }, []);

  const otherProps = {
    accountSettings,
    handleChangeAccountSettings,
    handleSureSettings,
  };

  return (
    <Wrap className="flexRow w100 h100">
      <div className="nav">
        <div className="Gray bold Font22 pAll20">{_l('设置')}</div>
        {navs.map(nav => (
          <div
            className={cx('navItem pointer', { active: nav.value === navType })}
            onClick={() => setNavType(nav.value)}
          >
            {nav.name}
          </div>
        ))}
      </div>
      <div className="content flexColumn flex pAll20">
        <div className="flexRow alignItemsCenter justifyContentRight">
          <Icon className="Font22 pointer Gray_75" icon="close" onClick={onClose} />
        </div>
        {loading ? (
          <div className="flexRow alignItemsCenter justifyContent flex">
            <LoadDiv />
          </div>
        ) : (
          <Fragment>
            {navType === 'base' && <Base {...props} {...otherProps} />}
            {navType === 'toolbar' && <Toolbar {...props} {...otherProps} />}
          </Fragment>
        )}
      </div>
    </Wrap>
  );
};

export default connect(
  () => ({}),
  dispatch => bindActionCreators(_.pick(actions, ['setToolbarConfig']), dispatch),
)(Setting);
