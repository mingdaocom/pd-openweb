import React from 'react';
import Clipboard from 'react-clipboard.js';
import copy from 'copy-to-clipboard';
import Ajax from 'src/api/workWeiXin';
import { LoadDiv } from 'ming-ui';
import { compareProps } from 'pages/PageHeader/util.js';
import fsImg1 from './img/1.png';
import fsImg2 from './img/2.png';
import fsImg3 from './img/3.png';
import fsImg3_1 from './img/3_1.png';
import fsImg4 from './img/4.png';
import fsImg5 from './img/5.png';
import fsImg6 from './img/6.png';
import fsImg7 from './img/7.png';
import fsImg8 from './img/8.png';
import scan1 from '../../workwx/workwxSyncCourse/img/scan1.png';
import scan2 from './img/scan2.png';
import scan4 from './img/scan4.png';
import scan5 from './img/scan5.png';
import './style.less';
import moment from 'moment';

export default class WorkwxSyncCourse extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      homeUrl: '',
      loading: true,
      scanSafeDomain: '',
    };
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
        const { homeUrl, scanSafeDomain } = result;
        this.setState({
          loading: false,
          homeUrl,
          scanSafeDomain,
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
          <img src={fsImg1} />
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
          <img src={fsImg2} />
          <h3 className="Font18 Gray mTop40">{_l('3. 配置对接信息')}</h3>
          <p className="Font14 Gray_75 mTop24 LineHeight22">{_l('1.进入自建应用，将我们提供的主页地址填入三个字段')}</p>
          <p className="Font14 Gray_75 mTop10 LineHeight22 mLeft15">
            {_l('a.“应用功能 - 网页”，先启用网页，然后填写桌面端及移动端主页')}
          </p>
          <p className="Font14 Gray_75 mTop10 LineHeight22 mLeft15">{_l('b.“安全设置”，填写重定向URL')}</p>
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
          <p className="Font14 Gray_75 mTop24 LineHeight22">{_l('注：复制上方内容，三处保持一致即可')}</p>
          <img src={fsImg3} />
          <img src={fsImg3_1} />
          <p className="Font14 Gray_75 mTop24 LineHeight22">
            {_l('2.切换到“机器人”，启用机器人功能，这样在飞书消息测就能直接收到内部的流程、应用消息')}
          </p>
          <img src={fsImg4} />
          <p className="Font14 Gray_75 mTop24 LineHeight22">{_l('3. 前往“权限管理”，开启所需的七个权限')}</p>
          <ul className="mLeft15">
            <li className="mTop5">{_l('a.获取应用信息')}</li>
            <li className="mTop5">{_l('b.获取通讯录基本信息')}</li>
            <li className="mTop5">{_l('c.获取通讯录部门组织架构信息')}</li>
            <li className="mTop5">{_l('d.获取部门基础信息')}</li>
            <li className="mTop5">{_l('e.获取部门组织架构信息')}</li>
            <li className="mTop5">{_l('f.获取用户组织架构信息')}</li>
            <li className="mTop5">{_l('g.获取用户基本信息')}</li>
            <li className="mTop5">{_l('h.获取用户邮箱信息')}</li>
            <li className="mTop5">{_l('i.获取用户受雇信息')}</li>
            <li className="mTop5">{_l('j.获取用户 user ID')}</li>
            <li className="mTop5">{_l('k.获取用户手机号')}</li>
            <li className="mTop5">{_l('l.以应用的身份发消息')}</li>
            <li className="mTop5">{_l('m.给多个用户批量发消息')}</li>
          </ul>
          <img src={fsImg5} />
          <p className="Font14 Gray_75 mTop24 LineHeight22">
            {_l('4.前往“版本管理与发布”，点击创建版本，填写版本详情。注：可用性状态决定了组织架构同步的范畴')}
          </p>
          <img src={fsImg6} />
          <p className="Font14 Gray_75 mTop24 LineHeight22">{_l('5.保存后，申请发布，可通知管理员审核发布即可')}</p>
          <img src={fsImg7} />
          <h3 className="Font18 Gray mTop40">{_l('4. 如何获取App ID和App Secret')}</h3>
          <p className="Font14 Gray_75 mTop24 LineHeight22">
            {_l('“凭证与基础信息”可以查看该App的ID和Secret；回到该系统管理后台，下一步录入信息将会用到')}
          </p>
          <img src={fsImg8} />
        </div>
      </React.Fragment>
    );
  };

  renderScanContent = () => {
    const { scanSafeDomain } = this.state;

    return (
      <div className="scanWorkwx" style={{ height: 2240 }}>
        <h3 className="Font18 Gray mTop40">{_l('飞书扫码登录（可选）')}</h3>
        <p className="mTop24">{_l('开启后，在二级域名下使用钉钉扫一扫，直接登录')}</p>
        <p className="Font14 Gray_75 mTop20 LineHeight22">{_l('1.设置二级域名')}</p>
        <p className="mTop10">{_l('如果您还没有申请二级域名，请前往 组织 — 组织信息 — 二级域名 处进行配置。')}</p>
        <img src={scan1} />
        <p className="Font14 Gray_75 mTop24 LineHeight22">{_l('2.添加重定向 URL')}</p>
        <div className="inputList mTop20">
          <span className="inputTitle">{_l('重定向 URL')}</span>
          <input type="text" className="inputBox" readOnly value={scanSafeDomain} />
          <span
            className="copyBtn"
            onClick={() => {
              copy(scanSafeDomain);
              alert(_l('已经复制到粘贴板，你可以使用Ctrl+V 贴到需要的地方去了哦'));
            }}
          >
            {_l('复制')}
          </span>
        </div>
        <img src={scan2} />
        <p className="Font14 Gray_75 mTop24 LineHeight22">{_l('3.启用该功能')}</p>
        <p className="mTop10">{_l('回到组织管理后台的飞书对接部分，开启第四步的功能开关')}</p>
        <img src={scan4} />
        <p className="mTop24">{_l('完成后，从二级域名下登录，点击飞书的图标，扫一扫即可')}</p>
        <img src={scan5} />
      </div>
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
      <div className="dingSyncCourseWrap">
        <div className="feishuSyncBox card">
          <h1 className="Gray">{_l('获取对接信息')}</h1>
          {this.renderDing()}
          {this.renderScanContent()}
        </div>
      </div>
    );
  }
}
