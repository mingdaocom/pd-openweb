import React from 'react';
import Clipboard from 'react-clipboard.js';
import Ajax from 'src/api/workWeiXin';
import { LoadDiv } from 'ming-ui';
import { compareProps } from 'pages/PageHeader/util.js';
import './style.less';
import moment from 'moment';

export default class WorkwxSyncCourse extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      homeUrl: '',
      scanUrl: '',
      loading: true
    }
  }

  componentDidMount() {
    let match = this.props.match;
    if (!match.params.projectId) {
      return;
    }
    Ajax.getWorkWXSsoUrlInfo({
      projectId: match.params.projectId,
      apkId: match.params.apkId,
    }).then(result => {
      if (result) {
          this.setState({
            loading: false,
            domainName: result.item1,
            homeUrl: result.item2,
            scanUrl: result.item5,
          });
          const hash = location.hash.replace('#', '');
          if (['scanWorkwx', 'syncField'].includes(hash)) {
            setTimeout(() => {
              const el = document.querySelector(`.${hash}`) || {};
              document.querySelector('html').scrollTop = el.offsetTop;
            }, 0);
          }
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

  renderScanContent = () => {
    const { scanUrl } = this.state;
    return (
      <div class="scanWorkwx" style={{ height: 1330 }}>
        <h3 className="Font18 Gray mTop40">{_l('企业微信扫码登陆（可选）')}</h3>
        <p className="Font14 Gray_75 mTop24 LineHeight22">{_l('1.填写授权回调域')}</p>
        <p className="mTop10">{_l('回到企业微信管理后台，进入自建应用的“企业微信授权登录”')}</p>
        <img src="/src/pages/Admin/workwx/workwxSyncCourse/img/scan2.png" />
        <p className="Font14 Gray_75 mTop24 LineHeight22">{_l('填写“授权回调域”')}</p>
        <div className="inputList mTop20">
          <span className="inputTitle">{_l('回调域名：')}</span>
          <input type="text" className="inputBox" readOnly value={scanUrl} />
          <Clipboard
            className="copyBtn"
            component="span"
            data-clipboard-text={scanUrl}
            onSuccess={() => {
              alert(_l('已经复制到粘贴板，你可以使用Ctrl+V 贴到需要的地方去了哦'));
            }}
          >
            {_l('复制')}
          </Clipboard>
        </div>
        <img src="/src/pages/Admin/workwx/workwxSyncCourse/img/scan3.png" />
        <p className="Font14 Gray_75 mTop24 LineHeight22">{_l('2.启用该功能')}</p>
        <p className="mTop10">{_l('回到组织管理后台的企业微信对接部分，开启第四步的功能开关')}</p>
        <img src="/src/pages/Admin/workwx/workwxSyncCourse/img/scan4.png" />
        <p className="mTop24">{_l('完成后，从二级域名下登录，点击企业微信的图标，扫一扫即可')}</p>
        <img src="/src/pages/Admin/workwx/workwxSyncCourse/img/scan5.png" />
      </div>
    );
  }

  renderSyncFieldContent = () => {
    return (
      <div className="syncField" style={{ height: 1920 }}>
        <h3 className="Font18 Gray mTop40">{_l('自定义同步字段（可选）')}</h3>
        <p className="mTop24">{_l('完成通讯录同步的基础配置后，可将企业微信用户账号或者企业微信自定义信息字段同步到系统的工号字段')}</p>
        <p className="Font14 Gray_75 mTop20 LineHeight22">{_l('1.什么是“企业微信用户账号”')}</p>
        <p className="mTop10">{_l('前往企微管理后台，可以在 通讯录 - 成员详情 找到企业微信用户账号')}</p>
        <img src="/src/pages/Admin/workwx/workwxSyncCourse/img/syncField1.png" />
        <p className="Font14 Gray_75 mTop24 LineHeight22">{_l('2.什么是“自定义信息字段”')}</p>
        <p className="mTop10">{_l('前往 我的企业 - 通讯录管理，点击“修改”企业内资料展示')}</p>
        <img src="/src/pages/Admin/workwx/workwxSyncCourse/img/syncField2.png" />
        <p className="mTop24">{_l('选择“添加自定义信息”')}</p>
        <img src="/src/pages/Admin/workwx/workwxSyncCourse/img/syncField3.png" />
        <p className="mTop24">{_l('输入自定义字段的名称和英文名称；类型请设为“文本”')}</p>
        <img src="/src/pages/Admin/workwx/workwxSyncCourse/img/syncField4.png" />
        <p className="mTop24">{_l('保存后，回到组织管理后台的企业微信对接部分，输入你的自定义信息字段名称，重新进行数据同步即可。')}</p>
        <img src="/src/pages/Admin/workwx/workwxSyncCourse/img/syncField5.png" />
      </div>
    );
  }

  renderDing = () => {
    const { domainName, homeUrl } = this.state;
    // 图片加载需要时间，固定高度能让 hash 定位到指定的位置
    return (
      <React.Fragment>
        <div style={{ height: 3700 }}>
          <h3 className="Font18 Gray mTop40">{_l('1. 登录企业微信 — 定位到“应用管理”')}</h3>
          <img src="/src/pages/Admin/ding/dingSyncCourse/img/wx/1.png" alt={_l('登录企业微信 — 定位到“应用管理”')} />
          <h3 className="Font18 Gray mTop40">{_l('2. 选择“自建-创建应用”进入新建应用页面')}</h3>
          <img src="/src/pages/Admin/ding/dingSyncCourse/img/wx/2.png" alt={_l('选择“自建-创建应用”进入新建应用页面')} />
          <h3 className="Font18 Gray mTop40">{_l('3. 填写应用信息')}</h3>
          <p className="Font14 Gray_75 mTop24 LineHeight22">
            {_l('填入应用名称')}
            <br />
            {_l('应用Logo建议：')}
            <a
              className="download Hidden"
              target="_blank"
              download={'md' + moment().format('YYYY-MM-DD') + '.png'}
              href={`${md.global.FileStoreConfig.pubHost}logo_app.png`}
            >
              {_l('点击下载')}
            </a>
            <br />
            {_l('选择可见范围后即可创建应用')}
          </p>
          <img src="/src/pages/Admin/ding/dingSyncCourse/img/wx/3.png" alt={_l('填写应用信息')} />
          <h3 className="Font18 Gray mTop40">{_l('4. 继续完善对接信息')}</h3>
          <p className="Font14 Gray_75 mTop24 LineHeight22">
            {_l('1.进入“网页授权及JS-SDK”，输入可信域名（只需填写该项即可）')}
          </p>
          <div className="inputList mTop20">
            <span className="inputTitle">{_l('可信域名：')}</span>
            <input type="text" className="inputBox" readOnly value={domainName} />
            <Clipboard
              className="copyBtn"
              component="span"
              data-clipboard-text={domainName}
              onSuccess={() => {
                alert(_l('已经复制到粘贴板，你可以使用Ctrl+V 贴到需要的地方去了哦'));
              }}
            >
              {_l('复制')}
            </Clipboard>
          </div>
          <p className="Font14 Gray_75 mTop24 LineHeight22">
            {_l('注：设置的可信域名，不能包含协议头，不支持IP地址及短链域名')}
          </p>
          <img src="/src/pages/Admin/ding/dingSyncCourse/img/wx/4.png" alt={_l('继续完善对接信息')} />
          <img src="/src/pages/Admin/ding/dingSyncCourse/img/wx/5.png" alt={_l('继续完善对接信息')} />
          <p className="Font14 Gray_75 mTop24 LineHeight22">{_l('2.点击“应用主页”，填写“网页地址”')}</p>
          <div className="inputList mTop20">
            <span className="inputTitle">{_l('应用主页：')}</span>
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
          <img src="/src/pages/Admin/ding/dingSyncCourse/img/wx/6.png" alt={_l('点击“应用主页”，填写“网页地址”')} />
          <img src="/src/pages/Admin/ding/dingSyncCourse/img/wx/7.png" alt={_l('点击“应用主页”，填写“网页地址”')} />
          <h3 className="Font18 Gray mTop40">{_l('5. 如何获取CorpId、AgentId和Secret')}</h3>
          <p className="Font14 Gray_75 mTop24 LineHeight22">{_l('CorpId可在“我的企业”底部查看')}</p>
          <img src="/src/pages/Admin/workwx/workwxSyncCourse/img/1.png" alt={_l('CorpId可在“我的企业”底部查看')} />
          <p className="Font14 Gray_75 mTop24 LineHeight22">{_l('AgentId、Secret可在自建应用的“应用管理”处查看')}</p>
          <img
            src="/src/pages/Admin/workwx/workwxSyncCourse/img/2.png"
            alt={_l('AgentId、Secret可在自建应用的“应用管理”处查看')}
          />
          <p className="Font14 Gray_75 mTop24 LineHeight22">
            {_l('其中，点击Secret的查看后，您的企业微信会收到一条消息；再点击其中的“前往查看”获取')}
          </p>
          <img
            src="/src/pages/Admin/workwx/workwxSyncCourse/img/3.png"
            alt={_l('点击Secret的查看后，您的企业微信会收到一条消息；再点击其中的“前往查看”获取')}
          />
          <img
            src="/src/pages/Admin/workwx/workwxSyncCourse/img/4.png"
            alt={_l('点击Secret的查看后，您的企业微信会收到一条消息；再点击其中的“前往查看”获取')}
          />
        </div>
        {this.renderScanContent()}
        {this.renderSyncFieldContent()}
      </React.Fragment>
    );
  }

  render() {
    if (this.state.loading) {
      return (
        <div className="workwxSyncBox card">
          <LoadDiv />
        </div>
      );
    }
    return (
      <div className="workwxSyncBox card">
        <h1 className="Gray">{_l('获取对接信息')}</h1>
        {this.renderDing()}
      </div>
    );
  }
}
