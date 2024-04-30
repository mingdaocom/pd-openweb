import React from 'react';
import { useSetState } from 'react-use';
import SearchWorksheetDialog from '../../../SearchWorksheet/SearchWorksheetDialog';

export default function SearchWorksheet(props) {
  const { filterData = {}, data, handleOk } = props;
  const { valueType, advancedSetting = {} } = filterData;

  const [{ visible }, setState] = useSetState({
    visible: true,
  });

  if (!visible) return null;

  return (
    <SearchWorksheetDialog
      {...props}
      data={{ ...data, advancedSetting }}
      customTitle={_l('配置查询工作表条件')}
      fromCustom={true}
      onChange={newData => {
        handleOk({
          valueType,
          advancedSetting: _.pick(newData.advancedSetting, ['dynamicsrc', 'defaulttype']),
        });
      }}
      onClose={() => setState({ visible: false })}
    />
  );
}
