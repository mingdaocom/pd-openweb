import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Dropdown } from 'ming-ui/antd-components';
import { VerticalMiddle } from 'worksheet/components/Basics';
import { getRequest } from 'src/utils/platform/browser/device';
import { emitter } from 'src/utils/platform/browser/dom';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import { getCurrentProject } from 'src/utils/services/project';

const ProjectSwitch = styled(VerticalMiddle)`
  cursor: pointer;
  padding: 3px 5px;
  border-radius: 4px;
  .companyName {
    display: inline-block;
    max-width: 500px;
    line-height: 1.4em;
    font-size: 16px;
  }
  .switchIcon {
    margin-left: 4px;
    display: inline-block;
    font-size: 18px;
    color: var(--color-text-tertiary);
  }
  &:hover {
    background: var(--color-background-disabled);
  }
`;

const ACTIVE_PROJECT_MENU_ITEM_STYLE = {
  color: 'var(--color-primary)',
  background: 'var(--color-primary-transparent)',
};

const PROJECT_MENU_LABEL_STYLE = { fontWeight: 500 };

function SwitchProject() {
  const request = getRequest();
  const projectId = request.projectId;
  const projects = md.global.Account.projects;
  const [currentProject, setCurrentProject] = useState(() => {
    const project = getCurrentProject(projectId || localStorage.getItem('currentProjectId'));

    if (!_.isEmpty(project)) return project;

    return projects[0]?.projectId ? projects[0] : { companyName: _l('外部协作'), projectId: 'external' };
  });
  const [popupVisible, setPopupVisible] = useState(false);

  useEffect(() => {
    const project = getCurrentProject(projectId || localStorage.getItem('currentProjectId'));

    if (_.isEmpty(project) && projects[0]?.projectId) {
      safeLocalStorageSetItem('currentProjectId', projects[0].projectId);
    }
  }, [projectId, projects]);

  const canCreateProject = md.global.Account.superAdmin || md.global.SysSettings.enableCreateProject;
  const projectMenuItems = projects
    .map(project => {
      const isActive = currentProject.projectId === project.projectId;

      return {
        key: `project:${project.projectId}`,
        label: (
          <span className="Font15 ellipsis" style={PROJECT_MENU_LABEL_STYLE}>
            {project.companyName}
          </span>
        ),
        style: {
          ...(isActive ? ACTIVE_PROJECT_MENU_ITEM_STYLE : {}),
        },
      };
    })
    .concat([
      { type: 'divider' },
      canCreateProject
        ? {
            key: 'createProject',
            label: (
              <span className="colorPrimary">
                <i className="icon icon-add colorPrimary Font16 mRight6" />
                <span className="Font15">{_l('加入/创建组织')}</span>
              </span>
            ),
            popupStyle: { width: 180 },
            children: [
              { key: 'joinProject', label: _l('加入组织') },
              { key: 'createOrganization', label: _l('创建组织') },
            ],
          }
        : {
            key: 'joinProject',
            label: (
              <span className="colorPrimary">
                <i className="icon icon-add colorPrimary Font16 mRight6" />
                <span className="Font15">{_l('加入组织')}</span>
              </span>
            ),
          },
    ]);

  const handleProjectMenuClick = ({ key }) => {
    setPopupVisible(false);

    if (key === 'joinProject') {
      window.open(pathCompletion('/enterpriseRegister?type=add'));
    } else if (key === 'createOrganization') {
      window.open(pathCompletion('/enterpriseRegister?type=create'));
    } else if (key.startsWith('project:')) {
      const project = _.find(projects, item => `project:${item.projectId}` === key);

      if (!project) return;

      setCurrentProject(project);
      safeLocalStorageSetItem('currentProjectId', project.projectId);
      emitter.emit('CHANGE_CURRENT_PROJECT', project);
    }
  };

  return currentProject ? (
    <Dropdown
      open={popupVisible}
      trigger={['click']}
      placement="bottomLeft"
      align={{ offset: [0, 4] }}
      menu={{
        items: projectMenuItems,
        expandIcon: null,
        selectable: true,
        selectedKeys: [`project:${currentProject.projectId}`],
        style: {
          width: 300,
          maxHeight: Math.max(window.innerHeight - 110, 200),
          overflowY: 'auto',
        },
        onClick: handleProjectMenuClick,
      }}
      onOpenChange={setPopupVisible}
    >
      <ProjectSwitch className="Font17 Hand">
        <div className="companyName ellipsis">{currentProject.companyName}</div>
        <i className="switchIcon icon icon-arrow-down-border"></i>
      </ProjectSwitch>
    </Dropdown>
  ) : (
    ''
  );
}

export default SwitchProject;
