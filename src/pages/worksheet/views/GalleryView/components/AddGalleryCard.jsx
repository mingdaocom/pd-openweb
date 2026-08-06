import React from 'react';
import _ from 'lodash';
import addRecord from 'worksheet/common/newRecord/addRecord';
import { getDefaultValue } from 'src/pages/worksheet/components/GroupByControl.jsx';
import { getAdvanceSetting } from 'src/utils/control';
import { canEditForGroupControl } from '../util';

// 渲染分组下的新增记录入口，并按分组控件写入默认值。
const AddGalleryCard = props => {
  const {
    rowKey,
    cardWidth,
    base = {},
    views = [],
    worksheetInfo,
    isCharge,
    updateRow,
    controls = [],
    galleryview = {},
    allowAddNewRecord = true,
  } = props;
  const currentView = views.find(o => o.viewId === base.viewId) || {};
  const { gallery = [] } = galleryview;
  const { groupsetting } = getAdvanceSetting(currentView);
  const control = controls.find(o => o.controlId === _.get(safeParse(groupsetting, 'array'), '[0].controlId'));
  const allowAdd =
    canEditForGroupControl({
      allowAdd: worksheetInfo?.allowAdd,
      control,
    }) && allowAddNewRecord;

  // 新增记录时带上当前分组默认值，确保新记录直接落在本分组。
  const addRecordInfo = () => {
    const dataRow = gallery.find(o => o.key === rowKey);
    addRecord({
      worksheetId: base.worksheetId,
      defaultFormData: getDefaultValue({
        control,
        groupKey: rowKey,
        name: dataRow?.name,
      }),
      defaultFormDataEditable: false,
      directAdd: true,
      isCharge,
      onAdd: data => {
        updateRow(data, rowKey);
      },
    });
  };

  if (!allowAdd) {
    return <div className="textSecondary Font16 pTop20 pBottom20 TxtCenter">{_l('该分组下无记录')}</div>;
  }

  return (
    <div className="galleryItem addNewGallery" style={{ width: cardWidth }}>
      <span
        className="addRow overflow_ellipsis WordBreak flexRow alignItemsCenter TxtCenter textSecondary hoverText"
        onClick={addRecordInfo}
      >
        <span className="Icon icon icon-plus Font13 mRight5" />
        <span className="bold">
          {worksheetInfo?.advancedSetting?.btnname || worksheetInfo?.entityName || _l('记录')}
        </span>
      </span>
    </div>
  );
};

export default AddGalleryCard;
