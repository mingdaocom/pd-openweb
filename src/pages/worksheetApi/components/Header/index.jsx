import React, { memo, useState } from 'react';
import DocumentTitle from 'react-document-title';
import { generate } from '@ant-design/colors';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, SvgIcon } from 'ming-ui';
import Share from 'worksheet/components/Share';
import { navigateTo } from 'src/router/navigateTo';
import { TAB_TYPE } from '../../core/enum';
import Beta from '../Beta';

const HeaderWrap = styled.header`
  position: relative;
  display: flex;
  justify-content: ${props => (props.isAuthorization ? 'flex-start' : 'space-between')};
  padding: 0 30px;
  font-size: 17px;
  height: 50px;
  background: #fff;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  z-index: 1;
  line-height: 50px;

  .shareButtonBox {
    display: flex;
    justify-content: flex-end;
  }
  .shareButton {
    height: 36px;
    padding: 0 15px;
    border: 1px solid #e0e0e0;
    border-radius: 20px;
    &:hover {
      border-color: var(--color-primary);
      text-decoration: none;
      i,
      span {
        color: var(--color-primary);
      }
    }
  }

  .appIconWrapIcon {
    display: inline-block;
    border-radius: 4px;
    color: #fff;
    margin-right: 10px;
    width: 30px;
    height: 30px;
    line-height: 30px;
    text-align: center;
  }

  .appName {
    display: inline;
  }

  .worksheetApiTabsBox {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    justify-content: center;
    gap: 50px;
    height: 50px;
    .worksheetApiTab {
      display: flex;
      align-items: center;
      padding: 0 14px;
      font-size: 15px;
      color: #151515;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease-out;
      border-bottom: 3px solid transparent;
      &:hover,
      &.active {
        color: var(--color-primary);
        border-color: var(--color-primary);
      }
    }
  }
`;

const TABS_OPTS = [
  { tabIndex: TAB_TYPE.APPLICATION, name: _l('应用授权') },
  { tabIndex: TAB_TYPE.API_V3, name: _l('API V3') },
  { tabIndex: TAB_TYPE.API_V2, name: _l('API V2') },
];

const getIconColor = ({ iconColor, navColor }) => {
  const lightColor = generate(iconColor)[0];
  const light = [lightColor, '#ffffff', '#f5f6f7'].includes(navColor);
  const black = '#1b2025' === navColor;
  const backgroundColor = light ? lightColor : navColor || iconColor;
  const fillColor = black || light ? iconColor : '#fff';
  return { backgroundColor, fillColor };
};

const CommonHeader = props => {
  const { data, dataApp, appId, isSharePage, appInfo, tabIndex, updateTabIndex } = props;
  const { backgroundColor, fillColor } = getIconColor(dataApp);
  const [shareVisible, setShareVisible] = useState(false);

  return (
    <HeaderWrap className="flexRow">
      <div className="appInfoBox">
        {data && (
          <React.Fragment>
            <span
              className="appIconWrapIcon"
              style={{ backgroundColor }}
              onClick={() => {
                navigateTo(`/app/${appId}`);
              }}
            >
              <SvgIcon url={dataApp.iconUrl} fill={fillColor} size={24} addClassName="mTop3" />
            </span>
            <span
              className="appName Hand bold mRight5"
              onClick={() => {
                navigateTo(`/app/${appId}`);
              }}
            >
              {dataApp.name}
            </span>
          </React.Fragment>
        )}
        {_l('API说明')}
      </div>
      <div className="worksheetApiTabsBox flex">
        {!isSharePage &&
          TABS_OPTS.map((item, i) => (
            <div
              key={i}
              className={cx('worksheetApiTab', {
                active: tabIndex === item.tabIndex,
              })}
              onClick={() => updateTabIndex(item.tabIndex)}
            >
              {item.name}
              {item.tabIndex === TAB_TYPE.API_V3 && <Beta />}
            </div>
          ))}
      </div>
      <div className="shareButtonBox">
        {!md.global.Config.IsLocal && (
          <a
            className="shareButton Hand Gray_75 flexRow valignWrapper"
            target="_blank"
            href="https://apifox.mingdao.com/"
          >
            <Icon icon="play_arrow" className="mRight8 Font18" />
            <span className="Font14">{_l('调试')}</span>
          </a>
        )}
        {!isSharePage && tabIndex !== TAB_TYPE.API_V3 && (
          <div className="shareButton Hand Gray_75 flexRow valignWrapper mLeft16" onClick={() => setShareVisible(true)}>
            <Icon icon="share" className="mRight8 Font18" />
            <span className="Font14">{_l('分享')}</span>
          </div>
        )}
      </div>
      {shareVisible && (
        <Share
          title={_l('分享文档')}
          from="worksheetApi"
          isCharge={true}
          params={{
            appId,
            sourceId: _.get(appInfo, 'apiRequest.appKey') || this.getId(),
            title: _l('API说明'),
          }}
          onClose={() => setShareVisible(false)}
        />
      )}
    </HeaderWrap>
  );
};

const AuthorizationHeader = props => {
  const { share } = props;
  const { appIconColor, appNavColor } = share.data;
  const { backgroundColor, fillColor } = getIconColor({ iconColor: appIconColor, navColor: appNavColor });
  return (
    <HeaderWrap isAuthorization={true}>
      {share.data && (
        <React.Fragment>
          <span className="appIconWrapIcon" style={{ backgroundColor }}>
            <SvgIcon url={share.data.appIcon} fill={fillColor} size={24} addClassName="mTop3" />
          </span>
          <span className="appName Hand bold mRight5">{share.data.appName}</span>
          {share.data.appName && <DocumentTitle title={`${share.data.appName}-${_l('API说明')}`} />}
        </React.Fragment>
      )}
      {_l('API说明')}
    </HeaderWrap>
  );
};

const Header = props => {
  const { isAuthorization = false, ...rest } = props;
  const Component = isAuthorization ? AuthorizationHeader : CommonHeader;

  return <Component {...rest} />;
};

export default memo(Header);
