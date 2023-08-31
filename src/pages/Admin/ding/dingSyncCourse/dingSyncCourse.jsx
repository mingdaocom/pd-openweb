import React, { Fragment } from 'react';
import copy from 'copy-to-clipboard';
import './style.less';
import Ajax from 'src/api/workWeiXin';
import projectAjax from 'src/api/project';
import Api from 'api/homeApp';
import { Icon, LoadDiv, Button, Input } from 'ming-ui';
import cx from 'classnames';
import html2canvas from 'html2canvas';
import { navigateTo } from '../../../../router/navigateTo';
import { compareProps } from 'pages/PageHeader/util.js';
import SvgIcon from 'src/components/SvgIcon';
import CreateLinkDialog from './CreateLinkDialog';
import moment from 'moment';

const passApplyConfig = {
  1: 'dingAppCourse',
  3: 'weixinAppCourse',
};

export default class DingSyncCourse extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      homeUrl: '',
      serverIp: '',
      pcHomeUrl: '',
      addApp: false,
      iconUrl: null,
      iconColor: null,
      name: 'md',
      loading: true,
      projectId: null,
      apkId: null,
      isPassApply: false,
      isWX: false,
      AgentId: null,
      Secret: null,
      baseUrl: '',
      createLinkVisible: false
    };
  }

  componentDidMount() {
    $('html').addClass('dingSyncBox');
    let match = this.props.match;
    if (!match.params.projectId) {
      return;
    }
    this.setState(
      {
        addApp: match.url.indexOf('dingAppCourse') >= 0,
        isWX: match.url.indexOf('weixinAppCourse') >= 0,
        projectId: match.params.projectId,
        apkId: match.params.apkId,
      },
      () => {
        //工作台过来的验证
        if (this.state.addApp || this.state.isWX) {
          projectAjax.getProjectSource({ projectId: match.params.projectId }).then(res => {
            if (!res) {
              this.setState({ isPassApply: false, loading: false });
            } else {
              this.setState(
                {
                  isPassApply: match.url.indexOf(passApplyConfig[res]) >= 0,
                  loading: false,
                },
                () => {
                  if (this.state.isPassApply) {
                    this.getAppInfo(
                      match.url.indexOf('weixinAppCourse') >= 0,
                      match.params.projectId,
                      match.params.apkId,
                    );
                  }
                },
              );
            }
          });
        } else {
          this.setState({ isPassApply: true }, () => {
            this.getAppInfo(match.url.indexOf('weixinAppCourse') >= 0, match.params.projectId, match.params.apkId);
          });
        }
      },
    );
  }

  getAppInfo = (isWX, projectId, apkId) => {
    if (isWX) {
      Ajax.getWorkWXSsoUrlInfo({
        projectId: projectId,
        apkId: apkId,
      }).then(res => {
        if (res) {
          this.setState({
            // "status: 集成状态，主要通过该值展现：1代表申请通过并提供了使用；0代表提交了申请；-1代表拒绝申请；2代表之前集成过但关闭了集成"
            domainName: res.item1,
            homeUrlN: res.item2,
            AgentId: res.item3,
            Secret: res.item4,
            baseUrl: res.item6,
          });
          this.getDetail(apkId);
        } else {
          this.setState({
            loading: false,
          });
        }
      });
    } else {
      Ajax.getDDSsoUrlInfo({
        projectId: projectId,
        apkId: apkId,
      }).then(res => {
        if (res) {
          this.setState({
            // "status: 集成状态，主要通过该值展现：1代表申请通过并提供了使用；0代表提交了申请；-1代表拒绝申请；2代表之前集成过但关闭了集成"
            homeUrl: res.homeUrl,
            serverIp: res.ip,
            pcHomeUrl: res.pcHomeUrl,
            AgentId: res.agentId,
            baseUrl: res.baseUrl,
          });
          if (this.state.addApp) {
            this.getDetail(apkId);
          } else {
            this.setState({
              loading: false,
            });
          }
        } else {
          this.setState({
            loading: false,
          });
        }
      });
    }
  };

  getDetail = (appId, callback) => {
    Api.getApp({ appId: appId }, { silent: true }).then(data => {
      this.setState({
        loading: false,
        iconUrl: data.iconUrl,
        iconColor: data.iconColor,
        name: data.name,
      });
    });
  };

  shouldComponentUpdate(nextProps, nextState) {
    return compareProps(this.state, nextState);
  }

  componentWillUnmount() {
    $('html').removeClass('dingSyncBox');
  }

  bindClipboard = (str) => {
    copy(str);
    alert(_l('已经复制到粘贴板，你可以使用Ctrl+V 贴到需要的地方去了哦'));
  };

  /**
   * 保存图片
   */
  saveImg = () => {
    if (this.state.addApp || this.state.isWX) {
      // let getPixelRatio = function (context) {
      //   let backingStore = context.backingStorePixelRatio ||
      //     context.webkitBackingStorePixelRatio ||
      //     context.mozBackingStorePixelRatio ||
      //     context.msBackingStorePixelRatio ||
      //     context.oBackingStorePixelRatio ||
      //     context.backingStorePixelRatio || 1;
      //   return (window.devicePixelRatio || 1) / backingStore;
      // };
      let saveContent = $(this.appIconForDown); //要生成的页面位置
      let width = saveContent.width();
      let height = saveContent.height();
      // let offsetTop = saveContent.offset().top;
      let canvas = document.createElement('canvas');
      let context = canvas.getContext('2d');
      let scaleBy = 256 / width;
      canvas.width = width;
      canvas.height = height;
      context.scale(scaleBy, scaleBy);
      html2canvas(this.appIconForDown, {
        backgroundColor: null,
        allowTaint: true,
        tainttest: true,
        scale: scaleBy,
        logging: false,
        width: width,
        height: height,
        canvas: canvas,
      }).then(canvas => {
        $('.download')
          .attr('href', canvas.toDataURL())[0]
          .click();
      });
    } else {
      $('.download')
        .attr('href', `${md.global.FileStoreConfig.pubHost}logo_app.png`)[0]
        .click();
    }
  };

  renderWX = () => {
    return (
      <React.Fragment>
        <h3 className="Font18 Gray mTop40">{_l('1. 登录企业微信 — 定位到“应用管理”')}</h3>
        <img src="/src/pages/Admin/ding/dingSyncCourse/img/wx/1.png" alt={_l('登录企业微信 — 定位到“应用管理”')} />
        <h3 className="Font18 Gray mTop40">{_l('2. 选择“自建-创建应用”进入新建应用页面')}</h3>
        <img src="/src/pages/Admin/ding/dingSyncCourse/img/wx/2.png" alt={_l('选择“自建-创建应用”进入新建应用页面')} />
        <h3 className="Font18 Gray mTop40">{_l('3. 填写应用信息')}</h3>
        <p className="Font14 Gray_75 mTop24 LineHeight22">
          {_l('填入应用名称（建议与实际应用名称保持一致）、应用Logo（建议与实际应用Logo保持一致）、应用介绍')}
          <br />
          {_l('选择可见范围后即可创建应用')}
          <br />
          应用Logo：
          <span
            className="downloadLogo"
            onClick={() => {
              this.saveImg();
            }}
          >
            {_l('点击下载')}
          </span>
          <a
            className="download Hidden"
            target="_blank"
            download={this.state.name + moment().format('YYYY-MM-DD') + '.png'}
            href=""
          >
            {_l('点击下载')}
          </a>
        </p>
        <img src="/src/pages/Admin/ding/dingSyncCourse/img/wx/3.png" alt={_l('填写应用信息')} />
        <h3 className="Font18 Gray mTop40">{_l('4. 继续完善对接信息')}</h3>
        <p className="Font14 Gray_75 mTop24 LineHeight22">
          {_l('1.进入“网页授权及JS-SDK”，输入可信域名（只需填写该项即可）')}
        </p>
        <div className="inputList mTop20">
          <span className="inputTitle">{_l('可信域名：')}</span>
          <input type="text" className="inputBox" readOnly value={this.state.domainName} />
          <span className="copyBtn" onClick={() => this.bindClipboard(this.state.domainName)}>
            {_l('复制')}
          </span>
        </div>
        <p className="Font14 Gray_75 mTop24 LineHeight22">
          {_l('注：设置的可信域名，不能包含协议头，不支持IP地址及短链域名')}
        </p>
        <img
          src="/src/pages/Admin/ding/dingSyncCourse/img/wx/4.png"
          alt={_l('进入“网页授权及JS-SDK”，输入可信域名（只需填写该项即可）')}
        />
        <img
          src="/src/pages/Admin/ding/dingSyncCourse/img/wx/5.png"
          alt={_l('进入“网页授权及JS-SDK”，输入可信域名（只需填写该项即可）')}
        />
        <p className="Font14 Gray_75 mTop24 LineHeight22">{_l('2.点击“应用主页”，填写“网页地址”')}</p>
        <div className="inputList mTop20">
          <span className="inputTitle">{_l('应用主页：')}</span>
          <input type="text" className="inputBox" readOnly value={this.state.homeUrlN} />
          <span className="copyBtn" onClick={() => this.bindClipboard(this.state.homeUrlN)}>
            {_l('复制')}
          </span>
        </div>
        <p className="Font14 Gray_75 mTop24 LineHeight22">
          <span className="Red mRight2">*</span>
          {_l('如您想个性化部署应用，把某一张表部署为一个应用，可把链接复制到输入框内直接')}
          <a onClick={() => { this.setState({ createLinkVisible: true }) }}>{_l('生成企业微信链接，')}</a>
          {_l('生成链接后复制进”应用首页链接“、”PC端首页地址“即可使用')}
        </p>
        <img src="/src/pages/Admin/ding/dingSyncCourse/img/wx/6.png" alt={_l('点击“应用主页”，填写“网页地址”')} />
        <img src="/src/pages/Admin/ding/dingSyncCourse/img/wx/7.png" alt={_l('点击“应用主页”，填写“网页地址”')} />
        <h3 className="Font18 Gray mTop40">{_l('5. 配置完成后，即可在客户端使用此应用')}</h3>
        <img src="/src/pages/Admin/ding/dingSyncCourse/img/wx/8.png" alt={_l('配置完成后，即可在客户端使用此应用')} />
      </React.Fragment>
    );
  };

  renderDing = () => {
    return (
      <React.Fragment>
        <h3 className="Font18 Gray mTop40">{_l('1. 前往钉钉管理后台 — 定位到“工作台”')}</h3>
        <img src="/src/pages/Admin/ding/dingSyncCourse/img/1.png" alt={_l('前往钉钉管理后台 — 定位到“工作台”')} />
        <h3 className="Font18 Gray mTop40">{_l('2. 点击下方“自建应用”进入钉钉开放平台')}</h3>
        <img src="/src/pages/Admin/ding/dingSyncCourse/img/2.png" alt={_l('点击下方“自建应用”进入钉钉开放平台')} />
        <p className="Font14 Gray_75 mTop24 LineHeight22">{_l('选择“应用开发”下的“企业内部开发”')}</p>
        <img src="/src/pages/Admin/ding/dingSyncCourse/img/2-1.png" alt={_l('选择“应用开发”下的“企业内部开发”')} />
        <h3 className="Font18 Gray mTop40">{_l('3. 点击创建应用，完善应用信息')}</h3>
        <p className="Font14 Gray_75 mTop24 LineHeight22">
          {_l('a. 应用类型选择“H5微应用”')}
          <br />
          {this.state.addApp
            ? _l('c. 填入应用名称（建议与应用名称保持一致）、应用描述、应用图标')
            : _l('c. 填入应用名称、应用描述、应用图标')}
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;{_l('应用Logo建议：')}
          <span
            className="downloadLogo"
            onClick={() => {
              this.saveImg();
            }}
          >
            {_l('点击下载')}
          </span>
          <a
            className="download Hidden"
            target="_blank"
            download={this.state.name + moment().format('YYYY-MM-DD') + '.png'}
            href={this.state.addApp ? '' : `${md.global.FileStoreConfig.pubHost}logo_app.png`}
          >
            {_l('点击下载')}
          </a>
          <br />
          {_l('d. 开发方式选择“企业自助开发”')}
        </p>
        <img src="/src/pages/Admin/ding/dingSyncCourse/img/3.png" alt={_l('完善应用信息')} />
        <h3 className="Font18 Gray mTop40">{_l('4. 完善接口信息')}</h3>
        <p className="Font14 Gray_75 mTop24 LineHeight22">
          {_l('定位到“开发管理”，将以下链接填入对应输入框内；开发模式选择“开发应用”')}
        </p>
        <div className="inputList mTop20">
          <span className="inputTitle">{_l('应用首页地址：')}</span>
          <input type="text" className="inputBox" readOnly value={this.state.homeUrl} />
          <span className="copyBtn" onClick={() => this.bindClipboard(this.state.homeUrl)}>
            {_l('复制')}
          </span>
        </div>
        <div className="inputList mTop20">
          <span className="inputTitle">{_l('服务器出口IP：')}</span>
          <input type="text" className="inputBox" readOnly value={this.state.serverIp} />
          <span className="copyBtn" onClick={() => this.bindClipboard(this.state.serverIp)}>
            {_l('复制')}
          </span>
        </div>
        <div className="inputList mTop20">
          <span className="inputTitle">{_l('PC端首页地址：')}</span>
          <input type="text" className="inputBox" readOnly value={this.state.pcHomeUrl} />
          <span className="copyBtn" onClick={() => this.bindClipboard(this.state.pcHomeUrl)}>
            {_l('复制')}
          </span>
        </div>
        <p className="Font14 Gray_75 mTop24 LineHeight22">
          <span className="Red mRight2">*</span>
          {_l('如您想个性化部署应用，把某一张表部署为一个应用，可把链接复制到输入框内直接')}
          <a onClick={() => { this.setState({ createLinkVisible: true }) }}>{_l('生成钉钉链接，')}</a>
          {_l('生成链接后复制进”应用首页链接“、”PC端首页地址“即可使用')}
        </p>
        <img src="/src/pages/Admin/ding/dingSyncCourse/img/4-1.png" alt={_l('完善接口信息')} />
        {this.state.addApp ? null : (
          <Fragment>
            <p className="Font14 Gray_75 mTop24 LineHeight22">
              {_l(
                '切换至“基础信息”，将AgentId、AppKey、AppSecret分别填入系统的“组织管理 - 集成 - 钉钉 - 对接信息录入”对应输入框内',
              )}
            </p>
            <img src="/src/pages/Admin/ding/dingSyncCourse/img/4-2.png" alt={_l('完善接口信息')} />
            <img src="/src/pages/Admin/ding/dingSyncCourse/img/4-3.png" alt={_l('完善接口信息')} />
            <p className="Font14 Gray_75 mTop24 LineHeight22">{_l('首页可以找到CorpId，填入对应输入框内')}</p>
            <img src="/src/pages/Admin/ding/dingSyncCourse/img/4-4.png" alt={_l('完善接口信息')} />
            <h3 className="Font18 Gray mTop40">{_l('5.申请开通企业通讯录权限')}</h3>
            <p className="Font14 Gray_75 mTop24 LineHeight22">
              {_l('回到自建应用的“权限管理”')}
              <br /> {_l('a. 权限范围：建议选择“全部员工”')}
              <br /> {_l('b. 批量申请以下权限')}
              <br /> {_l('通讯录部门信息读权限【必选】')}
              <br /> {_l('成员信息读权限【必选】')}
              <br /> {_l('通讯录部门成员读权限【必选】')}
              <br /> {_l('企业员工手机号信息【必选】')}
              <br /> {_l('个人手机号信息【建议开通，用于手机号对比账号】')}
              <br /> {_l('邮箱等个人信息【建议开通，用于手机号对比账号】')}
            </p>
            <img src="/src/pages/Admin/ding/dingSyncCourse/img/5.png" alt={_l('申请开通企业通讯录权限')} />
          </Fragment>
        )}
        <h3 className="Font18 Gray mTop40">{_l('%0.发布应用', this.state.addApp ? 5 : 6)}</h3>
        <p className="Font14 Gray_75 mTop24 LineHeight22">
          {_l('切换至“版本管理与发布”，配置可使用范围，点击“确认发布”后即可')}
        </p>
        <img src="/src/pages/Admin/ding/dingSyncCourse/img/6.png" alt={_l('发布应用')} />
        <h3 className="Font18 Gray mTop40">{_l('%0.设置使用范围', this.state.addApp ? 6 : 7)}</h3>
        <p className="Font14 Gray_75 mTop24 LineHeight22">
          {_l('应用发布后，仍然可以根据企业自身需求改变应用的可使用范围')}
        </p>
        <img src="/src/pages/Admin/ding/dingSyncCourse/img/7.png" alt={_l('设置使用范围')} />
      </React.Fragment>
    );
  };

  render() {
    if (this.state.loading) {
      return (
        <div className="courseBox card">
          <LoadDiv className="" />
        </div>
      );
    }
    if (!this.state.isPassApply) {
      return (
        <div className="courseBox card TxtCenter">
          <Icon icon="closeelement-bg-circle" className="Red iconReject" />
          <div className="TxtCenter mTop30">
            <h2 className="Font20 Gray">
              {this.state.isWX
                ? _l('抱歉，此功能只开放给基于企业微信开通的组织')
                : _l('抱歉，此功能只开放给基于钉钉开通的组织')}
            </h2>
            <p className="mTop16 mBottom30 Font14 Gray_75 LineHeight22">
              {this.state.isWX ? _l('请进入组织管理后台，配置企业微信集成') : _l('请进入组织管理后台，配置钉钉集成')}
            </p>
            <Button
              type="primary"
              className="goDingSetting"
              onClick={e => {
                if (this.state.isWX) {
                  navigateTo(`/admin/workwxapp/${this.state.projectId}`);
                } else {
                  navigateTo(`/admin/ding/${this.state.projectId}`);
                }
              }}
            >
              {_l('前往配置')}
            </Button>
          </div>
        </div>
      );
    }
    if (this.state.isWX && !md.global.Config.IsLocal) {
      return (
        <div className="wechartWork card TxtCenter">
          <img
            className="mTop80"
            src="/src/pages/Admin/ding/dingSyncCourse/img/wechat_work.png"
            alt={_l('企业微信')}
            width="56"
          />
          <div className="TxtCenter mTop30">
            <h2 className="Font20 Gray">{_l('将此应用添加到企业微信工作台')}</h2>
            <p className="mTop30 Font14 Gray_75 LineHeight22">
              {_l('因企业微信规则调整，新的对接方案正在开发，支持线下完成对接。')}
            </p>
            <p className="Font14 mBottom30 Gray_75 LineHeight22">
              {_l('您可以在线咨询客服或者电话咨询客服，联系电话：400-665-6655')}
            </p>
            <Button
              type="primary"
              className="goDingSetting"
              onClick={e => {
                window.KF5SupportBoxAPI && window.KF5SupportBoxAPI.open();
              }}
            >
              {_l('联系客服')}
            </Button>
          </div>
        </div>
      );
    }
    return (
      <div className="courseBox card">
        <h1 className="Gray">
          {this.state.addApp
            ? _l('将此应用安装到钉钉工作台')
            : this.state.isWX
            ? _l('将此应用安装到企业微信')
            : _l('获取对接信息')}
        </h1>
        {this.state.isWX ? this.renderWX() : this.renderDing()}
        {(this.state.addApp || this.state.isWX) && (
          <div className="boxForDown">
            <div
              className={cx('appIconForDown', { isWXIcon: this.state.isWX })}
              style={{
                backgroundColor: this.state.iconColor,
              }}
              ref={el => {
                this.appIconForDown = el;
              }}
            >
              <SvgIcon url={this.state.iconUrl} fill="#fff" size={this.state.isWX ? 750 : 200} />
            </div>
          </div>
        )}
        <CreateLinkDialog
          visible={this.state.createLinkVisible}
          isWX={this.state.isWX}
          baseUrl={this.state.baseUrl}
          projectId={this.state.projectId}
          onCancel={() => {
            this.setState({ createLinkVisible: false });
          }}
        />
      </div>
    );
  }
}
