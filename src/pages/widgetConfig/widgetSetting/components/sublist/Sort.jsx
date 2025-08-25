import React, { useState } from 'react';
import _ from 'lodash';
import { Dialog } from 'ming-ui';
import SortConditions from 'src/pages/worksheet/common/ViewConfig/components/SortConditions';
import { UN_SORT_WIDGET } from '../../../config';
import { getAdvanceSetting } from '../../../util';
import { handleAdvancedSettingChange } from '../../../util/setting';

const defaultSort = [
  {
    controlId: 'ctime',
    isAsc: true,
  },
];

export default function SubListSort(props) {
  const {
    data,
    controls,
    fromRelate,
    onChange,
    onClose,
    advancedSettingKey = 'sorts',
    onlyShowSystemDateControl,
  } = props;
  const [sorts, setSorts] = useState(getAdvanceSetting(data, advancedSettingKey));
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
            [advancedSettingKey]: fromRelate && _.isEmpty(sorts) ? JSON.stringify(defaultSort) : JSON.stringify(sorts),
          }),
        );
        onClose();
      }}
    >
      <SortConditions
        className="subListSortCondition"
        columns={controls.filter(o => !_.includes(UN_SORT_WIDGET, o.type))}
        sortConditions={sorts}
        showSystemControls
        onChange={setSorts}
        isSubList={true}
        onlyShowSystemDateControl={onlyShowSystemDateControl}
      />
    </Dialog>
  );
}
