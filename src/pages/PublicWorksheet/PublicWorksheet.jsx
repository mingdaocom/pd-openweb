import React from 'react';
import DocumentTitle from 'react-document-title';
import { generate } from '@ant-design/colors';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, Dialog, RichText, ScrollView, Skeleton } from 'ming-ui';
import weixinApi from 'src/api/weixin';
import { Absolute, FormTopImgCon } from 'worksheet/components/Basics';
import { VerificationPass } from 'worksheet/components/ShareState';
import BgContainer from 'src/pages/publicWorksheetConfig/components/BgContainer';
import Qr from 'src/pages/publicWorksheetConfig/components/Qr';
import { getPageConfig } from 'src/pages/publicWorksheetConfig/utils';
import { getRequest } from 'src/util';
import { handlePrePayOrder } from '../Admin/pay/PrePayorder';
import { themes, WX_ICON_LIST } from '../publicWorksheetConfig/enum';
import { getFormData, getPublicWorksheet, getPublicWorksheetInfo } from './action';
import { FILL_STATUS } from './enum';
import FillWorksheet from './FillWorksheet';
import NotFillStatus from './NotFillStatus';
import './index.less';

const TopBar = styled.div(
  ({ color, hasBorderRadius }) =>
    `height: 10px; background: ${color}; opacity: .4; border-radius: ${hasBorderRadius ? '3px 3px 0 0' : 'none'};`,
);

const PreFillWrap = styled.div``;

export default class PublicWorksheet extends React.Component {
  static propTypes = {
    isPreview: PropTypes.bool,
    worksheetId: PropTypes.string,
  };

  constructor(props) {
    super(props);

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    this.state = {
      loading: true,
      qrurl: '',
      passWord: '',
      pageConfigKey: urlParams.get('source') || '',
      preFillDescVisible: true,
    };
    window.isPublicWorksheet = _.get(window, 'shareState.isPublicFormPreview') ? false : true;
  }

  componentDidMount() {
    const { isPreview, worksheetId } = this.props;
    if (isPreview) {
      getPublicWorksheetInfo(worksheetId, (err, info) => {
        this.setState({
          loading: false,
          status: FILL_STATUS.NORMAL,
          publicWorksheetInfo: info.publicWorksheetInfo,
          formData: info.formData,
        });
      });
    } else {
      window.addEventListener('popstate', this.pageBack);

      const urlMatch = location.pathname.match(/.*\/((\w{32}))/);

      if (!urlMatch) {
        alert(_l('地址有误，无法找到相关数据！'), 2);
      }

      if (window.isWeiXin && !window.wx) {
        $.getScript('https://res.wx.qq.com/open/js/jweixin-1.6.0.js');
      }

      const shareId = urlMatch[1];
      window.publicWorksheetShareId = shareId;
      this.shareId = shareId;
      getPublicWorksheet(
        {
          shareId,
        },
        info => {
          this.setState({ loading: false, ...info });
          if (info.status === FILL_STATUS.NOT_IN_FILL_TIME) {
            alert(_l('你访问的表单暂未开放!'), 3);
          }

          if (window.isWeiXin && window.wx) {
            const shareConfig = safeParse(_.get(info, 'publicWorksheetInfo.extendDatas.shareConfig'));
            this.setWxShareConfig(shareConfig, _.get(info, 'publicWorksheetInfo.name'));
          }
        },
      );
    }
  }

  componentWillUnmount() {
    !this.props.isPreview && window.removeEventListener('popstate', this.pageBack);
  }

  pageBack = event => {
    if (event.state && event.state.page === 'wechat_redirect') {
      location.reload();
    }
  };

  setWxShareConfig(shareConfig, formName) {
    const entryUrl = sessionStorage.getItem('entryUrl');
    weixinApi.getWeiXinConfig({ url: encodeURI(entryUrl || location.href) }).then(({ data, code }) => {
      if (code === 1) {
        window.wx.config({
          debug: false,
          appId: data.appId,
          timestamp: data.timestamp,
          nonceStr: data.nonceStr,
          signature: data.signature,
          jsApiList: ['updateAppMessageShareData'],
        });

        wx.ready(function () {
          //需在用户可能点击分享按钮前就先调用
          wx.updateAppMessageShareData({
            title: shareConfig.title || `${formName} - ${_l('公开填写')}`,
            desc: shareConfig.desc || _l('请填写内容'),
            link: location.href,
            imgUrl: shareConfig.icon || md.global.FileStoreConfig.pubHost + WX_ICON_LIST[0],
            success: function () {
              console.log('设置成功');
            },
          });
        });
      }
    });
  }

  onClosePreFillDesc = () => this.setState({ preFillDescVisible: false });

  onSubmit = (isPayOrder, rowId, data) => {
    const { worksheetId, extendDatas } = this.state.publicWorksheetInfo || {};

    const afterSubmit = safeParse(_.get(extendDatas, 'afterSubmit'));

    const { payNow, paySuccessReturnUrl } = getRequest() || {};

    isPayOrder && rowId && handlePrePayOrder({ worksheetId, rowId, paymentModule: 1, payNow, paySuccessReturnUrl });

    if (!isPayOrder && afterSubmit.action === 2) {
      const value = safeParse(afterSubmit.content);
      const control = value.isControl ? _.find(data, l => l.controlId === _.get(value, 'value.controlId')) || {} : {};
      location.href = value.isControl ? control.value : value.value;
    } else {
      this.setState({ status: FILL_STATUS.COMPLETED, fillData: data });
    }
  };

  getThemeBgColor = ({ themeBgColor, themeColor }) => {
    if (!themeBgColor) {
      return !themes[themeColor] ? '#2196f3' : (themes[themeColor] || {}).main;
    } else {
      return themeBgColor;
    }
  };

  renderPreFillDesc() {
    const { preFillDescVisible, publicWorksheetInfo, loading, status } = this.state;
    const preFillDesc = _.get(publicWorksheetInfo, 'extendDatas.preFillDesc');
    const preFillDescConfig = safeParse(preFillDesc);

    if (loading || !preFillDescConfig.enable || !_.includes([FILL_STATUS.NORMAL, FILL_STATUS.NOT_IN_FILL_TIME], status))
      return null;

    return (
      <Dialog
        width={800}
        dialogClasses="preFillDescDialog"
        title={preFillDescConfig.title || _l('填写说明')}
        style={{ maxWidth: '80%' }}
        visible={preFillDescVisible}
        overlayClosable={false}
        closable={false}
        footer={
          <div className="flexRow justifyContentCenter">
            <Button onClick={this.onClosePreFillDesc}>{preFillDescConfig.buttonName}</Button>
          </div>
        }
        onCancel={this.onClosePreFillDesc}
      >
        <PreFillWrap className="mdEditor">
          <RichText
            data={preFillDescConfig.content || ''}
            className="worksheetDescription WordBreak mdEditorContent "
            disabled={true}
            minHeight={64}
          />
        </PreFillWrap>
      </Dialog>
    );
  }

  render() {
    const { isPreview } = this.props;
    const { loading, publicWorksheetInfo = {}, formData, rules, status, qrurl, pageConfigKey } = this.state;
    const { worksheetId, writeScope } = publicWorksheetInfo;
    const request = getRequest();
    const { bg, cover } = request;
    const hideBg = bg === 'no';
    const config = getPageConfig(_.get(publicWorksheetInfo, 'extendDatas.pageConfigs'), pageConfigKey);
    const { themeBgColor, layout, cover: coverPic, showQrcode, themeColor } = config;
    const bgShowTop = (layout === 2 || hideBg) && !loading;
    const theme = this.getThemeBgColor({ themeBgColor, themeColor });

    const renderContent = () => {
      return (
        <React.Fragment>
          <div className={cx('formContent flexColumn', { mTop10: bgShowTop })}>
            {bgShowTop && coverPic && cover !== 'no' && (
              <FormTopImgCon>
                <img src={coverPic} />
              </FormTopImgCon>
            )}
            {!hideBg && (
              <React.Fragment>
                {worksheetId && showQrcode && (
                  <Absolute top="0" right="-48">
                    <div
                      className="qrIcon icon icon-zendeskHelp-qrcode"
                      onMouseEnter={() => {
                        let qrurl = location.href;
                        if (isPreview) {
                          try {
                            qrurl = new URL(location.href).searchParams.get('url');
                          } catch (err) {
                            console.error(err);
                          }
                        }
                        this.setState({ qrurl });
                      }}
                    >
                      <Qr url={qrurl} />
                    </div>
                  </Absolute>
                )}
                <TopBar
                  color={theme}
                  hasBorderRadius={!bgShowTop || !coverPic}
                  className={cx({ hide: (bgShowTop && coverPic) || loading })}
                />
              </React.Fragment>
            )}

            {loading && (
              <div style={{ padding: 10 }}>
                <Skeleton
                  style={{ flex: 1 }}
                  direction="column"
                  widths={['30%', '40%', '90%', '60%']}
                  active
                  itemStyle={{ marginBottom: '10px' }}
                />
                <Skeleton
                  style={{ flex: 1 }}
                  direction="column"
                  widths={['40%', '55%', '100%', '80%']}
                  active
                  itemStyle={{ marginBottom: '10px' }}
                />
                <Skeleton
                  style={{ flex: 2 }}
                  direction="column"
                  widths={['45%', '100%', '100%', '100%']}
                  active
                  itemStyle={{ marginBottom: '10px' }}
                />
              </div>
            )}

            {!loading &&
              (!_.includes([FILL_STATUS.NORMAL, FILL_STATUS.NOT_IN_FILL_TIME], status) ? (
                <NotFillStatus
                  publicWorksheetInfo={publicWorksheetInfo}
                  status={status}
                  onRefill={async () => {
                    const formData = await getFormData(publicWorksheetInfo, FILL_STATUS.NORMAL);
                    this.setState({
                      status: FILL_STATUS.NORMAL,
                      formData,
                      publicWorksheetInfo: {
                        ...publicWorksheetInfo,
                        completeNumber: publicWorksheetInfo.completeNumber + 1,
                      },
                    });
                    $('.nano').nanoScroller({ scrollTop: 0 });
                  }}
                  formData={formData}
                  rules={rules}
                  fillData={this.state.fillData}
                />
              ) : (
                <FillWorksheet
                  rules={rules}
                  isPreview={isPreview}
                  loading={loading}
                  publicWorksheetInfo={publicWorksheetInfo}
                  formData={formData}
                  status={status}
                  themeBgColor={themeBgColor}
                  onSubmit={this.onSubmit}
                />
              ))}
          </div>
        </React.Fragment>
      );
    };

    return (
      <div
        className={cx('publicWorksheet', { hideBg })}
        style={{ backgroundColor: loading ? '#f2f2f2' : !hideBg ? generate(theme)[0] : '#fff' }}
      >
        {!loading && (
          <DocumentTitle
            title={
              status !== FILL_STATUS.NEED_FILL_PASSWORD
                ? worksheetId
                  ? publicWorksheetInfo.name || _l('公开表单')
                  : _l('你访问的表单不存在')
                : _l('填写密码')
            }
          />
        )}

        {!loading && status === FILL_STATUS.NEED_FILL_PASSWORD ? (
          <VerificationPass
            validatorPassPromise={(value, captchaResult) => {
              return new Promise(async (resolve, reject) => {
                if (value) {
                  const params = {
                    shareId: this.shareId,
                    passWord: value,
                    ...captchaResult,
                  };
                  getPublicWorksheet(params, info => {
                    if (info) {
                      this.setState({ loading: false, ...info });
                      if (info.status === FILL_STATUS.NOT_IN_FILL_TIME) {
                        alert(_l('你访问的表单暂未开放!'), 3);
                      }
                      resolve(data);
                    } else {
                      reject();
                    }
                  });
                } else {
                  reject();
                }
              });
            }}
          />
        ) : (
          <ScrollView className="flex">
            {(hideBg || bgShowTop) && !loading ? (
              renderContent()
            ) : (
              <BgContainer
                coverUrl={coverPic}
                theme={loading ? '#f2f2f2' : theme}
                isDisplayAvatar={!isPreview && writeScope !== 1 && !loading}
              >
                {renderContent()}
              </BgContainer>
            )}
          </ScrollView>
        )}
        {this.renderPreFillDesc()}
      </div>
    );
  }
}
