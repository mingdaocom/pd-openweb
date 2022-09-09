import React from 'react';
import { Dialog, Switch, Tooltip, Icon } from 'ming-ui';
import copy from 'copy-to-clipboard';
import './index.less';
import projectSettingController from 'src/api/projectSetting';
import { emitter } from '../../components/departmentView/createBtn';
import { navigateTo } from 'router/navigateTo';
// 新用户加入企业必填字段

class DialogSettingInviteRules extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      regCode: '', //企业号
      projectId: props.projectId,
      rulesData: {
        userAuditEnabled: true, //邀请审核
        allowProjectCodeJoin: true, //搜索加入
        userFillCompanyEnabled: false, //公司
        userFillDepartmentEnabled: false, //部门
        userFillJobEnabled: false, //职位
        userFillWorkSiteEnabled: false, //工作地点
        userFillJobNumberEnabled: false, //工号
      },
    };
  }

  componentDidMount() {
    this.getData();
  }

  getData = () => {
    var param = {
      projectId: this.props.projectId,
    };
    projectSettingController.getPrivacy(param).then(data => {
      this.setState({
        regCode: data.regCode,
        userAuditEnabled: data.userAuditEnabled, //邀请审核
        allowProjectCodeJoin: data.allowProjectCodeJoin, //搜索加入
        userFillCompanyEnabled: data.userFillCompanyEnabled, //公司
        userFillDepartmentEnabled: data.userFillDepartmentEnabled, //部门
        userFillJobEnabled: data.userFillJobEnabled, //职位
        userFillWorkSiteEnabled: data.userFillWorkSiteEnabled, //工作地点
        userFillJobNumberEnabled: data.userFillJobNumberEnabled, //工号
      });
    });
  };

  tipAnimation = $elem => {
    $elem.show();
  };

  render() {
    const { showDialogSettingInviteRules, setValue, updateType, dispatch, projectId } = this.props;
    return (
      <Dialog
        title={_l('人员加入规则设置')}
        okText={_l('保存')}
        cancelText={_l('取消')}
        className="showRulesDialog"
        onCancel={() => {
          setValue({
            showDialogSettingInviteRules: false,
          });
        }}
        onOk={() => {
          projectSettingController
            .setPrivacys({
              projectId: this.props.projectId,
              settings: [
                {
                  setting: 'projectUserAuditEnabled',
                  settingValue: this.state.userAuditEnabled, //邀请审核
                },
                {
                  setting: 'allowProjectCodeJoin',
                  settingValue: this.state.allowProjectCodeJoin, //搜索加入
                },
                {
                  setting: 'userFillCompanyEnabled',
                  settingValue: this.state.userFillCompanyEnabled, //公司
                },
                {
                  setting: 'userFillDepartmentEnabled',
                  settingValue: this.state.userFillDepartmentEnabled, //部门
                },
                {
                  setting: 'userFillJobEnabled',
                  settingValue: this.state.userFillJobEnabled, //职位
                },
                {
                  setting: 'userFillWorkSiteEnabled',
                  settingValue: this.state.userFillWorkSiteEnabled, //工作地点
                },
                {
                  setting: 'userFillJobNumberEnabled',
                  settingValue: this.state.userFillJobNumberEnabled, //工号
                },
              ],
            })
            .then(
              res => {
                // 1: 成功 2：失败 3：失败，部门数量必须大于0， 4：失败，工作点数量必须大于0
                // 现在返回 4 也的示成功 5 ：失败，职位的数量必须大于0
                switch (res) {
                  case 1:
                    setValue({
                      showDialogSettingInviteRules: false,
                    });
                    alert(_l('保存成功'));
                    break;
                  case 2:
                    setValue({
                      showDialogSettingInviteRules: false,
                    });
                    alert(_l('保存失败'), 2);
                    break;
                  case 3:
                    // 没有部门
                    alert(_l('尚未配置部门，请前往创建'), 3);
                    this.tipAnimation($('.warnTip.dept'));
                    break;
                  case 4:
                    // 没有工作地点
                    alert(_l('尚未配置工作地点，请前往创建'), 3);
                    this.tipAnimation($('.warnTip.workSite'));
                    break;
                  case 5:
                    // 没有职位
                    alert(_l('尚未配置职位'), 3);
                    // this.tipAnimation($('.warnTip.profession'));
                    break;
                  default:
                    break;
                }
              },
              () => {
                alert(_l('保存失败'), 2);
              },
            );
        }}
        visible={showDialogSettingInviteRules}
      >
        <div className="listBox">
          <h3>{_l('人员加入审核')}</h3>
          <div className="listText">
            <span className="iconBox">
              <Tooltip text={<span>{_l('开启后需要审核，关闭后不需要')}</span>} action={['hover']}>
                <span>
                  <Switch
                    checked={this.state.userAuditEnabled}
                    onClick={() => {
                      this.setState({
                        userAuditEnabled: !this.state.userAuditEnabled,
                      });
                    }}
                  />
                </span>
              </Tooltip>
            </span>
            <span className="text">
              <p className="Gray Font13">
                {_l('邀请审核')}
                <Tooltip
                  text={
                    <span>
                      {_l(
                        '通过邀请链接、搜索企业号的方式加入企业网络，默认均需要管理员审核；企业网络管理员通过手机或邮箱邀请用户加入网络无需审批',
                      )}
                    </span>
                  }
                  action={['hover']}
                >
                  <span>
                    <Icon className="Font14 Hand Gray_bd mLeft5" icon="help" />
                  </span>
                </Tooltip>{' '}
              </p>
              <p className="Gray_9e Font13 mTop13">{_l('非管理员通过邮箱或手机号邀请他人加入组织是否需要审核')}</p>
            </span>
          </div>
        </div>
        <div className="listBox borderTopLine">
          <h3>{_l('搜索加入')}</h3>
          <div className="listText">
            <span className="iconBox">
              {/* <Tooltip text={<span>{_l('开启时需要审核，关闭后不需要')}</span>} action={['hover']}>
              <span> */}
              <Switch
                checked={this.state.allowProjectCodeJoin}
                onClick={() => {
                  this.setState({
                    allowProjectCodeJoin: !this.state.allowProjectCodeJoin,
                  });
                }}
              />
              {/* </span>
            </Tooltip> */}
            </span>
            <span className="text">
              <p className="Gray Font13">
                {_l('组织门牌号 %0', this.state.regCode)}
                <span
                  className="copyBtn Gray_75 Hand mLeft15 regCode"
                  onClick={() => {
                    copy(this.state.regCode);
                    alert(_l('已复制到剪切板'));
                  }}
                >
                  {_l('复制')}
                </span>
              </p>
              <p className="Gray_9e Font13 mTop13">{_l('开启后允许通过搜索组织门牌号到组织')}</p>
            </span>
          </div>
          <div className="listBox borderTopLine">
            <h3>{_l('人员加入组织需要填写的信息')}</h3>
            <p className="Gray_9e Font13 mTop12">{_l('开启后成员加入组织时则需要填写')}</p>
            <div className="listText">
              <span className="iconBox">
                <Tooltip text={<span>{_l('开启后需要填写，关闭后不需要')}</span>} action={['hover']}>
                  <span>
                    <Switch
                      checked={this.state.userFillCompanyEnabled}
                      onClick={() => {
                        this.setState({
                          userFillCompanyEnabled: !this.state.userFillCompanyEnabled,
                        });
                      }}
                    />
                  </span>
                </Tooltip>
              </span>
              <span className="text">
                <p className="Gray Font13">{_l('组织')}</p>
                <p className="Gray_9e Font13 mTop13">{_l('填写组织信息，默认为当前组织名称')}</p>
              </span>
            </div>
            <div className="listText">
              <span className="iconBox">
                <Tooltip text={<span>{_l('开启后成员可自主选择')}</span>} action={['hover']}>
                  <span>
                    <Switch
                      checked={this.state.userFillDepartmentEnabled}
                      onClick={() => {
                        this.setState({
                          userFillDepartmentEnabled: !this.state.userFillDepartmentEnabled,
                        });
                      }}
                    />
                  </span>
                </Tooltip>
              </span>
              <span className="text">
                <p className="Gray Font13">
                  {_l('部门')}
                  <span className="warnTip dept Hidden">
                    <span className="icon-knowledge-message Red" />
                    <span className="Red">{_l('尚未配置部门')}</span>
                    <span
                      className="Gray_9e Hand"
                      onClick={() => {
                        setValue({
                          showDialogSettingInviteRules: false,
                          ischage: true,
                        });
                        emitter.emit('handleClick');
                      }}
                    >
                      {_l('前往创建')}
                    </span>
                  </span>
                </p>
                <p className="Gray_9e Font13 mTop13">{_l('加入组织需要填写部门')}</p>
              </span>
            </div>
            <div className="listText">
              <span className="iconBox">
                <Tooltip text={<span>{_l('开启后成员可自主选择')}</span>} action={['hover']}>
                  <span>
                    <Switch
                      checked={this.state.userFillJobEnabled}
                      onClick={() => {
                        this.setState({
                          userFillJobEnabled: !this.state.userFillJobEnabled,
                        });
                      }}
                    />
                  </span>
                </Tooltip>
              </span>
              <span className="text">
                <p className="Gray Font13">{_l('职位')}</p>
                <p className="Gray_9e Font13 mTop13">{_l('需要选择职位')}</p>
              </span>
            </div>
            <div className="listText">
              <span className="iconBox">
                <Tooltip text={<span>{_l('开启后成员可自主选择')}</span>} action={['hover']}>
                  <span>
                    <Switch
                      checked={this.state.userFillWorkSiteEnabled}
                      onClick={() => {
                        this.setState({
                          userFillWorkSiteEnabled: !this.state.userFillWorkSiteEnabled,
                        });
                      }}
                    />
                  </span>
                </Tooltip>
              </span>
              <span className="text">
                <p className="Gray Font13">
                  {_l('工作地点')}
                  <span className="warnTip workSite Hidden">
                    <span className="icon-knowledge-message Red" />
                    <span className="Red"> {_l('尚未配置工作地点')}</span>
                    <span
                      className="Gray_9e Hand"
                      onClick={() => {
                        setValue({
                          showDialogSettingInviteRules: false,
                          ischage: true,
                        });
                        navigateTo('/admin/sysinfo/' + projectId);
                      }}
                    >
                      {_l('前往创建')}
                    </span>
                  </span>
                </p>
                <p className="Gray_9e Font13 mTop13">{_l('需要选择工作地点')}</p>
              </span>
            </div>
            <div className="listText">
              <span className="iconBox">
                <Tooltip text={<span>{_l('开启后需要填写，关闭后不需要')}</span>} action={['hover']}>
                  <span>
                    <Switch
                      checked={this.state.userFillJobNumberEnabled}
                      onClick={() => {
                        this.setState({
                          userFillJobNumberEnabled: !this.state.userFillJobNumberEnabled,
                        });
                      }}
                    />
                  </span>
                </Tooltip>
              </span>
              <span className="text">
                <p className="Gray Font13">{_l('工号')}</p>
                <p className="Gray_9e Font13 mTop13">{_l('需要填写工号')}</p>
              </span>
            </div>
          </div>
        </div>
      </Dialog>
    );
  }
}

export default DialogSettingInviteRules;
