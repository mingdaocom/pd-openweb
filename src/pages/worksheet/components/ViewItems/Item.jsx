import React, { Component } from 'react';
import cx from 'classnames';
import { Menu, MenuItem, Icon, MdLink } from 'ming-ui';
import Trigger from 'rc-trigger';
import 'rc-trigger/assets/index.css';
import ViewDisplayMenu from './viewDisplayMenu';
import './ViewItems.less';
import { VIEW_DISPLAY_TYPE } from 'src/pages/worksheet/constants/enum';
import { getDefaultViewSet } from 'src/pages/worksheet/constants/common';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import HiddenMenu from './HiddenMenu';
import _ from 'lodash';
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
      changeHiddenTypeVisible: false,
    };
  }
  componentWillMount() {
    clearTimeout(this.timer);
  }

  canShare = () => {
    const { item, currentView, sheetSwitchPermit } = this.props;
    return (
      isOpenPermit(permitList.viewShareSwitch, sheetSwitchPermit, item.viewId) &&
      !md.global.Account.isPortal
    );
  };
  canExport = () => {
    const { item, sheetSwitchPermit } = this.props;
    return isOpenPermit(permitList.viewExportSwitch, sheetSwitchPermit, item.viewId);
  };
  renderSettingMenu = () => {
    const { item, isCharge, changeViewDisplayType, currentView, sheetSwitchPermit, updateAdvancedSetting } = this.props;
    const { changeViewDisplayTypeVisible, changeHiddenTypeVisible } = this.state;
    return (
      <Menu className="viewItemMoreOperate">
        {isCharge && (
          <MenuItem
            icon={<Icon icon="settings" className="Font18"/>}
            onClick={() => {
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
            icon={<Icon icon="swap_horiz" className="Font18"/>}
            onMouseEnter={() => this.setState({ changeViewDisplayTypeVisible: true })}
            onMouseLeave={() => this.setState({ changeViewDisplayTypeVisible: false })}
          >
            <span className="text">{_l('更改视图类型')}</span>
            <Icon icon="arrow-right-tip Font15" style={{ fontSize: '16px', right: '10px', left: 'initial' }} />
            {changeViewDisplayTypeVisible && (
              <ViewDisplayMenu
                onClickAway={() => this.setState({ changeViewDisplayTypeVisible: false })}
                style={{ top: '-6px', left: '100%', borderRadius: '3px' }}
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
            icon={<Icon icon="content-copy" className="Font16"/>}
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
            icon={<Icon icon="share" className="Font18"/>}
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
            icon={<Icon icon="download" className="Font18"/>}
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
            icon={<Icon icon={item.advancedSetting.showhide!=='hide' ? "visibility_off" : "visibility"} className="Font18"/>}
            className="hiddenTypeMenuWrap"
            onMouseEnter={() => this.setState({ changeHiddenTypeVisible: true })}
            onMouseLeave={() => this.setState({ changeHiddenTypeVisible: false })}
          >
            <span className='text'>{item.advancedSetting.showhide!=='hide' ? _l('从导航栏中隐藏') : _l('取消隐藏')}</span>
            <Icon icon="arrow-right-tip Font15" style={{ fontSize: '16px', right: '10px', left: 'initial' }} />
            {changeHiddenTypeVisible && (
              <HiddenMenu
                showhide={item.advancedSetting.showhide || 'show'}
                onClick={(showhiden)=>{
                  updateAdvancedSetting({
                    ...item,
                    advancedSetting: {
                      ...item.advancedSetting,
                      showhide: showhiden,
                    }
                  });
                  this.setState({ visible: false });
                }}
                style={{ top: '-6px', left: '100%'}}
              />
            )}
          </MenuItem>
        )}
        {isCharge && (
          <MenuItem
            icon={<Icon icon="hr_delete" className="Font18"/>}
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
        style={item.advancedSetting.showhide && item.advancedSetting.showhide.search(/hide|hpc/g)!==-1 ? {display: 'none'} : {}}
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
