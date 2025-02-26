import React, { useRef, useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import Trigger from 'rc-trigger';
import cx from 'classnames';
import { emitter, getCurrentProject } from 'src/util';
import { ScrollView, Menu, MenuItem, Icon } from 'ming-ui';
import { VerticalMiddle } from 'worksheet/components/Basics';
import CommonUserHandle from '../components/CommonUserHandle';
import GlobalSearch from '../components/GlobalSearch';
import { purchaseMethodFunc } from 'src/components/pay/versionUpgrade/PurchaseMethodModal';
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
  display: inline-flex;
  max-width: calc(100% - 172px);
  .companyName {
    display: inline-block;
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
  width: 400px;
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
  width: 400px;
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

  .trial {
    color: #ffb100 !important;
  }
  .free {
    color: #4caf50 !important;
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

const DashboardSearch = styled.div`
  width: 267px;
  background: rgba(0, 0, 0, 0.03);
  display: flex;
  align-items: center;
  height: 36px;
  padding: 12px;
  border-radius: 18px;
  margin: 0 auto;
  cursor: pointer;
  justify-content: center;
  .icon {
    font-size: 20px;
    color: rgb(0, 0, 0, 0.6);
  }
  span {
    color: #757575;
    margin: 0 2px 1px 4px;
  }
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

const UpgradeWrap = styled.div`
  .upgrade {
    min-width: 67px;
    height: 26px;
    line-height: 24px;
    background-color: #000;
    border-radius: 13px;
    padding: 0 12px 0 10px;
    .icon {
      color: #fac03a;
    }
    &:hover {
      background-color: #444;
    }
  }
`;

function AppCenterHeader(props) {
  const projectId = _.get(props, 'match.params.projectId');
  const [projects, setProjects] = useState(md.global.Account.projects);
  const createRef = useRef();
  const commonUserHandleRef = useRef();
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
  const [globalSearchVisible, setGlobalSearchVisible] = useState(false);
  let menuContent = (
    <ProjectsMenu>
      {[
        ...projects,
        {
          companyName: _l('外部协作'),
          projectId: 'external',
        },
      ].map((project, i) => {
        const isFree = project.licenseType === 0; // 免费版
        const isTrial = project.licenseType === 2; // 试用版

        return (
          <ProjectItem
            key={i}
            className={cx('flexRow', { active: currentProject && currentProject.projectId === project.projectId })}
            onClick={() => {
              setPopupVisible(false);
              setCurrentProject(project);
              if (project.projectId !== 'external') {
                safeLocalStorageSetItem('currentProjectId', project.projectId);
              }
              emitter.emit('CHANGE_CURRENT_PROJECT', project);
            }}
          >
            <div className="flex ellipsis"> {project.companyName}</div>
            <div className={cx('Font12 mLeft10 Gray_9e Normal', { trial: isTrial, free: isFree })}>
              {isFree ? _l('免费版') : isTrial ? _l('试用') : _.get(project, 'version.name')}
            </div>
          </ProjectItem>
        );
      })}
    </ProjectsMenu>
  );
  if (projects.length > Math.ceil((window.innerHeight - 160) / 40)) {
    menuContent = <ScrollCon height={Math.ceil((window.innerHeight - 160) / 40) * 40}>{menuContent}</ScrollCon>;
  }

  return (
    <Con className="appCenterHeader">
      <div className="flex flexRow">
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
                      <NewMenuItem onClick={() => window.open('/enterpriseRegister?type=create')}>
                        {_l('创建组织')}
                      </NewMenuItem>
                    </Menu>
                  }
                  getPopupContainer={() => createRef.current}
                  destroyPopupOnHide
                >
                  <div ref={createRef}>
                    <NewMenuItem className="ThemeColor3">
                      <i className="icon icon-add ThemeColor3 Font16 mRight6"></i>
                      <span className="Font15">{_l('加入/创建组织')}</span>
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
        {_.includes([0, 2], currentProject.licenseType) && (
          <UpgradeWrap className="flexCenter mLeft8">
            <div className="Gray_75 Font12 mRight6 nowrap">
              {currentProject.licenseType == 0
                ? _l('免费版')
                : _.get(currentProject, 'currentLicense.expireDays')
                ? _l('试用期剩余%0天', _.get(currentProject, 'currentLicense.expireDays'))
                : ''}
            </div>
          </UpgradeWrap>
        )}
      </div>
      <Flex>
        <DashboardSearch
          onClick={() => {
            setGlobalSearchVisible(true);
            GlobalSearch({
              match: props.match,
              onClose: () => setGlobalSearchVisible(false),
            });
          }}
        >
          <Icon icon="search" />
          <span>{_l('超级搜索(F)')}</span>
        </DashboardSearch>
      </Flex>

      <CommonUserHandle type="dashboard" currentProject={currentProject} />
    </Con>
  );
}

export default withRouter(AppCenterHeader);
