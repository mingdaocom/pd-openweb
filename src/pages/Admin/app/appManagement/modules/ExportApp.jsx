import React, { Fragment } from 'react';
import ClipboardButton from 'react-clipboard.js';
import cx from 'classnames';
import _ from 'lodash';
import { Checkbox, Dialog, Icon, Support, Tooltip } from 'ming-ui';
import ajaxRequest from 'src/api/appManagement';
import { generateRandomPassword } from 'src/utils/common';
import RegExpValidator from 'src/utils/expression';
import AppSettings from './AppSettings';
import './index.less';

const configs = [
  {
    key: 'importKey',
    checkFiled: 'isNeed',
    checkName: _l('导入时需要验证密码'),
    password: 'password',
    placeholder: _l('导入密码'),
  },
  {
    key: 'appKey',
    checkFiled: 'locked',
    checkName: _l('导入后不允许修改应用配置'),
    password: 'lockPassword',
    description: _l('锁定后，导入的应用下所有用户不能查看、修改应用的配置，用户验证密码后可解锁其在应用下的操作权限。'),
    placeholder: _l('应用锁密码'),
  },
];
let timeout = null;
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
    const { appIds = [], projectId } = this.props;
    const { disabledExportBtn = false, lockPassword, locked, isNeed, password } = this.state;
    const importErr = isNeed ? this.checkedPassword('isNeed', password) : {};
    const lockErr = locked ? this.checkedPassword('locked', lockPassword) : {};
    const errors = { ...importErr, ...lockErr };
    const batch = appIds.length > 1;

    if (Object.keys(errors).length) {
      this.setState({ errors });
      return;
    }

    if (disabledExportBtn) return;

    const { list = [] } = this.settings.state;
    const params = {
      password: this.state.password,
      locked,
      lockPassword,
      [batch ? 'appConfigs' : 'appConfig']: list.map(item => {
        const { entities = [] } = item;
        const sheetConfig = entities.map(entity => {
          return { [batch ? 'sheeId' : 'worksheetId']: entity.worksheetId, count: entity.count > 0 ? entity.count : 0 };
        });
        return { appId: item.appId, exampleType: item.exampleType, sheetConfig };
      }),
    };
    this.props.closeDialog();

    if (batch) {
      params.projectId = projectId;
      ajaxRequest.batchExportApp(params).then(res => {
        if (!res) alert(_l('导出失败'), 2, 3000);
      });
    } else {
      params.token = this.state.token;
      params.accountId = md.global.Account.accountId;
      window
        .mdyAPI('', '', params, {
          ajaxOptions: {
            url: `${md.global.Config.AppFileServer}AppFile/Export`,
          },
          customParseResponse: true,
        })
        .then(({ state, exception }) => {
          if (state !== 1) {
            alert(exception, 2, 3000);
          }
        });
    }
  }

  // 密码校验
  checkedPassword = (checkFiled, password) => {
    let reason;
    let copyErrors = { ...this.state.errors };

    if (!RegExpValidator.isPasswordValid(password)) {
      reason = _.get(md, 'global.SysSettings.passwordRegexTip') || _l('密码，至少8-20位，且含字母+数字');
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
      const { checkName, checkFiled, password, description, key, placeholder } = it;
      const canEdit = this.state[`${key}Edit`];

      return (
        <Fragment key={key}>
          <div className={cx('flexRow TxtMiddle alignItemsCenter', { mTop50: index === 0, mTop20: index !== 0 })}>
            <Checkbox
              checked={this.state[checkFiled]}
              onClick={checked => {
                this.setState({
                  [checkFiled]: !checked,
                  [`${key}Edit`]: true,
                  [password]: '',
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
                autoCloseDelay={0}
              >
                <Icon icon="help" className="Gray_9e" />
              </Tooltip>
            )}
          </div>
          {key === 'appKey' && this.state.locked && <div className="Font12 mTop12">{_l('设置解锁密码')}</div>}
          {this.state[checkFiled] && (
            <div className={cx('passwordInputBox', { mTop6: key === 'appKey' && this.state.locked })}>
              <div className="flexColumn">
                <input
                  type="text"
                  className={cx('inputBox', { editInput: canEdit })}
                  placeholder={placeholder}
                  value={this.state[password]}
                  ref={input => (this[`${key}Input`] = input)}
                  onChange={e => this.setState({ [password]: e.target.value })}
                  onFocus={() => this.setState({ [`${key}Edit`]: true })}
                  onBlur={e => {
                    if (!e || !e.target.value) return;
                    let val = e.target.value;
                    this.setState({ errors: this.checkedPassword(checkFiled, val) });
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {
                      this.setState({
                        [`${key}Edit`]: false,
                      });
                    }, 500);
                  }}
                />
              </div>
              {canEdit && (
                <span
                  className="ThemeColor mRight15 Hand"
                  onClick={() => {
                    const newPassword = generateRandomPassword(8);
                    this.setState({
                      [`${key}Edit`]: false,
                      [password]: newPassword,
                      errors: this.checkedPassword(checkFiled, newPassword),
                    });
                  }}
                >
                  {_l('随机生成')}
                </span>
              )}
              {!canEdit && (
                <ClipboardButton
                  className="adminHoverColor Hand Gray_9e copyIcon"
                  component="span"
                  data-clipboard-text={this.state[password]}
                  onSuccess={() => alert(_l('复制成功'))}
                >
                  <Tooltip text={<span>{_l('复制')}</span>} popupPlacement="bottom">
                    <span className="icon-content-copy Hand" />
                  </Tooltip>
                </ClipboardButton>
              )}
            </div>
          )}
          {this.state[checkFiled] && errors[checkFiled] && <div className="error mTop5">{errors[checkFiled]}</div>}
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
          <div className="Gray_75 singleItemRight Bold">
            <span>{_l('导出示例数据')}</span>
          </div>
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
            <Support text={_l('帮助')} type={3} href="https://help.mingdao.com/application/import-export" />
          </div>
          {relation && (
            <div className="exportWarning">
              <span className="icon-info Font15 mLeft12 mRight6" />
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
