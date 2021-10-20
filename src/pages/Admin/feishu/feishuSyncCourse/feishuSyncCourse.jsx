import React from 'react';
import Clipboard from 'react-clipboard.js';
import Ajax from 'src/api/workWeiXin';
import { LoadDiv } from 'ming-ui';
import { compareProps } from 'pages/PageHeader/util.js';
import './style.less';

export default class WorkwxSyncCourse extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      homeUrl: '',
      loading: true,
    }
  }

  componentDidMount() {
    let match = this.props.match;
    if (!match.params.projectId) {
      return;
    }
    Ajax.getFeishuSsoUrlInfo({
      projectId: match.params.projectId,
      apkId: match.params.apkId,
    }).then(result => {
      if (result) {
          this.setState({
            loading: false,
            homeUrl: result
          });
      } else {
        this.setState({
          loading: false,
        });
      }
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return compareProps(this.state, nextState);
  }

  renderDing = () => {
    const { homeUrl } = this.state;
    return (
      <React.Fragment>
        <div>
          <h3 className="Font18 Gray mTop40">{_l('1. 登录飞书开放平台 — 点击“创建应用”')}</h3>
          <img src="/src/pages/Admin/feishu/feishuSyncCourse/img/1.png"/>
          <h3 className="Font18 Gray mTop40">{_l('2. 填写应用信息')}</h3>
          <p className="Font14 Gray_75 mTop24 LineHeight22">
            {_l('选择“企业自建应用”')}
            <br />
            {_l('填入应用名称、应用描述')}
            <br />
            {_l('应用Logo建议：')}
            <a
              className="download"
              target="_blank"
              download={'md' + moment().format('YYYY-MM-DD') + '.png'}
              href={`${md.global.FileStoreConfig.pubHost}logo_app.png`}
            >
              {_l('点击下载')}
            </a>
            <br />
          </p>
          <img src="/src/pages/Admin/feishu/feishuSyncCourse/img/2.png"/>
          <h3 className="Font18 Gray mTop40">{_l('3. 配置对接信息')}</h3>
          <p className="Font14 Gray_75 mTop24 LineHeight22">
            {_l('1.进入自建应用，将我们提供的主页地址填入三个字段')}
          </p>
          <p className="Font14 Gray_75 mTop10 LineHeight22 mLeft15">
            {_l('a.“应用功能 - 网页”，先启用网页，然后填写桌面端及移动端主页')}
          </p>
          <p className="Font14 Gray_75 mTop10 LineHeight22 mLeft15">
            {_l('b.“安全设置”，填写重定向URL')}
          </p>
          <div className="inputList mTop20">
            <span className="inputTitle">{_l('主页地址：')}</span>
            <input type="text" className="inputBox" readOnly value={homeUrl} />
            <Clipboard
              className="copyBtn"
              component="span"
              data-clipboard-text={homeUrl}
              onSuccess={() => {
                alert(_l('已经复制到粘贴板，你可以使用Ctrl+V 贴到需要的地方去了哦'));
              }}
            >
              {_l('复制')}
            </Clipboard>
          </div>
          <p className="Font14 Gray_75 mTop24 LineHeight22">
            {_l('注：复制上方内容，三处保持一致即可')}
          </p>
          <img src="/src/pages/Admin/feishu/feishuSyncCourse/img/3.png" />
          <img src="/src/pages/Admin/feishu/feishuSyncCourse/img/3_1.png" />
          <p className="Font14 Gray_75 mTop24 LineHeight22">{_l('2.切换到“机器人”，启用机器人功能，这样在飞书消息测就能直接收到内部的流程、应用消息')}</p>
          <img src="/src/pages/Admin/feishu/feishuSyncCourse/img/4.png" />
          <p className="Font14 Gray_75 mTop24 LineHeight22">{_l('3. 前往“权限管理”，开启所需的七个权限')}</p>
          <ul className="mLeft15">
            <li className="mTop5">{_l('a.[用户]获取用户邮箱信息')}</li>
            <li className="mTop5">{_l('b.[用户]获取用户手机号')}</li>
            <li className="mTop5">{_l('c.[用户]获取用户userid')}</li>
            <li className="mTop5">{_l('d.[消息]以应用的身份发消息')}</li>
            <li className="mTop5">{_l('e.[消息]给多个用户批量发消息')}</li>
            <li className="mTop5">{_l('f.[通讯录]以应用身份访问通讯录（历史版本）')}</li>
            <li className="mTop5">{_l('g.[应用管理]获取应用信息')}</li>
          </ul>
          <img src="/src/pages/Admin/feishu/feishuSyncCourse/img/5.png" />
          <p className="Font14 Gray_75 mTop24 LineHeight22">{_l('4.前往“版本管理与发布”，点击创建版本，填写版本详情。注：可用性状态决定了组织架构同步的范畴')}</p>
          <img src="/src/pages/Admin/feishu/feishuSyncCourse/img/6.png" />
          <p className="Font14 Gray_75 mTop24 LineHeight22">{_l('5.保存后，申请发布，可通知管理员审核发布即可')}</p>
          <img src="/src/pages/Admin/feishu/feishuSyncCourse/img/7.png" />
          <h3 className="Font18 Gray mTop40">{_l('4. 如何获取App ID和App Secret')}</h3>
          <p className="Font14 Gray_75 mTop24 LineHeight22">{_l('“凭证与基础信息”可以查看该App的ID和Secret；回到该系统管理后台，下一步录入信息将会用到')}</p>
          <img src="/src/pages/Admin/feishu/feishuSyncCourse/img/8.png" />
        </div>
      </React.Fragment>
    );
  };

  render() {
    if (this.state.loading) {
      return (
        <div className="feishuSyncBox card">
          <LoadDiv />
        </div>
      );
    }
    return (
      <div className="feishuSyncBox card">
        <h1 className="Gray">{_l('获取对接信息')}</h1>
        {this.renderDing()}
      </div>
    );
  }
}
