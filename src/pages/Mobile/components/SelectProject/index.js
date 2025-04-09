import React, { Fragment, useState, useEffect } from 'react';
import { ActionSheet } from 'antd-mobile';
import { Icon } from 'ming-ui';
import { getCurrentProject } from 'src/util';
import './index.less';

export default function SelectProject(props) {
  const { changeProject = () => {} } = props;
  let actionSheetHandler = null;
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

  useEffect(() => {
    return () => {
      actionSheetHandler && actionSheetHandler.close();
    }
  }, []);

  const handleSelectProject = () => {
    actionSheetHandler = ActionSheet.show({
      popupClassName: 'selectProjectWrap',
      actions: projects.map(item => {
        return {
          project: item,
          key: item.projectId,
          text: (
            <Fragment key={item.projectId}>
              <span className="flex Bold ellipsis">{item.companyName}</span>
              {item.projectId === currentProject.projectId && <Icon className="ThemeColor Font20" icon="done" />}
            </Fragment>
          )
        }
      }),
      extra: (
        <div className="flexRow header">
          <span className="Font13">{_l('切换组织')}</span>
          <div className="closeIcon" onClick={() => actionSheetHandler.close()}>
            <Icon icon="close" />
          </div>
        </div>
      ),
      onAction: (action) => {
        const { project } = action;
        safeLocalStorageSetItem('currentProjectId', project.projectId);
        setCurrentProject(project);
        changeProject();
        actionSheetHandler.close();
      }
    });
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
