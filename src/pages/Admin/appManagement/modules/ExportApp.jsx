import React, { Fragment } from 'react';
import './index.less';
import AppSettings from './AppSettings';
import { Checkbox, Tooltip, Support, Dialog, Icon } from 'ming-ui';
import ClipboardButton from 'react-clipboard.js';
import ajaxRequest from 'src/api/appManagement';
import { getRandomString } from 'src/util';
import RegExp from 'src/util/expression';
import cx from 'classnames';

const configs = [
  { key: 'importKey', checkFiled: 'isNeed', checkName: _l('导入时需要密码'), password: 'password' },
  {
    key: 'appKey',
    checkFiled: 'locked',
    checkName: _l('开启应用锁'),
    password: 'lockPassword',
    description: _l('开启应用锁后，应用导入后将不能查看、修改应用的配置。用户验证密码后将会解锁其在应用下的操作权限。'),
  },
];

export default class ExportApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isNeed: false, //导入是否需要密码
      password: '',
      locked: false, // 是否开启应用锁
      lockPassword: '',
      exportList: [], //导出列表
      relation: false, //是否有关联关系
      token: '',
      errors: {},
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
    const { disabledExportBtn = false, lockPassword, locked, errors = {} } = this.state;
    if (Object.keys(errors).length) return;
    if (disabledExportBtn) return;
    const { list = [] } = this.settings.state;
    const params = {
      token: this.state.token,
      accountId: md.global.Account.accountId,
      password: this.state.password,
      locked,
      lockPassword,
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

  // 密码校验
  checkedPassword = (checkFiled, password) => {
    let reason;
    let copyErrors = { ...this.state.errors };

    if (!password) {
      reason = _l('请输入字母或数字');
    } else if (password.length < 8 || password.length > 20) {
      reason = _l('请输入8-20个字');
    } else if (!RegExp.isPasswordRule(password, /^[0-9A-Za-z]{8,20}$/)) {
      reason = _l('请输入字母数字');
    }
    if (!reason) {
      delete copyErrors[checkFiled];
    }
    let errors = reason ? { ...copyErrors, [checkFiled]: reason } : copyErrors;

    return errors;
  };

  //密码设置
  renderPassword() {
    const { errors = {} } = this.state;
    return configs.map((it, index) => {
      const { checkName, checkFiled, password, description, key } = it;
      const canEdit = this.state[`${key}Edit`];
      const inputExtra = canEdit ? {} : { readonly: 'readonly' };
      return (
        <Fragment key={key}>
          <div className={cx('flexRow TxtMiddle alignItemsCenter', { mTop50: index === 0, mTop30: index !== 0 })}>
            <Checkbox
              checked={this.state[checkFiled]}
              onClick={checked => {
                this.setState({
                  [checkFiled]: !checked,
                  [password]: !checked
                    ? getRandomString(16, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz')
                    : '',
                });
              }}
              className="TxtMiddle mRight13"
            >
              <span>{checkName}</span>
            </Checkbox>
            {description && (
              <Tooltip
                text={<span>{description}</span>}
                popupAlign={{
                  points: ['bl', 'tl'],
                  offset: [-5, 0],
                  overflow: { adjustX: true, adjustY: true },
                }}
              >
                <Icon icon="workflow_help" className="Gray_9e" />
              </Tooltip>
            )}
          </div>
          {this.state[checkFiled] && (
            <div className="passwordInputBox">
              <div className="flexColumn">
                <input
                  type="text"
                  className={cx('inputBox', { editInput: canEdit })}
                  value={this.state[password]}
                  ref={input => (this[`${key}Input`] = input)}
                  onChange={e => this.setState({ [password]: e.target.value })}
                  onBlur={e => {
                    this.setState({
                      [`${key}Edit`]: false,
                      errors: this.checkedPassword(checkFiled, e.target.value),
                    });
                  }}
                  {...inputExtra}
                />
                {errors[checkFiled] && <div className="error">{errors[checkFiled]}</div>}
              </div>
              <Tooltip text={<span>{_l('编辑')}</span>} popupPlacement="bottom">
                <span
                  className="icon-edit Gray_9e Hand LineHeight36"
                  onClick={() => {
                    this.setState({
                      [`${key}Edit`]: true,
                    });
                    this[`${key}Input`] && this[`${key}Input`].focus();
                  }}
                ></span>
              </Tooltip>
              <Tooltip offset={[5, 0]} text={<span>{_l('复制')}</span>} popupPlacement="bottom">
                <ClipboardButton
                  className="adminHoverColor Hand Gray_9e"
                  component="span"
                  data-clipboard-text={this.state[password]}
                  onSuccess={() => alert(_l('复制成功'))}
                >
                  <span className="icon-content-copy mLeft15 Hand" />
                </ClipboardButton>
              </Tooltip>
            </div>
          )}
        </Fragment>
      );
    });
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
            {(this.state.isNeed || this.state.locked) && (
              <div className="LineHeight36 Gray_75 Left">{_l('请保存密码，或导出后在导出记录中查看')}</div>
            )}
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
