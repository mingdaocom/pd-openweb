import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { string } from 'prop-types';
import styled from 'styled-components';
import { Icon, MdLink, Tooltip } from 'ming-ui';
import appManagementApi from 'src/api/appManagement';
import privateGuideApi from 'src/api/privateGuide';
import { VerticalMiddle } from 'worksheet/components/Basics';
import { hasBackStageAdminAuth } from 'src/components/checkPermission';
import { canEditApp, canEditData } from 'src/pages/worksheet/redux/actions/util.js';
import { getAppFeaturesVisible } from 'src/utils/app';
import AddMenu from '../AddMenu';
import LanguageList from '../LanguageList';
import MyProcessEntry from '../MyProcessEntry';
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

const EntryWrap = styled.div`
  height: 32px;
  line-height: 32px;
  border-radius: 20px 20px 20px 20px;
  padding: 0 10px;
  cursor: pointer;
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

@withRouter
export default class CommonUserHandle extends Component {
  static propTypes = {
    type: string,
    currentProject: PropTypes.shape({}),
  };
  state = {
    addMenuVisible: false,
    newVersion: null,
    isLicense: true,
  };

  componentDidMount() {
    if (md.global.Account.superAdmin) {
      privateGuideApi.getPlatformRemindInfo().then(data => {
        this.setState({ newVersion: data.newVersion, isLicense: data.isLicense });
      });
    }
  }

  handleAddMenuVisible(visible) {
    this.setState({
      addMenuVisible: visible,
    });
  }

  render() {
    const { newVersion, isLicense } = this.state;
    const { type, currentProject = {} } = this.props;
    const hasProjectAdminAuth =
      currentProject.projectId &&
      currentProject.projectId !== 'external' &&
      hasBackStageAdminAuth({ projectId: currentProject.projectId });

    // 获取url参数
    const { tr } = getAppFeaturesVisible();
    if (window.isPublicApp || !tr) {
      return null;
    }

    return (
      <div className={cx('commonUserHandleWrap', { dashboardCommonUserHandleWrap: type === 'dashboard' })}>
        {['native', 'integration'].includes(type) && (
          <React.Fragment>
            {type === 'native' && (
              <Tooltip
                popupVisible={this.state.addMenuVisible}
                text={
                  <AddMenu
                    onClose={() => {
                      this.setState({ addMenuVisible: false });
                    }}
                  />
                }
                action={['click']}
                mouseEnterDelay={0.2}
                themeColor="white"
                tooltipClass="pAll0"
                autoCloseDelay={0}
                onPopupVisibleChange={this.handleAddMenuVisible.bind(this)}
              >
                <div className="addOperationIconWrap mLeft20 mRight15 pointer">
                  <Icon icon="add_circle Font30" />
                </div>
              </Tooltip>
            )}
            <MyProcessEntry type={type} />
          </React.Fragment>
        )}

        {type !== 'appPkg' && (
          <React.Fragment>
            {type === 'dashboard' && hasProjectAdminAuth && (
              <MdLink to={`/admin/home/${currentProject.projectId}`}>
                <EntryWrap>
                  <i className="icon icon-business Font20 Gray_75 TxtMiddle"></i>
                  <span className="Gray_75 mLeft5 TxtMiddle">{_l('组织管理')}</span>
                </EntryWrap>
              </MdLink>
            )}
            {type === 'dashboard' && !!newVersion && (
              <AdminEntry
                data-tip={_l('发现新版本：%0，点击查看', newVersion)}
                className="tip-bottom-left"
                onClick={() => window.open('https://docs-pd.mingdao.com/version')}
              >
                <Icon icon="score-up" className="Font20" style={{ color: '#20CA86' }} />
              </AdminEntry>
            )}
            {type === 'dashboard' && !isLicense && (
              <AdminEntry
                data-tip={_l('平台授权已失效，点击查看')}
                className="tip-bottom-left"
                onClick={() => {
                  location.href = md.global.Config.WebUrl + 'pm/sysconfig/platform';
                }}
              >
                <Icon icon="error1" className="Font20" style={{ color: '#f44336' }} />
              </AdminEntry>
            )}
            {/*<BtnCon
              className={cx(`${type === 'native' ? 'mLeft10' : ''}`, { isDashboard: type === 'dashboard' })}
              data-tip={_l('帮助')}
              onClick={() => window.KF5SupportBoxAPI && window.KF5SupportBoxAPI.open()}
            >
              <Icon icon="workflow_help" />
            </BtnCon>*/}
          </React.Fragment>
        )}
      </div>
    );
  }
}

@withRouter
export class LeftCommonUserHandle extends Component {
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
          this.setState({ roleEntryVisible: appSettingsEnum === 1 });
        });
    }
  }

  render() {
    const { roleEntryVisible } = this.state;
    const { data, sheet, match } = this.props;
    const { projectId, id, permissionType, isLock, appStatus, sourceType } = data;
    const isUpgrade = appStatus === 4;
    // 获取url参数
    const { tr } = getAppFeaturesVisible();

    if (window.isPublicApp || !tr) {
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
            >
              <div className="headerColorSwitch">
                <Icon icon="add" className="Font20 pointer" />
              </div>
            </CreateAppItem>
            {_.includes([1, 5], appStatus) && !md.global.Account.isPortal && (
              <Fragment>
                {!window.isPublicApp && canEditApp(permissionType, isLock) && (
                  <MdLink data-tip={_l('工作流')} className="tip-top" to={`/app/${id}/workflow`}>
                    <Icon icon="workflow" className="Font20 headerColorSwitch" />
                  </MdLink>
                )}
                {roleEntryVisible && (
                  <MdLink data-tip={_l('用户')} className="tip-top" to={`/app/${id}/role`}>
                    <Icon icon="group" className="Font20 headerColorSwitch" />
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
          <div className="headerColorSwitch tip-top pointer" data-tip={_l('应用语言')}>
            <Icon icon="language" className="Font20" />
          </div>
        </LanguageList>
      </div>
    );
  }
}
