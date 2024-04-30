import React from 'react';
import ReactDom from 'react-dom';
import preall from 'src/common/preall';
import styled from 'styled-components';
import { browserIsMobile } from 'src/util';
import cx from 'classnames';
import { getRequest } from 'src/util/sso';
import { RichText, LoadDiv, SvgIcon } from 'ming-ui';
import externalPortalAjax from 'src/api/externalPortal';

const Wrap = styled.div`
  background: #f5f5f5;
  .con {
    box-sizing: border-box;
    width: 800px;
    background: #ffffff;
    box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    margin: 40px auto;
    padding: 24px;
    .headCon {
      display: flex;
    }
    .pageTitle {
      margin-bottom: 32px;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      text-overflow: ellipsis;
      word-break: break-all;
      flex: 1;
    }
    .logo {
      img {
        max-width: 100%;
        object-fit: contain;
      }
      .logoImageUrlIcon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 5px;
        div {
          height: 28px;
        }
      }
    }
    &.isMobile {
      width: 100%;
      margin: 0;
      .editorNull {
        border: none;
      }
    }
  }
`;
class PrivacyOrAgreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      summary: '',
      logoImageUrl: '',
      customizeName: '',
      appColor: '#00bcd4',
      appLogoUrl: md.global.FileStoreConfig.pubHost.replace(/\/$/, '') + '/customIcon/0_lego.svg',
      loading: true,
    };
  }
  componentDidMount() {
    const { appId = '' } = getRequest();
    this.ajax = null;
    if (location.pathname.indexOf('privacy') < 0) {
      this.ajax = externalPortalAjax.getUserAgreement({ AppId: appId });
    } else {
      this.ajax = externalPortalAjax.getPrivacyTerms({ AppId: appId });
    }
    this.ajax.then(res => {
      const {
        appColor = '#00bcd4',
        appLogoUrl = md.global.FileStoreConfig.pubHost.replace(/\/$/, '') + '/customIcon/0_lego.svg',
      } = res;
      document.title =
        (location.pathname.indexOf('privacy') < 0 ? _l('用户协议') : _l('隐私政策')) +
        ' - ' +
        (res.customizeName || _l('未命名'));
      this.setState({
        summary: location.pathname.indexOf('privacy') < 0 ? res.userAgreement : res.privacyTerms,
        logoImageUrl: res.logoImageUrl,
        customizeName: res.customizeName,
        appColor,
        appLogoUrl,
        loading: false,
      });
    });
  }
  render() {
    const { summary, logoImageUrl, customizeName, appColor, appLogoUrl, loading } = this.state;
    if (loading) {
      return <LoadDiv />;
    }
    if (!summary) {
      return (
        <Wrap>
          <div
            className={cx('con TxtCenter Font24', { isMobile: browserIsMobile() })}
            style={{
              height: browserIsMobile() ? document.body.clientHeight : document.body.clientHeight - 80,
              paddingTop: document.body.clientHeight / 3,
            }}
          >
            {location.pathname.indexOf('privacy') < 0 ? _l('暂未设置用户协议') : _l('暂未设置隐私政策')}
          </div>
        </Wrap>
      );
    }
    return (
      <Wrap>
        <div className={cx('con', { isMobile: browserIsMobile() })}>
          <div className="headCon">
            <div className="logo InlineBlock">
              {logoImageUrl ? (
                <img src={logoImageUrl} height={40} />
              ) : appColor && appLogoUrl ? (
                <span className={cx('logoImageUrlIcon')} style={{ backgroundColor: appColor }}>
                  <SvgIcon url={appLogoUrl} fill={'#fff'} size={28} />
                </span>
              ) : (
                ''
              )}
            </div>
            <span
              className="Font26 Gray mAll0 Bold pageTitle InlineBlock mLeft30 TxtMiddle"
              style={{ WebkitBoxOrient: 'vertical' }}
            >
              {customizeName}
            </span>
          </div>
          <RichText data={summary || ``} className={''} disabled={true} backGroundColor={'#fff'} />
        </div>
      </Wrap>
    );
  }
}

const Comp = preall(PrivacyOrAgreen, { allowNotLogin: true });

ReactDom.render(<Comp />, document.getElementById('app'));
