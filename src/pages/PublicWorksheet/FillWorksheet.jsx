import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, RichText } from 'ming-ui';
import { captcha } from 'ming-ui/functions';
import CustomFields from 'src/components/newCustomFields';
import { addWorksheetRow } from './action';
import { checkMobileVerify, controlState, getControlsByTab } from 'src/components/newCustomFields/tools/utils';
import { updateRulesData } from 'src/components/newCustomFields/tools/filterFn';
import './index.less';
import _, { get } from 'lodash';
import moment from 'moment';
import { TIME_TYPE } from '../publicWorksheetConfig/enum';
import { getLimitWriteTimeDisplayText } from '../publicWorksheetConfig/utils';
import FilledRecord from './FilledRecord';
import { FILL_STATUS } from './enum';
import CountDown from '../publicWorksheetConfig/common/CountDown';
import { getRgbaByColor } from '../widgetConfig/util';
import { getRequest, browserIsMobile } from 'src/util';
import cx from 'classnames';
import localForage from 'localforage';
import FormSection from 'src/pages/worksheet/common/recordInfo/RecordForm/FormSection';
import { TinyColor } from '@ctrl/tinycolor';
import { getPublicSubmitStorage } from './utils';

const ImgCon = styled.div`
  position: relative;
  display: inline-block;
  height: 40px;
  img {
    height: 40px;
    max-width: 100%;
    object-fit: contain;
  }
  .icon {
    position: absolute;
    top: -8px;
    right: -8px;
    font-size: 18px;
    color: #bdbdbd;
  }
`;

const LoadMask = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  z-index: 2;
`;

export default class FillWorksheet extends React.Component {
  static propTypes = {
    loading: PropTypes.bool,
    rules: PropTypes.arrayOf(PropTypes.shape({})),
    publicWorksheetInfo: PropTypes.shape({}),
    formData: PropTypes.arrayOf(PropTypes.shape({})),
    onSubmit: PropTypes.func,
    status: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      showError: false,
      formData: props.formData,
    };
  }

  componentDidMount() {
    const request = getRequest();
    if (!this.props.isPreview && !request.isMDClient) {
      window.onbeforeunload = function (e) {
        e = e || window.event;
        if (e) {
          e.returnValue = '关闭提示';
        }
        return '关闭提示';
      };
    }
  }

  con = React.createRef();
  customwidget = React.createRef();
  sectionTab = React.createRef();
  cellObjs = {};

  handleSubmit = () => {
    this.setState({ submitLoading: true });
    this.customwidget.current.submitFormData();
  };

  onSave = (error, { data, updateControlIds, handleRuleError, handleServiceError }) => {
    if (this.issubmitting) {
      return;
    }
    if (error) {
      this.setState({ submitLoading: false });
      return;
    }
    if (!this.customwidget.current) return;
    const { publicWorksheetInfo = {}, onSubmit } = this.props;
    const {
      shareId,
      worksheetId,
      needCaptcha,
      smsVerificationFiled,
      smsVerification,
      cacheFieldData = {},
      writeScope,
    } = publicWorksheetInfo;
    let hasError;
    const submit = res => {
      if (res && !res.ticket) {
        this.setState({
          submitLoading: false,
        });
        return;
      }
      this.issubmitting = true;
      let params = res
        ? {
            ticket: res.ticket,
            randStr: res.randstr,
            captchaType: md.global.getCaptchaType(),
          }
        : {};
      if (smsVerification && checkMobileVerify(data, smsVerificationFiled)) {
        params.verifyCode = this.customwidget.current.state.verifyCode;
      }
      addWorksheetRow(
        {
          worksheetId,
          shareId,
          formData: data,
          publicWorksheetInfo,
          triggerUniqueError: badData => {
            if (this.customwidget.current && _.isFunction(this.customwidget.current.uniqueErrorUpdate)) {
              this.customwidget.current.uniqueErrorUpdate(badData);
            }
          },
          setSubListUniqueError: badData => {
            this.customwidget.current.dataFormat.callStore('setUniqueError', { badData });
          },
          setRuleError: badData => handleRuleError(badData),
          setServiceError: badData => handleServiceError(badData),
          params,
        },
        (err, res) => {
          this.issubmitting = false;
          if (err) {
            this.setState({
              submitLoading: false,
            });
            return;
          }
          if (!res) {
            alert(_l('当前表单已过期'), 3);
            this.setState({
              submitLoading: false,
            });
            return;
          }

          // 添加成功
          const wxUserInfo = JSON.parse(localStorage.getItem('wxUserInfo') || '{}');
          if (writeScope === 1 && !wxUserInfo.openId) {
            const submitStorage = getPublicSubmitStorage(shareId);
            safeLocalStorageSetItem(
              'publicWorksheetSubmit_' + publicWorksheetInfo.shareId,
              JSON.stringify([...submitStorage, new Date().toISOString()]),
            );
          }

          if (cacheFieldData.isEnable) {
            const cacheData = (data || []).map(item => ({
              controlId: item.controlId,
              value:
                item.type === 34
                  ? _.get(item, 'value.rows')
                    ? JSON.stringify(item.value.rows)
                    : undefined
                  : item.value,
            }));
            localForage.setItem(`cacheFieldData_${publicWorksheetInfo.shareId}`, cacheData);
          }
          //提交成功，清除未提交缓存
          localForage.removeItem(`cacheDraft_${publicWorksheetInfo.shareId}`);

          window.onbeforeunload = null;
          this.setState({
            submitLoading: false,
          });
          onSubmit(res.isPayOrder, res.rowId, data);
        },
      );
    };
    if (hasError) {
      alert(_l('请正确填写'), 3);
      this.setState({
        submitLoading: false,
      });
      return false;
    } else {
      if (needCaptcha) {
        if (md.global.getCaptchaType() === 1) {
          captcha(submit, () => submit({}));
        } else {
          new TencentCaptcha(md.global.Config.CaptchaAppId.toString(), submit, { needFeedBack: false }).show();
        }
      } else {
        submit();
      }
    }
  };

  renderFormSection = () => {
    const { publicWorksheetInfo = {}, rules = [] } = this.props;
    const { formData = [] } = this.state;
    const getRulesData = updateRulesData({
      from: 4,
      rules,
      data: formData,
    }).filter(control => controlState(control, 4).visible);

    const { tabData = [] } = getControlsByTab(getRulesData, publicWorksheetInfo.advancedSetting, 4);

    return (
      <FormSection
        from={4}
        ref={this.sectionTab}
        tabControls={tabData}
        widgetStyle={publicWorksheetInfo.advancedSetting}
        onClick={controlId => {
          if (this.customwidget.current) {
            this.customwidget.current.setActiveTabControlId(controlId);
          }
        }}
      />
    );
  };

  render() {
    const { loading, publicWorksheetInfo = {}, rules, status, isPreview, themeBgColor } = this.props;
    const { submitLoading, formData, showError } = this.state;
    const {
      name,
      desc,
      worksheetId,
      logoUrl,
      submitBtnName,
      isWorksheetQuery,
      smsVerificationFiled,
      smsVerification,
      appId,
      projectId,
      linkSwitchTime = {},
      limitWriteCount = {},
      limitWriteTime = {},
      completeNumber,
      cacheDraft,
      advancedSetting = {},
    } = publicWorksheetInfo;
    const request = getRequest();
    const { header, submit } = request;
    const isFixedLeft = !browserIsMobile() && _.get(advancedSetting, 'tabposition') === '3';
    const isFixedRight = _.get(advancedSetting, 'tabposition') === '4';

    return (
      <React.Fragment>
        {submitLoading && <LoadMask />}
        <div className="infoCon">
          {header !== 'no' && (
            <React.Fragment>
              {logoUrl && (
                <ImgCon>
                  <img className="logo" src={logoUrl} />
                </ImgCon>
              )}

              {name && <div className="worksheetName">{name}</div>}

              {!!desc && (
                <div className="mdEditor">
                  <RichText
                    data={desc || ''}
                    className="worksheetDescription WordBreak mdEditorContent "
                    disabled={true}
                    minHeight={64}
                  />
                </div>
              )}
            </React.Fragment>
          )}

          {!isPreview && (
            <React.Fragment>
              {(linkSwitchTime.isEnable || limitWriteCount.isEnable || limitWriteTime.isEnable) && (
                <div className="worksheetLimitInfo" style={{ borderColor: getRgbaByColor(themeBgColor, 0.2) }}>
                  {linkSwitchTime.isEnable && (
                    <div className="itemInfo">
                      <React.Fragment>
                        {linkSwitchTime.isShowCountDown ? (
                          <CountDown
                            className="Gray"
                            endTime={linkSwitchTime.endTime}
                            beforeText={_l('链接将于')}
                            afterText={_l('后截止')}
                            arriveText={_l('链接已截止') + ';'}
                          />
                        ) : (
                          <React.Fragment>
                            <span>{_l('链接将于')}</span>
                            <span className="bold Gray mLeft5 mRight5">
                              {moment(linkSwitchTime.endTime).format('YYYY-MM-DD HH:mm')}
                            </span>
                            <span>{_l('截止')};</span>
                          </React.Fragment>
                        )}
                      </React.Fragment>
                    </div>
                  )}
                  {limitWriteCount.isEnable && (
                    <div className="itemInfo">
                      <span>{_l('已收集')}</span>
                      <span className="Gray mLeft5 mRight5">
                        {_l(`${completeNumber || 0}/${limitWriteCount.limitWriteCount}`)}
                      </span>
                      <span>{_l('份, 还剩')}</span>
                      <span className="Gray mLeft5 mRight5">
                        {limitWriteCount.limitWriteCount - (completeNumber || 0)}
                      </span>
                      <span>{_l('份结束收集')};</span>
                    </div>
                  )}
                  {limitWriteTime.isEnable && (
                    <div className="itemInfo">
                      <span className="Gray">{getLimitWriteTimeDisplayText(TIME_TYPE.MONTH, limitWriteTime)}</span>
                      <span className="mLeft5 mRight5">{_l('的')}</span>
                      <span className="Gray">{getLimitWriteTimeDisplayText(TIME_TYPE.DAY, limitWriteTime)}</span>
                      {!!getLimitWriteTimeDisplayText(TIME_TYPE.HOUR, limitWriteTime) && (
                        <span className="mLeft5 mRight5">{_l('的')}</span>
                      )}
                      <span className="Gray">{getLimitWriteTimeDisplayText(TIME_TYPE.HOUR, limitWriteTime)}</span>
                      <span className="mLeft5">{_l('可填写')}</span>
                    </div>
                  )}
                </div>
              )}

              <FilledRecord
                isFillPage={true}
                publicWorksheetInfo={publicWorksheetInfo}
                formData={formData}
                rules={rules}
                status={status}
              />
            </React.Fragment>
          )}
        </div>

        <div
          className={cx('formMain', {
            fillWorksheetSection: isFixedLeft || isFixedRight,
            isFixedRight,
            flexColumn: browserIsMobile(),
          })}
          ref={this.con}
          style={{ padding: '0 32px' }}
        >
          {!loading && (
            <Fragment>
              {(isFixedLeft || isFixedRight) && this.renderFormSection()}
              <CustomFields
                widgetStyle={advancedSetting}
                rules={rules}
                ref={this.customwidget}
                data={formData}
                appId={appId}
                projectId={projectId}
                from={4}
                worksheetId={worksheetId}
                isWorksheetQuery={isWorksheetQuery}
                smsVerificationFiled={smsVerificationFiled}
                smsVerification={smsVerification}
                showError={showError}
                registerCell={({ item, cell }) => (this.cellObjs[item.controlId] = { item, cell })}
                onChange={(data, id) => {
                  if (cacheDraft) {
                    const draftData = (data || []).map(item => ({
                      controlId: item.controlId,
                      value:
                        item.type === 34
                          ? _.get(item, 'value.rows')
                            ? JSON.stringify(item.value.rows)
                            : undefined
                          : item.value,
                    }));
                    localForage.setItem(`cacheDraft_${publicWorksheetInfo.shareId}`, draftData);
                  }

                  this.setState({
                    formData: data,
                  });
                }}
                onSave={this.onSave}
                onError={() => {
                  this.setState({ submitLoading: false });
                }}
                tabControlProp={{
                  handleSectionClick: id => {
                    if (this.sectionTab && this.sectionTab.current) {
                      this.sectionTab.current.setActiveId(id);
                    }
                  },
                }}
              />
            </Fragment>
          )}
        </div>
        <div className={cx('submitCon', { TxtLeft: submit === 'left', TxtRight: submit === 'right' })}>
          <Button
            className="submitBtn"
            disabled={
              !formData.filter(c => controlState(c, 4).visible).length ||
              status === FILL_STATUS.NOT_IN_FILL_TIME ||
              isPreview
            }
            loading={submitLoading}
            style={{
              height: '40px',
              lineHeight: '40px',
              background: themeBgColor,
              padding: 0,
              color: new TinyColor(themeBgColor).isDark() ? '#fff' : 'rgba(0, 0, 0, 0.45)',
            }}
            onClick={this.handleSubmit}
          >
            <span className="InlineBlock ellipsis w100">{submitBtnName}</span>
          </Button>
        </div>
      </React.Fragment>
    );
  }
}
