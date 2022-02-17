import React, { Component } from 'react';
import appManagement from 'src/api/appManagement';
import SelectIcon from 'src/pages/AppHomepage/components/SelectIcon';

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      originalName: props.name,
      originalIcon: props.icon,
    };
  }
  onChange(newName, newIcon) {
    const { workSheetId, appId, groupId, icon } = this.props;
    appManagement
      .editWorkSheetInfoForApp({
        appId,
        appSectionId: groupId,
        workSheetId,
        workSheetName: newName,
        icon: newIcon || icon || '1_worksheet',
      })
      .then(data => {
        this.props.updateSheetList(workSheetId, {
          icon: newIcon || icon,
        });
      })
      .fail(err => {
        alert(_l('修改工作表名称失败'), 2);
      });
  }
  updateName(newName) {
    const { originalName } = this.state;
    const { workSheetId, isActive } = this.props;
    const name = (newName || originalName).slice(0, 25);
    isActive && this.props.updateWorksheetInfo(workSheetId, { name });
    this.props.updateSheetList(workSheetId, {
      workSheetName: name,
    });
  }
  render() {
    const { className, onCancel, icon, workSheetId, ...rest } = this.props;
    const { originalName, originalIcon } = this.state;
    return (
      <SelectIcon
        {...rest}
        className={className}
        colorList={[]}
        name={originalName}
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
            this.props.updateSheetList(workSheetId, { icon, iconUrl });
          }
        }}
        onClickAway={onCancel}
        onClose={onCancel}
      />
    );
  }
}
