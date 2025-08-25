import React, { Component } from 'react';
import { navigateTo } from 'src/router/navigateTo';
import TaskGantt from '../taskGantt/containers/taskGantt/taskGantt';
import './subordinate.less';

export default class Subordinate extends Component {
  /**
   * 加入企业网络
   */
  joinNetwork() {
    navigateTo('/personal?type=enterprise');
  }

  render() {
    // 不存在网络
    if (!md.global.Account.projects.length) {
      return (
        <div className="subordinateNull">
          <div className="subordinateNullImg" />
          <div className="Font17 mTop40">{_l('创建或加入组织以启用“下属任务”，查看下属和协作同事的任务进展')}</div>
          <div
            className="Font16 mTop40 subordinateAdd ThemeColor3 ThemeBorderColor3 pointer"
            onClick={() => this.joinNetwork()}
          >
            {_l('创建组织')}
          </div>
          <div className="Font13 mTop20 ThemeColor3">
            {_l('或')}{' '}
            <span className="pointer" onClick={() => this.joinNetwork()}>
              {_l('加入组织')}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="subordinateContainer flexColumn">
        <div className="subordinateHead relative">
          <div className="subordinateLabel">{_l('下属任务')}</div>
        </div>
        <div className="flex folderGanttMain relative">
          <TaskGantt />
        </div>
      </div>
    );
  }
}
