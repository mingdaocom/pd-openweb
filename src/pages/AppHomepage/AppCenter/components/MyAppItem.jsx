import React, { Component } from 'react';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import 'rc-trigger/assets/index.css';
import { string, func, oneOf, bool } from 'prop-types';
import { Icon, Dialog, MdLink } from 'ming-ui';
import { navigateTo } from 'src/router/navigateTo';
import withClickAway from 'ming-ui/decorators/withClickAway';
import AppOperator from './AppOperator';
import SelectIcon from 'src/pages/AppHomepage/components/SelectIcon';
import VerifyDel from 'src/pages/AppHomepage/components/VerifyDel';
import CopyApp from 'src/pages/AppHomepage/components/CopyApp';
import LineClampTextBox from 'src/pages/AppHomepage/components/LineClampTextBox';
import { compareProps, isCanEdit } from 'src/pages/PageHeader/util';
import { ADVANCE_AUTHORITY } from 'src/pages/PageHeader/AppPkgHeader/config';
import AppStatusComp from './AppStatus';
import SvgIcon from 'src/components/SvgIcon';
import _ from 'lodash';

@withClickAway
export default class MyAppItem extends Component {
  static propTypes = {
    id: string,
    projectId: string,
    icon: string,
    iconColor: string,
    iconUrl: string,
    name: string,
    type: oneOf(['star', 'project', 'personal', 'external', 'expire', 'group']),
    onAppChange: func,
    handleApp: func,
    permissionType: oneOf([0, 10, 50, 100, 200, 300]),
    isMarked: bool,
    newAppItemId: string,
    clearNewAppItemId: func,
  };

  static defaultProps = {
    onAppChange: _.noop,
    onAppIconUpdate: _.noop,
    handleApp: _.noop,
    clearNewAppItemId: _.noop,
    newAppItemId: '',
  };

  state = {
    editAppVisible: false,
    selectIconVisible: false,
    delAppConfirmVisible: false,
    quitAppConfirmVisible: false,
    copyAppVisible: false,
  };

  shouldComponentUpdate(nextProps, nextState) {
    const { id } = this.props;
    return (
      compareProps(nextProps, this.props, [
        'id',
        'type',
        'isMarked',
        'permissionType',
        'name',
        'iconColor',
        'icon',
        'groupIds',
      ]) ||
      compareProps(nextState, this.state) ||
      id === this.props.newAppItemId ||
      id === nextProps.newAppItemId
    );
  }

  componentWillUnmount() {
    clearTimeout(this.clickTimer);
  }

  $myAppItem = React.createRef();
  clickTimer = null;
  dataCache = _.pick(this.props, ['icon', 'iconColor', 'name']);

  handleAppChange = obj => {
    const para = _.pick(this.props, ['projectId', 'icon', 'iconColor', 'name', 'description']);
    this.props.onAppChange({ ...para, ...obj, appId: this.props.id });
  };

  handleModify = obj => {
    const { id: appId, projectId, type } = this.props;
    if (obj.name === '') {
      obj.name = this.dataCache.name;
    }
    this.props.handleModify({ ...obj, appId, projectId });
  };

  switchVisible = (obj, cb) => {
    this.setState(obj, cb);
  };

  handleMoreClick = type => {
    switch (type) {
      case 'edit':
        this.switchVisible({ selectIconVisible: true, editAppVisible: false });
        break;
      case 'del':
        this.switchVisible({ delAppConfirmVisible: true });
        break;
      case 'quit':
        this.switchVisible({ quitAppConfirmVisible: true });
        break;
      case 'copy':
        this.switchVisible({ copyAppVisible: true });
        break;
      default:
        break;
    }
  };

  getNavigateUrl = id => {
    const storage = JSON.parse(localStorage.getItem(`mdAppCache_${md.global.Account.accountId}_${id}`));
    if (storage) {
      const { lastGroupId, lastWorksheetId, lastViewId } = storage;
      if (lastGroupId && lastWorksheetId && lastViewId) {
        return `/app/${id}/${[lastGroupId, lastWorksheetId, lastViewId].join('/')}?from=insite`;
      } else if (lastGroupId && lastWorksheetId) {
        return `/app/${id}/${[lastGroupId, lastWorksheetId].join('/')}?from=insite`;
      } else if (lastGroupId) {
        return `/app/${id}/${lastGroupId}?from=insite`;
      } else {
        return `/app/${id}`;
      }
    } else {
      return `/app/${id}`;
    }
  };
  handleApp = mode => {
    const { id: appId, projectId } = this.props;
    this.props.handleApp({ appId, projectId, mode });
  };

  render() {
    const { editAppVisible, selectIconVisible, delAppConfirmVisible, quitAppConfirmVisible, copyAppVisible } =
      this.state;
    const {
      groupId,
      groupType,
      isAdmin,
      type,
      iconColor,
      iconUrl,
      name,
      permissionType,
      isExternalApp,
      isMarked,
      handleApp,
      id,
      groupIds,
      isLock,
      projectId,
      projectName,
      groups,
      newAppItemId,
      clearNewAppItemId,
      onCopy,
      onUpdateAppBelongGroups,
    } = this.props;
    const isShowSelectIcon = selectIconVisible || newAppItemId === id;
    const offsetLeft = _.get(this, '$myAppItem.current.offsetLeft');
    const selectIconLeft = !_.isUndefined(offsetLeft) && offsetLeft < (300 - 132) / 2 && 0;
    return (
      <div
        ref={this.$myAppItem}
        className={cx('sortableMyAppItemWrap', { active: editAppVisible, isSelectingIcon: isShowSelectIcon })}
      >
        <div className={cx('myAppItemWrap')}>
          <MdLink className="myAppItem" to={this.getNavigateUrl(id)}>
            <div className="myAppItemDetail" style={{ backgroundColor: iconColor || '#2196f3' }}>
              <SvgIcon url={iconUrl} fill="#fff" size={48} />
              <AppStatusComp {..._.pick(this.props, ['isGoodsStatus', 'isNew', 'fixed'])} />
            </div>
            {type === 'external' ? (
              <div className="externalAppInfo">
                <div className="appName overflow_ellipsis" title={name}>
                  {name}
                </div>
                {projectName && (
                  <div className="projectName overflow_ellipsis" title={projectName}>
                    {projectName}
                  </div>
                )}
              </div>
            ) : (
              <LineClampTextBox className="appExplain" text={name} title={name} />
            )}
          </MdLink>

          <div
            className="star appItemIcon"
            data-tip={isMarked ? _l('取消标星') : _l('标星')}
            onClick={() => handleApp({ mode: 'mark', appId: id, projectId, isMark: !isMarked })}
          >
            <Icon className="Font16" icon={isMarked ? 'task-star' : 'star-hollow'} />
          </div>
          {(isCanEdit(permissionType, isLock) || !_.includes(['external', 'star', 'personal'], type)) && (
            <Trigger
              popupVisible={editAppVisible}
              popupClassName="myAppItemOperatorTriggerWrap"
              popup={
                <AppOperator
                  isAdmin={isAdmin}
                  groupType={type}
                  projectId={projectId}
                  disabledCopy={type === 'external' || isExternalApp}
                  groups={groups}
                  selectedGroupIds={groupIds}
                  role={permissionType}
                  isLock={isLock}
                  onUpdateAppBelongGroups={args => onUpdateAppBelongGroups({ ...args, appId: id })}
                  onClick={id => this.switchVisible({ editAppVisible: false }, () => this.handleMoreClick(id))}
                  onClickAway={() => this.switchVisible({ editAppVisible: false })}
                />
              }
              popupAlign={{
                points: ['tl', 'bl'],
                offset: [0, 0],
                overflow: { adjustX: true },
              }}
              getPopupContainer={() => this.$myAppItem.current}
              destroyPopupOnHide
            >
              <div className="myAppItemMore appItemIcon" onClick={() => this.switchVisible({ editAppVisible: true })}>
                <Icon className={cx('moreOperation Font18', { active: editAppVisible })} icon="task-point-more" />
              </div>
            </Trigger>
          )}
          {delAppConfirmVisible && (
            <VerifyDel
              para={{ appId: id, projectId: projectId, name: name }}
              mode="del"
              onOk={para =>
                this.switchVisible({ delAppConfirmVisible: false }, this.props.handleApp({ ...para, mode: 'del' }))
              }
              onCancel={() => this.switchVisible({ delAppConfirmVisible: false })}
            />
          )}
          {quitAppConfirmVisible && (
            <Dialog
              visible
              title={<span style={{ color: '#f44336' }}>{_l('您确认退出此应用吗?')}</span>}
              buttonType="danger"
              onOk={() => this.switchVisible({ quitAppConfirmVisible: false }, this.handleApp('quit'))}
              onCancel={() => this.switchVisible({ quitAppConfirmVisible: false })}
            >
              <div className="Gray_75">{_l('退出此应用后，您将无法访问此应用')}</div>
            </Dialog>
          )}
          {copyAppVisible && (
            <CopyApp
              title={name}
              para={{ appId: id, groupId, groupType }}
              onCopy={appId => onCopy({ type, id, projectId, ...appId })}
              onCancel={() => this.switchVisible({ copyAppVisible: false })}
            />
          )}
          {isShowSelectIcon && (
            <SelectIcon
              projectId={projectId}
              className="myAppItemSelectIconWrap"
              style={{
                left: selectIconLeft,
              }}
              {..._.pick(this.props, ['icon', 'name', 'iconColor'])}
              onModify={this.handleModify}
              onChange={this.handleAppChange}
              onClose={() => this.switchVisible({ selectIconVisible: false })}
              onClickAway={() => this.switchVisible({ selectIconVisible: false }, clearNewAppItemId)}
            />
          )}
        </div>
      </div>
    );
  }
}
