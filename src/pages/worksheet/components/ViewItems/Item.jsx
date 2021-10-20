import React, { Component } from 'react';
import cx from 'classnames';
import Menu from 'ming-ui/components/Menu';
import MenuItem from 'ming-ui/components/MenuItem';
import Icon from 'ming-ui/components/Icon';
import Trigger from 'rc-trigger';
import 'rc-trigger/assets/index.css';
import ViewDisplayMenu from './viewDisplayMenu';
import './ViewItems.less';
import { VIEW_DISPLAY_TYPE } from 'src/pages/worksheet/constants/enum';
import { getDefaultViewSet } from 'src/pages/worksheet/constants/common';
import { formatValuesOfOriginConditions } from '../../common/WorkSheetFilter/util';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
export default class Item extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      isEdit: false,
      changeViewDisplayTypeVisible: false,
    };
  }
  componentWillMount() {
    clearTimeout(this.timer);
  }

  isDisabledConfig = () => {
    const { currentView } = this.props;
    const { viewType, viewControl, viewControls, childType } = currentView;
    if (_.includes(['0', '3', '4'], String(viewType))) return false;
    if (String(viewType) === '2' && String(childType) === '2' && !_.isEmpty(viewControls)) return false;
    if (_.includes(['1', '2'], String(viewType)) && viewControl) return false;
    return true;
  };
  renderSettingMenu = () => {
    const { item, isCharge, changeViewDisplayType, currentView, sheetSwitchPermit } = this.props;
    const { changeViewDisplayTypeVisible } = this.state;
    return (
      <Menu className="viewItemMoreOperate">
        {isCharge && (
          <MenuItem
            icon={<Icon icon="settings" />}
            disabled={this.isDisabledConfig()}
            onClick={() => {
              if (this.isDisabledConfig()) return;
              this.props.onOpenView(item);
              this.setState({
                visible: false,
              });
            }}
          >
            <span className="text">{_l('配置视图')}</span>
          </MenuItem>
        )}
        {isCharge && (
          <MenuItem
            className="changeViewDisplayTypeMenuWrap"
            icon={<Icon icon="swap_horiz" />}
            onMouseEnter={() => this.setState({ changeViewDisplayTypeVisible: true })}
            onMouseLeave={() => this.setState({ changeViewDisplayTypeVisible: false })}
          >
            <span className="text">{_l('更改视图类型')}</span>
            <Icon icon="arrow-right-tip Font14" style={{ fontSize: '16px', right: '10px', left: 'initial' }} />
            {changeViewDisplayTypeVisible && (
              <ViewDisplayMenu
                onClickAway={() => this.setState({ changeViewDisplayTypeVisible: false })}
                style={{ top: '-6px', left: '100%' }}
                onClick={(viewType = 'sheet') => {
                  if (viewType !== VIEW_DISPLAY_TYPE[item.viewType]) {
                    changeViewDisplayType(
                      getDefaultViewSet({
                        ...item,
                        viewControl: '',
                        viewControls: [],
                        viewType: VIEW_DISPLAY_TYPE[viewType],
                        filters: item.filters, // formatValuesOfOriginConditions(item.filters),
                      }),
                    );
                  }
                  this.setState({ changeViewDisplayTypeVisible: false, visible: false });
                }}
              />
            )}
          </MenuItem>
        )}
        {isCharge && (
          <MenuItem
            icon={<Icon icon="content-copy" />}
            onClick={() => {
              this.props.onCopyView(item);
              this.setState({
                visible: false,
              });
            }}
          >
            <span className="text">{_l('复制')}</span>
          </MenuItem>
        )}
        {isCharge && <hr className="splitLine" />}
        {/* 分享视图权限 目前只有表视图才能分享*/}
        {isOpenPermit(permitList.viewShareSwitch, sheetSwitchPermit, item.viewId) &&
          +_.get(currentView, 'viewType') === 0 && (
            <MenuItem
              icon={<Icon icon="share" />}
              onClick={() => {
                if (window.isPublicApp) {
                  alert(_l('预览模式下，不能操作'), 3);
                  return;
                }
                this.props.onShare(item);
                this.setState({
                  visible: false,
                });
              }}
            >
              <span className="text">{_l('分享')}</span>
            </MenuItem>
          )}
        {/* 导出视图下记录权限 */}
        {isOpenPermit(permitList.viewExportSwitch, sheetSwitchPermit, item.viewId) && (
          <MenuItem
            icon={<Icon icon="download" />}
            onClick={() => {
              if (window.isPublicApp) {
                alert(_l('预览模式下，不能操作'), 3);
                return;
              }
              this.props.onExport(item);
              this.setState({
                visible: false,
              });
            }}
          >
            <span className="text">{_l('导出')}</span>
          </MenuItem>
        )}
        {isCharge && (
          <MenuItem
            icon={<Icon icon="hr_delete" />}
            className="delete"
            onClick={() => {
              this.props.onRemoveView(item);
              this.setState({
                visible: false,
              });
            }}
          >
            <span className="text">{_l('删除视图')}</span>
          </MenuItem>
        )}
      </Menu>
    );
  };
  handleClick = (view, event) => {
    const { isEdit } = this.state;
    if (this.timer || isEdit) return;
    this.timer = setTimeout(() => {
      clearTimeout(this.timer);
      this.timer = null;
      this.props.onSelectView(view);
    }, 200);
  };
  handleDbClick = view => {
    this.setState({ isEdit: true });
    this.props.onSelectView(view);
    clearTimeout(this.timer);
    this.timer = null;
  };
  handleSaveName = event => {
    const value = event.target.value.trim();
    const { item } = this.props;
    const { name } = item;
    if (value && name !== value) {
      item.name = value;
      this.props.updateViewName(item);
    }
    this.setState({
      isEdit: false,
    });
  };
  render() {
    const { item, currentViewId, isCharge, sheetSwitchPermit, currentView } = this.props;
    const { isEdit } = this.state;
    return (
      <div
        className={cx('valignWrapper workSheetViewItem pointer', {
          active: currentViewId === item.viewId,
        })}
      >
        <div
          className={cx('name valignWrapper overflowHidden h100', {
            pRight20: !(isCharge || isOpenPermit(permitList.viewExportSwitch, sheetSwitchPermit, item.viewId)),
          })}
          onClick={() => this.handleClick(item)}
          onDoubleClick={isCharge ? () => this.handleDbClick(item) : _.noop}
        >
          {isEdit ? (
            <input
              autoFocus
              className="deit"
              defaultValue={item.name}
              onBlur={this.handleSaveName}
              onKeyDown={event => {
                if (event.which === 13) {
                  this.handleSaveName(event);
                }
              }}
            />
          ) : (
            <span className="ellipsis bold">{item.name}</span>
          )}
        </div>
        {isCharge ||
        isOpenPermit(permitList.viewExportSwitch, sheetSwitchPermit, item.viewId) ||
        (isOpenPermit(permitList.viewShareSwitch, sheetSwitchPermit, item.viewId) &&
          +_.get(currentView, 'viewType') === 0) ? (
          <Trigger
            popupVisible={this.state.visible}
            onPopupVisibleChange={visible => {
              this.setState({ visible });
            }}
            popupClassName="DropdownPanelTrigger"
            action={['click']}
            popupPlacement="bottom"
            builtinPlacements={{
              bottom: { points: ['tc', 'bc'] },
            }}
            popup={this.renderSettingMenu()}
            popupAlign={{ offset: [-30, 10] }}
          >
            <Icon icon="arrow-down" />
          </Trigger>
        ) : (
          ''
        )}
      </div>
    );
  }
}
