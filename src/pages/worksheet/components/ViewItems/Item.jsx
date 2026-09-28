import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, MdLink } from 'ming-ui';
import { Dropdown, Input, Tooltip } from 'ming-ui/antd-components';
import { navigateTo } from 'src/router/navigation/navigateTo';
import { permitList } from 'src/utils/domain/control/formEnum';
import { isOpenPermit } from 'src/utils/domain/permission/worksheet';
import { PLUGIN_INFO_SOURCE, VIEW_DISPLAY_TYPE } from 'src/utils/domain/worksheet/constants';
import { getTranslateInfo } from 'src/utils/services/app';
import getViewSettingMenuItems from './SettingMenu';
import './ViewItems.less';

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
  getSettingMenuItems = () => {
    const { item, updateAdvancedSetting, list, getNavigateUrl } = this.props;

    return getViewSettingMenuItems({
      ...this.props,
      changeViewType: true,
      onChangeHidden: showhiden => {
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
      },
      handleClose: () => this.setState({ visible: false }),
    });
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
    const { appId, item, currentViewId, isCharge, getNavigateUrl, fixed = false } = this.props;
    const { isEdit } = this.state;

    const customViewDebugUrl = window.localStorage.getItem(`customViewDebugUrl_${item.viewId}`);
    const pluginIsInDevelop = _.get(item, 'pluginInfo.source') === PLUGIN_INFO_SOURCE.DEVELOPMENT;
    const pluginIsDeleted = !_.get(item, 'pluginInfo.id');
    const codeUrl = _.get(item, 'pluginInfo.codeUrl');
    const showWidgetDebugIcon = item.viewType === 21 && pluginIsInDevelop && !pluginIsDeleted;
    const isManageView = item.viewId === item.worksheetId;

    if (!item.viewId) return null;
    return (
      <div
        className={cx('valignWrapper workSheetViewItem pointer', `workSheetViewItemViewId-${item.viewId}`, {
          active: currentViewId === item.viewId,
        })}
        style={
          _.get(item, 'advancedSetting.showhide') &&
          _.get(item, 'advancedSetting.showhide').search(/hide|hpc/g) !== -1 &&
          !fixed
            ? { display: 'none' }
            : {}
        }
      >
        <MdLink
          className={cx('name valignWrapper overflowHidden h100', {
            pRight20: !(isCharge || this.canExport() || this.canShare()) || isManageView,
          })}
          to={getNavigateUrl(item)}
        >
          {showWidgetDebugIcon && (
            <Tooltip
              title={
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
            <Input
              autoFocus
              className="deit"
              radius
              variant="filled"
              defaultValue={item.name}
              onBlur={this.handleSaveName}
              onKeyDown={event => {
                if (event.which === 13) {
                  this.handleSaveName(event);
                }
              }}
            />
          ) : (
            <span
              className="ellipsis bold"
              title={isManageView ? _l('数据管理') : getTranslateInfo(appId, null, item.viewId).name || item.name}
            >
              {isManageView ? _l('数据管理') : getTranslateInfo(appId, null, item.viewId).name || item.name}
            </span>
          )}
        </MdLink>
        {(isCharge || this.canExport() || this.canShare()) && !isManageView && (
          <Dropdown
            open={this.state.visible}
            onOpenChange={visible => {
              this.setState({ visible });
            }}
            trigger={['click']}
            align={{ offset: [60, 10] }}
            placement="bottom"
            menu={{
              items: this.getSettingMenuItems(),
              selectable: false,
              selectedKeys: [],
              style: { minWidth: 220 },
            }}
          >
            <Icon icon="arrow-down" />
          </Dropdown>
        )}
      </div>
    );
  }
}
