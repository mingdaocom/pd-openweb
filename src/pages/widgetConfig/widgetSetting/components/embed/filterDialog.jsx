import React, { useRef, useState } from 'react';
import { isEmpty } from 'lodash';
import { Modal } from 'ming-ui/antd-components';
import FilterConfig from 'src/pages/worksheet/common/WorkSheetFilter/common/FilterConfig';
import 'src/pages/worksheet/common/WorkSheetFilter/WorkSheetFilter.less';
import { getAdvanceSetting } from 'src/utils/domain/control/advancedSetting';
import EmptyRuleConfig from '../EmptyRuleConfig';
import '../FilterData/FilterDialog.less';

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
  const ruleRef = useRef(null);

  return (
    <Modal
      open
      mask={{ closable: true }}
      keyboard
      width={560}
      title={_l('设置筛选条件')}
      okDisabled={isEmpty(filters)}
      okText={_l('确定')}
      cancelText={_l('取消')}
      className="filterDialog"
      onCancel={onClose}
      onOk={() => {
        const ruleConfig = ruleRef.current ? { emptyRule: ruleRef.current } : {};
        const newFilters = filters.map(i => {
          if (i.isGroup) {
            return { ...i, groupFilters: (i.groupFilters || []).map(g => ({ ...g, ...ruleConfig })) };
          }

          return { ...i, ...ruleConfig };
        });
        onOk(newFilters);
      }}
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
        currentColumns={allControls.map(a => ({ ...a, type: a.type === 30 ? a.sourceControlType : a.type }))}
        showCustom={true}
        onConditionsChange={conditions => {
          setFilters(conditions);
        }}
      />

      <EmptyRuleConfig {...props} filters={filters} handleChange={value => (ruleRef.current = value)} />
    </Modal>
  );
}
