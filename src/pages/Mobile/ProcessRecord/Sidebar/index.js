import React, { Component } from 'react';
import { Icon, ScrollView } from 'ming-ui';
import StepItem from 'src/pages/workflow/components/ExecDialog/StepItem';
import SvgIcon from 'src/components/SvgIcon';
import './index.less';

class Sidebar extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { instance, onOpenChange } = this.props;
    const { app, processName, works, info, currentWork, currentWorkItem } = instance;
    const width = document.documentElement.clientWidth - 60;
    return (
      <div className="flexColumn h100" style={{ width }}>
        <div className="workflowStepHeader flexRow">
          <div className="workflowStepIcon" style={{ background: app.iconColor }}>
            <SvgIcon url={app.iconUrl} fill="#fff" size={20} addClassName="mTop2" />
          </div>
          <div className="flex mLeft10 ellipsis Font14 Gray_9e bold">{`${app.name} · ${processName}`}</div>
          <Icon
            icon="close"
            className="Font20 Gray_9e ThemeHoverColor3 pointer mLeft20"
            onClick={onOpenChange}
          />
        </div>
        <div className="flex">
          <ScrollView>
            <ul className="stepList">
              {works.map((item, index) => {
                return (
                  <StepItem
                    key={index}
                    data={item}
                    currentWork={currentWork}
                    currentType={(currentWorkItem || {}).type}
                  />
                );
              })}
            </ul>
          </ScrollView>
        </div>
      </div>
    );
  }
}

export default Sidebar;
