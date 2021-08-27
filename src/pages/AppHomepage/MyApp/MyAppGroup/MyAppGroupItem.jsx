import React, { Component, Fragment } from 'react';
import { string, arrayOf, bool, shape, number } from 'prop-types';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { navigateTo } from 'src/router/navigateTo';
import styled from 'styled-components';
import SortableAppList from './SortableAppList';
import Invite from 'src/components/common/inviteMember/inviteMember';

const ColorText = styled.div`
  font-weight: bold;
  font-size: 13px;
  line-height: 28px;
  border-radius: 28px;
  padding: 0 12px;
  cursor: pointer;
  transition: background-color 0.25s;
  &.invite {
    background-color: rgba(76, 175, 80, 0.1);
    color: #4caf50;
    &:hover {
      background-color: rgba(76, 175, 80, 0.2);
    }
  }
  &.renew {
    margin: 0 6px;
    background-color: rgba(250, 180, 0, 0.1);
    color: #fab400;
    &:hover {
      background-color: rgba(250, 180, 0, 0.2);
    }
  }
`;
const ProjectInfo = styled.div`
  display: flex;
  align-items: center;
  color: #757575;
  .invite {
    margin: 0 6px;
  }
`;

const {
  admin: {
    homePage: { delayTrial, versionName, renewBtn, invitePerson },
  },
} = window.private;

export default class MyAppGroupItem extends Component {
  static propTypes = {
    projectId: string,
    type: string,
    projectName: string,
    projectTotal: number,
    items: arrayOf(shape({ id: string, isMarked: bool, name: string, iconColor: string })),
  };
  static defaultProps = {};

  // 渲染星标应用
  renderMarkedApp = () => {
    const { type, items, ...props } = this.props;
    return (
      <div className="myAppGroupItem" id={type}>
        <div className="myAppGroupTitle">
          <Icon className="Font18 Gray_9e Font24" icon="star-hollow" />
          <span className="Font18 Gray_75">{_l('星标应用')}</span>
        </div>
        <SortableAppList type={type} items={items} {...props} />
      </div>
    );
  };
  inviteToNetwork = projectId => {
    if (Invite && _.isFunction(Invite.inviteMembers)) {
      Invite.inviteMembers(projectId, undefined, undefined, { defaultShowMoreInvite: true });
    }
  };

  // 渲染有效网络应用
  renderValidProject = () => {
    const {
      type,
      projectId,
      projectApps,
      projectName,
      projectTotal,
      projectTypeName,
      isTrial,
      expireDays,
      ...props
    } = this.props;
    return (
      <div className="myAppGroupItem" id={`${type}-${projectId}`}>
        <div className="myAppGroupTitle validProject">
          <span className="projectName overflow_ellipsis" title={projectName}>{projectName}</span>
          {md.global.Account.superAdmin && (
            <Fragment>
              <div
                className={cx('appBelongInfo', { isValid: type === 'validProject' }, { Hidden: versionName })}
                onClick={() => navigateTo(`/admin/home/${projectId}`)}
              >
                <Icon icon="enterprise_network" style={{ fontSize: '24px', color: '#f9b402' }} />
                <span className="pointer Bold">{_l('%0 %1人', projectTypeName, projectTotal)}</span>
              </div>
              {isTrial ? (
                <ProjectInfo>
                  <span className={cx({ mLeft10: versionName })}>{_l('免费试用剩余%0天', expireDays)}</span>
                  <ColorText
                    className={cx('renew', { Hidden: renewBtn })}
                    onClick={e => this.handleAppBelongClick({ type: 'purchase', projectId }, e)}
                  >
                    {_l('购买')}
                  </ColorText>
                  <span className={cx({ Hidden: renewBtn })}>{_l('或')}</span>
                  <ColorText
                    onClick={() => this.inviteToNetwork(projectId)}
                    className={cx('invite', { Hidden: invitePerson })}
                  >
                    {_l('邀请成员')}
                  </ColorText>
                  <span
                    className={cx('purchase', { Hidden: delayTrial })}
                    onClick={e => this.handleAppBelongClick({ type: 'prolongExperience', projectId }, e)}
                  >
                    {_l('延长试用')}
                  </span>
                </ProjectInfo>
              ) : (
                <ColorText
                  onClick={() => this.inviteToNetwork(projectId)}
                  className={cx('invite', { Hidden: invitePerson })}
                >
                  {_l('邀请成员')}
                </ColorText>
              )}
            </Fragment>
          )}
        </div>
        <SortableAppList type={type} items={projectApps} projectId={projectId} {...props} />
      </div>
    );
  };

  // 渲染个人应用
  renderAloneApps = () => {
    const { type, items, ...props } = this.props;
    return (
      <div className="myAppGroupItem" id={type}>
        <div className="myAppGroupTitle">
          <span className="projectName">{_l('个人')}</span>
          <div className="appBelongInfo Gray_75 Bold" onClick={() => this.handleAppBelongClick({ type: 'aloneApps' })}>
            {_l('免费')}
          </div>
        </div>
        <SortableAppList type={type} items={items} {...props} />
      </div>
    );
  };

  // 渲染外部应用
  renderExternalApps = () => {
    const { type, items, ...props } = this.props;
    return (
      <div className="myAppGroupItem">
        <div className="myAppGroupTitle">
          <Icon icon="external_collaboration Font24" />
          <span className="projectName">{_l('外部协作应用')}</span>
        </div>
        <SortableAppList type={type} items={items} {...props} />
      </div>
    );
  };

  handleAppBelongClick = ({ type, projectId }, e) => {
    e && e.stopPropagation();
    switch (type) {
      case 'purchase':
        navigateTo(`/upgrade/choose?projectId=${projectId}`);
        break;
      case 'prolongExperience':
        navigateTo(`/admin/home/${projectId}/showInvite`);
        break;
      case 'aloneApps':
        navigateTo('/personal');
        break;
      default:
        break;
    }
  };

  render() {
    const TYPE_TO_COMPONENT = {
      markedApps: this.renderMarkedApp,
      validProject: this.renderValidProject,
      aloneApps: this.renderAloneApps,
      externalApps: this.renderExternalApps,
    };
    const { type } = this.props;
    return <Fragment>{TYPE_TO_COMPONENT[type]()}</Fragment>;
  }
}
