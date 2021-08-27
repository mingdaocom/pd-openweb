import React, { Component } from 'react';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import 'rc-trigger/assets/index.css';
import { string, func, oneOf, bool } from 'prop-types';
import { Icon, Dialog } from 'ming-ui';
import { navigateTo } from 'src/router/navigateTo';
import withClickAway from 'ming-ui/decorators/withClickAway';
import AppOperator from './AppOperator';
import SelectIcon from '../../components/SelectIcon';
import VerifyDel from '../../components/VerifyDel';
import CopyApp from '../../components/CopyApp';
import LineClampTextBox from '../../components/LineClampTextBox';
import { compareProps, isCanEdit } from '../../../PageHeader/util';
import { ADVANCE_AUTHORITY } from '../../../PageHeader/AppPkgHeader/config';
import AppStatusComp from './AppStatus';
import SvgIcon from 'src/components/SvgIcon';

@withClickAway
export default class MyAppItem extends Component {
  static propTypes = {
    id: string,
    projectId: string,
    icon: string,
    iconColor: string,
    iconUrl: string,
    name: string,
    type: oneOf(['expireProject', 'aloneApps', 'externalApps', 'markedApps', 'validProject']),
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
      compareProps(nextProps, this.props, ['id', 'type', 'isMarked', 'permissionType', 'name', 'iconColor', 'icon']) ||
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
    const para = _.pick(this.props, ['projectId', 'type', 'icon', 'iconColor', 'name', 'description']);
    this.props.onAppChange({ ...para, ...obj, appId: this.props.id });
  };

  handleModify = obj => {
    const { id: appId, projectId, type } = this.props;
    if (obj.name === '') {
      obj.name = this.dataCache.name;
    }
    this.props.handleModify({ ...obj, appId, projectId, type });
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

  handleClick = (id, e) => {
    if (this.clickTimer) return;
    this.clickTimer = setTimeout(() => {
      const storage = JSON.parse(localStorage.getItem(`mdAppCache_${md.global.Account.accountId}_${id}`));

      if (storage) {
        const { lastGroupId, lastWorksheetId, lastViewId } = storage;
        navigateTo(`/app/${id}/${_.filter([lastGroupId, lastWorksheetId, lastViewId], item => !!item).join('/')}`);
      } else {
        navigateTo(`/app/${id}`);
      }
    }, 250);
  };

  handleDbClick = () => {
    const { permissionType } = this.props;
    if (permissionType < ADVANCE_AUTHORITY) return;
    this.setState({ selectIconVisible: true });
    clearTimeout(this.clickTimer);
    this.clickTimer = null;
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
      quitAppConfirmVisible,
      copyAppVisible,
    } = this.state;
    const {
      type,
      iconColor,
      iconUrl,
      name,
      permissionType,
      isExternalApp,
      isMarked,
      handleApp,
      id,
      isLock,
      projectId,
      projectName,
      newAppItemId,
      clearNewAppItemId,
      onCopy,
    } = this.props;
    const isShowSelectIcon = selectIconVisible || newAppItemId === id;
    return (
      <div
        ref={this.$myAppItem}
        className={cx('sortableMyAppItemWrap', { active: editAppVisible, isSelectingIcon: isShowSelectIcon })}>
        <div className={cx('myAppItemWrap')}>
          <div className="myAppItem" onClick={e => this.handleClick(id, e)} onDoubleClick={this.handleDbClick}>
            <div className="myAppItemDetail" style={{ backgroundColor: iconColor }}>
              <SvgIcon url={iconUrl} fill="#fff" size={48} />
              <AppStatusComp {..._.pick(this.props, ['isGoodsStatus', 'isNew'])} />
            </div>
            {type === 'externalApps' ? (
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
          </div>

          <div
            className="star appItemIcon"
            onClick={() => handleApp({ mode: 'mark', appId: id, projectId, isMark: !isMarked })}>
            <Icon className="Font16" icon={isMarked ? 'task-star' : 'star-hollow'} />
          </div>
          {isCanEdit(permissionType, isLock) && (
            <Trigger
              popupVisible={editAppVisible}
              popupClassName="myAppItemOperatorTriggerWrap"
              popup={
                <AppOperator
                  projectId={projectId}
                  disabledCopy={type === 'externalApps' || isExternalApp}
                  role={permissionType}
                  isLock={isLock}
                  onClick={id => this.switchVisible({ editAppVisible: false }, () => this.handleMoreClick(id))}
                  onClickAway={() => this.switchVisible({ editAppVisible: false })}
                />
              }
              popupAlign={{
                points: ['tl', 'bl'],
                offset: [0, 0],
              }}>
              <div className="myAppItemMore appItemIcon" onClick={() => this.switchVisible({ editAppVisible: true })}>
                <Icon className={cx('moreOperation Font18', { active: editAppVisible })} icon="task-point-more" />
              </div>
            </Trigger>
          )}
          {delAppConfirmVisible && (
            <VerifyDel
              name={name}
              onOk={() => this.switchVisible({ delAppConfirmVisible: false }, this.handleApp('del'))}
              onCancel={() => this.switchVisible({ delAppConfirmVisible: false })}
            />
          )}
          {quitAppConfirmVisible && (
            <Dialog
              visible
              title={<span style={{ color: '#f44336' }}>{_l('您确认退出此应用吗?')}</span>}
              buttonType="danger"
              onOk={() => this.switchVisible({ quitAppConfirmVisible: false }, this.handleApp('quit'))}
              onCancel={() => this.switchVisible({ quitAppConfirmVisible: false })}>
              <div className="Gray_75">{_l('退出此应用后，您将无法访问此应用')}</div>
            </Dialog>
          )}
          {copyAppVisible && (
            <CopyApp
              title={name}
              para={{ appId: id }}
              onCopy={appId => onCopy({ type, id, projectId, ...appId })}
              onCancel={() => this.switchVisible({ copyAppVisible: false })}
            />
          )}
          {isShowSelectIcon && (
            <SelectIcon
              projectId={projectId}
              className="myAppItemSelectIconWrap"
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
