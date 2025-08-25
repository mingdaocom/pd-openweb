import React, { Fragment, useEffect, useState } from 'react';
import { Checkbox } from 'antd';
import { Dialog } from 'ming-ui';
import worksheetApi from 'src/api/worksheet';
import { filterData } from 'src/pages/FormSet/components/columnRules/config';
import { FilterItemTexts } from 'src/pages/widgetConfig/widgetSetting/components/FilterData';
import FilterConfig from 'src/pages/worksheet/common/WorkSheetFilter/common/FilterConfig';

export default function FilterData(props) {
  const { projectId, appId, filterId, controls, config, onChangeConfig } = props;
  const { isFilter, filterConditions = [] } = config;
  const [visible, setVisible] = useState(false);
  const [filter, setFilter] = useState([]);
  const filterItemTexts = filterData(controls, filterConditions);

  const handleChangeConfig = data => {
    onChangeConfig({
      ...config,
      ...data,
    });
  };

  useEffect(() => {
    if (filterId && !filterConditions.length) {
      worksheetApi
        .getWorksheetFilterById({
          filterId,
        })
        .then(data => {
          const { items = [] } = data;
          setFilter(items);
          handleChangeConfig({
            filterConditions: items,
          });
        });
    }
  }, [filterId]);

  return (
    <Fragment>
      <Checkbox
        checked={isFilter}
        onChange={e => {
          if (filterConditions.length > 0) {
            handleChangeConfig({
              isFilter: e.target.checked,
            });
          } else if (e.target.checked) {
            setVisible(true);
          }
        }}
      >
        {_l('筛选')}
      </Checkbox>
      <Dialog
        visible={visible}
        title={_l('筛选')}
        okText={_l('确定')}
        cancelText={_l('取消')}
        onCancel={() => {
          setVisible(false);
        }}
        onOk={() => {
          if (filter.length) {
            handleChangeConfig({
              filterConditions: filter,
              isFilter: true,
            });
            setVisible(false);
          } else {
            if (filter.length) {
              setVisible(false);
            } else {
              alert(_l('请选择筛选条件'), 3);
            }
          }
        }}
      >
        <FilterConfig
          canEdit
          feOnly
          supportGroup
          filterColumnClassName="showBtnFilter"
          projectId={projectId}
          appId={appId}
          columns={controls}
          conditions={filterConditions}
          filterResigned={false}
          onConditionsChange={conditions => {
            setFilter(conditions);
          }}
        />
      </Dialog>
      {isFilter && (
        <FilterItemTexts filterItemTexts={filterItemTexts} loading={false} editFn={() => setVisible(true)} />
      )}
    </Fragment>
  );
}
