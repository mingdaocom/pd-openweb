import { dialogSelectIcon } from 'ming-ui/functions';
import appManagementApi from 'src/api/appManagement';
import homeAppApi from 'src/api/homeApp';
import { updateAppItemInfo, updateSheetListAppItem } from 'worksheet/redux/actions/sheetList';
import { getAppSectionRef } from 'src/pages/PageHeader/AppPkgHeader/LeftAppGroup';
import store from 'src/redux/configureStore';

export default props => {
  const { iconColor } = store.getState().appPkg;
  const originalName = props.name;
  const originalIcon = props.icon;
  const onChange = (newName, newIcon) => {
    const { appItem, workSheetId, appId, groupId, icon } = props;
    if (appItem.type === 2) {
      homeAppApi
        .updateAppSection({
          appId,
          appSectionId: workSheetId,
          appSectionName: newName,
          icon: newIcon || icon,
        })
        .then(() => {
          updateName(newName);
          updateIcon({ icon: newIcon || icon });
        })
        .catch(() => {
          alert(_l('修改分组名称失败'), 2);
        });
    } else {
      appManagementApi
        .editWorkSheetInfoForApp({
          appId,
          appSectionId: appItem.parentGroupId || groupId,
          workSheetId,
          workSheetName: newName,
          icon: newIcon || icon,
        })
        .then(() => {
          updateName(newName);
          updateIcon({ icon: newIcon || icon });
        })
        .catch(() => {
          alert(_l('修改工作表名称失败'), 2);
        });
    }
  };
  const updateName = newName => {
    const { workSheetId, isActive, appItem, groupId } = props;
    const name = (newName || originalName).slice(0, 100);
    const { currentPcNaviStyle } = store.getState().appPkg;
    isActive && store.dispatch(updateAppItemInfo(workSheetId, appItem.type, name));

    if ([1, 3].includes(currentPcNaviStyle)) {
      const singleRef = getAppSectionRef(groupId);
      singleRef.dispatch(updateSheetListAppItem(workSheetId, { workSheetName: newName }));
    } else {
      props.updateSheetListAppItem(workSheetId, { workSheetName: newName });
    }
  };

  const updateIcon = args => {
    const { workSheetId, groupId } = props;
    const { currentPcNaviStyle } = store.getState().appPkg;

    if ([1, 3].includes(currentPcNaviStyle)) {
      const singleRef = getAppSectionRef(groupId);
      singleRef.dispatch(updateSheetListAppItem(workSheetId, args));
    } else {
      props.updateSheetListAppItem(workSheetId, args);
    }
  };

  dialogSelectIcon({
    ...props,
    hideColor: true,
    name: originalName,
    iconColor,
    onChange: ({ name, icon: newIcon }) => {
      const newName = name.slice(0, 100);

      if ((newName && newName !== originalName) || originalIcon !== newIcon) {
        onChange(newName, newIcon);
      }
    },
    onModify: ({ name, icon, iconUrl }) => {
      name && updateName(name);
      icon && iconUrl && updateIcon({ icon, iconUrl });
    },
  });
};
