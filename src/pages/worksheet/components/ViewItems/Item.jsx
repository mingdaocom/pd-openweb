import React, { Component } from 'react';
import cx from 'classnames';
import { Menu, MenuItem, Icon, MdLink } from 'ming-ui';
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
  static defaultProps = {
    item: {},
  };
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
    if (_.includes(['0', '3', '4', '5'], String(viewType))) return false;
    if (String(viewType) === '2' && String(childType) === '2' && !_.isEmpty(viewControls)) return false;
    if (_.includes(['1', '2'], String(viewType)) && viewControl) return false;
    return true;
  };
  canShare = () => {
    const { item, currentView, sheetSwitchPermit } = this.props;
    return (
      isOpenPermit(permitList.viewShareSwitch, sheetSwitchPermit, item.viewId) &&
      !md.global.Account.isPortal &&
      +_.get(currentView, 'viewType') === 0
    );
  };
  canExport = () => {
    const { item, sheetSwitchPermit } = this.props;
    return isOpenPermit(permitList.viewExportSwitch, sheetSwitchPermit, item.viewId);
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
                        viewControl: 'gunter' === viewType ? '' : item.viewControl, //转换成甘特图，viewControl清空
                        viewControls: [],
                        viewType: VIEW_DISPLAY_TYPE[viewType],
                        filters: item.filters, // formatValuesOfOriginConditions(item.filters),
                        advancedSetting: _.omit(item.advancedSetting || {}, ['navfilters', 'navshow']), //更换视图类型，把分组清空
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
        {this.canShare() && (
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
        {this.canExport() && (
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
    const { item, currentViewId, isCharge, sheetSwitchPermit, currentView, getNavigateUrl } = this.props;
    const { isEdit } = this.state;
    return (
      <div
        className={cx('valignWrapper workSheetViewItem pointer', {
          active: currentViewId === item.viewId,
        })}
      >
        <MdLink
          className={cx('name valignWrapper overflowHidden h100', {
            pRight20: !(isCharge || this.canExport()),
          })}
          to={getNavigateUrl(item)}
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
        </MdLink>
        {isCharge || this.canExport() || this.canShare() ? (
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
