import React, { Fragment, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv } from 'ming-ui';
import accountSettingApi from 'src/api/accountSetting';
import * as actions from 'src/pages/chat/redux/actions';
import common from 'src/utils/domain/account/settings';
import AuthAccess from './AuthAccess';
import Base from './Base';
import Toolbar from './Toolbar';

const Wrap = styled.div`
  .nav {
    width: 180px;
    background-color: var(--color-background-tertiary);
  }
  .content {
    min-width: 0;
  }
  .settingHeader {
    padding: 20px 20px 0;
  }
  .settingContent {
    padding: 0 20px 20px;
    overflow-x: hidden;
    overflow-y: auto;
  }
  .navItem {
    font-size: 14px;
    padding: 10px 20px;
    position: relative;
    &.active {
      color: var(--color-primary);
      font-weight: bold;
      background-color: var(--color-background-card);
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
    background-color: var(--color-border-secondary);
    margin: 0 auto;
  }
  .widthMaxContent {
    width: max-content;
  }
  .hap-radio-group-vertical .hap-radio-wrapper {
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
    name: _l('右侧栏'),
  },
  {
    value: 'auth',
    name: _l('授权与访问'),
  },
];

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

const Setting = props => {
  const { defaultAuthTab, defaultNavType, onClose, setToolbarConfig } = props;
  const [navType, setNavType] = useState(defaultNavType || navs[0].value);
  const [accountSettings, setAccountSettings] = useState({});
  const [loading, setLoading] = useState(true);

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
        <div className="textPrimary bold Font22 pAll20">{_l('设置')}</div>
        {navs.map(nav => (
          <div
            key={nav.value}
            className={cx('navItem pointer', { active: nav.value === navType })}
            onClick={() => setNavType(nav.value)}
          >
            {nav.name}
          </div>
        ))}
      </div>
      <div className="content flexColumn flex minHeight0 overflowHidden">
        <div className="settingHeader flexRow alignItemsCenter justifyContentRight">
          <Icon className="Font22 pointer textSecondary" icon="close" onClick={onClose} />
        </div>
        <div className="settingContent flexColumn flex minHeight0">
          {loading ? (
            <div className="flexRow alignItemsCenter justifyContent flex">
              <LoadDiv />
            </div>
          ) : (
            <Fragment>
              {navType === 'base' && <Base {...props} {...otherProps} />}
              {navType === 'auth' && <AuthAccess defaultAuthTab={defaultAuthTab} />}
              {navType === 'toolbar' && <Toolbar {...props} {...otherProps} />}
            </Fragment>
          )}
        </div>
      </div>
    </Wrap>
  );
};

export default connect(
  () => ({}),
  dispatch => bindActionCreators(_.pick(actions, ['setToolbarConfig']), dispatch),
)(Setting);
