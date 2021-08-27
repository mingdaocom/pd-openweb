import React from 'react';
import cx from 'classnames';
import CustomFields from 'src/components/newCustomFields';
import './noData.less';
import styled from 'styled-components';
import captcha from 'src/components/captcha';

const Con = styled.div`
  background: #f5f5f9;
  padding: 0 20px;
  min-height: 100%;
  .queryBox {
    max-width: 320px;
    margin: 0 auto;
    padding-top: 56px;
    h3 {
      font-size: 22px;
      text-align: center;
      color: #333333;
      padding-bottom: 32px;
    }
    .err {
      line-height: 72px;
      opacity: 1;
      background: #ffffff;
      border: 1px solid #dddddd;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 400;
      text-align: center;
    }
    .customFieldsContainer {
      background: #f5f5f9;
    }
    .customFieldsContainer .customFormItemControl .customAntPicker,
    .customAntSelect .ant-select-selector,
    .customFieldsContainer .customFormItemControl .customFormControlBox,
    .customFieldsContainer .customFormItemControl > div {
      border-color: #eaeaea !important;
      background-color: #fff !important;
    }
    .customFieldsContainer .customFormItemControl .customFormControlBox.formBoxNoBorder {
      border-color: #eaeaea !important;
      background-color: #f5f5f9 !important;
    }
    .btn {
      margin-top: 24px;
      height: 36px;
      opacity: 1;
      background: #2196f3;
      border-radius: 3px;
      font-size: 13px;
      font-weight: 700;
      color: #ffffff;
      line-height: 36px;
      width: 100%;
      &.disable {
        background: #bdbdbd !important;
      }
      &:hover {
        background: #2365c0;
      }
    }
    .fot {
      font-size: 12px;
      color: #bdbdbd;
      margin-top: 40px;
      text-align: center;
      a {
        color: #757575;
        &:hover {
          color: #2196f3;
        }
      }
    }
  }
`;

class Publicquery extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showError: false,
    };
    this.customwidget = React.createRef();
  }
  componentDidMount() {
    const { publicqueryRes = {} } = this.props;
    const { worksheetName } = publicqueryRes;
    const str = ['公开查询', worksheetName].filter(o => !!o).join('-');
    document.title = str;
  }
  renderErr = () => {
    const { publicqueryRes = {} } = this.props;
    const { visibleType } = publicqueryRes;
    return <div className="err">{visibleType === 1 ? _l('查询不存在或已关闭!') : _l('未设置可用的查询条件')}</div>;
  };
  render() {
    const { publicqueryRes = {} } = this.props;
    const { queryControlIds = [], viewId, worksheet = {}, worksheetId = '', visibleType, title } = publicqueryRes;
    const { projectId = '', template = {} } = worksheet;
    const controls = (template.controls || []).filter(o => queryControlIds.includes(o.controlId));
    let isErr = queryControlIds.length <= 0 || !viewId || controls.length <= 0 || visibleType === 1;
    const { showError } = this.state;
    return (
      <Con style={{ minHeight: document.documentElement.clientHeight }}>
        <div className="queryBox">
          <h3>{title || _l('公开查询')}</h3>
          {isErr ? (
            this.renderErr()
          ) : (
            <CustomFields
              disableRules
              recordId="00000"
              ref={this.customwidget}
              data={controls.map(c => ({ ...c, size: 12, required: true, unique: false }))}
              projectId={projectId}
              worksheetId={worksheetId}
              showError={showError} //showError: false, // 是否显示错误信息
            />
          )}
          <div
            className={cx('btn', { disable: isErr })}
            onClick={() => {
              const submitData = this.customwidget.current.getSubmitData();
              const hasError = submitData.hasError;
              if (hasError) {
                this.setState({
                  showError: true,
                });
                return;
              }
              if (submitData.hasRuleError) {
                return;
              }
              let callback = res => {
                if (res.ret !== 0) {
                  return;
                } else {
                  this.props.searchFn({
                    controls: submitData.data.map(o => {
                      return {
                        controlId: o.controlId,
                        dataType: o.type,
                        dateRange: 0,
                        dateRangeType: 1,
                        filterType: 2,
                        spliceType: 1,
                        value: o.value,
                        values: [o.value],
                      };
                    }),
                    ticket: res.ticket,
                    randStr: res.randstr,
                    captchaType: md.staticglobal.CaptchaType(),
                  });
                }
              };
              if (md.staticglobal.CaptchaType() === 1) {
                new captcha(callback);
              } else {
                new TencentCaptcha(md.staticglobal.TencentAppId, callback).show();
              }
            }}
          >
            {_l('查询')}
          </div>
        </div>
      </Con>
    );
  }
}

export default Publicquery;
