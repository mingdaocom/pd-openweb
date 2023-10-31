import React, { Component } from 'react';
import appManagementApi from 'src/api/appManagement';
import homeAppApi from 'src/api/homeApp';
import SelectIcon from 'src/pages/AppHomepage/components/SelectIcon';
import store from 'redux/configureStore';
import { updateAppItemInfo, updateSheetListAppItem } from 'worksheet/redux/actions/sheetList';
import { getAppSectionRef } from 'src/pages/PageHeader/AppPkgHeader/LeftAppGroup';

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      originalName: props.name,
      originalIcon: props.icon,
    };
  }
  onChange(newName, newIcon) {
    const { appItem, workSheetId, appId, groupId, icon } = this.props;
    if (appItem.type === 2) {
      homeAppApi.updateAppSection({
        appId,
        appSectionId: workSheetId,
        appSectionName: newName,
        icon: newIcon || icon,
      }).then(data => {
        this.updateName(newName);
        this.updateIcon({ icon: newIcon || icon });
      }).fail(err => {
        alert(_l('修改分组名称失败'), 2);
      });
    } else {
      const { currentPcNaviStyle } = store.getState().appPkg;
      appManagementApi.editWorkSheetInfoForApp({
        appId,
        appSectionId: appItem.parentGroupId || groupId,
        workSheetId,
        workSheetName: newName,
        icon: newIcon || icon,
      }).then(data => {
        this.updateName(newName);
        this.updateIcon({ icon: newIcon || icon });
      }).fail(err => {
        alert(_l('修改工作表名称失败'), 2);
      });
    }
  }
  updateName(newName) {
    const { originalName } = this.state;
    const { workSheetId, isActive, appItem, groupId } = this.props;
    const name = (newName || originalName).slice(0, 25);
    const { currentPcNaviStyle } = store.getState().appPkg;
    isActive && store.dispatch(updateAppItemInfo(workSheetId, appItem.type, name));
    if (currentPcNaviStyle === 1) {
      const singleRef = getAppSectionRef(groupId);
      singleRef.dispatch(updateSheetListAppItem(workSheetId, {
        workSheetName: newName,
      }));
    } else {
      this.props.updateSheetListAppItem(workSheetId, {
        workSheetName: newName,
      });
    }
  }
  updateIcon(args) {
    const { originalIcon } = this.state;
    const { workSheetId, appItem, groupId } = this.props;
    const { currentPcNaviStyle } = store.getState().appPkg;
    if (currentPcNaviStyle === 1) {
      const singleRef = getAppSectionRef(groupId);
      singleRef.dispatch(updateSheetListAppItem(workSheetId, args));
    } else {
      this.props.updateSheetListAppItem(workSheetId, args);
    }
  }
  render() {
    const { className, onCancel, icon, workSheetId, ...rest } = this.props;
    const { originalName, originalIcon } = this.state;
    const { iconColor } = store.getState().appPkg;
    return (
      <SelectIcon
        {...rest}
        className={className}
        hideColor={true}
        name={originalName}
        iconColor={iconColor}
        icon={icon}
        onChange={({ name, icon: newIcon }) => {
          const newName = name.slice(0, 25);
          if ((newName && newName !== originalName) || originalIcon !== newIcon) {
            this.onChange(newName, newIcon);
          }
        }}
        onNameInput={({ name }) => {
          this.updateName(name);
        }}
        onModify={({ name, icon, iconUrl }) => {
          if (name) {
            this.updateName(name);
          }
          if (icon) {
            this.updateIcon({ icon, iconUrl });
          }
        }}
        onClickAway={onCancel}
        onClose={onCancel}
      />
    );
  }
}
