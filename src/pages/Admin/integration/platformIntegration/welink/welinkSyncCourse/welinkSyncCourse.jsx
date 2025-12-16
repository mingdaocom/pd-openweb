import React from 'react';
import Clipboard from 'react-clipboard.js';
import moment from 'moment';
import { compareProps } from 'pages/PageHeader/util.js';
import { LoadDiv } from 'ming-ui';
import Ajax from 'src/api/workWeiXin';
import welinkPng1 from './img/1.png';
import welinkPng2 from './img/2.png';
import welinkPng3 from './img/3.png';
import welinkPng4 from './img/4.png';
import welinkPng5 from './img/5.png';
import welinkPng6 from './img/6.png';
import welinkPng7 from './img/7.png';
import './style.less';

export default class WelinkSyncCourse extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      homeUrl: '',
      loading: true,
    };
  }

  componentDidMount() {
    let match = this.props.match;
    if (!match.params.projectId) {
      return;
    }
    Ajax.getWelinkSsoUrlInfo({
      projectId: match.params.projectId,
    }).then(result => {
      if (result) {
        this.setState({
          loading: false,
          homeUrl: result,
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
        <h3 className="Font18 Gray mTop40">{_l('1. 登录Welink管理后台 — 前往“业务应用”下的“应用管理”')}</h3>
        <img src={welinkPng1} />
        <h3 className="Font18 Gray mTop40">{_l('2. 在“自建应用”一栏，前往开放平台创建应用')}</h3>
        <img src={welinkPng2} />
        <h3 className="Font18 Gray mTop40">{_l('3. 在开放平台，选择“企业内部应用”下的“轻应用”，创建轻应用')}</h3>
        <img src={welinkPng3} />
        <h3 className="Font18 Gray mTop40">{_l('4. 在创建流程填写应用信息')}</h3>
        <p className="Font14 Gray_75 mTop24 LineHeight22">
          {_l('中文名')}
          <br />
          应用Logo建议：
          <a
            className="download"
            target="_blank"
            download={'md' + moment().format('YYYY-MM-DD') + '.png'}
            href={`${md.global.FileStoreConfig.pubHost}/logo_app.png`}
          >
            {_l('点击下载')}
          </a>
          <br />
        </p>
        <img src={welinkPng4} />
        <h3 className="Font18 Gray mTop40">{_l('5. 应用创建完成后，请配置首页地址并开通接口权限')}</h3>
        <p className="Font14 Gray_75 mTop24 LineHeight22">
          {_l('1.点击”设置首页地址”，将下方的应用主页地址分别复制到手机端链接和PC端链接上')}
        </p>
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
        <img src={welinkPng5} />
        <p className="Font14 Gray_75 mTop24 LineHeight22">{_l('2.点击”设置接口权限”，开通集成需要用到的接口权限')}</p>
        <p className="Font14 Gray_75 LineHeight22">{_l('需要开通的授权如图所示')}</p>
        <img src={welinkPng6} />
        <h3 className="Font18 Gray mTop40">{_l('6. 发布应用')}</h3>
        <p className="Font14 Gray_75 mTop24 LineHeight22">
          {_l('发布新创建的应用。最后回到“应用管理”，设置“可见范围”')}
        </p>
        <img src={welinkPng7} />
      </React.Fragment>
    );
  };

  render() {
    if (this.state.loading) {
      return (
        <div className="welinkSyncCourse card">
          <LoadDiv className="" />
        </div>
      );
    }
    return (
      <div className="dingSyncCourseWrap">
        <div className="welinkSyncCourse card">
          <h1 className="Gray">{_l('获取对接信息')}</h1>
          {this.renderDing()}
        </div>
      </div>
    );
  }
}
