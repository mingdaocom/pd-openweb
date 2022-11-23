import React from 'react';
import ReactDOM from 'react-dom';
import ChangeLang from 'src/components/ChangeLang';
import Container from './container/registerContainer';
import RegisterName from './container/registerName';
import CreateOrAdd from './container/createOrAdd';
import CreateComp from './container/create';
import createPermissionCheckWrapper from './container/createPermissionCheckWrapper';
import Add from './container/add';
import EditInfo from './container/editInfo';
import InviteLinkExpirate from './container/inviteLinkExpirate';
import RegisterController from 'src/api/register';
import { LoadDiv } from 'ming-ui';
import Config from './config';
import account from 'src/api/account';
import './register.css';
import { getRequest, browserIsMobile, htmlEncodeReg } from 'src/util';
let request = getRequest();
import preall from 'src/common/preall';
import { getDataByFilterXSS } from './util';

const Create = createPermissionCheckWrapper(CreateComp);
class RegisterContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      step: 'register', // 'register'未注册 'registerName'注册填写姓名 'createOrAdd'选择加入或创建网络CreateOrAdd 'create'创建网络 221加入网络输入企业码 222填写网络名片
      registerData: {
        encrypeAccount: '',
        encrypePassword: '',
        onlyRead: false,
        onlyReadName: false,
        dialCode: '',
        warnningData: {},
        loginForAdd: null,
        inviteInfo: [],
        projectId: request.projectId,
        emailOrTel: '', // 邮箱或手机
        verifyCode: '', // 验证码
        password: '', // 8-20位，需包含字母和数字
        fullName: '', // 姓名
        regcode: '', // 企业码
        isApplyJoin: false, // 主动申请加入网络
        company: {
          companyName: '',
          departmentId: '',
          jobId: '', // 加入网络使用
          workSiteId: '',
          jobNumber: '',
          job: '', // 加入网络使用
          email: '', // 邮箱
          scaleId: '', // 预计人数
          code: '',
        },
        confirmation: request.confirmation,
        isLink: location.href.indexOf('linkInvite') >= 0 || location.href.indexOf('join') >= 0,
        inviteFromType: Config.InviteFromType.register,
        sourceId: '',
        userCardFill: null, // 网络名片设置
        TPParams: {
          unionId: '',
          state: '',
          tpType: 0,
        },
        userCard: [],
      },
      logo: '',
      defaultAccountVerifyNextAction: Config.ExistAccountNextActions.createProject,
    };
  }

  componentDidMount() {
    if (md.global.SysSettings.hideRegister && (location.href.indexOf('/register') > -1 || (location.href.toLowerCase().indexOf('linkinvite.htm') > -1 && request.projectId))) {
      alert("系统已关闭注册功能", 3, 3000, function () { location.href = '/login.htm' });
      return;
    }
    $('html').addClass('registerContainerCon');
    if (location.href.indexOf('/enterpriseRegister.htm?type=create') >= 0) {
      document.title = _l('创建组织');
      this.setState(
        {
          step: 'create',
          loading: false,
        },
        () => {
          RegisterController.checkExistAccountByCurrentAccount().then(accountData => {
            if (accountData.actionResult == Config.ActionResult.success) {
              const { user = {} } = accountData;
              const { companyName, fullname, job, email } = user;
              this.setState(
                {
                  registerData: {
                    ...this.state.registerData,
                    company: {
                      ...this.state.registerData.company,
                      // fullname,
                      // companyName,
                      // job, // 加入网络使用
                      email, // 邮箱
                    },
                  },
                },
                () => {
                  this.goRegisterFn();
                },
              );
            }
          });
        },
      );
    } else if (location.href.indexOf('/enterpriseRegister.htm?type=add') >= 0) {
      document.title = _l('加入组织');
      this.setState(
        {
          step: 'add',
          loading: false,
        },
        () => {
          this.goRegisterFn();
        },
      );
    } else if (location.href.indexOf('/enterpriseRegister.htm?type=editInfo') >= 0) {
      document.title = _l('加入组织');
      account
        .checkJoinProjectByTokenWithCard({
          projectId: request.projectId,
          token: request.token,
        })
        .then(data => {
          switch (data.joinProjectResult) {
            case 1: // 验证通过
              let userCard = data.userCard;
              const { user = {} } = userCard;
              const { companyName, fullname, job, email } = user;
              this.setState(
                {
                  loading: false,
                  step: 'editInfo',
                  registerData: {
                    ...this.state.registerData,
                    // inviteAccountId: data.inviteAccountId,
                    userCard,
                    company: {
                      ...this.state.registerData.company,
                      companyName,
                    },
                  },
                },
                () => {
                  this.goRegisterFn();
                },
              );
              break;
            default:
              alert(_l('操作失败'), 2);
          }
        });
    } else {
      document.title = _l('注册');
      this.goRegisterFn();
    }
  }

  goRegisterFn = () => {
    // 注册来源
    var s = request.s || '';
    if (s) {
      safeLocalStorageSetItem('RegFrom', s);
    }

    // 绑定微信帐号
    if (request.unionId && request.state && request.tpType) {
      this.setState({
        registerData: {
          ...this.state.registerData,
          TPParams: {
            unionId: request.unionId,
            state: request.state,
            tpType: parseInt(request.tpType),
          },
        },
      });
    }

    if (request.confirmation) {
      this.setState({
        registerData: {
          ...this.state.registerData,
          confirmation: request.confirmation,
          isApplyJoin: false,
        },
      });
    }

    if (request.code) {
      this.setState({
        registerData: {
          ...this.state.registerData,
          company: {
            ...this.state.registerData.company,
            code: request.code,
          },
        },
      });
    }
    // 如果 url 带 mobile 参数
    const { mobile } = request;
    if (mobile) {
      this.setState({
        registerData: {
          ...this.state.registerData,
          emailOrTel: $.trim(mobile),
        },
      });
    }

    if (
      (getRequest().ReturnUrl || '').indexOf('type=privatekey') > -1 ||
      //url 中的 tpType 参数为 7 或 8 ，则直接进去
      (request.tpType && [7, 8].includes(parseInt(request.tpType)))
    ) {
      this.setState({
        defaultAccountVerifyNextAction: Config.AccountVerifyNextActions.login,
      });
    }

    // 公共链接邀请|手机号邮箱邀请
    if (this.state.registerData.isLink) {
      if (this.state.registerData.confirmation) {
        this.checkInviteLink(
          this.state.registerData.confirmation,
          location.href.indexOf('linkInvite') >= 0,
          (inviteInfo = {}, userCard = {}, logo = '') => {
            let { user = {} } = userCard;
            let { fullname } = user;
            let data = {
              inviteInfo,
              userCard,
              projectId: inviteInfo.sourceId,
              inviteFromType: inviteInfo.fromType,
              fullName: fullname,
              onlyReadName: !!fullname,
              company: {
                ...this.state.registerData.company,
                companyName: inviteInfo.sourceName,
              },
            };
            if (inviteInfo.account) {
              data.emailOrTel = inviteInfo.account;
              data.onlyRead = true;
              data.loginForAdd = !!inviteInfo.isNormal;
            }

            this.setState({
              logo: logo,
              defaultAccountVerifyNextAction:
                inviteInfo.fromType === Config.InviteFromType.project
                  ? Config.AccountVerifyNextActions.userCardInfo
                  : Config.AccountVerifyNextActions.login,
              registerData: {
                ...this.state.registerData,
                ...data,
              },
            });
            this.InviteTitle(inviteInfo);
          },
        );
      } else {
        RegisterController.checkJoinLink({
          projectId: this.state.registerData.projectId,
        }).then(data => {
          this.setState({
            loading: false,
          });
          let actionResult = Config.ActionResult;
          if (data && data.actionResult == actionResult.success) {
            let userCard = data.userCard;
            let inviteInfo = data.inviteInfo;

            this.setState({
              defaultAccountVerifyNextAction: Config.AccountVerifyNextActions.userCardInfo,
              logo: data.logo,
              registerData: {
                ...this.state.registerData,
                inviteInfo,
                isApplyJoin: true,
                userCard,
                company: {
                  ...this.state.registerData.company,
                  companyName: inviteInfo.sourceName,
                },
              },
            });
            this.JoinTitle(inviteInfo.sourceName);
          } else {
            this.setState({
              step: 'inviteLinkExpirate',
            });
          }
        });
      }
    } else {
      this.setState({
        loading: false,
      });
    }
  };

  checkInviteLink = (confirmation, isLink, setFn) => {
    RegisterController.checkInviteLink({
      confirmation: confirmation,
      isLink,
    }).then(data => {
      this.setState({
        loading: false,
      });
      var actionResult = Config.ActionResult;
      if (data && data.actionResult == actionResult.success) {
        setFn(data.inviteInfo, data.userCard, data.logo);
      } else {
        this.setState({
          step: 'inviteLinkExpirate',
        });
      }
    });
  };

  InviteTitle = authInfo => {
    let titleDesc = '';
    let btnNameDesc = '';
    switch (authInfo.fromType) {
      case Config.InviteFromType.friend:
        titleDesc = _l('成为协作好友');
        btnNameDesc = _l('并加为好友');
        break;
      case Config.InviteFromType.group:
        let groupDesc = authInfo.isPost ? _l('群组') : _l('聊天');
        titleDesc = groupDesc;
        btnNameDesc = _l('并加入') + groupDesc;
        break;
      case Config.InviteFromType.task:
        titleDesc = _l('任务');
        btnNameDesc = _l('并加入任务');
        break;
      case Config.InviteFromType.kc:
        titleDesc = _l('共享文件夹');
        btnNameDesc = _l('并加入共享文件夹');
        break;
      case Config.InviteFromType.project:
        btnNameDesc = _l('并加入这个组织');
        break;
      case Config.InviteFromType.calendar:
        titleDesc = _l('日程');
        btnNameDesc = _l('并加入日程');
        break;
      case Config.InviteFromType.tFolder:
        titleDesc = _l('项目');
        btnNameDesc = _l('并加入项目');
        break;
    }
    this.setState({
      registerData: {
        ...this.state.registerData,
        company: {
          ...this.state.registerData.company,
          titleStr: htmlEncodeReg(authInfo.sourceName) + titleDesc,
        },
      },
    });
    document.title = authInfo.createUserName + _l('邀请您加入') + authInfo.sourceName + titleDesc;
  };

  JoinTitle = companyName => {
    this.setState({
      registerData: {
        ...this.state.registerData,
        company: {
          ...this.state.registerData.company,
          titleStr: companyName,
        },
      },
    });
    document.title = _l('您正在加入') + companyName;
  };

  componentWillUnmount() {
    $('html').removeClass('registerContainerCon');
  }

  changeStep = step => {
    this.setState({
      step,
    });
  };

  // 登录成功跳转
  loginSuc = (encrypeAccount, encrypePassword, createProjectId) => {
    const { registerData } = this.state;
    const { inviteFromType } = registerData;
    let isMobile = browserIsMobile();
    let request = getRequest();
    let returnUrl = getDataByFilterXSS(request.ReturnUrl || '');

    if (returnUrl.indexOf('type=privatekey') > -1) {
      location.href = returnUrl;
    } else {
      location.href = '/app';
    }
  };

  renderCon = () => {
    let pram = {
      defaultAccountVerifyNextAction: this.state.defaultAccountVerifyNextAction,
      projectId: this.state.registerData.projectId,
      step: this.state.step,
      changeStep: this.changeStep,
      registerData: _.cloneDeep(this.state.registerData),
      loginSuc: this.loginSuc,
      onChangeData: (data, callback) => {
        this.setState(
          {
            registerData: {
              ...data,
            },
          },
          () => {
            if (callback) {
              callback();
            }
          },
        );
      },
    };
    switch (this.state.step) {
      case 'register':
        return <Container {...pram} />;
      case 'registerName':
        return <RegisterName {...pram} />;
      case 'createOrAdd':
        return <CreateOrAdd {...pram} />;
      case 'create':
        return <Create {...pram} />;
      case 'add':
        return <Add {...pram} />;
      case 'editInfo':
        return <EditInfo {...pram} />;
      case 'inviteLinkExpirate':
        return <InviteLinkExpirate />;
    }
  };

  render() {
    if (this.state.loading) {
      return <LoadDiv className="" style={{ margin: '50px auto' }} />;
    }
    return (
      <div className="registerBox">
        <div className="registerContainer">
          <div className="titleHeader">
            <img src={md.global.SysSettings.brandLogoUrl} height={40} />
          </div>
          {this.renderCon()}
        </div>
        <ChangeLang />
      </div>
    );
  }
}

const WrappedComp = preall(RegisterContainer, { allownotlogin: true });

ReactDOM.render(<WrappedComp />, document.querySelector('#app'));
