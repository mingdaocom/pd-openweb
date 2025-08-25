import React from 'react';
import functionWrap from 'ming-ui/components/FunctionWrap';
import { FILTER_VALUE_ENUM } from '../config';
import IntegratedApi from '../CustomAction/actionTypes/IntegratedApi';
import FilterValue from './filterTypes/FilterValue';
import FunctionEditor from './filterTypes/FunctionEditor';
import SearchWorksheet from './filterTypes/SearchWorksheet';

const CustomFilterConfig = props => {
  const { filterData = {} } = props;

  switch (filterData.valueType) {
    // 字段值
    case FILTER_VALUE_ENUM.CONTROL_VALUE:
      return <FilterValue {...props} />;
    // 查询工作表
    case FILTER_VALUE_ENUM.SEARCH_WORKSHEET:
      return <SearchWorksheet {...props} />;
    // 集成api
    case FILTER_VALUE_ENUM.API:
      return <IntegratedApi {...props} actionData={filterData} clickType="filters" fromCustomFilter={true} />;
    // 自定义函数
    case FILTER_VALUE_ENUM.CUSTOM_FUN:
      return <FunctionEditor {...props} />;
  }
};

export default props => functionWrap(CustomFilterConfig, { ...props });
