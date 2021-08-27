import React from 'react';
import { Icon, ScrollView } from 'ming-ui';
import { navigateTo } from 'src/router/navigateTo';
import cx from 'classnames';

class Sidenav extends React.Component {
  render() {
    let { type, worksheetId = '', displayNum = 0 } = this.props;
    return (
      <ScrollView className="sidenavBox">
        <div className="title">{_l('基础设置')}</div>
        <ul>
          <li
            className={cx({ current: !type || type === 'alias' })}
            onClick={() => {
              navigateTo(`/worksheet/formSet/edit/${worksheetId}/alias`);
            }}
          >
            <div className="">
              <Icon icon="workflow_write" className="aliasIcon" />
              <span className="flex mLeft12 Bold">{_l('数据名称')}</span>
            </div>
            <p className="mTop5 Font12">{_l('设置标题字段、记录名称、字段别名')}</p>
          </li>
          <li
            className={cx({ current: type === 'functionalSwitch' })}
            onClick={() => {
              navigateTo(`/worksheet/formSet/edit/${worksheetId}/functionalSwitch`);
            }}
          >
            <div className="">
              <Icon icon="settings" className="aliasIcon" />
              <span className="flex mLeft12 Bold">{_l('功能开关')}</span>
            </div>
            <p className="mTop5 Font12">{_l('设置启用的系统功能和使用范围')}</p>
          </li>
        </ul>
        <div className="title">{_l('高级设置')}</div>
        <ul>
          <li
            className={cx({ current: type === 'display' })}
            onClick={() => {
              navigateTo(`/worksheet/formSet/edit/${worksheetId}/display`);
            }}
          >
            <div className="">
              <Icon icon="task-list" className="displayIcon" />
              <span className="flex mLeft12 Bold">{_l('业务规则')}</span>
            </div>
            <p className="mTop5 Font12">{_l('当满足条件时，变更字段的状态或提示错误')}</p>
          </li>
          {/* <li className={cx({ 'current': type === 'validation' })} onClick={() => {
          navigateTo(`/worksheet/formSet/edit/${worksheetId}/validation`);
        }}>
          <Icon icon='task-new-locked' className="validationIcon" />
          {_l('验证规则')}</li> */}
          <li
            className={cx({ current: type === 'customBtn' })}
            onClick={() => {
              navigateTo(`/worksheet/formSet/edit/${worksheetId}/customBtn`);
            }}
          >
            <div className="">
              <Icon icon="custom_actions" className="printIcon" />
              <span className="mLeft12 Bold">{_l('自定义动作')}</span>
            </div>
            <p className="mTop5 Font12">{_l('自定义在查看记录时可执行的操作')}</p>
          </li>
          <li
            className={cx({ current: type === 'printTemplate' })}
            onClick={() => {
              navigateTo(`/worksheet/formSet/edit/${worksheetId}/printTemplate`);
            }}
          >
            <div className="">
              <Icon icon="print" className="printIcon" />
              <span className="mLeft12 Bold">{_l('打印模板')}</span>
            </div>
            <p className="mTop5 Font12">{_l('自定义记录打印时的样式')}</p>
          </li>
        </ul>
      </ScrollView>
    );
  }
}

export default Sidenav;
