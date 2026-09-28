import React, { useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Modal } from 'ming-ui/antd-components';
import SortConditions from 'src/pages/worksheet/common/ViewConfig/components/SortConditions';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { UN_SORT_WIDGET } from 'src/utils/domain/control/config';

const ModalWrap = styled(Modal)`
  .subListSortCondition > div {
    margin-top: 0px !important;
  }
`;

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
    <ModalWrap
      open
      title={_l('排序')}
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
    </ModalWrap>
  );
}
