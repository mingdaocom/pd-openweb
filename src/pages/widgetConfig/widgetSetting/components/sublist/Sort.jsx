import React, { useState } from 'react';
import { Dialog } from 'ming-ui';
import SortConditions from 'src/pages/worksheet/common/ViewConfig/components/SortConditions';
import { getAdvanceSetting } from '../../../util';
import { handleAdvancedSettingChange } from '../../../util/setting';

export default function SubListSort(props) {
  const { data, controls, onChange, onClose } = props;
  const [sorts, setSorts] = useState(getAdvanceSetting(data, 'sorts'));
  return (
    <Dialog
      visible
      title={<span className="Bold">{_l('排序')}</span>}
      width={560}
      onCancel={onClose}
      className="subListSortDialog"
      onOk={() => {
        console.log(sorts);
        onChange(handleAdvancedSettingChange(data, { sorts: JSON.stringify(sorts) }));
        onClose();
      }}
    >
      <SortConditions
        className="subListSortCondition"
        columns={controls.filter(o => ![43].includes(o.type))}
        sortConditions={sorts}
        onChange={setSorts}
      />
    </Dialog>
  );
}
