import React, { useState } from 'react';
import { Dialog } from 'ming-ui';
import { isEmpty } from 'lodash';
import SingleFilter from 'src/pages/worksheet/common/WorkSheetFilter/common/SingleFilter';
import 'src/pages/worksheet/common/WorkSheetFilter/WorkSheetFilter.less';
import { getAdvanceSetting } from '../../../util/setting';
import '../FilterData/filterDialog.less';
import { checkConditionCanSave } from 'src/pages/FormSet/components/columnRules/config';
import styled from 'styled-components';

const EmbedFilterWrap = styled.div`
  .addFilterCondition {
    display: inline-block;
    margin: 10px 0 0 0 !important;
    background-color: #fff !important;
    padding: 8px !important;
    &:hover {
      color: #1780d3;
      background: #f5f5f5 !important;
      border-radius: 3px;
    }
  }
  .addFilterCondition span {
    color: #2196f3;
    display: inline-block;
    font-weight: bold;
    padding: 0 !important;
    .icon {
      font-size: 13px !important;
    }
  }
  .conditionRelationBox {
    display: none !important;
  }
  .conditionItem {
    margin: 12px 0 0 0 !important;
  }
`;

export default function FilterDialog(props) {
  const {
    data,
    titleCom,
    onClose,
    onOk,
    controls,
    allControls, //动态字段值显示的Controls
    globalSheetInfo,
  } = props;

  const [filters, setFilters] = useState(getAdvanceSetting(data, 'filters'));

  const renderSearchCom = () => {
    return (
      <React.Fragment>
        <i className="icon icon-add"></i>
        {_l('筛选条件')}
      </React.Fragment>
    );
  };

  return (
    <Dialog
      visible
      title={_l('筛选数据源')}
      okDisabled={isEmpty(filters) || !checkConditionCanSave(filters)}
      okText={_l('确定')}
      cancelText={_l('取消')}
      className="filterDialog"
      onCancel={onClose}
      onOk={() => onOk(filters)}
    >
      <EmbedFilterWrap>
        <div>{titleCom}</div>
        <SingleFilter
          canEdit
          feOnly
          projectId={globalSheetInfo.projectId}
          appId={globalSheetInfo.appId}
          columns={controls}
          conditions={filters}
          from={'relateSheet'}
          currentColumns={allControls}
          onConditionsChange={conditions => {
            setFilters(conditions);
          }}
          comp={renderSearchCom}
        >
          {renderSearchCom}
        </SingleFilter>
      </EmbedFilterWrap>
    </Dialog>
  );
}
