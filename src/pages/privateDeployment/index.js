import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Icon, Textarea, Tooltip, Dialog, LoadDiv, Radio, Dropdown, Button, Checkbox, ScrollView } from 'ming-ui';
import ClipboardButton from 'react-clipboard.js';
import Trigger from 'rc-trigger';
import EmailDialog from './EmailDialog';
import DataRestrictionDialog from './DataRestrictionDialog';
import ServerStateDialog from './ServerStateDialog';
import InstallCaptainDialog from './InstallCaptainDialog';
import MessageSettings from './MessageSettings';
import CustomConfig from './CustomConfig';
import SourceListSettings from './SourceListSettings';
import privateGuide from 'src/api/privateGuide';
import weixinCode from './images/weixin.png';
import './index.less';

const LicenseVersions = [_l('社区版'), _l('标准版'), _l('企业版'), _l('大型企业版')];

const formatDate = date => {
  const year = moment(date).format('YYYY');
  if (year == 9999) {
    return _l('永久');
  }
  return moment(date).format('YYYY/MM/DD');
};

const isEfficacy = time => {
  let expirationDate = moment(time).add(1, 'd');
  return moment(expirationDate).isBefore(moment());
};

class Projects extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      confirmVisible: false,
      projects: [],
      loading: true,
    }
  }
  getProjects() {
    this.setState({ loading: true });
    privateGuide.getProjects().then(result => {
      this.setState({
        loading: false,
        projects: result.map(item => {
          if (item.isBind) {
            item.disabled = true;
          }
          return item;
        })
      });
    });
  }
  changeBind = (project) => {
    const { projects } = this.state;
    const newProjects = projects.map(item => {
      if (item.projectId === project.projectId) {
        item.isBind = !project.isBind;
      }
      return item;
    });
    this.setState({
      newProjects: projects,
    });
  }
  handleSave = () => {
    this.setState({ confirmVisible: true });
    Dialog.confirm({
      title: _l('您确认要关联新组织吗 ？'),
      description: _l('关联后会占用租户名额，且不可取消'),
      onOk: () => {
        const { projects } = this.state;
        const projectIds = projects.filter(item => item.isBind).map(item => item.projectId);
        privateGuide.bindProject({
          projectIds,
        }).then(result => {
          if (result) {
            alert(_l('关联成功'), 1);
            this.setState({ visible: false });
          } else {
            alert(_l('关联失败'), 2);
          }
        });
      },
      onCancel: () => {
        this.setState({ confirmVisible: false });
      }
    });
  }
  handlePopupVisibleChange = visible => {
    const { usable } = this.props;
    if (!usable || this.state.confirmVisible) return;
    this.setState({ visible });
    if (visible) {
      this.getProjects();
    }
  }
  renderProjectPopup = () => {
    const { projects, loading } = this.state;
    return (
      <div className="card z-depth-2 privateDeploymentProjectPopup flexColumn">
        <div className="Font20 Gray bold">{_l('关联组织')}</div>
        <div className="Gray_75 mTop5 mBottom5">{_l('关联后会占租户名额，且不可取消')}</div>
        <div className="flex projectWrapper">
          {
            loading ? (
              <div className="mTop5"><LoadDiv size="small" /></div>
            ) : (
              projects.map(item => (
                <div
                  key={item.projectId}
                  className="projectItme projectItmeActive flexRow valignWrapper"
                  onClick={() => {
                    if (!item.disabled) this.changeBind(item);
                  }}
                >
                  <Checkbox checked={item.isBind} value={item.projectId} />
                  <span className="flex overflow_ellipsis">{item.companyName}</span>
                </div>
              ))
            )
          }
        </div>
        <div className="btnWrapper">
          <Button type="link" onClick={() => { this.setState({ visible: false }) }}>{_l('取消')}</Button>
          <Button type="primary" onClick={this.handleSave}>{_l('确认')}</Button>
        </div>
      </div>
    );
  }
  render() {
    const { usable } = this.props;
    const { visible } = this.state;
    return (
      <Trigger
        zIndex={100}
        popupVisible={visible}
        onPopupVisibleChange={this.handlePopupVisibleChange}
        action={['click']}
        popup={this.renderProjectPopup()}
        popupAlign={{
          offset: [0, 7],
          points: ['tl', 'bl'],
          overflow: {
            adjustX: true,
            adjustY: true,
          },
        }}
      >
        <div className={cx({pointer: usable})}>
          <span className={cx({associated: usable})}>{_l('关联')}</span>
        </div>
      </Trigger>
    );
  }
}

export default class privateDeployment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: 'sys',
      licenseList: [],
      listLoading: true,
      privateKeyDialogVisible: false,
      emailDialogVisible: false,
      messageDialogVisible: false,
      customConfigDialogVisible: false,
      detailedDialogVisible: false,
      dataRestrictionVisible: false,
      serverStateDialogVisible: false,
      installCaptainDialogVisible: false,
      sourceListSettingsDialogVisible: false,
      licenseCode: '',
      verifyLicenseCode: '',
      loading: false,
      prompt: '',
      serverInfo: null,
    };
  }
  componentDidMount() {
    this.getServerLicenseList();
  }
  getServerLicenseList() {
    this.setState({ listLoading: true });
    privateGuide.getServerLicenseList().then(result => {
      this.setState({
        licenseList: result,
        listLoading: false,
      });
    });
    privateGuide.getServerInfo().then(result => {
      this.setState({
        serverInfo: result,
      });
    });
  }
  handleSetVisible = (visible, targetIndex) => {
    const { licenseList } = this.state;
    this.setState({
      licenseList: licenseList.map((item, index) => {
        if (index === targetIndex) {
          item.visible = !visible;
        }
        return item;
      }),
    });
  };
  handleSetTab = tab => {
    this.setState({ tab });
  };
  handleChangeState = (licenseCode, state, isEfficacyVlaue) => {
    if (state == 1 || isEfficacyVlaue) {
      return;
    }
    privateGuide
      .enableLicenseCode({
        licenseCode,
      })
      .then(result => {
        if (result) {
          const { licenseList } = this.state;
          this.setState({
            licenseList: licenseList.map(item => {
              if (item.licenseCode === licenseCode) {
                item.state = 1;
              } else {
                item.state = -1;
              }
              return item;
            }),
          });
        }
      });
  };
  handleAddPrivateKey = () => {
    const { licenseCode, loading } = this.state;
    if (_.isEmpty(licenseCode)) {
      this.setState({
        prompt: _l('请输入密钥'),
        verifyLicenseCode: '',
      });
      return;
    }
    if (loading) return;
    this.setState({ loading: true, verifyLicenseCode: '', prompt: '' });
    privateGuide.bindLicenseCode({
      licenseCode,
    }).then(result => {
      this.setState({ verifyLicenseCode: result, loading: false });
      if (result) {
        alert(_l('添加成功'));
        this.getServerLicenseList();
        this.setState({ privateKeyDialogVisible: false, licenseCode: '', verifyLicenseCode: '' });
      }
    }).fail(error => {
      this.setState({ loading: false, prompt: error.errorMessage });
    });
  }
  renderPrivateKeyDialog() {
    const { licenseCode, loading, verifyLicenseCode, prompt } = this.state;
    return (
      <Dialog
        visible={true}
        anim={false}
        title={_l('添加密钥')}
        width={560}
        onOk={this.handleAddPrivateKey}
        onCancel={() => {
          this.setState({ privateKeyDialogVisible: false });
        }}
      >
        <div className="mBottom10">
          <span className="Gray_75 Font16">{_l('请输入您的密钥')}</span>
          <span className="Red Font14">{_l('（添加后请注意关联组织）')}</span>
        </div>
        <Textarea
          value={licenseCode}
          onChange={value => {
            this.setState({ licenseCode: value });
          }}
        />
        {
          loading ? (
            <div className="flexRow verifyInfo Gray_75 mBottom10">
              <LoadDiv size="small" />
              {_l('正在验证您的产品密钥')}
            </div>
          ) : (
            (_.isBoolean(verifyLicenseCode) && !verifyLicenseCode) && <div className="mBottom10 Red">{_l('密钥验证失败, 请重新填写')}</div>
          )
        }
        {prompt ? <div className="mBottom10 Red">{prompt}</div> : null}
      </Dialog>
    );
  }
  renderEmailDialog() {
    return (
      <EmailDialog
        onCancel={() => {
          this.setState({ emailDialogVisible: false });
        }}
      />
    );
  }
  renderDataRestrictionDialog() {
    return (
      <DataRestrictionDialog
        onCancel={() => {
          this.setState({ dataRestrictionVisible: false });
        }}
      />
    );
  }
  renderServerStateDialog() {
    return (
      <ServerStateDialog
        onCancel={() => {
          this.setState({ serverStateDialogVisible: false });
        }}
      />
    );
  }
  renderInstallCaptainDialog() {
    return (
      <InstallCaptainDialog
        onCancel={() => {
          this.setState({ installCaptainDialogVisible: false });
        }}
      />
    );
  }
  renderDetailedDialog() {
    const { serverInfo } = this.state;
    return (
      <Dialog
        className="privateDeploymentDetailedDialog"
        visible={true}
        anim={false}
        width={415}
        onCancel={() => {
          this.setState({ detailedDialogVisible: false });
        }}
      >
        <div className="Gray Font14 mBottom10">{_l('服务器 id')}</div>
        <div className="Font14 flexRow valignWrapper">
          <span className="Gray_75">{serverInfo.serverId}</span>
          <ClipboardButton
            className="Font14 copy"
            component="span"
            data-clipboard-text={serverInfo.serverId}
            onSuccess={() => {
              alert(_l('复制成功'));
            }}
          >
            {_l('复制')}
          </ClipboardButton>
        </div>
        <div className="Gray Font14 mBottom10 mTop30">{_l('密钥版本')}</div>
        <div className="Gray_75 Font14">{serverInfo.licenseTemplateVersion}</div>
      </Dialog>
    );
  }
  renderLicenseItem(item, index) {
    const { serverId, licenseCode, startDate, expirationDate, licenseVersion, visible, state, technicalSupport, projectNum, projectUserNum, applicationNum, workflowNum, worktableNum, worktableRowNum } = item;
    const isEfficacyVlaue = isEfficacy(expirationDate);
    return (
      <Fragment key={index}>
        <div className="flexRow companyItem">
          <div className="flex flexRow valignWrapper">
            <Icon
              icon={visible ? 'expand_more' : 'navigate_next'}
              className="Gray_9e Font18 pointer"
              onClick={() => {
                this.handleSetVisible(visible, index);
              }}
            />
            <Radio
              className="mLeft10 mRight0"
              value={index.toString()}
              checked={state == 1}
              onClick={() => {
                this.handleChangeState(licenseCode, state, isEfficacyVlaue);
              }}
            />
            {isEfficacyVlaue ? (
              <span className="Gray_75">{_l('已失效')}</span>
            ) : state == 1 ? (
              <span className="start">{_l('生效中')}</span>
            ) : (
              <span className="Gray_75">{_l('未生效')}</span>
            )}
          </div>
          <div className="flex flexRow valignWrapper">
            <span className="mLeft5 serverId">{LicenseVersions[licenseVersion]}</span>
          </div>
          <div className="flex flexRow valignWrapper">{formatDate(startDate)}</div>
          <div className="flex flexRow valignWrapper">{formatDate(expirationDate)}</div>
          <div className="flex flexRow valignWrapper">{technicalSupport ? formatDate(technicalSupport) : '--'}</div>
          <div className="flex flexRow valignWrapper">{ projectNum == 2147483647 ? '不限' : projectNum }</div>
          <div className="flex flexRow valignWrapper">{ projectUserNum == 2147483647 ? '不限' : projectUserNum }</div>
          <div className="flex flexRow valignWrapper">{ applicationNum == 2147483647 ? '不限' : applicationNum }</div>
          <div className="flex flexRow valignWrapper">{ worktableNum == 2147483647 ? '不限' : worktableNum }</div>
          <div className="flex flexRow valignWrapper">{ worktableRowNum == 2147483647 ? '不限' : worktableRowNum }</div>
          <div className="flex flexRow valignWrapper">{ workflowNum == 1000000 ? '不限' : workflowNum }</div>
          <div className="flex flexRow valignWrapper">
            <Projects usable={!isEfficacyVlaue && state == 1} />
          </div>
        </div>
        {visible && (
          <div className="flexColumn valignWrapper companyPrivateKeyItem">
            <div className="flex flexRow w100 mBottom10">
              <div className="Gray_75 mBottom5 mRight5">{_l('服务器ID')}：</div>
              <div className="flex">{serverId}</div>
            </div>
            <div className="flex flexRow w100">
              <div className="Gray_75 mBottom5 mRight5">{_l('产品密钥')}</div>
              <div className="flex Relative">
                <Textarea minHeight={90} readOnly defaultValue={licenseCode} />
                <Tooltip text={<span>{_l('复制')}</span>} popupPlacement="bottom">
                  <div className="copyWrapper">
                    <ClipboardButton
                      component="div"
                      data-clipboard-text={licenseCode}
                      onSuccess={() => {
                        alert(_l('复制成功'));
                      }}
                    >
                      <Icon icon="content-copy" className="pointer Gray_75 Font16" />
                    </ClipboardButton>
                  </div>
                </Tooltip>
              </div>
            </div>
          </div>
        )}
      </Fragment>
    );
  }
  renderSystemSetting() {
    return (
      <div className="systemSettingInfo">
        <div
          className="flexRow sysItem pointer"
          onClick={() => {
            this.setState({ emailDialogVisible: true });
          }}
        >
          <div>
            <div className="Font17 bold mBottom2">{_l('邮件服务设置')}</div>
            <div className="Gray_9e">
              {_l('设置后系统内邮件相关功能均可正常使用')}{'，'}
              <a className="pointer" onClick={(e) => { e.stopPropagation(); }}
                href='https://docs.pd.mingdao.com/faq/email.html' target="_blank">
                {_l('查看配置说明')}
              </a>
            </div>
          </div>
          <div>
            <Icon className="Font20 Gray_9e" icon="navigate_next" />
          </div>
        </div>
        <div
          className="flexRow sysItem pointer"
          onClick={() => {
            this.setState({ messageDialogVisible: true });
          }}
        >
          <div>
            <div className="Font17 bold mBottom2">{_l('短信服务设置')}</div>
            <div className="Gray_9e">
              {_l('设置后可发送验证码类型短信')}{'，'}
              <a className="pointer" onClick={(e) => { e.stopPropagation(); }}
                href='https://docs.pd.mingdao.com/faq/sms.html' target="_blank">
                {_l('查看配置说明')}
              </a>
            </div>
          </div>
          <div>
            <Icon className="Font20 Gray_9e" icon="navigate_next" />
          </div>
        </div>
        <div
          className="flexRow sysItem pointer"
          onClick={() => {
            this.setState({ customConfigDialogVisible: true });
          }}
        >
          <div>
            <div className="Font17 bold mBottom2">{_l('自定义功能设置')}</div>
            <div className="Gray_9e">{_l('可设置功能显示隐藏')}</div>
          </div>
          <div>
            <Icon className="Font20 Gray_9e" icon="navigate_next" />
          </div>
        </div>
        <div
          className="flexRow sysItem pointer"
          onClick={() => {
            this.setState({ dataRestrictionVisible: true });
          }}
        >
          <div>
            <div className="Font17 bold mBottom2">{_l('数据操作设置')}</div>
            <div className="Gray_9e">{_l('可设置批量数据操作上限、附件上传大小、自定义页面统计图刷新时间间隔')}</div>
          </div>
          <div>
            <Icon className="Font20 Gray_9e" icon="navigate_next" />
          </div>
        </div>
        <div
          className="flexRow sysItem pointer"
          onClick={() => {
            this.setState({ sourceListSettingsDialogVisible: true });
          }}
        >
          <div>
            <div className="Font17 bold mBottom2">{_l('资源列表设置')}</div>
            <div className="Gray_9e">{_l('可自定义工作台显示的资源列表项')}</div>
          </div>
          <div>
            <Icon className="Font20 Gray_9e" icon="navigate_next" />
          </div>
        </div>
        <div
          className="flexRow sysItem pointer"
          onClick={() => {
            this.setState({ serverStateDialogVisible: true });
          }}
        >
          <div>
            <div className="Font17 bold mBottom2">{_l('服务状态提醒')}</div>
            <div className="Gray_9e">{_l('可配置 Webhook 地址接受服务状态通知')}</div>
          </div>
          <div>
            <Icon className="Font20 Gray_9e" icon="navigate_next" />
          </div>
        </div>
        {!md.global.Config.IsCluster && (
          <div className="flexRow sysItem">
            <div>
              <div className="Font17 bold mBottom2">{_l('安装管理器')}</div>
              <div className="Gray_9e">
                {_l('升级、重启、访问地址设置等，请访问')}
                <a className="pointer mLeft2 mRight2" href={ md.global.SysSettings.installCaptainUrl || location.protocol + '//' + location.hostname + ':38881/settings' } target="_blank">
                  {_l('安装管理器')}
                </a>
                {_l('进行操作')}{', '}{_l('设置')}
                <a
                  className="pointer mLeft2 mRight2"
                  href="javascript:void(0);"
                  onClick={() => {
                    this.setState({ installCaptainDialogVisible: true });
                  }}
                >
                  {_l('访问地址')}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  renderPrivateKey() {
    const { licenseList, serverInfo, listLoading } = this.state;
    const moreQueryParams = ('&ltv=' + serverInfo.licenseTemplateVersion);
    return (
      <Fragment>
        <div className="personalEntrypointInfo flexRow valignWrapper">
          {_l('密钥是用于激活')}
          <a className="pointer" href="https://www.mingdao.com/privateDeployment.htm" target="_blank">
            {_l('私有部署版本')}
          </a>
          ，{_l('建议您添加私有版微信客服，获得各类支持与问题解答')}
          <Trigger
            action={['hover']}
            popup={<img className="card z-depth-2" style={{ width: 300 }} src={weixinCode} />}
            popupAlign={{
              offset: [0, 7],
              points: ['tc', 'bc'],
              overflow: { adjustX: 1, adjustY: 2 },
            }}
          >
            <div className="addWeiXin pointer">
              <Icon icon="weixin" className="mRight2" />
              {_l('添加微信')}
            </div>
          </Trigger>
        </div>
        <div className="btnWrapper flexRow valignWrapper">
          <div
            className="pointer addPrivateKey"
            onClick={() => {
              this.setState({ privateKeyDialogVisible: true });
            }}
          >
            {_l('添加密钥')}
          </div>
          <div className="detailed" onClick={() => { this.setState({ detailedDialogVisible: true }) }}>{_l('详情')}</div>
        </div>
        <div className="personalEntrypointContent flex flexColumn">
          <div className="flexRow titleWrapper">
            <div className="Bold">{_l('状态')}</div>
            <div className="Bold">{_l('版本')}</div>
            <div className="Bold">{_l('开始时间')}</div>
            <div className="Bold">{_l('到期时间')}</div>
            <div className="Bold">{_l('技术服务到期')}</div>
            <div className="Bold">{_l('组织数')}</div>
            <div className="Bold">{_l('用户数')}</div>
            <div className="Bold">{_l('应用数')}</div>
            <div className="Bold">{_l('工作表数')}</div>
            <div className="Bold">{_l('行记录数/表')}</div>
            <div className="Bold">{_l('工作流执行数/月')}</div>
            <div className="Bold">{_l('关联组织')}</div>
          </div>
          {
            listLoading ? (
              <div className="mTop30"><LoadDiv size="middle" /></div>
            ) : (
              licenseList.length ? (
                <ScrollView className="flex">{licenseList.map((item, index) => this.renderLicenseItem(item, index))}</ScrollView>
              ) : (
                <div className="withoutList flexColumn valignWrapper">
                  <div className="iconWrapper flexRow valignWrapper">
                    <Icon className="Font40" icon="Empty_nokey" />
                  </div>
                  <div className="Gray_75">{_l('暂无密钥')}</div>
                  <div className="mTop30">
                    <a href={`https://www.mingdao.com/register?ReturnUrl=${encodeURIComponent(`/personal?type=privatekey${moreQueryParams}&serverId=${serverInfo.serverId}#apply`)}`}target="_blank" className="applyBtn mRight10">{_l('注册并申请')}</a>
                    <a href={`https://www.mingdao.com/personal?type=privatekey${moreQueryParams}&serverId=${serverInfo.serverId}#apply`} target="_blank" className="applyBtn">{_l('登录并申请')}</a>
                  </div>
                </div>
              )
            )
          }
        </div>
      </Fragment>
    );
  }
  render() {
    const { tab, privateKeyDialogVisible, emailDialogVisible, dataRestrictionVisible, messageDialogVisible, detailedDialogVisible, customConfigDialogVisible, serverStateDialogVisible, installCaptainDialogVisible, sourceListSettingsDialogVisible } = this.state;

    if (messageDialogVisible) {
      return <MessageSettings onClose={() => this.setState({ messageDialogVisible: false })} />;
    }

    if (customConfigDialogVisible) {
      return <CustomConfig onClose={() => this.setState({ customConfigDialogVisible: false })} />
    }

    if (sourceListSettingsDialogVisible) {
      return <SourceListSettings onClose={() => this.setState({ sourceListSettingsDialogVisible: false })} />
    }

    return (
      <div className="privateDeploymentWrapper card overflowHidden mAll15 pAll20 flexColumn">
        <div className="flexRow privateDeploymentHeader">
          <div className="tabs flex flexRow">
            <div
              className={cx('tab pointer', { headerActive: tab == 'sys' })}
              onClick={() => {
                this.handleSetTab('sys');
              }}
            >
              {_l('系统设置')}
            </div>
            <div
              className={cx('tab pointer', { headerActive: tab == 'privateKey' })}
              onClick={() => {
                this.handleSetTab('privateKey');
              }}
            >
              {_l('密钥管理')}
            </div>
          </div>
          <div
            className="paidUpgrade"
            onClick={() => {
              window.open('https://www.mingdao.com/privateDeployment.htm');
            }}
          >
            <Icon icon="enterprise_network" />
            <span>{_l('付费升级')}</span>
          </div>
        </div>
        <div className="content flex flexColumn">{tab === 'sys' ? this.renderSystemSetting() : this.renderPrivateKey()}</div>
        {privateKeyDialogVisible ? this.renderPrivateKeyDialog() : null}
        {detailedDialogVisible ? this.renderDetailedDialog() : null}
        {emailDialogVisible ? this.renderEmailDialog() : null}
        {dataRestrictionVisible ? this.renderDataRestrictionDialog() : null}
        {serverStateDialogVisible ? this.renderServerStateDialog() : null}
        {installCaptainDialogVisible ? this.renderInstallCaptainDialog() : null}
      </div>
    );
  }
}
