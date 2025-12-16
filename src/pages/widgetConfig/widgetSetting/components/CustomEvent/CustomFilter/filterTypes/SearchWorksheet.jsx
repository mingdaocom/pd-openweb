import React from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import { DYNAMIC_FROM_MODE } from '../../../DynamicDefaultValue/config';
import SearchWorksheetDialog from '../../../SearchWorksheet/SearchWorksheetDialog';

export default function SearchWorksheet(props) {
  const { filterData = {}, data, customQueryConfig = [], handleOk } = props;
  const { valueType, advancedSetting = {}, spliceType } = filterData;

  const dynamicData = safeParse(advancedSetting.dynamicsrc || '{}');
  const queryConfig = _.find(customQueryConfig, q => q.id === _.get(dynamicData, 'id')) || {};

  const [{ visible }, setState] = useSetState({
    visible: true,
  });

  if (!visible) return null;

  return (
    <SearchWorksheetDialog
      {...props}
      data={{ ...data, advancedSetting }}
      dynamicData={dynamicData}
      queryConfig={queryConfig}
      customTitle={_l('配置查询工作表条件')}
      from={DYNAMIC_FROM_MODE.CUSTOM_EVENT}
      onChange={newData => {
        handleOk({
          valueType,
          spliceType,
          advancedSetting: _.pick(newData.advancedSetting, ['dynamicsrc', 'defaulttype']),
        });
      }}
      onClose={() => setState({ visible: false })}
    />
  );
}
