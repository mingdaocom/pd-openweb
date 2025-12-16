import React from 'react';
import DocumentTitle from 'react-document-title';
import { generate } from '@ant-design/colors';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, Dialog, RichText, ScrollView, Skeleton } from 'ming-ui';
import { Absolute, FormTopImgCon } from 'worksheet/components/Basics';
import { VerificationPass } from 'worksheet/components/ShareState';
import ShareCardConfig from 'src/components/ShareCardConfig';
import { SHARECARDTYPS } from 'src/components/ShareCardConfig/config';
import { themes } from 'src/pages/FormExtend/enum';
import BgContainer from 'src/pages/FormExtend/PublicWorksheetConfig/components/BgContainer';
import Qr from 'src/pages/FormExtend/PublicWorksheetConfig/components/Qr';
import { getPageConfig } from 'src/pages/FormExtend/utils';
import { getRequest } from 'src/utils/common';
import { handlePrePayOrder } from '../Admin/pay/PrePayorder';
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
      submitRes: {},
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

          if (window.isWeiXin) {
            ShareCardConfig({
              title: `${_.get(info, 'publicWorksheetInfo.name')} - ${_l('公开填写')}`,
              desc: _l('请填写内容'),
              projectId: _.get(info, 'publicWorksheetInfo.projectId'),
              worksheetId: _.get(info, 'publicWorksheetInfo.worksheetId'),
              type: SHARECARDTYPS.PUBLICWORKSHEET,
            });
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

  onClosePreFillDesc = () => this.setState({ preFillDescVisible: false });

  onSubmit = (submitResult, data, submitSuccess = () => {}) => {
    const { isPayOrder, rowId, isAtOncePayment, isPaySuccessAddRecord, isOpenInvoice } = submitResult || {};
    const { worksheetId, extendDatas } = this.state.publicWorksheetInfo || {};

    const afterSubmit = safeParse(_.get(extendDatas, 'afterSubmit'));
    let jumpUrl = '';
    if (afterSubmit.action === 2) {
      const afterSubmitContent = safeParse(afterSubmit.content);
      const control = afterSubmitContent.isControl
        ? _.find(data, l => l.controlId === _.get(afterSubmitContent, 'value.controlId')) || {}
        : {};
      jumpUrl = afterSubmitContent.isControl ? control.value : afterSubmitContent.value;
    }

    const { notDialog } = getRequest() || {};

    isPayOrder &&
      rowId &&
      handlePrePayOrder({
        worksheetId,
        rowId,
        paymentModule: 1,
        payNow: isAtOncePayment,
        paySuccessReturnUrl: jumpUrl,
        isPaySuccessAddRecord,
        notDialog,
        payFinished: ({ onCancel, isSuccess, amount, orderId }) => {
          if (isPaySuccessAddRecord && isSuccess) {
            submitSuccess();
            if (!notDialog) {
              this.setState({
                status: FILL_STATUS.COMPLETED,
                fillData: data,
                submitRes: {
                  isPaySuccessAddRecord: true,
                  isOpenInvoice,
                  amount,
                  orderId,
                },
              });
              onCancel();
            }
          }
        },
      });

    !isPayOrder && jumpUrl && (location.href = jumpUrl);

    (!isPaySuccessAddRecord || notDialog) && this.setState({ status: FILL_STATUS.COMPLETED, fillData: data });
  };

  getThemeBgColor = ({ themeBgColor, themeColor }) => {
    if (!themeBgColor) {
      return !themes[themeColor] ? '#1677ff' : (themes[themeColor] || {}).main;
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
    const { loading, publicWorksheetInfo = {}, formData, rules, status, qrurl, pageConfigKey, submitRes } = this.state;
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
                    $('.scrollViewContainer .scroll-viewport').scrollTop(0);
                  }}
                  formData={formData}
                  rules={rules}
                  fillData={this.state.fillData}
                  submitRes={submitRes}
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
                      resolve(info);
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
