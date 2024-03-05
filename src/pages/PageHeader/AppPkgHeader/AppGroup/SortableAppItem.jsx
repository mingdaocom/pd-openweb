import React, { Component, createRef } from 'react';
import { string, func, number, shape } from 'prop-types';
import { SortableElement } from 'react-sortable-hoc';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import 'rc-trigger/assets/index.css';
import { Menu, MenuItem, Icon, MdLink } from 'ming-ui';
import { changeBoardViewData } from 'src/pages/worksheet/redux/actions/boardView';
import { APP_GROUP_CONFIG, DEFAULT_CREATE, DEFAULT_GROUP_NAME } from '../config';
import { compareProps, getIds } from '../../util';
import { getTranslateInfo } from 'src/util';
import { convertColor } from 'worksheet/common/WorkSheetLeft/WorkSheetItem';
import styled from 'styled-components';
import _ from 'lodash';
import { canEditApp } from 'src/pages/worksheet/redux/actions/util';

const LiCon = styled.li`
  &.active {
    background-color: ${props => props.lightIconColor} !important;
    .sortableItem {
      color: ${props => props.textColor} !important;
    }
  }
  .sortableItem::before {
    background-color: ${props => props.iconColor} !important;
  }
`;

@connect(state => state, dispatch => bindActionCreators({ changeBoardViewData }, dispatch))
@SortableElement
export default class SortableAppItem extends Component {
  static propTypes = {
    value: shape({
      name: string,
      appSectionId: string,
    }),
    focusGroupId: string,
    permissionType: number,
    onAppItemConfigClick: func,
    renameAppGroup: func,
    ensurePointerVisible: func,
  };

  static defaultProps = {
    onAppItemConfigClick: _.noop,
    renameAppGroup: _.noop,
    ensurePointerVisible: _.noop,
    focusGroupId: null,
    permissionType: 0,
  };

  constructor(props) {
    super(props);
    this.ids = getIds(props);
    this.state = {
      visible: false,
      dbClickedAppGroupId: '',
    };
    this.$nameRef = createRef();
  }

  componentWillReceiveProps(nextProps) {
    this.ids = getIds(nextProps);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { appSectionId } = this.props.value;
    const { groupId } = getIds(this.props);
    return (
      compareProps(this.props.match.params, nextProps.match.params, ['appId', 'groupId']) ||
      compareProps(this.props, nextProps, ['value']) ||
      compareProps(this.state, nextState) ||
      appSectionId === groupId
    );
  }

  componentWillUnmount() {
    clearTimeout(this.clickTimer);
  }

  switchVisible = (obj, cb) => {
    this.setState(obj, cb);
  };

  handleFocus = () => {
    setTimeout(() => {
      this.$nameRef && this.$nameRef.current && this.$nameRef.current.select();
    }, 0);
  };
  handleNameBlur = (data, e) => {
    let { value } = e.target;
    value = value.trim();

    const { renameAppGroup } = this.props;
    const { appSectionId, type } = data;
    const isNeedSendRequest = (value !== DEFAULT_GROUP_NAME && !!value) || type === DEFAULT_CREATE;
    renameAppGroup(appSectionId, { name: value }, isNeedSendRequest);
    if (this.state.dbClickedAppGroupId) this.setState({ dbClickedAppGroupId: '' });
  };

  handleDbClick = appSectionId => {
    const { ensurePointerVisible, permissionType } = this.props;
    if (!canEditApp(permissionType)) return;
    clearTimeout(this.clickTimer);
    this.setState({ dbClickedAppGroupId: appSectionId }, ensurePointerVisible);
  };

  getFirstAppItemId = () => {
    const { permissionType, value, appPkg } = this.props;
    const isCharge = appPkg.viewHideNavi;
    const { workSheetInfo = [], childSections = [] } = value;
    const firstAppItem = (isCharge ? workSheetInfo : workSheetInfo.filter(item => item.status === 1 && !item.navigateHide))[0] || {};
    if (firstAppItem.type === 2) {
      const { workSheetInfo = [] } = _.find(childSections, { appSectionId: firstAppItem.workSheetId });
      const childrenFirstAppItem = (isCharge ? workSheetInfo : workSheetInfo.filter(item => item.status === 1 && !item.navigateHide))[0] || {};
      return childrenFirstAppItem.workSheetId;
    } else {
      return firstAppItem.workSheetId;
    }
  };

  getNavigateUrl = (appSectionId, isCharge) => {
    const { appPkg } = this.props;
    let { appId } = getIds(this.props);
    if (md.global.Account.isPortal) {
      appId = md.global.Account.appId;
    }
    const storage = JSON.parse(localStorage.getItem(`mdAppCache_${md.global.Account.accountId}_${appId}`)) || {};
    const worksheets = _.filter(storage.worksheets || [], item => item.groupId === appSectionId);
    const { worksheetId, viewId } = worksheets.length ? worksheets[worksheets.length - 1] : {};
    if (appPkg.pcNaviStyle === 2) {
      return `/app/${appId}/${appSectionId}?from=insite`;
    }
    if (appPkg.selectAppItmeType === 1) {
      const worksheetId = this.getFirstAppItemId();
      return `/app/${appId}/${appSectionId}/${worksheetId || ''}?from=insite`;
    }
    return `/app/${appId}/${appSectionId}/${_.filter([worksheetId, viewId], item => !!item).join('/')}?from=insite`;
  };

  handleKeyDown = e => {
    const { key, keyCode } = e;
    if (key === 'Enter' || keyCode === 13) {
      this.$nameRef.current.blur();
    }
    return false;
  };

  render() {
    const {
      value = {},
      focusGroupId,
      permissionType,
      onAppItemConfigClick,
      changeBoardViewData,
      appPkg,
      isLock,
      isUpgrade,
    } = this.props;
    const { visible, dbClickedAppGroupId } = this.state;
    const { name, appSectionId } = value;
    const { appId, groupId } = this.ids;
    const isFocus = appSectionId === focusGroupId || appSectionId === dbClickedAppGroupId;
    const isShowConfigIcon = appSectionId === groupId && !isFocus && canEditApp(permissionType);
    const url = this.getNavigateUrl(appSectionId);
    const showName = getTranslateInfo(appId, appSectionId).name || name;
    return (
      <LiCon
        className={cx({ active: isFocus || groupId === appSectionId, isCanConfigAppGroup: isShowConfigIcon })}
        textColor={['light'].includes(appPkg.themeType) ? appPkg.iconColor : ''}
        iconColor={['light', 'black'].includes(appPkg.themeType) ? appPkg.iconColor : ''}
        lightIconColor={['light'].includes(appPkg.themeType) ? convertColor(appPkg.iconColor) : ''}
      >
        {isFocus ? (
          <div className="sortableItem">
            <input
              defaultValue={name}
              ref={this.$nameRef}
              autoFocus
              onFocus={this.handleFocus}
              onBlur={e => this.handleNameBlur(value, e)}
              onKeyDown={this.handleKeyDown}
            />
          </div>
        ) : (
          <MdLink
            className="sortableItem"
            to={url}
            onClick={event => {
              if (this.ids.groupId !== appSectionId) {
                changeBoardViewData([]);
              }
              if (appPkg.pcNaviStyle === 2) {
                const key = `mdAppCache_${md.global.Account.accountId}_${appPkg.id}`;
                const storage = JSON.parse(localStorage.getItem(key));
                storage.lastGroupId = appSectionId;
                safeLocalStorageSetItem(key, JSON.stringify(storage));
              }
            }}
          >
            <span title={showName} onDoubleClick={() => this.handleDbClick(appSectionId)}>
              {showName}
            </span>
          </MdLink>
        )}
        {canEditApp(permissionType) && !isUpgrade && (
          <Trigger
            action={['click']}
            popupVisible={visible}
            onPopupVisibleChange={visible => this.switchVisible({ visible })}
            popupAlign={{
              points: ['tl', 'bl'],
              offset: [-63, 13],
            }}
            popup={
              <Menu className="appGroupConfigWrap" onClickAway={() => this.switchVisible({ visible: false })}>
                {APP_GROUP_CONFIG.map(({ type, icon, text, ...rest }) => {
                  if (isLock && type !== 'rename') return '';
                  return (
                    <MenuItem
                      key={type}
                      icon={<Icon icon={icon} />}
                      onClick={() =>
                        this.switchVisible({ visible: false }, () => onAppItemConfigClick({ id: type, appSectionId }))
                      }
                      {...rest}
                    >
                      <span>{text}</span>
                    </MenuItem>
                  );
                })}
              </Menu>
            }
          >
            <div
              className="topTri"
              style={{ display: isShowConfigIcon ? 'block' : 'none' }}
              onClick={() => this.switchVisible({ visible: true })}
            />
          </Trigger>
        )}
      </LiCon>
    );
  }
}
