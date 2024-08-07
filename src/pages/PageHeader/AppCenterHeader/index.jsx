import React, { useRef, useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import Trigger from 'rc-trigger';
import cx from 'classnames';
import { emitter, getCurrentProject } from 'src/util';
import { ScrollView, Menu, MenuItem } from 'ming-ui';
import { VerticalMiddle } from 'worksheet/components/Basics';
import CommonUserHandle from '../components/CommonUserHandle';
import _ from 'lodash';

const Con = styled.div`
  display: flex;
  align-items: center;
  background: #fff;
  height: 50px;
  padding-left: 20px;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.16);
`;

const ProjectSwitch = styled(VerticalMiddle)`
  cursor: pointer;
  padding: 3px 5px;
  border-radius: 4px;
  .companyName {
    display: inline-block;
    max-width: 500px;
    line-height: 1.4em;
  }
  .switchIcon {
    margin-left: 4px;
    display: inline-block;
    font-size: 18px;
    color: #9d9d9d;
  }
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

const Flex = styled.div`
  flex: 1;
`;

const ProjectsMenuCon = styled.div`
  width: 300px;
  background: #fff;
  border-radius: 3px;
  padding-bottom: 5px;
  box-shadow: 0 4px 20px rgb(0 0 0 / 13%), 0 2px 6px rgb(0 0 0 / 10%);
  .nano-pane {
    z-index: 20;
  }
`;

const ProjectsMenu = styled.div`
  padding-top: 5px;
  width: 300px;
`;

const ProjectItem = styled.div`
  cursor: pointer;
  padding: 0 20px;
  font-size: 15px;
  font-weight: 500;
  height: 40px;
  line-height: 40px;
  &.active {
    color: #2196f3;
    background: rgb(33, 150, 243, 0.08);
  }
  &:not(.active):hover {
    background: #f7f7f7;
  }
`;

const ScrollCon = styled(ScrollView)`
  height: ${({ height }) => height}px !important;
`;

const Hr = styled.div`
  height: 0px;
  border-top: 1px solid #eaeaea;
  margin: 5px 0;
`;

const NewMenuItem = styled(MenuItem)`
  &.ming.Item.MenuItem .Item-content {
    &:not(.disabled):hover {
      color: inherit !important;
      background-color: #f7f7f7 !important;
    }
  }
`;

function AppCenterHeader(props) {
  const projectId = _.get(props, 'match.params.projectId');
  const [projects, setProjects] = useState(md.global.Account.projects);
  const createRef = useRef();
  const [currentProject, setCurrentProject] = useState(
    getCurrentProject(projectId || localStorage.getItem('currentProjectId')),
  );

  useEffect(() => {
    const project = getCurrentProject(projectId || localStorage.getItem('currentProjectId'));
    if (_.isEmpty(project)) {
      if (projects[0] && projects[0].projectId) {
        setCurrentProject(projects[0]);
        safeLocalStorageSetItem('currentProjectId', projects[0].projectId);
      } else {
        setCurrentProject({ companyName: _l('外部协作'), projectId: 'external' });
      }
    }
  }, []);
  const [popupVisible, setPopupVisible] = useState();
  let menuContent = (
    <ProjectsMenu>
      {[
        ...projects,
        {
          companyName: _l('外部协作'),
          projectId: 'external',
        },
      ].map((project, i) => (
        <ProjectItem
          key={i}
          className={cx('ellipsis', { active: currentProject && currentProject.projectId === project.projectId })}
          onClick={() => {
            setPopupVisible(false);
            setCurrentProject(project);
            if (project.projectId !== 'external') {
              safeLocalStorageSetItem('currentProjectId', project.projectId);
            }
            emitter.emit('CHANGE_CURRENT_PROJECT', project);
          }}
        >
          {project.companyName}
        </ProjectItem>
      ))}
    </ProjectsMenu>
  );
  if (projects.length > Math.ceil((window.innerHeight - 160) / 40)) {
    menuContent = <ScrollCon height={Math.ceil((window.innerHeight - 160) / 40) * 40}>{menuContent}</ScrollCon>;
  }

  return (
    <Con className="appCenterHeader">
      {currentProject && (
        <Trigger
          popupVisible={popupVisible}
          action={['click']}
          popupAlign={{
            points: ['tl', 'bl'],
            offset: [0, 4],
          }}
          popup={
            <ProjectsMenuCon>
              {menuContent}

              <Hr />
              <Trigger
                action={['hover']}
                popupAlign={{
                  points: ['bl', 'br'],
                  offset: [2, 5],
                }}
                popup={
                  <Menu className="Relative">
                    <NewMenuItem onClick={() => window.open('/enterpriseRegister?type=add')}>
                      {_l('加入组织')}
                    </NewMenuItem>
                  </Menu>
                }
                getPopupContainer={() => createRef.current}
                destroyPopupOnHide
              >
                <div ref={createRef}>
                  <NewMenuItem className="ThemeColor3">
                    <i className="icon icon-add ThemeColor3 Font16 mRight6" />
                    <span className="Font15">{_l('加入组织')}</span>
                  </NewMenuItem>
                </div>
              </Trigger>
            </ProjectsMenuCon>
          }
          onPopupVisibleChange={setPopupVisible}
        >
          <ProjectSwitch className="Font17 bold Hand">
            <div className="companyName ellipsis">
              {(_.find(projects, v => v.projectId === currentProject.projectId) || {}).companyName ||
                currentProject.companyName}
            </div>
            <i className="switchIcon icon icon-arrow-down-border"></i>
          </ProjectSwitch>
        </Trigger>
      )}
      <Flex />

      <CommonUserHandle type="dashboard" currentProject={currentProject} />
    </Con>
  );
}

export default withRouter(AppCenterHeader);
