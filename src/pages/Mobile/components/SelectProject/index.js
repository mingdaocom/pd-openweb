import React, { Fragment, useState } from 'react';
import { ActionSheet } from 'antd-mobile';
import { Icon } from 'ming-ui';
import { getCurrentProject } from 'src/util';
import './index.less';

export default function SelectProject(props) {
  const { changeProject = () => {} } = props;
  const projectObj = getCurrentProject(
    localStorage.getItem('currentProjectId') || (md.global.Account.projects[0] || {}).projectId,
  );

  const [currentProject, setCurrentProject] = useState(
    !_.isEmpty(projectObj) ? projectObj : { projectId: 'external', companyName: _l('外部协作') },
  );
  const [projects, setProjects] = useState(
    md.global.Account.projects.concat([
      {
        companyName: _l('外部协作'),
        projectId: 'external',
      },
    ]),
  );

  const handleSelectProject = () => {
    ActionSheet.showActionSheetWithOptions(
      {
        className: 'selectProjectWrap',
        options: projects.map(item => (
          <Fragment key={item.projectId}>
            <span className="flex Bold ellipsis">{item.companyName}</span>
            {item.projectId === currentProject.projectId && <Icon className="ThemeColor Font20" icon="done" />}
          </Fragment>
        )),
        message: (
          <div className="flexRow header">
            <span className="Font13">{_l('切换网络')}</span>
            <div
              className="closeIcon"
              onClick={() => {
                ActionSheet.close();
              }}
            >
              <Icon icon="close" />
            </div>
          </div>
        ),
      },
      buttonIndex => {
        if (buttonIndex === -1) return;
        const project = projects[buttonIndex];
        safeLocalStorageSetItem('currentProjectId', project.projectId);
        setCurrentProject(project);
        changeProject();
      },
    );
  };

  return (
    <div className="flexRow valignWrapper pLeft16 pRight16 pTop10 pBottom10" onClick={handleSelectProject}>
      <div className="Font17 bold ellipsis">{currentProject.companyName}</div>
      <div className="flexColumn valignWrapper mLeft10">
        <Icon className="Gray_9e Font14" icon="expand_less" style={{ lineHeight: '10px' }} />
        <Icon className="Gray_9e Font14" icon="expand_more" style={{ lineHeight: '10px' }} />
      </div>
    </div>
  );
}
