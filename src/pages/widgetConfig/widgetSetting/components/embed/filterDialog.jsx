import React, { useState } from 'react';
import { Dialog } from 'ming-ui';
import { isEmpty } from 'lodash';
import FilterConfig from 'src/pages/worksheet/common/WorkSheetFilter/common/FilterConfig';
import 'src/pages/worksheet/common/WorkSheetFilter/WorkSheetFilter.less';
import { getAdvanceSetting } from '../../../util/setting';
import '../FilterData/filterDialog.less';

export default function FilterDialog(props) {
  const {
    data,
    titleCom,
    onClose,
    onOk,
    controls,
    allControls, // 动态字段值显示的Controls
    globalSheetInfo,
    sourceControlId,
  } = props;

  const [filters, setFilters] = useState(getAdvanceSetting(data, 'filters'));

  return (
    <Dialog
      visible
      width={560}
      title={_l('设置筛选条件')}
      okDisabled={isEmpty(filters)}
      okText={_l('确定')}
      cancelText={_l('取消')}
      className="filterDialog"
      onCancel={onClose}
      onOk={() => onOk(filters)}
    >
      <div>{titleCom}</div>
      <FilterConfig
        canEdit
        feOnly
        supportGroup={data.enumDefault === 3}
        projectId={globalSheetInfo.projectId}
        appId={globalSheetInfo.appId}
        columns={controls}
        conditions={filters}
        sourceControlId={sourceControlId}
        filterResigned={false}
        from={'relateSheet'}
        currentColumns={allControls}
        showCustom={true}
        onConditionsChange={conditions => {
          setFilters(conditions);
        }}
      />
    </Dialog>
  );
}
