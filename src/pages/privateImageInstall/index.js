import React, { Fragment, Component } from 'react';
import { Input, Button, Textarea, LoadDiv } from 'ming-ui';
import DocumentTitle from 'react-document-title';
import privateGuide from 'src/api/privateGuide';
import logo from 'src/pages/emailValidate/logo.png';
import weixinCode from './images/weixin.png';
import './index.less';
import 'src/common/mdcss/Themes/theme.less';
import { encrypt, getRequest } from 'src/util';
import RegExpValidator from 'src/util/expression';
import { createRoot } from 'react-dom/client';

class PrivateImageInstall extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stepResult: {},
      licenseCode: '',
      verifyLicenseCode: true,
      loading: false,
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      projectName: '',
      prompt: '',
      namePrompt: '',
      emailPrompt: '',
      passwordPrompt: '',
      projectNamePrompt: '',
    };
  }
  componentDidMount() {
    privateGuide.getGuideStepStatus().then(result => {
      this.setState({
        stepResult: result,
      });
    });
  }
  handleBindLicenseCode = () => {
    const { licenseCode, stepResult } = this.state;

    if (_.isEmpty(licenseCode)) {
      this.setState({
        prompt: _l('请输入密钥'),
        loading: false,
      });
      return;
    }

    this.setState({ loading: true, verifyLicenseCode: true, prompt: '' });

    privateGuide
      .bindLicenseCode({
        licenseCode,
      })
      .then(result => {
        this.setState({
          verifyLicenseCode: result,
        });
        if (result) {
          this.setState({ loading: false });
          this.setState({
            stepResult: Object.assign(stepResult, { createdLicenseCode: true }),
          });
        }
      });
  };
  handleCreateAdmin = () => {
    const { name, email, password, confirmPassword, stepResult, loading } = this.state;

    if (loading) return;

    if (_.isEmpty(name)) {
      this.setState({ namePrompt: _l('请输入姓名') });
      return;
    } else {
      this.setState({ namePrompt: '' });
    }

    if (_.isEmpty(email)) {
      this.setState({ emailPrompt: _l('请输入邮箱') });
      return;
    } else if (!RegExpValidator.isEmail(email)) {
      this.setState({ emailPrompt: _l('请输入正确的邮箱') });
      return;
    } else {
      this.setState({ emailPrompt: '' });
    }

    if (_.isEmpty(password)) {
      this.setState({ passwordPrompt: _l('请输入密码') });
      return;
    } else {
      if (confirmPassword) {
        if (password !== confirmPassword) {
          this.setState({ passwordPrompt: _l('密码不一致，请重新输入') });
          return;
        }
      } else {
        this.setState({ passwordPrompt: _l('请输入确认密码') });
        return;
      }
      this.setState({ passwordPrompt: '' });
    }

    this.setState({ loading: true });
    privateGuide
      .addAdmin({
        name,
        email,
        password: encrypt(password),
      })
      .then(result => {
        this.setState({
          loading: false,
          stepResult: Object.assign(stepResult, { createdAdmin: true }),
        });
      })
      .catch(error => {
        this.setState({ loading: false });
      });
  };
  handleCreatedProject = () => {
    const { projectName, stepResult, loading } = this.state;

    if (loading) return;

    if (_.isEmpty(projectName)) {
      this.setState({ projectNamePrompt: _l('请输入企业名称') });
      return;
    } else {
      this.setState({ projectNamePrompt: '' });
    }

    this.setState({ loading: true });
    privateGuide
      .addProject({
        name: projectName,
      })
      .then(result => {
        this.setState({
          loading: false,
          stepResult: Object.assign(stepResult, { createdProject: true }),
        });
      })
      .catch(error => {
        this.setState({ loading: false });
      });
  };
  renderContent() {
    const { stepResult } = this.state;

    if (_.isEmpty(stepResult)) {
      return this.renderLoading();
    }

    if (stepResult.createdProject) {
      return this.renderCompleteInstall();
    }
    if (stepResult.createdAdmin) {
      return this.renderCreatedProject();
    }
    if (stepResult.createdLicenseCode) {
      return this.renderCreatedAdmin();
    }

    return this.renderYourprivatekey();
  }
  renderLoading() {
    return (
      <div className="body loading">
        <LoadDiv size="middle" />
      </div>
    );
  }
  renderYourprivatekey() {
    const { stepResult, licenseCode, verifyLicenseCode, loading, prompt } = this.state;
    const { channel } = getRequest();

    let moreQueryParams = '';
    // 来源
    if (channel) {
      moreQueryParams += '&channel=' + channel;
    }

    // 系统版本
    if (stepResult.systemVersion) {
      moreQueryParams += '&v=' + stepResult.systemVersion;
    }

    // 密钥版本
    if (stepResult.licenseTemplateVersion) {
      moreQueryParams += '&ltv=' + stepResult.licenseTemplateVersion;
    }

    const url = `<a href="https://www.mingdao.com/register?ReturnUrl=${encodeURIComponent(
      `/personal?type=privatekey${moreQueryParams}&serverId=${stepResult.serverId}#apply`,
    )}" target="_blank" class="applyPrivatekey">${_l('立即注册')}</a>`;

    return (
      <div className="body yourprivatekeyBody">
        <div className="title">{_l('请输入您的密钥')}</div>
        <div className="flexRow alignItemsCenter Font17 Gray_9e mBottom30">
          <div>{_l('服务器 ID')}：</div>
          <div className="value">{stepResult.serverId}</div>
        </div>
        <Button
          className="applyKey mBottom10"
          type="ghostgray"
          size="large"
          onClick={() => {
            window.open(
              `https://www.mingdao.com/personal?type=privatekey${moreQueryParams}&serverId=${stepResult.serverId}#apply`,
            );
          }}
        >
          {_l('申请密钥')}
        </Button>
        <div
          className="info"
          dangerouslySetInnerHTML={{
            __html: _l('申请时需要登录您的 HAP 账号。还没有账号 %0', url),
          }}
        ></div>
        <div className="formItem">
          <div className="label">{_l('请输入密钥')}</div>
          <Textarea
            value={licenseCode}
            onChange={value => {
              this.setState({ licenseCode: value });
            }}
          />
        </div>
        {loading &&
          (verifyLicenseCode ? (
            <div className="verifyInfo">
              <LoadDiv size="small" />
              {_l('正在验证您的产品密钥')}
            </div>
          ) : (
            <div className="error">{_l('密钥验证失败, 请重新填写')}</div>
          ))}
        {prompt ? <div className="error">{prompt}</div> : null}
        <Button className="btn mTop45" type="primary" size="large" onClick={this.handleBindLicenseCode}>
          {_l('下一步')}
        </Button>
      </div>
    );
  }
  renderCreatedAdmin() {
    const { name, email, password, confirmPassword, namePrompt, emailPrompt, passwordPrompt, loading } = this.state;
    return (
      <div className="body createAdmin">
        <div className="title">{_l('设置管理员账户')}</div>
        <div className="info">{_l('请输入管理员账户信息')}</div>
        <div className="formItem">
          <div className="label">{_l('姓名')}</div>
          <Input
            value={name}
            onChange={name => {
              this.setState({ name });
            }}
          />
          {namePrompt ? <div className="error">{namePrompt}</div> : null}
        </div>
        <div className="formItem">
          <div className="label">{_l('邮箱地址（邮箱作为登录账户）')}</div>
          <Input
            value={email}
            onChange={email => {
              this.setState({ email });
            }}
          />
          {emailPrompt ? <div className="error">{emailPrompt}</div> : null}
        </div>
        <div className="formItem formPassWordItem">
          <div className="flex password">
            <div className="label">{_l('密码')}</div>
            <Input
              type="password"
              value={password}
              onChange={password => {
                this.setState({ password });
              }}
            />
          </div>
          <div className="flex confirmPassword">
            <div className="label">{_l('确认密码')}</div>
            <Input
              type="password"
              value={confirmPassword}
              onChange={confirmPassword => {
                this.setState({ confirmPassword });
              }}
            />
          </div>
        </div>
        {passwordPrompt ? <div className="error">{passwordPrompt}</div> : null}
        <Button className="btn mTop45" type="primary" size="large" onClick={this.handleCreateAdmin}>
          {loading ? <LoadDiv className="whiteLoad" size="small" /> : _l('下一步')}
        </Button>
      </div>
    );
  }
  renderCreatedProject() {
    const { projectName, projectNamePrompt, loading } = this.state;
    return (
      <div className="body createProject">
        <div className="title">{_l('企业名称')}</div>
        <div className="info">{_l('创建组织后可以邀请团队成员加入')}</div>
        <div className="formItem">
          <div className="label">{_l('企业名称')}</div>
          <Input
            value={projectName}
            onChange={projectName => {
              this.setState({ projectName });
            }}
          />
        </div>
        {projectNamePrompt ? <div className="error">{projectNamePrompt}</div> : null}
        <Button className="btn mTop45" type="primary" size="large" onClick={this.handleCreatedProject}>
          {loading ? <LoadDiv className="whiteLoad" size="small" /> : _l('下一步')}
        </Button>
      </div>
    );
  }
  renderCompleteInstall() {
    return (
      <div className="body completeInstall">
        <img src={weixinCode} className="weixinCode" />
        <div className="title">{_l('太棒了！ 您完成了安装')}</div>
        <div className="info">{_l('建议您扫码注册并收藏工单系统，获得各类支持与问题解答')}</div>
        <Button
          className="btn mTop45"
          type="primary"
          size="large"
          onClick={() => {
            location.href = '/dashboard';
          }}
        >
          {_l('完成')}
        </Button>
      </div>
    );
  }
  render() {
    return (
      <Fragment>
        <DocumentTitle title={_l('HAP 私有部署版')} />
        <div className="header">
          <div>
            <img src={logo} />
          </div>
          <div className="text">{_l('HAP 私有部署版')}</div>
        </div>
        {this.renderContent()}
      </Fragment>
    );
  }
}

const root = createRoot(document.getElementById('app'));

root.render(<PrivateImageInstall />);
