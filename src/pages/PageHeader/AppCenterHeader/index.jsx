import React, { Fragment, useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Dropdown } from 'ming-ui/antd-components';
import { VerticalMiddle } from 'worksheet/components/Basics';
import { purchaseMethodFunc } from 'src/components/pay/versionUpgrade/PurchaseMethodModal';
import { versionUpgradeModal } from 'src/components/pay/versionUpgrade/VersionUpgradeModal';
import { emitter } from 'src/utils/platform/browser/dom';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import { getCurrentProject } from 'src/utils/services/project';
import CommonUserHandle from '../components/CommonUserHandle';
import GlobalSearch from '../components/GlobalSearch';

const Mask = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

const Con = styled.div`
  display: flex;
  align-items: center;
  background: var(--color-background-secondary);
  height: 50px;
  padding-left: 20px;
  box-shadow: var(--shadow-md);
  --dashboard-search-bg: rgba(0, 0, 0, 0.03);
  --dashboard-search-hover-bg: rgba(0, 0, 0, 0.08);
  [data-theme='dark'] & {
    --dashboard-search-bg: rgba(255, 255, 255, 0.08);
    --dashboard-search-hover-bg: rgba(255, 255, 255, 0.12);
  }
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
    color: var(--color-text-tertiary);
  }
  &:hover {
    background: var(--dashboard-search-hover-bg);
  }
`;

const Flex = styled.div`
  flex: 1;
`;

const ACTIVE_PROJECT_MENU_ITEM_STYLE = {
  color: 'var(--color-primary)',
  background: 'var(--color-primary-transparent)',
};

const DashboardSearch = styled.div`
  width: 267px;
  background: var(--dashboard-search-bg);
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
    color: var(--color-text-secondary);
  }
  span {
    color: var(--color-text-secondary);
    margin: 0 2px 1px 4px;
  }
  &:hover {
    background: var(--dashboard-search-hover-bg);
  }
`;

const UpgradeWrap = styled.div`
  .upgrade {
    min-width: 67px;
    height: 26px;
    line-height: 24px;
    background-color: var(--color-background-inverse);
    border-radius: 13px;
    padding: 0 12px 0 10px;
    .icon {
      color: var(--color-warning-border);
    }
    &:hover {
      background-color: var(--color-background-inverse);
    }
  }
`;

function AppCenterHeader(props) {
  const projectId = _.get(props, 'match.params.projectId');
  const projects = md.global.Account.projects;
  const [currentProject, setCurrentProject] = useState(() => {
    const project = getCurrentProject(projectId || localStorage.getItem('currentProjectId'));

    if (!_.isEmpty(project)) return project;

    return projects[0]?.projectId ? projects[0] : { companyName: _l('外部协作'), projectId: 'external' };
  });

  useEffect(() => {
    const project = getCurrentProject(projectId || localStorage.getItem('currentProjectId'));

    if (_.isEmpty(project) && projects[0]?.projectId) {
      safeLocalStorageSetItem('currentProjectId', projects[0].projectId);
    }
  }, [projectId, projects]);

  // 跟随外部组织切换（右侧 Mingo 等同样 emit CHANGE_CURRENT_PROJECT）：更新头部选中组织，保持两边一致
  useEffect(() => {
    const onChangeProject = project => {
      if (project && project.projectId) setCurrentProject(project);
    };

    emitter.addListener('CHANGE_CURRENT_PROJECT', onChangeProject);
    return () => emitter.removeListener('CHANGE_CURRENT_PROJECT', onChangeProject);
  }, []);
  const [popupVisible, setPopupVisible] = useState(false);
  const canCreateProject = md.global.Account.superAdmin || md.global.SysSettings.enableCreateProject;
  const projectOptions = [
    ...projects,
    {
      companyName: _l('外部协作'),
      projectId: 'external',
    },
  ];
  const projectMenuItems = projectOptions
    .map(project => {
      const isFree = project.licenseType === 0;
      const isTrial = project.licenseType === 2;
      const isActive = currentProject.projectId === project.projectId;

      return {
        key: `project:${project.projectId}`,
        label: <span className="Font15 bold">{project.companyName}</span>,
        extra: (
          <span
            className={cx('Font12 Normal', { textTertiary: !isTrial && !isFree })}
            style={{ color: isFree ? 'var(--color-success)' : isTrial ? 'var(--color-warning)' : undefined }}
          >
            {isFree ? _l('免费版') : isTrial ? _l('试用') : _.get(project, 'version.name')}
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
      const project = _.find(projectOptions, item => `project:${item.projectId}` === key);

      if (!project) return;

      setCurrentProject(project);
      if (project.projectId !== 'external') {
        safeLocalStorageSetItem('currentProjectId', project.projectId);
      }

      emitter.emit('CHANGE_CURRENT_PROJECT', project);
    }
  };

  const handleUpgrade = () => {
    const isTrial = currentProject.licenseType == 2;

    if (window.platformENV.isOverseas) {
      versionUpgradeModal({ projectId: currentProject.projectId });
      return;
    }

    purchaseMethodFunc({
      projectId: currentProject.projectId,
      isTrial,
    });
  };

  return (
    <Fragment>
      <Mask className="appCenterHeaderMask" />
      <Con className="appCenterHeader">
        <div className="flex flexRow">
          {currentProject && (
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
                  width: 400,
                  maxHeight: Math.max(window.innerHeight - 110, 200),
                  overflowY: 'auto',
                },
                onClick: handleProjectMenuClick,
              }}
              onOpenChange={setPopupVisible}
            >
              <ProjectSwitch className="Font17 bold Hand" title={window.isMDClient ? location.origin : ''}>
                <div className="companyName ellipsis">
                  {(_.find(projects, v => v.projectId === currentProject.projectId) || {}).companyName ||
                    currentProject.companyName}
                </div>
                <i className="switchIcon icon icon-arrow-down-border"></i>
              </ProjectSwitch>
            </Dropdown>
          )}
          {_.includes([0, 2], currentProject.licenseType) && (
            <UpgradeWrap className="flexCenter mLeft8">
              <div className="textSecondary Font12 mRight6 nowrap">
                {currentProject.licenseType == 0
                  ? _l('免费版')
                  : _.get(currentProject, 'currentLicense.expireDays')
                    ? _l('试用期剩余%0天', _.get(currentProject, 'currentLicense.expireDays'))
                    : ''}
              </div>

              {!window.platformENV.isLocal && (
                <div className="upgrade Hand" onClick={handleUpgrade}>
                  <i className="icon icon-auto_awesome Font16 TxtMiddle mRight5" />
                  <span className="Font12 textWhite TxtMiddle bold">
                    {currentProject.licenseType == 2 ? _l('购买') : _l('升级')}
                  </span>
                </div>
              )}
            </UpgradeWrap>
          )}
        </div>
        <Flex>
          <DashboardSearch
            onClick={() => {
              GlobalSearch({
                match: props.match,
              });
            }}
          >
            <Icon icon="search" />
            <span>{_l('超级搜索(F)')}</span>
          </DashboardSearch>
        </Flex>

        <CommonUserHandle type="dashboard" currentProject={currentProject} />
      </Con>
    </Fragment>
  );
}

export default withRouter(AppCenterHeader);
