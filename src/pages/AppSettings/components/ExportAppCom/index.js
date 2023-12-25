import React, { Component, Fragment } from 'react';
import { Support, Button, VerifyPasswordConfirm, Tooltip, ScrollView, LoadDiv } from 'ming-ui';
import ExportApp from 'src/pages/Admin/appManagement/modules/ExportApp';
import UserHead from 'src/components/userHead';
import UserName from 'src/components/userName';
import EmptyStatus from '../EmptyStatus';
import appManagementAjax from 'src/api/appManagement';
import { verifyPassword } from 'src/util';
import cx from 'classnames';
import './index.less';

export default class ExportAppCom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      exportAppVisible: false,
      loading: false,
      pageIndex: 1,
      records: [],
      isMore: false,
    };
  }

  componentDidMount() {
    this.getExportLogs();
  }

  getExportLogs = () => {
    const { appId } = this.props;
    const { pageIndex } = this.state;

    this.setState({ loading: true });

    appManagementAjax
      .getExportsByApp({
        appId,
        pageIndex,
        pageSize: 50,
      })
      .then(({ records, total }) => {
        this.setState({
          records: pageIndex > 1 ? this.state.records.concat(records) : records,
          loading: false,
          isMore: records.length >= 50,
        });
      });
  };

  onScrollEnd = () => {
    let { isMore, loading } = this.state;

    if (loading || !isMore) return;

    this.setState({ pageIndex: this.state.pageIndex + 1 }, () => {
      this.getExportLogs();
    });
  };

  verifyPassword = (id, passwordType) => {
    const { projectId } = this.props;

    verifyPassword({
      projectId,
      checkNeedAuth: true,
      customActionName: 'checkAccount',
      ignoreAlert: true,
      success: () => this.getPassword(id, passwordType),
      fail: () => {
        VerifyPasswordConfirm.confirm({
          title: _l('验证身份后查看密码'),
          showAccount: false,
          description: '',
          passwordLabel: <div className="mTop10 mBottom10">{_l('当前用户登录密码')}</div>,
          passwordPlaceholder: _l('请输入密码确认授权'),
          onOk: () => this.getPassword(id, passwordType),
        });
      },
    });
  };

  getPassword = (id, passwordType) => {
    const { appId } = this.props;
    const { records } = this.state;

    appManagementAjax
      .getExportPassword({
        appId,
        id,
        passwordType: passwordType === 'exportPassword' ? 0 : 1,
      })
      .then(res => {
        this.setState({
          records: records.map(v => {
            if (v.id === id) {
              return { ...v, [passwordType]: res, [`show_${passwordType}`]: true };
            }
            return v;
          }),
        });
      });
  };

  checkPassword = ({ id, passwordType, password }) => {
    const { records = [] } = this.state;
    if (password) {
      this.setState({
        records: records.map(o => {
          if (o.id === id) {
            o[`show_${passwordType}`] = !o[`show_${passwordType}`];
          }

          return o;
        }),
      });
    } else {
      this.verifyPassword(id, passwordType);
    }
  };

  renderPassword = (item, passwordType) => {
    const {
      id,
      hasExportPassword,
      hasLockPassword,
      show_exportPassword,
      show_lockPassword,
      exportPassword,
      lockPassword,
    } = item;
    const { records } = this.state;
    const hasPassword = passwordType === 'exportPassword' ? hasExportPassword : hasLockPassword;
    const showPassword = passwordType === 'exportPassword' ? show_exportPassword : show_lockPassword;
    const password = passwordType === 'exportPassword' ? exportPassword : lockPassword;

    return (
      <span
        className={cx('password', { hoverPassword: !showPassword })}
        onClick={() => {
          if (!hasPassword || showPassword) return;
          this.checkPassword({ id, passwordType, password });
        }}
      >
        {hasPassword ? (showPassword ? password : '******') : ''}
        {hasPassword && (
          <i
            className={cx(
              'icon Font14 Hover_21 mLeft5 Hand showVisibilityIcon',
              showPassword ? 'icon-visibility_off' : 'icon-visibility',
            )}
            onClick={() => {
              if (!showPassword) return;
              this.checkPassword({ id, passwordType, password });
            }}
          />
        )}
      </span>
    );
  };

  render() {
    const { appId } = this.props;
    const { exportAppVisible, records = [], loading } = this.state;

    return (
      <Fragment>
        <div className="exportAppHeader">
          <div className="flex">
            <div className="Font17 bold mBottom8">{_l('导出')}</div>
            <div className="Gray_9e mBottom20">
              <span className="Gray_9e">
                {_l('将应用配置导出为文件，之后可以将此文件导入其他组织以实现应用迁移，可选择同时导出部分示例数据')}
              </span>
              <Support text={_l('帮助')} type={3} href="https://help.mingdao.com/apply3" />
            </div>
          </div>
          <Button
            className="pLeft20 pRight20 Font14"
            style={{ height: 36 }}
            type="primary"
            radius
            onClick={() => this.setState({ exportAppVisible: true })}
          >
            <i className="icon icon-import mRight5" />
            {_l('导出应用')}
          </Button>
        </div>

        {loading ? (
          <div className="exportAppListWrap flexColumn flex">
            <LoadDiv />
          </div>
        ) : (
          <div className="exportAppListWrap flexColumn flex">
            <div className="row headerRow flexRow Gray_9e Font14">
              <div className="operator">{_l('操作人')}</div>
              <div className="date">{_l('导出时间')}</div>
              <div className="exportType flex">{_l('导出类型')}</div>
              <div className="password">{_l('导出密码')}</div>
              <div className="password">{_l('应用锁密码')}</div>
              <div className="download"></div>
            </div>
            <div className="flex listContent">
              {_.isEmpty(records) ? (
                <EmptyStatus
                  radiusSize={132}
                  icon="import"
                  iconClassName="Gray_9e Font50"
                  emptyTxtClassName="Gray_bd mTop18 Font17"
                  emptyTxt={_l('暂无导出记录')}
                />
              ) : (
                <ScrollView onScrollEnd={this.onScrollEnd}>
                  {records.map(item => {
                    const { operator, createTime, apps = [], downLoadUrl } = item;
                    const appNames = apps.map((v, i) => (i < apps.length - 1 ? v.appName + ';' : v.appName)).join('');

                    return (
                      <div className="row flexRow">
                        <div className="operator flexRow">
                          <UserHead
                            className="circle mRight8"
                            user={{
                              userHead: operator.avatarSmall,
                              accountId: operator.accountId,
                            }}
                            size={24}
                          />
                          <UserName
                            className="Gray Font13 pLeft5 pRight10 pTop3 flex ellipsis"
                            user={{
                              userName: operator.fullname,
                              accountId: operator.accountId,
                            }}
                          />
                        </div>
                        <div className="date">{createTime}</div>
                        <div className="exportType flex overflowHidden">
                          {apps.length === 1 ? (
                            _l('单应用')
                          ) : (
                            <Tooltip text={<span>{_l('应用包') + `(${appNames})`}</span>}>
                              <span className="ellipsis InlineBlock wMax100">{_l('应用包') + `(${appNames})`}</span>
                            </Tooltip>
                          )}
                        </div>
                        {this.renderPassword(item, 'exportPassword')}
                        {this.renderPassword(item, 'lockPassword')}
                        <div className="download">
                          {downLoadUrl ? (
                            <a href={downLoadUrl} target="_blank">
                              {_l('下载')}
                            </a>
                          ) : (
                            <span className="Gray_9e">{_l('下载')}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </ScrollView>
              )}
            </div>
          </div>
        )}

        {exportAppVisible && (
          <ExportApp appIds={[appId]} closeDialog={() => this.setState({ exportAppVisible: false })} />
        )}
      </Fragment>
    );
  }
}
