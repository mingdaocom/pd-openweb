import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { autobind } from 'core-decorators';
import { Button, Dialog, RichText, Linkify } from 'ming-ui';
import captcha from 'src/components/captcha';
import CustomFields from 'src/components/newCustomFields';
import { Hr } from 'src/pages/publicWorksheetConfig/components/Basics';
import { addWorksheetRow } from './action';
import { getSubListError } from 'worksheet/util';
import './index.less';

const ImgCon = styled.div`
  position: relative;
  display: inline-block;
  margin-top: 32px;
  height: 59px;
  img {
    height: 59px;
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

export default class FillWorkseet extends React.Component {
  static propTypes = {
    loading: PropTypes.bool,
    rules: PropTypes.arrayOf(PropTypes.shape({})),
    publicWorksheetInfo: PropTypes.shape({}),
    formData: PropTypes.arrayOf(PropTypes.shape({})),
    onSubmit: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      showError: false,
      formData: props.formData,
    };
  }

  componentDidMount() {
    if (!this.props.isPreview) {
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
  cellObjs = {};

  @autobind
  handleSubmit() {
    this.setState({ submitLoading: true });
    this.customwidget.current.submitFormData();
  }

  @autobind
  onSave(error, { data, updateControlIds }) {
    if (this.issubmitting) {
      return;
    }
    if (error) {
      this.setState({ submitLoading: false });
      return;
    }
    if (!this.customwidget.current) return;
    const { isPreview, publicWorksheetInfo = {}, onSubmit } = this.props;
    const { shareId, worksheetId, needCaptcha } = publicWorksheetInfo;
    let hasError;
    const subListControls = data.filter(item => item.type === 34);
    if (subListControls.length) {
      const errors = subListControls
        .map(control => ({
          id: control.controlId,
          value:
            control.value &&
            control.value.rows &&
            control.value.rows.length &&
            getSubListError(
              {
                rows: control.value.rows,
                rules:
                  _.get(this.cellObjs || {}, `${control.controlId}.cell.rules`) ||
                  _.get(this.cellObjs || {}, `${control.controlId}.cell.worksheettable.current.table.state.rules`),
              },
              control.relationControls,
              control.showControls,
              2,
            ),
        }))
        .filter(c => !_.isEmpty(c.value));
      if (errors.length) {
        hasError = true;
        errors.forEach(error => {
          const errorSublist = (this.cellObjs || {})[error.id];
          if (errorSublist) {
            errorSublist.cell.setState({
              error: !_.isEmpty(error.value),
              cellErrors: error.value,
            });
          }
        });
      } else {
        subListControls.forEach(control => {
          const errorSublist = (this.cellObjs || {})[control.controlId];
          if (errorSublist) {
            errorSublist.cell.setState({
              error: false,
              cellErrors: {},
            });
          }
        });
      }
      if (this.con.current.querySelector('.cellControlErrorTip')) {
        hasError = true;
      }
    }

    if (isPreview) {
      Dialog.confirm({
        title: _l('目前为预览模式，不可提交表单'),
      });
      return;
    }
    const submit = res => {
      if (res && !res.ticket) {
        return;
      }
      this.issubmitting = true;
      addWorksheetRow(
        {
          shareId,
          worksheetId,
          formData: data,
          publicWorksheetInfo,
          triggerUniqueError: badData => {
            if (this.customwidget.current && _.isFunction(this.customwidget.current.uniqueErrorUpdate)) {
              this.customwidget.current.uniqueErrorUpdate(badData);
            }
          },
          params: res
            ? {
                ticket: res.ticket,
                randStr: res.randstr,
                captchaType: md.staticglobal.getCaptchaType(),
              }
            : {},
        },
        (err, data) => {
          this.issubmitting = false;
          if (err) {
            return;
          }
          if (!data) {
            alert(_l('当前表单已过期'), 3);
            return;
          }
          // 添加成功
          localStorage.setItem('publicWorksheetLastSubmit_' + publicWorksheetInfo.shareId, new Date().toISOString());
          window.onbeforeunload = null;
          this.setState({
            submitLoading: false,
          });
          onSubmit();
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
        if (md.staticglobal.getCaptchaType() === 1) {
          captcha(submit);
        } else {
          new TencentCaptcha(md.global.Config.CaptchaAppId.toString(), submit).show();
        }
      } else {
        submit();
      }
    }
  }

  render() {
    const { loading, publicWorksheetInfo = {}, rules } = this.props;
    const { submitLoading, formData, showError } = this.state;
    const { name, desc, worksheetId, logoUrl, submitBtnName, isWorksheetQuery } = publicWorksheetInfo;
    return (
      <React.Fragment>
        {submitLoading && <LoadMask />}
        <div className="infoCon" style={{ padding: '0 30px' }}>
          {logoUrl ? (
            <ImgCon>
              <img className="logo" src={logoUrl} />
            </ImgCon>
          ) : (
            <div style={{ marginTop: 32 }}></div>
          )}
          <div className="worksheetName">{name || _l('未命名表单')}</div>
          <div className="mdEditor">
            {!!desc && (
              <RichText data={desc || ''} className="worksheetDescription WordBreak mdEditorContent " disabled={true} />
            )}
          </div>
        </div>
        <Hr style={{ margin: '16px 0' }} />
        <div className="formMain" ref={this.con} style={{ padding: '0 32px' }}>
          {!loading && (
            <CustomFields
              rules={rules}
              ref={this.customwidget}
              data={formData}
              from={4}
              worksheetId={worksheetId}
              isWorksheetQuery={isWorksheetQuery}
              showError={showError}
              registerCell={({ item, cell }) => (this.cellObjs[item.controlId] = { item, cell })}
              onChange={(data, id) => {
                this.setState({
                  formData: data,
                });
              }}
              onSave={this.onSave}
            />
          )}
        </div>
        <div className="submitCon">
          <Button loading={submitLoading} style={{ height: '40px', lineHeight: '40px' }} onClick={this.handleSubmit}>
            <span className="InlineBlock ellipsis" style={{ maxWidth: 140 }}>
              {submitBtnName}
            </span>
          </Button>
        </div>
      </React.Fragment>
    );
  }
}
