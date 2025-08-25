import React from 'react';
import DocumentTitle from 'react-document-title';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { captcha } from 'ming-ui/functions';

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
      color: #151515;
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
      background: #1677ff;
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
          color: #1677ff;
        }
      }
    }
  }
`;

const ErrText = {
  1: _l('查询不存在或已关闭!'),
  2: _l('未设置可用的查询条件'),
  3: _l('数据源已删除'),
};

class Publicquery extends React.Component {
  constructor(props) {
    super(props);
    props.onRef(this);

    this.state = {
      Components: null,
    };
  }

  componentDidMount() {
    import('src/components/newCustomFields').then(res => {
      this.setState({ Components: res });
    });
  }

  renderErr = errCode => {
    return <div className="err">{ErrText[errCode]}</div>;
  };

  //查询
  onSearch = controls => {
    let callback = res => {
      if (res.ret !== 0) {
        return;
      } else {
        this.props.searchFn({
          controls: controls,
          ticket: res.ticket,
          randStr: res.randstr,
          captchaType: md.global.getCaptchaType(),
        });
      }
    };

    new captcha(callback);
  };

  render() {
    const { publicqueryRes = {}, querydata = {} } = this.props;
    const { Components } = this.state;
    const { queryControlIds = [], viewId, worksheet = {}, worksheetId = '', visibleType, title } = publicqueryRes;
    const { projectId = '', template = {}, viewIds } = worksheet;
    const controls = (template.controls || []).filter(o => queryControlIds.includes(o.controlId));
    const errCode =
      visibleType === 1
        ? 1
        : queryControlIds.length <= 0 || !viewId || controls.length <= 0
          ? 2
          : !_.includes(viewIds, viewId)
            ? 3
            : 0;

    return (
      <Con style={{ minHeight: document.documentElement.clientHeight }}>
        <DocumentTitle title={title || _l('公开查询')} />
        <div className="queryBox">
          <h3>{title || _l('公开查询')}</h3>
          {errCode ? (
            this.renderErr(errCode)
          ) : !Components ? null : (
            <Components.default
              disableRules
              recordId="00000"
              ref={customWidget => (this.customWidget = customWidget)}
              data={controls.map(c => ({
                ...c,
                size: 12,
                required: true,
                unique: false,
                sectionId: '',
                fieldPermission: '111', //公开查询，不受字段本身的只读属性影响
                value: ((querydata.controls || []).find(o => o.controlId === c.controlId) || {}).value,
              }))}
              projectId={projectId}
              worksheetId={worksheetId}
            />
          )}
          <div
            className={cx('btn', { disable: !!errCode })}
            onClick={() => {
              const submitData = this.customWidget.getSubmitData();

              if (submitData.error) {
                return;
              }

              this.onSearch(
                submitData.data.map(o => {
                  return {
                    controlId: o.controlId,
                    dataType: o.type,
                    dateRange: 0,
                    filterType: 2,
                    spliceType: 1,
                    value: o.value,
                    values: [o.value],
                  };
                }),
              );
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
