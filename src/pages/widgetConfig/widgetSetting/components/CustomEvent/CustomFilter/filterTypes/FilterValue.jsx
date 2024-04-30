import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import { Dialog } from 'ming-ui';
import { redefineComplexControl } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import FilterConfig from 'src/pages/worksheet/common/WorkSheetFilter/common/FilterConfig';
import { checkConditionCanSave } from 'src/pages/FormSet/components/columnRules/config';

export default function FilterValue(props) {
  const { filterData = {}, handleOk, globalSheetInfo = {}, allControls } = props;
  const { projectId, appId } = globalSheetInfo;
  const filterControls = allControls.map(redefineComplexControl);

  const [{ filterItems, visible }, setState] = useSetState({
    filterItems: filterData.filterItems || [],
    visible: true,
  });

  useEffect(() => {
    setState({
      filterItems: filterData.filterItems || [],
    });
  }, []);

  const disabled = _.isEmpty(filterItems) || !checkConditionCanSave(filterItems);

  return (
    <Dialog
      width={560}
      visible={visible}
      okDisabled={disabled}
      className="SearchWorksheetDialog filterDialog"
      title={_l('配置字段值条件')}
      onCancel={() => setState({ visible: false })}
      onOk={() => {
        handleOk({ ...filterData, filterItems });
        setState({ visible: false });
      }}
    >
      <FilterConfig
        canEdit
        feOnly
        isRules={true}
        supportGroup={true}
        projectId={projectId}
        appId={appId}
        from={'rule'}
        columns={filterControls}
        currentColumns={filterControls}
        showCustom={true}
        conditions={filterItems}
        onConditionsChange={(conditions = []) => {
          const newConditions = conditions.some(item => item.groupFilters)
            ? conditions
            : [
                {
                  spliceType: 2,
                  isGroup: true,
                  groupFilters: conditions,
                },
              ];
          setState({ filterItems: newConditions });
        }}
      />
    </Dialog>
  );
}
