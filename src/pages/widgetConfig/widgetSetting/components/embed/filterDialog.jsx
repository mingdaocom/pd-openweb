import React, { useState } from 'react';
import { Dialog } from 'ming-ui';
import { isEmpty } from 'lodash';
import FilterConfig from 'src/pages/worksheet/common/WorkSheetFilter/common/FilterConfig';
import 'src/pages/worksheet/common/WorkSheetFilter/WorkSheetFilter.less';
import { getAdvanceSetting } from '../../../util/setting';
import '../FilterData/filterDialog.less';
import { checkConditionCanSave } from 'src/pages/FormSet/components/columnRules/config';
import styled from 'styled-components';

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
      title={_l('筛选数据源')}
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
        projectId={globalSheetInfo.projectId}
        appId={globalSheetInfo.appId}
        columns={controls}
        conditions={filters}
        sourceControlId={sourceControlId}
        filterResigned={false}
        from={'relateSheet'}
        currentColumns={allControls}
        onConditionsChange={conditions => {
          setFilters(conditions);
        }}
      />
    </Dialog>
  );
}
