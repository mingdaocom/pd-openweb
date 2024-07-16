import React, { Component } from 'react';
import cx from 'classnames';
import { Icon, MdLink, Tooltip } from 'ming-ui';
import Trigger from 'rc-trigger';
import 'rc-trigger/assets/index.css';
import './ViewItems.less';
import { PLUGIN_INFO_SOURCE, VIEW_DISPLAY_TYPE } from 'src/pages/worksheet/constants/enum';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import { getTranslateInfo } from 'src/util';
import _ from 'lodash';
import { navigateTo } from 'src/router/navigateTo';
import SettingMenu from './SettingMenu';
export default class Item extends Component {
  static defaultProps = {
    item: {},
  };
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      isEdit: false,
    };
  }
  componentWillMount() {
    clearTimeout(this.timer);
  }

  isDelCustomize = () => {
    const { item } = this.props;
    const isCustomize = ['customize'].includes(VIEW_DISPLAY_TYPE[item.viewType]);
    return isCustomize && !_.get(item, 'pluginInfo.id');
  };

  canShare = () => {
    if (this.isDelCustomize()) {
      return false;
    }
    return !md.global.Account.isPortal;
  };
  canExport = () => {
    const { item, sheetSwitchPermit } = this.props;
    if (this.isDelCustomize()) {
      return false;
    }
    return isOpenPermit(permitList.viewExportSwitch, sheetSwitchPermit, item.viewId);
  };
  renderSettingMenu = () => {
    const { item, updateAdvancedSetting, list, getNavigateUrl } = this.props;

    return (
      <SettingMenu
        {...this.props}
        changeViewType={true}
        onChangeHidden={showhiden => {
          this.setState({ visible: false });
          updateAdvancedSetting({
            ...item,
            advancedSetting: {
              showhide: showhiden,
            },
            editAttrs: ['advancedSetting'],
            editAdKeys: ['showhide'],
          });
          if (showhiden.search(/hide|hpc/g) > -1) {
            let showList = list.filter(l => {
              return (
                l.viewId !== item.viewId &&
                _.get(l, 'advancedSetting.showhide') &&
                _.get(l, 'advancedSetting.showhide').search(/hide|hpc/g) === -1
              );
            });

            if (showList.length === 0) return;
            navigateTo(getNavigateUrl(showList[0]));
          }

        }}
        handleClose={() => this.setState({ visible: false })}
      />
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
    const { appId, item, currentViewId, isCharge, sheetSwitchPermit, currentView, getNavigateUrl } = this.props;
    const { isEdit } = this.state;

    const customViewDebugUrl = window.localStorage.getItem(`customViewDebugUrl_${item.viewId}`);
    const pluginIsInDevelop = _.get(item, 'pluginInfo.source') === PLUGIN_INFO_SOURCE.DEVELOPMENT;
    const pluginIsDeleted = !_.get(item, 'pluginInfo.id');
    const codeUrl = _.get(item, 'pluginInfo.codeUrl');
    const showWidgetDebugIcon = item.viewType === 21 && pluginIsInDevelop && !pluginIsDeleted;

    return (
      <div
        className={cx('valignWrapper workSheetViewItem pointer', `workSheetViewItemViewId-${item.viewId}`, {
          active: currentViewId === item.viewId,
        })}
        style={
          _.get(item, 'advancedSetting.showhide') && _.get(item, 'advancedSetting.showhide').search(/hide|hpc/g) !== -1
            ? { display: 'none' }
            : {}
        }
      >
        <MdLink
          className={cx('name valignWrapper overflowHidden h100', {
            pRight20: !(isCharge || this.canExport() || this.canShare()),
          })}
          to={getNavigateUrl(item)}
        >
          {showWidgetDebugIcon && (
            <Tooltip
              text={
                customViewDebugUrl
                  ? _l('开发调试中，本地脚本: %0', customViewDebugUrl)
                  : codeUrl
                  ? _l('视图插件调试中，使用的是提交历史中的版本。')
                  : _l('视图插件调试中')
              }
            >
              <i className="developIcon icon icon-setting"></i>
            </Tooltip>
          )}
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
            <span className="ellipsis bold">{getTranslateInfo(appId, null, item.viewId).name || item.name}</span>
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
