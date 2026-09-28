import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { string } from 'prop-types';
import styled from 'styled-components';
import { Icon, MdLink } from 'ming-ui';
import { Button, Dropdown, Tooltip } from 'ming-ui/antd-components';
import appManagementApi from 'src/api/appManagement';
import privateGuideApi from 'src/api/privateGuide';
import { VerticalMiddle } from 'worksheet/components/Basics';
import addFriends from 'src/components/addFriends';
import { hasBackStageAdminAuth } from 'src/components/checkPermission';
import createCalendar from 'src/components/createCalendar/load';
import createTask from 'src/components/createTask/load';
import createFeed from 'src/pages/feed/components/createFeed/load';
import createGroup from 'src/pages/Group/createGroup/load';
import { isSandboxEnvironment } from 'src/utils/domain/app/sandbox';
import { canEditApp, canEditData } from 'src/utils/domain/permission/app';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import { getAppFeaturesVisible } from 'src/utils/platform/navigation/query';
import LanguageList from '../LanguageList';
import MyProcessEntry from '../MyProcessEntry';
import ConnectAiEntry from './ConnectAiEntry';
import CreateAppItem from './CreateAppItem';
import './index.less';

const AdminEntry = styled(VerticalMiddle)`
  cursor: pointer;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 28px;
  height: 28px;
  border-radius: 28px;
  margin: 0 5px;
  .icon {
    font-size: 20px;
    color: rgb(0, 0, 0, 0.6);
  }
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

function getAddMenuItems() {
  const feedVisible = !md.global.SysSettings.forbidSuites.includes('1');
  const taskVisible = !md.global.SysSettings.forbidSuites.includes('2');
  const calendarVisible = !md.global.SysSettings.forbidSuites.includes('3');
  const knowledgeVisible = !md.global.SysSettings.forbidSuites.includes('4');
  const suiteItems = [
    feedVisible && {
      key: 'create-feed',
      icon: <i className="icon icon-edit Font18" />,
      label: _l('创建动态'),
      onClick: () => createFeed(),
    },
    taskVisible && {
      key: 'create-task',
      icon: <i className="icon icon-task-responsible Font18" />,
      label: _l('创建任务'),
      onClick: () => createTask(),
    },
    calendarVisible && {
      key: 'create-calendar',
      icon: <i className="icon icon-bellSchedule Font18" />,
      label: _l('创建日程'),
      onClick: () => createCalendar(),
    },
    knowledgeVisible && {
      key: 'upload-file',
      icon: <i className="icon icon-cloud_upload Font18" />,
      label: _l('上传文件'),
      onClick: () => window.open(pathCompletion('/apps/kcupload')),
    },
  ].filter(Boolean);

  return [
    ...suiteItems,
    !!suiteItems.length && { key: 'suite-divider', type: 'divider' },
    {
      key: 'invite-member',
      icon: <i className="icon icon-invite Font18" />,
      label: _l('邀请'),
      onClick: () => addFriends({ selectProject: true }),
    },
    {
      key: 'create-group',
      icon: <i className="icon icon-group Font18" />,
      label: _l('群组'),
      onClick: () => createGroup({}),
    },
  ].filter(Boolean);
}

let CommonUserHandle = class CommonUserHandle extends Component {
  static propTypes = {
    type: string,
    currentProject: PropTypes.shape({}),
  };
  state = {
    newVersion: null,
    isLicense: true,
  };

  componentDidMount() {
    if ((window.platformENV.isOverseas || window.platformENV.isLocal) && md.global.Account.superAdmin) {
      privateGuideApi.getPlatformRemindInfo().then(data => {
        this.setState({
          newVersion: data.newVersion,
          isLicense: data.isLicense,
        });
      });
    }
  }

  render() {
    const { newVersion, isLicense } = this.state;
    const { type, currentProject = {} } = this.props;
    const hasProjectAdminAuth =
      currentProject.projectId &&
      currentProject.projectId !== 'external' &&
      hasBackStageAdminAuth({
        projectId: currentProject.projectId,
      }); // 获取url参数

    const { tr } = getAppFeaturesVisible();

    if (window.isPublicApp || !tr) {
      return null;
    }

    return (
      <div
        className={cx('commonUserHandleWrap', {
          dashboardCommonUserHandleWrap: type === 'dashboard',
        })}
      >
        {['native', 'integration'].includes(type) && (
          <Fragment>
            {type === 'native' && (
              <Dropdown trigger={['click']} placement="bottom" menu={{ items: getAddMenuItems() }}>
                <div className="addOperationIconWrap mLeft20 mRight15 pointer">
                  <Icon icon="add_circle" className="Font26" />
                </div>
              </Dropdown>
            )}
            <MyProcessEntry type={type} />
          </Fragment>
        )}

        {type !== 'appPkg' && (
          <Fragment>
            {type === 'dashboard' && md.global.SysSettings.enableAIConnector !== false && (
              <ConnectAiEntry projectId={currentProject?.projectId} />
            )}
            {type === 'dashboard' && hasProjectAdminAuth && !isSandboxEnvironment() && (
              <MdLink to={`/admin/home/${currentProject.projectId}`}>
                <Button
                  style={{
                    '--hap-btn-bg-color-hover': 'var(--dashboard-search-hover-bg)',
                  }}
                  color="default"
                  variant="text"
                  shape="round"
                  icon={<Icon icon="business" className="Font20" />}
                >
                  {_l('组织管理')}
                </Button>
              </MdLink>
            )}
            {(window.platformENV.isOverseas || window.platformENV.isLocal) && (
              <Fragment>
                {type === 'dashboard' && !!newVersion && (
                  <Tooltip title={_l('发现新版本：%0，点击查看', newVersion)}>
                    <AdminEntry
                      onClick={() =>
                        window.open(
                          window.platformENV.isOverseas
                            ? 'https://docs-pd.nocoly.com/version'
                            : 'https://docs-pd.mingdao.com/version',
                        )
                      }
                    >
                      <Icon
                        icon="score-up"
                        className="Font20"
                        style={{
                          color: '#20CA86',
                        }}
                      />
                    </AdminEntry>
                  </Tooltip>
                )}
                {type === 'dashboard' && !isLicense && (
                  <Tooltip title={_l('平台授权已失效，点击查看')}>
                    <AdminEntry
                      onClick={() => {
                        location.href = md.global.Config.PlatformUrl + 'hap/platform';
                      }}
                    >
                      <Icon
                        icon="error1"
                        className="Font20"
                        style={{
                          color: '#f44336',
                        }}
                      />
                    </AdminEntry>
                  </Tooltip>
                )}
              </Fragment>
            )}
          </Fragment>
        )}
      </div>
    );
  }
};
CommonUserHandle = withRouter(CommonUserHandle);
export default CommonUserHandle;
let LeftCommonUserHandle = class LeftCommonUserHandle extends Component {
  static propTypes = {
    type: string,
  };
  state = {
    roleEntryVisible: true,
  };

  componentDidMount() {
    const { id, permissionType, isLock } = this.props.data;

    if (!canEditData(permissionType) && !canEditApp(permissionType, isLock)) {
      appManagementApi
        .getAppRoleSetting({
          appId: id,
        })
        .then(data => {
          const { appSettingsEnum } = data;
          this.setState({
            roleEntryVisible: appSettingsEnum === 1,
          });
        });
    }
  }

  render() {
    const { roleEntryVisible } = this.state;
    const { data, sheet, match } = this.props;
    const { projectId, id, permissionType, isLock, appStatus, sourceType } = data;
    const isUpgrade = appStatus === 4; // 获取url参数

    const { tr } = getAppFeaturesVisible();

    if (window.isPublicApp || !tr || appStatus === 300016) {
      return null;
    }

    return (
      <div className="commonUserHandleWrap leftCommonUserHandleWrap w100">
        {!isUpgrade && (
          <Fragment>
            <CreateAppItem
              isCharge={sheet.isCharge}
              appId={id}
              groupId={match.params.groupId}
              worksheetId={match.params.worksheetId}
              projectId={projectId}
              appPkg={data}
            >
              <div className="headerColorSwitch">
                <Icon icon="add" className="Font20 pointer" />
              </div>
            </CreateAppItem>
            {_.includes([1, 5], appStatus) && !md.global.Account.isPortal && (
              <Fragment>
                {!window.isPublicApp && canEditApp(permissionType, isLock) && (
                  <MdLink to={`/app/${id}/workflow`}>
                    <Tooltip title={_l('工作流')} placement="bottom">
                      <Icon icon="workflow" className="Font20 headerColorSwitch" />
                    </Tooltip>
                  </MdLink>
                )}
                {roleEntryVisible && (
                  <MdLink to={`/app/${id}/role`}>
                    <Tooltip title={_l('用户')} placement="bottom">
                      <Icon icon="group" className="Font20 headerColorSwitch" />
                    </Tooltip>
                  </MdLink>
                )}
              </Fragment>
            )}
          </Fragment>
        )}
        <LanguageList
          placement={canEditApp(permissionType, isLock) ? 'top' : 'topLeft'}
          app={data}
          isCharge={canEditApp(permissionType, sourceType === 60 ? false : isLock)}
        >
          <Tooltip title={_l('应用语言')} placement="bottom">
            <div className="headerColorSwitch pointer">
              <Icon icon="language" className="Font20" />
            </div>
          </Tooltip>
        </LanguageList>
      </div>
    );
  }
};
LeftCommonUserHandle = withRouter(LeftCommonUserHandle);
export { LeftCommonUserHandle };
