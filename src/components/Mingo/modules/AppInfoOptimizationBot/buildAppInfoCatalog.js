/**
 * 将应用结构（与左侧应用分组 / 工作表列表一致）整理为 Agent 易读的树形 JSON（与产品侧「应用信息」视图一致）。
 * 节点均带 id、name、icon；分组 type 为 Section，工作表为 Worksheet 等。
 */

function mapLeafWorksheetType(type) {
  if (type === 0) return 'Worksheet';
  if (type === 1) return 'CustomPage';
  return typeof type === 'number' ? String(type) : 'Worksheet';
}

function serializeSection(section) {
  const node = {
    id: section.appSectionId || '',
    name: section.name || '',
    icon: section.icon || '',
    type: 'Section',
    item: [],
    childSections: [],
  };

  for (const ws of section.workSheetInfo || []) {
    if (ws.type === 2) {
      const child = section.childSections?.find(c => c.appSectionId === ws.workSheetId);

      if (child) {
        node.childSections.push(serializeSection(child));
      }
    } else {
      node.item.push({
        id: ws.workSheetId || '',
        name: ws.workSheetName || '',
        icon: ws.icon || '',
        type: mapLeafWorksheetType(ws.type),
      });
    }
  }

  return node;
}

/**
 * @param {object} appInfo Redux / GlobalStore 中的当前应用信息（含 sections、workSheetInfo、childSections）
 * @returns {{ appId: string, name: string, icon: string, sections: object[] }}
 */
export function buildAppInfoCatalog(appInfo) {
  if (!appInfo || typeof appInfo !== 'object') {
    return { appId: '', name: '', icon: '', sections: [] };
  }

  return {
    appId: appInfo.appId || appInfo.id || '',
    name: appInfo.name || '',
    icon: appInfo.icon || '',
    sections: (appInfo.sections || []).map(s => serializeSection(s)),
  };
}

/** 供 Agent message 使用的 JSON 字符串（格式化便于模型阅读） */
export function buildAppInfoMessage(appInfo) {
  return JSON.stringify(buildAppInfoCatalog(appInfo), null, 2);
}
