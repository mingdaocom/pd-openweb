import React, { Component } from 'react';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import 'rc-trigger/assets/index.css';
import { string, func, oneOf, bool } from 'prop-types';
import { Icon, MdLink, SvgIcon } from 'ming-ui';
import withClickAway from 'ming-ui/decorators/withClickAway';
import AppOperator from './AppOperator';
import VerifyDel from 'src/pages/AppHomepage/components/VerifyDel';
import CopyApp from 'src/pages/AppHomepage/components/CopyApp';
import LineClampTextBox from 'src/pages/AppHomepage/components/LineClampTextBox';
import { compareProps } from 'src/pages/PageHeader/util';
import AppStatusComp from './AppStatus';
import _ from 'lodash';
import { canEditApp, canEditData } from 'src/pages/worksheet/redux/actions/util.js';
import { getAppNavigateUrl, transferExternalLinkUrl } from '../utils';
import ExternalLinkDialog from './ExternalLinkDialog';
import ManageUserDialog from 'src/pages/Role/AppRoleCon/ManageUserDialog.jsx';
import { addBehaviorLog } from 'src/util';
import SelectIcon from 'src/pages/AppHomepage/components/SelectIcon';

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
    permissionType: oneOf([0, 1, 2, 10, 50, 100, 200, 300]),
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
    copyAppVisible: false,
    externalLinkVisible: false,
    showRoleDialog: false,
    selectIconLeft: false,
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
        'navColor',
        'lightColor',
        'icon',
        'groupIds',
        'urlTemplate',
        'pcDisplay',
        'webMobileDisplay',
        'appDisplay',
        'isNew',
        'appLang',
      ]) ||
      compareProps(nextState, this.state) ||
      id === this.props.newAppItemId ||
      id === nextProps.newAppItemId
    );
  }

  componentWillUnmount() {
    clearTimeout(this.clickTimer);
  }

  componentDidMount() {
    const offsetLeft = _.get(this, '$myAppItem.current.offsetLeft');
    this.setState({ selectIconLeft: offsetLeft < 414 && 0 });
  }

  componentDidUpdate() {
    const { newAppItemId, id, canDrag, onChangeCanDrag = () => {} } = this.props;
    const isShowSelectIcon = this.state.selectIconVisible || newAppItemId === id;

    const newLeft = _.get(this, '$myAppItem.current.offsetLeft') < 414 && 0;

    if (this.state.selectIconLeft !== newLeft) {
      this.setState({ selectIconLeft: newLeft });
    }

    if (canDrag !== !isShowSelectIcon) {
      onChangeCanDrag(!isShowSelectIcon);
    }
  }

  $myAppItem = React.createRef();
  clickTimer = null;
  dataCache = _.pick(this.props, ['icon', 'iconColor', 'name']);

  handleAppChange = obj => {
    const para = _.pick(this.props, [
      'projectId',
      'icon',
      'iconColor',
      'navColor',
      'lightColor',
      'name',
      'description',
    ]);
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
      case 'copy':
        this.switchVisible({ copyAppVisible: true });
        break;
      case 'setExternalLink':
        this.switchVisible({ externalLinkVisible: true });
        break;
      case 'manageUser':
        this.switchVisible({ showRoleDialog: true });
        break;
      default:
        break;
    }
  };

  handleApp = mode => {
    const { id: appId, projectId } = this.props;
    this.props.handleApp({ appId, projectId, mode });
  };

  render() {
    const {
      editAppVisible,
      selectIconVisible,
      delAppConfirmVisible,
      copyAppVisible,
      externalLinkVisible,
      showRoleDialog,
      selectIconLeft,
    } = this.state;
    const {
      groupId,
      groupType,
      type,
      lightColor,
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
      pcNaviStyle,
      selectAppItmeType,
      createType,
      urlTemplate,
      pcDisplay,
      webMobileDisplay,
      appDisplay,
      isDashboard,
      appLang,
      allowCreate,
      myPermissions = [],
    } = this.props;
    const isShowSelectIcon = selectIconVisible || newAppItemId === id;
    const iconColor = this.props.iconColor || '#2196f3';
    const navColor = this.props.navColor || iconColor;
    const black = '#1b2025' === navColor;
    const light = [lightColor, '#ffffff', '#f5f6f7'].includes(navColor);
    const appName = _.get(_.find(appLang, { key: id }), 'value') || name;

    return (
      <div
        ref={this.$myAppItem}
        className={cx('sortableMyAppItemWrap', { active: editAppVisible, isSelectingIcon: isShowSelectIcon })}
      >
        <div className={cx('myAppItemWrap')}>
          <MdLink
            className="myAppItem stopPropagation"
            to={getAppNavigateUrl(id, pcNaviStyle, selectAppItmeType)}
            onClick={e => {
              addBehaviorLog('app', id); // 浏览应用埋点

              if (createType === 1) {
                //是外部链接应用
                e.stopPropagation();
                e.preventDefault();
                this.props.isNew && this.handleModify({ isNew: false });
                window.open(transferExternalLinkUrl(urlTemplate, projectId, id));
              }
            }}
          >
            <div className="myAppItemDetail" style={{ backgroundColor: light ? lightColor : navColor || iconColor }}>
              <SvgIcon url={iconUrl} fill={black || light ? iconColor : '#fff'} size={48} />
              <AppStatusComp {..._.pick(this.props, ['isGoodsStatus', 'isNew', 'fixed'])} />
            </div>
            {type === 'external' ? (
              <div className="externalAppInfo">
                <div className="appName overflow_ellipsis" title={appName}>
                  {appName}
                </div>
                {projectName && (
                  <div className="projectName overflow_ellipsis" title={projectName}>
                    {projectName}
                  </div>
                )}
              </div>
            ) : (
              <LineClampTextBox className="appExplain" text={appName} title={appName} />
            )}
          </MdLink>
          <div
            className="star appItemIcon"
            data-tip={isMarked ? _l('取消收藏') : _l('收藏')}
            onClick={() => handleApp({ mode: 'mark', appId: id, projectId, isMark: !isMarked, groupType: type })}
          >
            <Icon className="Font16" icon={isMarked ? 'task-star' : 'star-hollow'} />
          </div>
          {(canEditApp(permissionType, isLock) ||
            canEditData(permissionType) ||
            (!_.includes(['external', 'star', 'personal'], type) && !isDashboard)) && (
            <Trigger
              popupVisible={editAppVisible}
              popupClassName="myAppItemOperatorTriggerWrap"
              popup={
                <AppOperator
                  groupType={type}
                  projectId={projectId}
                  disabledCopy={type === 'external' || isExternalApp}
                  groups={groups}
                  selectedGroupIds={groupIds}
                  role={permissionType}
                  isLock={isLock}
                  createType={createType}
                  onUpdateAppBelongGroups={args => onUpdateAppBelongGroups({ ...args, appId: id })}
                  onClick={id => this.switchVisible({ editAppVisible: false }, () => this.handleMoreClick(id))}
                  onClickAway={() => this.switchVisible({ editAppVisible: false })}
                  isDashboard={isDashboard}
                  allowCreate={allowCreate}
                  myPermissions={myPermissions}
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
          {copyAppVisible && (
            <CopyApp
              title={name}
              projectId={projectId}
              para={{ appId: id, groupId, groupType }}
              onCopy={appId => onCopy({ type, id, projectId, ...appId })}
              onCancel={() => this.switchVisible({ copyAppVisible: false })}
              myPermissions={myPermissions}
            />
          )}
          {isShowSelectIcon && (
            <div style={{ height: 400 }}>
              <SelectIcon
                projectId={projectId}
                className="myAppItemSelectIconWrap"
                style={{ left: selectIconLeft }}
                {..._.pick(this.props, ['icon', 'name', 'iconColor', 'navColor', 'lightColor'])}
                onModify={this.handleModify}
                onChange={this.handleAppChange}
                onClose={() => this.switchVisible({ selectIconVisible: false })}
                onClickAway={() => this.switchVisible({ selectIconVisible: false }, clearNewAppItemId)}
                onClickAwayExceptions={['.mui-dialog-container']}
              />
            </div>
          )}
          {externalLinkVisible && (
            <ExternalLinkDialog
              projectId={projectId}
              isEdit={true}
              record={{ id, name, urlTemplate, pcDisplay, webMobileDisplay, appDisplay }}
              onCancel={() => this.switchVisible({ externalLinkVisible: false })}
              onAppChange={this.props.onAppChange}
            />
          )}
          {showRoleDialog && (
            <ManageUserDialog
              appId={id}
              projectId={projectId}
              onCancel={() => {
                this.switchVisible({ showRoleDialog: false });
              }}
            />
          )}
        </div>
      </div>
    );
  }
}
