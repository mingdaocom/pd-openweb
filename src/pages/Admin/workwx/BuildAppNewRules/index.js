import React, { Component, Fragment } from 'react';
import workWeiXinAjax from 'src/api/workWeiXin.js';
import Config from '../../config';
import { Icon, Button, LoadDiv } from 'ming-ui';
import VertifyClearIntegationData from '../../components/VertifyClearIntegationData';
import wechatIcon from '../img/wechat_work.png';
import styled from 'styled-components';
import gearImg from '../img/gear.gif';
import _ from 'lodash';

const BuildAppBox = styled.div`
  padding: 15px 32px 0;
  .stepOneContent {
    width: 480px;
    text-align: center;
    margin: 90px auto 0;
    .iconContainer {
      width: 220px;
      height: 58px;
      margin: 0 auto 55px;
      display: flex;
      justify-content: space-between;
      .icon1 {
        width: 58px;
        background: #2196f3;
        border-radius: 50%;
        text-align: center;
        .icon {
          font-size: 36px;
          line-height: 58px;
          color: #fff;
        }
      }
      .icon2 {
        .icon {
          font-size: 27px;
          color: #bdbdbd;
          line-height: 58px;
        }
      }
      .icon3 {
        img {
          height: 58px;
        }
      }
    }
    .erweima {
      width: 220px;
      height: 220px;
      margin: 0 auto 39px;
      display: flex;
      justify-content: center;
      align-items: center;
      img {
        width: 100%;
        height: 100%;
      }
    }
    .tip {
      font-size: 32px;
      font-weight: 600;
      margin-bottom: 25px;
    }
    .subTip {
      font-size: 17px;
    }
  }
  .title {
    font-size: 20px;
    font-weight: 600;
  }
  .subTitle {
    font-size: 13px;
    color: #9e9e9e;
  }
  .confirmBtn {
    width: 132px;
    height: 36px;
    line-height: 36px;
    background: #2196f3;
    opacity: 1;
    border-radius: 18px;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    margin-top: 36px;
  }
  .line {
    width: 100%;
    border-top: 1px solid #eaeaea;
    height: 0;
    margin-bottom: 40px;
  }

  .dataSynInfo {
    color: #757575;
    font-size: 13px;
    margin-right: 8px;
  }

  .w130 {
    width: 130px;
  }
  .w140 {
    width: 140px;
  }
  .linkTxt {
    font-size: 13px;
    color: #2196f3;
    cursor: pointer;
  }
  .BoldText {
    color: #333;
    font-weight: 600;
  }
`;

const StepTwo = styled.div`
  width: 452px;
  margin: 0 auto;
  text-align: center;
  padding-top: 150px;
  .gearImg {
    width: 120px;
    margin-bottom: 29px;
  }
  .title {
    margin-bottom: 15px;
  }
  .gray9e {
    color: #9e9e9e;
  }
`;

export default class BuildAppNewRules extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step: props.status === 0 ? 2 : 1,
      isLoading: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.status, nextProps.status)) {
      this.setState({ step: nextProps.status === 0 ? 2 : 1 });
      nextProps.status !== 0 && this.geterwima();
    }
  }

  // 获取二维码链接
  geterwima = () => {
    this.setState({ isLoading: true });
    workWeiXinAjax.getWorkWXAlternativeAppScanCodeUrl({ projectId: Config.projectId }).then(res => {
      if (res) {
        this.setState({
          url: md.global.Config.AjaxApiUrl + `code/CreateQrCodeImage?url=${res}&download=true`,
          isLoading: false,
        });
      }
    });
  };
  // 确认授权
  confirmAuthorize = () => {
    workWeiXinAjax
      .editWorkWXAlternativeAppStatus({
        projectId: Config.projectId,
      })
      .then(res => {
        if (res === -1) {
          VertifyClearIntegationData({
            projectId: Config.projectId,
            callback: this.confirmAuthorize,
          });
          return;
        } else if (res) {
          this.setState({ step: 2 });
        } else {
          alert(_l('失败'), 2);
        }
      });
  };
  renderStepOne = () => {
    let { url = '', isLoading } = this.state;
    return (
      <div className="stepOneContent">
        <div className="iconContainer">
          <div className="icon1">
            <Icon icon="widgets2" />
          </div>
          <div className="icon2">
            <Icon icon="swap_horiz" />
          </div>
          <div className="icon3">
            <img src={wechatIcon} />
          </div>
        </div>
        <div className="erweima">{isLoading ? <LoadDiv /> : <img src={url} />}</div>
        <div className="tip">{_l('将应用安装企业微信工作台')}</div>
        <div className="subTip">{_l('企业微信管理员扫码并完成授权')}</div>
        <Button className="confirmBtn" onClick={this.confirmAuthorize}>
          {_l('确认')}
        </Button>
      </div>
    );
  };
  // 前往企业微信后台-应用管理
  toEnterPriseWXBackStage = () => {
    window.open('https://work.weixin.qq.com/wework_admin/frame#apps');
  };
  renderStepTwo = () => {
    return (
      <StepTwo>
        <img className="gearImg" src={gearImg} />
        <div className="title">{_l('应用开发中')}</div>
        <div className="gray9e">{_l('授权完成后应用进入开发阶段')}</div>
        <div className="gray9e">
          {_l('可以前往')}
          <span className="Hand linkTxt" onClick={this.toEnterPriseWXBackStage}>
            {_l('企业微信后台-应用管理')}
          </span>
          {'查看开发进度，预计1-3个工作日内完成。 '}
        </div>
      </StepTwo>
    );
  };

  render() {
    let { step } = this.state;
    return (
      <BuildAppBox>
        {step === 1 && this.renderStepOne()}
        {step === 2 && this.renderStepTwo()}
      </BuildAppBox>
    );
  }
}
