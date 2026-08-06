import _ from 'lodash';
import { getEmbedValue } from 'src/components/Form/core/formUtils/helper';
import { transferValue } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/util';
import { getAdvanceSetting } from 'src/utils/control';
import { getRecordColorConfig } from 'src/utils/record';
import { getRecordAttachments } from '../../util';
import { getDataWithFormat } from '../util';

// 将接口行数据整理成 EditableCard 需要的卡片数据结构。
export const formatGalleryItem = (item, props, currentView) => {
  const { worksheetInfo, base = {}, controls = [] } = props;
  const { coverCid } = currentView;
  const { abstract = '' } = getAdvanceSetting(currentView);
  const formData = controls.map(o => ({ ...o, value: item[o.controlId] }));
  const { coverImage, allAttachments } = getRecordAttachments(item[coverCid]);
  let coverData = { ...(controls.find(it => it.controlId === coverCid) || {}), value: item[coverCid] };

  // 嵌入控件被配置为封面时，需按当前记录上下文解析出实际展示地址。
  if (coverData.type === 45) {
    const dataSource = transferValue(coverData.value);
    const urlList = dataSource.map(
      o =>
        o.staticValue ||
        getEmbedValue(
          {
            projectId: worksheetInfo.projectId,
            appId: base.appId,
            groupId: base.groupId,
            worksheetId: base.worksheetId,
            viewId: base.viewId,
            recordId: item.rowid,
          },
          o.cid,
        ),
    );
    coverData = { ...coverData, value: urlList.join('') };
  }

  const abstractData = controls.find(it => it.controlId === abstract) || {};

  return {
    coverData,
    coverImage,
    allAttachments,
    allowEdit: item.allowedit,
    allowDelete: item.allowdelete,
    rawRow: item,
    recordColorConfig: getRecordColorConfig(currentView),
    fields: getDataWithFormat(item, props),
    formData,
    rowId: item.rowid,
    abstractControl: abstract ? { ...abstractData, value: item[abstract] } : '',
  };
};

// 为卡片的移动分组操作准备可选分组和分组控件信息。
export const getGalleryItemGroupInfo = (item, rowKey, props, currentView) => {
  const { controls = [], galleryview = {} } = props;
  const { gallery = [] } = galleryview;
  const { groupsetting } = getAdvanceSetting(currentView);
  const groupControlId = _.get(safeParse(groupsetting, 'array'), '[0].controlId');
  const groupControl = groupsetting && item.allowedit ? controls.find(o => o.controlId === groupControlId) : null;

  if (!groupControl) return {};

  // 移动分组只需要可选目标分组信息，rows 不参与操作面板展示。
  return {
    allowEditForGroup: true,
    groups: gallery.filter(o => o.key !== rowKey).map(o => _.omit(o, ['rows'])),
    groupControl,
  };
};
