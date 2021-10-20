import React, { Component, createRef } from 'react';
import { string, func, number, shape } from 'prop-types';
import { SortableElement } from 'react-sortable-hoc';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import 'rc-trigger/assets/index.css';
import Icon from 'ming-ui/components/Icon';
import Menu from 'ming-ui/components/Menu';
import MenuItem from 'ming-ui/components/MenuItem';
import { changeBoardViewData } from 'src/pages/worksheet/redux/actions/boardView';
import { APP_GROUP_CONFIG, DEFAULT_CREATE, DEFAULT_GROUP_NAME, ADVANCE_AUTHORITY } from '../config';
import { compareProps, getIds } from '../../util';
import { navigateTo } from '../../../../router/navigateTo';

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
    if (permissionType < ADVANCE_AUTHORITY) return;
    clearTimeout(this.clickTimer);
    this.setState({ dbClickedAppGroupId: appSectionId }, ensurePointerVisible);
  };

  handleAppGroupClick = appSectionId => {
    const { changeBoardViewData } = this.props;
    const { appId, groupId } = getIds(this.props);
    this.clickTimer = setTimeout(() => {
      const storage = JSON.parse(localStorage.getItem(`mdAppCache_${md.global.Account.accountId}_${appId}`)) || {};
      const worksheets = _.filter(storage.worksheets || [], item => item.groupId === appSectionId);
      const { worksheetId, viewId } = worksheets.length ? worksheets[worksheets.length - 1] : {};
      if (groupId !== appSectionId) {
        changeBoardViewData([]);
      }
      navigateTo(`/app/${appId}/${appSectionId}/${_.filter([worksheetId, viewId], item => !!item).join('/')}`);
    }, 250);
  };

  handleGroupNameClick = appSectionId => {
    setTimeout(() => {
      this.handleAppGroupClick(appSectionId);
    }, 250);
  };

  handleKeyDown = e => {
    const { key, keyCode } = e;
    if (key === 'Enter' || keyCode === 13) {
      this.$nameRef.current.blur();
    }
    return false;
  };

  render() {
    const { value = {}, focusGroupId, permissionType, onAppItemConfigClick } = this.props;
    const { visible, dbClickedAppGroupId } = this.state;
    const { name, appSectionId } = value;
    const { groupId } = this.ids;
    const isFocus = appSectionId === focusGroupId || appSectionId === dbClickedAppGroupId;
    const isShowConfigIcon = appSectionId === groupId && !isFocus && permissionType >= ADVANCE_AUTHORITY;
    return (
      <li className={cx({ active: isFocus || groupId === appSectionId, isCanConfigAppGroup: isShowConfigIcon })}>
        <div className="sortableItem" onClick={() => this.handleAppGroupClick(appSectionId)}>
          {isFocus ? (
            <input
              defaultValue={name}
              ref={this.$nameRef}
              autoFocus
              onFocus={this.handleFocus}
              onBlur={e => this.handleNameBlur(value, e)}
              onKeyDown={this.handleKeyDown}
            />
          ) : (
            <span
              title={name}
              onClick={() => this.handleGroupNameClick(appSectionId)}
              onDoubleClick={() => this.handleDbClick(appSectionId)}>
              {name}
            </span>
          )}
        </div>
        {permissionType >= ADVANCE_AUTHORITY && (
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
                {APP_GROUP_CONFIG.map(({ type, icon, text, ...rest }) => (
                  <MenuItem
                    key={type}
                    icon={<Icon icon={icon} />}
                    onClick={() =>
                      this.switchVisible({ visible: false }, () => onAppItemConfigClick({ id: type, appSectionId }))
                    }
                    {...rest}>
                    <span>{text}</span>
                  </MenuItem>
                ))}
              </Menu>
            }>
            <div
              className="topTri"
              style={{ display: isShowConfigIcon ? 'block' : 'none' }}
              onClick={() => this.switchVisible({ visible: true })}
            />
          </Trigger>
        )}
      </li>
    );
  }
}
