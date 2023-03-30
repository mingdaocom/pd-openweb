import React, { Fragment } from 'react';
import './index.less';
import AppSettings from './AppSettings';
import { Checkbox, Tooltip, Support, Dialog } from 'ming-ui';
import ClipboardButton from 'react-clipboard.js';
import ajaxRequest from 'src/api/appManagement';
import { getRandomString } from 'src/util';
import cx from 'classnames';

export default class ExportApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isNeed: false, //导入是否需要密码
      password: '',
      exportList: [], //导出列表
      relation: false, //是否有关联关系
      token: '',
    };
  }

  componentDidMount() {
    const { appIds = [] } = this.props;
    ajaxRequest.getApps({ appIds }).then(({ data, relation, token }) => {
      if (token) {
        const exportList = data.map(item => {
          return {
            ...item,
            exampleType: 0,
            entities: item.entities.map(entity => {
              return { ...entity, count: 0, totalRecordNum: entity.count };
            }),
          };
        });
        this.setState({ exportList, relation, token });
      }
    });
  }

  //立即导出
  handleExportApp() {
    const { disabledExportBtn = false } = this.state;
    if (disabledExportBtn) return;
    const { list = [] } = this.settings.state;
    const params = {
      token: this.state.token,
      accountId: md.global.Account.accountId,
      password: this.state.password,
      appConfig: list.map(item => {
        const { entities = [] } = item;
        const sheetConfig = entities.map(entity => {
          return { worksheetId: entity.worksheetId, count: entity.count > 0 ? entity.count : 0 };
        });
        return { appId: item.appId, exampleType: item.exampleType, sheetConfig };
      }),
    };
    this.props.closeDialog();
    $.ajax({
      type: 'POST',
      url: `${md.global.Config.AppFileServer}AppFile/Export`,
      data: JSON.stringify(params),
      dataType: 'JSON',
      contentType: 'application/json',
    }).done(({ state, exception }) => {
      if (state !== 1) {
        alert(exception, 2, 3000);
      }
    });
  }

  //密码设置
  renderPassword() {
    const { isNeed, password } = this.state;
    return (
      <Fragment>
        <div className="flexRow TxtMiddle mTop50">
          <Checkbox
            checked={isNeed}
            onClick={checked => {
              this.setState({
                isNeed: !checked,
                password: !checked
                  ? getRandomString(16, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz!@#$%&*')
                  : '',
              });
            }}
            className="TxtMiddle mRight13"
          >
            <span>{_l('导入时需要密码')}</span>
          </Checkbox>
        </div>
        {isNeed && (
          <Fragment>
            <div className="passwordInputBox">
              <input
                type="text"
                className="inputBox"
                value={password}
                readonly="readonly"
                ref={input => (this.input = input)}
                onFocus={() => this.input.select()}
              />
              <Tooltip offset={[5, 0]} text={<span>{_l('复制密码')}</span>} popupPlacement="top">
                <div>
                  <ClipboardButton
                    className="adminHoverColor Hand Gray_9e"
                    component="span"
                    data-clipboard-text={password}
                    onSuccess={() => alert(_l('复制成功'))}
                  >
                    <span className="icon-content-copy mLeft15" />
                  </ClipboardButton>
                </div>
              </Tooltip>
            </div>
            <div className="mTop10 Gray_75">{_l('请保存密码，或导出后在导出记录中查看')}</div>
          </Fragment>
        )}
      </Fragment>
    );
  }

  // 选择导出数量
  getIsDisabledExportBtn = flag => {
    this.setState({ disabledExportBtn: flag });
  };

  //导出应用及子表设置
  renderAppSettingContent() {
    const { exportList } = this.state;

    return (
      <Fragment>
        <div className="singleItemHeader mTop24">
          <div className="Gray_75 singleItemLeft Bold">{_l('应用')}</div>
          <div className="Gray_75 singleItemRight Bold">{_l('导出示例数据')}</div>
        </div>
        <AppSettings
          ref={con => (this.settings = con)}
          list={exportList}
          getIsDisabledExportBtn={this.getIsDisabledExportBtn}
        />
      </Fragment>
    );
  }

  //dialog头部
  renderHeader() {
    return (
      <div className="flexRow mBottom4">
        <span className="Font17 overflow_ellipsis Bold">{_l('导出应用')}</span>
      </div>
    );
  }

  render() {
    const { relation, disabledExportBtn = false } = this.state;
    const options = {
      title: this.renderHeader(),
      visible: true,
      footer: null,
      className: 'exportSingleAppDialog',
      width: '920',
      type: 'scroll',
      overlayClosable: false,
      onCancel: () => this.props.closeDialog(),
    };
    return (
      <Dialog {...options}>
        <div className="exportSingleAppContainer">
          <div className="pBottom8">
            <span className="Gray_75">
              {_l('将应用配置导出为文件，之后可以将此文件导入其他组织以实现应用迁移，可选择同时导出部分示例数据。')}
            </span>
            <Support text={_l('帮助')} type={3} href="https://help.mingdao.com/zh/apply3.html" />
          </div>
          {relation && (
            <div className="exportWarning">
              <span className="icon-info1 Font15 mLeft12 mRight6" />
              {_l('此应用工作表关联了未选择导出的应用工作表，直接导出将失去这部分关联')}
            </div>
          )}
          {this.renderAppSettingContent()}
          {this.renderPassword()}
          <div className="mTop32 mBottom20 clearfix selectAppOptionBtns">
            <button
              type="button"
              className={cx('ming Button Right Button--primary nextBtn Bold', {
                'Button--disabled': disabledExportBtn,
              })}
              onClick={() => this.handleExportApp()}
            >
              {_l('立即导出')}
            </button>
            <div className="Right mRight40 Gray_9e Hover_49 Hand LineHeight36" onClick={() => this.props.closeDialog()}>
              {_l('取消')}
            </div>
          </div>
        </div>
      </Dialog>
    );
  }
}
