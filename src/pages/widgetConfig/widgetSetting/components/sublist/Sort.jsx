import React, { useState } from 'react';
import { Dialog } from 'ming-ui';
import SortConditions from 'src/pages/worksheet/common/ViewConfig/components/SortConditions';
import { getAdvanceSetting } from '../../../util';
import { handleAdvancedSettingChange } from '../../../util/setting';

const defaultSort = [
  {
    controlId: 'ctime',
    isAsc: true,
  },
];

export default function SubListSort(props) {
  const { data, controls, fromRelate, onChange, onClose } = props;
  const [sorts, setSorts] = useState(getAdvanceSetting(data, 'sorts'));
  return (
    <Dialog
      visible
      title={<span className="Bold">{_l('排序')}</span>}
      width={560}
      onCancel={onClose}
      className="subListSortDialog"
      onOk={() => {
        onChange(
          handleAdvancedSettingChange(data, {
            sorts: fromRelate && _.isEmpty(sorts) ? JSON.stringify(defaultSort) : JSON.stringify(sorts),
          }),
        );
        onClose();
      }}
    >
      <SortConditions
        className="subListSortCondition"
        columns={controls.filter(o => ![43].includes(o.type))}
        sortConditions={sorts}
        onChange={setSorts}
        isSubList={true}
      />
    </Dialog>
  );
}
