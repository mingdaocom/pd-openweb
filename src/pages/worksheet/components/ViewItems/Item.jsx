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
import { getFeatureStatus, buriedUpgradeVersionDialog } from 'src/util';
import _ from 'lodash';

const exportAttachmentFeatureId = 28;
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
    return isOpenPermit(permitList.viewShareSwitch, sheetSwitchPermit, item.viewId) && !md.global.Account.isPortal;
  };
  canExport = () => {
    const { item, sheetSwitchPermit } = this.props;
    return isOpenPermit(permitList.viewExportSwitch, sheetSwitchPermit, item.viewId);
  };
  renderSettingMenu = () => {
    const {
      item,
      isCharge,
      changeViewDisplayType,
      currentView,
      sheetSwitchPermit,
      updateAdvancedSetting,
      isLock,
      appId,
      controls,
      projectId,
    } = this.props;

    const { changeViewDisplayTypeVisible, changeHiddenTypeVisible } = this.state;
    const attachmentControls = isCharge
      ? controls.filter(it => it.type === 14)
      : controls
          .filter(it => it.type === 14)
          .filter(item => {
            const controlPermissions = item.controlPermissions || '111';
            const fieldPermission = item.fieldPermission || '111';
            return fieldPermission[0] === '1' && controlPermissions[0] === '1';
          });

    const featureType = getFeatureStatus(projectId, exportAttachmentFeatureId);

    return (
      <Menu className="viewItemMoreOperate">
        {!isLock && isCharge && (
          <MenuItem
            icon={<Icon icon="settings" className="Font18" />}
            onClick={() => {
              this.props.onOpenView(item);
              this.setState({
                visible: false,
              });
            }}
          >
            <span className="text">{_l('配置视图%05024')}</span>
          </MenuItem>
        )}
        {!isLock && isCharge && (
          <Trigger
            popupVisible={changeViewDisplayTypeVisible}
            onPopupVisibleChange={changeViewDisplayTypeVisible => {
              this.setState({ changeViewDisplayTypeVisible });
            }}
            popupClassName="DropdownPanelTrigger"
            action={['hover']}
            popupPlacement="bottom"
            popupAlign={{ points: ['tl', 'tr'], offset: [0, -6], overflow: { adjustX: true, adjustY: true } }}
            popup={() => {
              return (
                <ViewDisplayMenu
                  style={{
                    borderRadius: '3px',
                  }}
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
              );
            }}
          >
            <MenuItem className="changeViewDisplayTypeMenuWrap" icon={<Icon icon="swap_horiz" className="Font18" />}>
              <span className="text">{_l('更改视图类型%05023')}</span>
              <Icon icon="arrow-right-tip Font15" style={{ fontSize: '16px', right: '10px', left: 'initial' }} />
            </MenuItem>
          </Trigger>
        )}
        {!isLock && isCharge && (
          <MenuItem
            icon={<Icon icon="content-copy" className="Font16" />}
            onClick={() => {
              this.props.onCopyView(item);
              this.setState({
                visible: false,
              });
            }}
          >
            <span className="text">{_l('复制%05022')}</span>
          </MenuItem>
        )}
        {isCharge && <hr className="splitLine" />}
        {/* 分享视图权限 目前只有表视图才能分享*/}
        {this.canShare() && (
          <MenuItem
            icon={<Icon icon="share" className="Font18" />}
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
            <span className="text">{_l('分享%05021')}</span>
          </MenuItem>
        )}
        {/* 导出视图下记录权限 */}
        {this.canExport() && (
          <Trigger
            popupVisible={this.state.exportVisible}
            onPopupVisibleChange={visible => {
              this.setState({ exportVisible: visible });
            }}
            popupClassName="exportTrigger"
            action={['hover', 'click']}
            popupPlacement="right"
            builtinPlacements={{
              right: { points: ['cl', 'cr'] },
            }}
            popup={
              <Menu style={{ width: 200 }}>
                {[
                  {
                    name: _l('导出记录') + '（Excel，CSV）',
                    icon: 'new_excel',
                    exportType: 1,
                  },
                  {
                    name: _l('导出附件'),
                    icon: 'attachment',
                    exportType: 2,
                  },
                ].map(it => {
                  if (it.exportType === 2 && _.isEmpty(attachmentControls)) return;
                  return (
                    <MenuItem
                      icon={<Icon icon={it.icon} />}
                      onClick={() => {
                        if (window.isPublicApp === 1) {
                          alert(_l('预览模式下，不能操作'), 3);
                          return;
                        }
                        if (it.exportType === 1) {
                          this.props.onExport(item);
                          this.setState({ visible: false, exportVisible: false });
                        } else {
                          this.setState({ exportVisible: false, visible: false });
                          const allowDownload = isOpenPermit(
                            permitList.recordAttachmentSwitch,
                            sheetSwitchPermit,
                            item.viewId,
                          );
                          if (it.exportType === 2 && !allowDownload) {
                            return alert(_l('无附件下载权限，无法导出'), 2);
                          }
                          if (featureType === '2') {
                            buriedUpgradeVersionDialog(projectId, exportAttachmentFeatureId);
                            return;
                          }
                          this.props.onExportAttachment();
                        }
                      }}
                    >
                      <span>{it.name}</span>
                    </MenuItem>
                  );
                })}
              </Menu>
            }
            popupAlign={{ offset: [0, -20] }}
          >
            <MenuItem icon={<Icon icon="download" className="Font18" />}>
              <span className="text">{_l('导出%05020')}</span>
              <Icon icon="arrow-right-tip Font15" style={{ fontSize: '16px', right: '10px', left: 'initial' }} />
            </MenuItem>
          </Trigger>
        )}
        {!isLock && isCharge && (
          <MenuItem
            icon={
              <Icon
                icon={item.advancedSetting.showhide !== 'hide' ? 'visibility_off' : 'visibility'}
                className="Font18"
              />
            }
            className="hiddenTypeMenuWrap"
            onMouseEnter={() => this.setState({ changeHiddenTypeVisible: true })}
            onMouseLeave={() => this.setState({ changeHiddenTypeVisible: false })}
          >
            <span className="text">
              {item.advancedSetting.showhide !== 'hide' ? _l('从导航栏中隐藏%05019') : _l('取消隐藏')}
            </span>
            <Icon icon="arrow-right-tip Font15" style={{ fontSize: '16px', right: '10px', left: 'initial' }} />
            {changeHiddenTypeVisible && (
              <HiddenMenu
                showhide={item.advancedSetting.showhide || 'show'}
                onClick={showhiden => {
                  updateAdvancedSetting({
                    ...item,
                    advancedSetting: {
                      ...item.advancedSetting,
                      showhide: showhiden,
                    },
                  });
                  this.setState({ visible: false });
                }}
                style={{ top: '-6px', left: '100%' }}
              />
            )}
          </MenuItem>
        )}
        {!isLock && isCharge && (
          <MenuItem
            icon={<Icon icon="hr_delete" className="Font18" />}
            className="delete"
            onClick={() => {
              this.props.onRemoveView(item);
              this.setState({
                visible: false,
              });
            }}
          >
            <span className="text">{_l('删除视图%05018')}</span>
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
        style={
          item.advancedSetting.showhide && item.advancedSetting.showhide.search(/hide|hpc/g) !== -1
            ? { display: 'none' }
            : {}
        }
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
