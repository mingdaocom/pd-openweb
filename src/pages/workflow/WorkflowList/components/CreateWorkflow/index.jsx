import React, { Component, createRef } from 'react';
import { string, func } from 'prop-types';
import { Icon, Support } from 'ming-ui';
import { navigateTo } from 'src/router/navigateTo';
import FullScreenCurtain from '../../../components/FullScreenCurtain';
import { START_APP_TYPE } from '../../config';
import api from '../../../api/process';
import appManagement from 'src/api/appManagement';
import BgIcon from './BgIcon';
import './index.less';

const WORKFLOW_TRIGGER_MODE = [
  {
    text: _l('工作表'),
    subClass: [
      {
        title: _l('工作表事件触发'),
        explain: _l('当工作表中新增记录或已有记录发生变更时触发'),
        startEventAppType: 1,
      },
    ],
  },
  {
    text: _l('时间'),
    subClass: [
      {
        title: _l('定时触发'),
        explain: _l('按照设定的时间周期循环触发流程'),
        startEventAppType: 5,
      },
      {
        title: _l('按日期字段触发'),
        explain: _l(
          '指定一个日期字段，将字段的日期作为时间表来触发流程。如：指定工作表中的员工生日或客户注册日期来发送短信通知',
        ),
        startEventAppType: 6,
      },
    ],
  },
  {
    text: _l('组织'),
    subClass: [
      {
        title: _l('人员事件触发'),
        explain: _l('当组织中有人员入职/离职时触发'),
        startEventAppType: 20,
      },
      // {
      //   title: _l('部门事件触发'),
      //   explain: _l('当组织中有部门创建/解散时触发'),
      //   startEventAppType: 21,
      // },
    ],
  },
  {
    text: _l('其他'),
    subClass: [
      {
        title: _l('Webhook触发'),
        explain: _l('在指定的URL，接收到Webhook时触发'),
        startEventAppType: 7,
      },
    ],
  },
];
export default class CreateFlow extends Component {
  static propTypes = {
    appId: string.isRequired,
    onBack: func,
    flowName: string,
  };

  static defaultProps = {
    onBack: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      flowName: props.flowName,
    };
  }

  inputRef = createRef();

  requestPending = false;

  createFlow = startEventAppType => {
    const { appId } = this.props;
    const { flowName } = this.state;
    this.requestPending = true;
    api
      .addProcess({
        companyId: '',
        relationId: appId,
        relationType: 2,
        startEventAppType,
        name: flowName || this.props.flowName,
        explain: '',
      })
      .then(res => {
        appManagement.addWorkflow({ projectId: res.companyId });
        navigateTo(`/workflowedit/${res.id}`);
      })
      .always(() => {
        this.requestPending = false;
      });
  };

  handleInputFocus = (focus = true) => {
    const $ele = this.inputRef.current;
    focus ? $ele.classList.add('ThemeBorderColor3') : $ele.classList.remove('ThemeBorderColor3');
  };

  render() {
    const { flowName } = this.state;
    return (
      <FullScreenCurtain>
        <header className="createWorkflowHeader flexRow">
          <div className="backEdit flexRow">
            <div className="backToWorkflowIndex mRight12" onClick={this.props.onBack}>
              <Icon icon="backspace" className="Font24 Gray_9e ThemeHoverColor3 pointer" />
            </div>
            <input
              ref={this.inputRef}
              type="text"
              value={flowName}
              placeholder={_l('请输入流程名称')}
              onFocus={this.handleInputFocus}
              onChange={e => this.setState({ flowName: e.target.value })}
              onBlur={() => this.handleInputFocus(false)}
              className="editWorkflowName"
            />
          </div>
          <div>
            <Support type={2} text={_l('使用帮助')} href="https://help.mingdao.com/flow51.html" />
          </div>
        </header>
        <div className="createWorkflowBox">
          <h2 className="Font22">{_l('如何开始你的流程')}</h2>
          {WORKFLOW_TRIGGER_MODE.map(({ text, subClass }, index) => {
            return (
              <div key={index} className="triggerWorkflowMode">
                <div className="modeName bold Gray_75">{text}</div>
                {subClass.map(item => {
                  return (
                    <div
                      key={item.startEventAppType}
                      className="triggerModeDetail flexRow pointer"
                      onClick={() => !this.requestPending && this.createFlow(item.startEventAppType)}
                    >
                      <BgIcon
                        size={56}
                        iconSize={28}
                        icon={START_APP_TYPE[item.startEventAppType].iconName}
                        bgColor={START_APP_TYPE[item.startEventAppType].iconColor}
                      />
                      <div className="detailExplain flexColumn">
                        <div className="Font15 mTop4">{item.title}</div>
                        <div className="Gray_75 mTop10" style={{ maxWidth: 520 }}>
                          {item.explain}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </FullScreenCurtain>
    );
  }
}
