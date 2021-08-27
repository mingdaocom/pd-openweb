import PropTypes from 'prop-types';
import React, { Component } from 'react';

import Button from 'ming-ui/components/Button';
import UserHead from 'src/pages/feed/components/userHead/userHead';

import './style.less';

class HrHintPage extends Component {
  render() {
    const { accountId, avatar, fullname, profession } = md.global.Account;
    const user = {
      accountId: accountId,
      userHead: avatar,
    };
    return (
      <div className="hrHintPage">
        <div className="hintHeader">
          <div style={{ fontSize: '26px', marginTop: '22px' }}>免费体验人事</div>
          <Button
            size="large"
            onClick={() => {
              window.location.href = '/enterpriseRegister.htm?type=create';
            }}
            className="mTop10"
          >
            创建组织，立即试用
          </Button>
        </div>
        <div className="hrHintCards">
          <div className="userCard">
            <div className="userName White">{fullname}</div>
            <UserHead user={{ ...user }} size={58} className="userAvatar" />
          </div>
          <div className="approvalCard">
            <div style={{ paddingTop: '260px' }}>
              <div className="TxtCenter Font18">审批</div>
              <ul className="cardTextBox">
                <li>
                  <span>配置个性化，后台内含28种数据控件</span>
                </li>
                <li>
                  <span>审批更灵活，甚至支持转审和转经办</span>
                </li>
                <li>
                  <span>操作易上手，拖拖拽拽，所见即所得</span>
                </li>
                <li>
                  <span>安装即可用，已内置数十种审批模版</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="checkCard">
            <div style={{ paddingTop: '260px' }}>
              <div className="TxtCenter Font18">考勤</div>
              <ul className="cardTextBox">
                <li>
                  <span>打卡灵活，支持WIFI与GPS两种方式</span>
                </li>
                <li>
                  <span>配置自由，支持班次与考勤组自定义</span>
                </li>
                <li>
                  <span>数据联动，审批表单与考勤自动关联</span>
                </li>
                <li>
                  <span>便于统计，自动生成详尽的考勤报表</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default HrHintPage;
