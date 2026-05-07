import appManagementApi from 'src/api/appManagement';

const CUSTOM_ICON_BASE = 'https://fp1.mingdaoyun.cn/customIcon/';

const getEffectiveIconName = (iconName, lineStyle) => {
  if (!iconName) return undefined;
  if (lineStyle) return iconName.endsWith('_line') ? iconName : `${iconName}_line`;
  return iconName.endsWith('_line') ? iconName.replace(/_line$/, '') : iconName;
};

const mapItemType = type => {
  if (type === 0) return 'Worksheet';
  if (type === 1) return 'CustomPage';
  return String(type);
};

const buildSectionPayload = (section, changeMap) => {
  const sectionId = section.appSectionId;
  const sectionChange = changeMap[sectionId];

  const itemPayload = [];
  section.workSheetInfo?.forEach(wsItem => {
    const itemChange = changeMap[wsItem.workSheetId];
    if (!itemChange) return;
    itemPayload.push({
      id: wsItem.workSheetId,
      name: itemChange.name || wsItem.workSheetName,
      icon: itemChange.icon || wsItem.icon,
      type: mapItemType(wsItem.type),
    });
  });

  const childSectionPayload = [];
  section.childSections?.forEach(childSection => {
    const childPayload = buildSectionPayload(childSection, changeMap);

    if (childPayload) {
      childSectionPayload.push(childPayload);
    }
  });

  if (!sectionChange && !itemPayload.length && !childSectionPayload.length) {
    return null;
  }

  return {
    id: sectionId,
    name: sectionChange?.name || section.name,
    icon: sectionChange?.icon || section.icon,
    type: 'Section',
    item: itemPayload,
    childSections: childSectionPayload,
  };
};

function buildChanges({ optimizedMap, selectedIds, editName, editIcon, isLine, treeData }) {
  return selectedIds
    .filter(id => id !== 'app')
    .map(id => {
      const item = treeData.find(i => i.id === id);
      if (!item) return { id, name: undefined, icon: undefined };
      const override = optimizedMap[id];
      return {
        id,
        name: editName && override?.name ? override.name : item.name,
        icon: editIcon && override?.icon ? getEffectiveIconName(override.icon, isLine) : item.icon,
      };
    });
}

/** 供 Redux 更新左侧列表用：返回 { id, workSheetName, icon, iconUrl }[]，不含 app */
export function buildSheetListUpdates(params) {
  const changes = buildChanges(params);
  return changes
    .filter(c => c.id !== 'app')
    .map(c => ({
      id: c.id,
      workSheetName: c.name,
      icon: c.icon,
      iconUrl: c.icon ? `${CUSTOM_ICON_BASE}${c.icon}.svg` : undefined,
    }));
}

export function saveOptimizationResult({ appInfo, optimizedMap, selectedIds, editName, editIcon, isLine, treeData }) {
  const changes = buildChanges({ optimizedMap, selectedIds, editName, editIcon, isLine, treeData });

  const changeMap = changes.reduce((map, item) => {
    map[item.id] = item;
    return map;
  }, {});

  const sectionsPayload = appInfo.sections
    .map(section => buildSectionPayload(section, changeMap))
    .filter(section => section !== null);

  const appNameChanged = editName && optimizedMap.app?.name && optimizedMap.app.name !== appInfo.name;
  const appIconCandidate =
    editIcon && optimizedMap.app?.icon ? getEffectiveIconName(optimizedMap.app.icon, isLine) : undefined;
  const appIconChanged = !!appIconCandidate && appIconCandidate !== appInfo.icon;

  const payload = {
    appId: appInfo.id || appInfo.appId,
    sections: sectionsPayload,
  };

  if (appNameChanged) {
    payload.name = optimizedMap.app.name;
  }

  if (appIconChanged) {
    payload.icon = appIconCandidate;
  }

  if (!sectionsPayload.length && !appNameChanged && !appIconChanged) {
    return Promise.resolve(null);
  }

  return appManagementApi.batchEditItemInfo(payload);
}
