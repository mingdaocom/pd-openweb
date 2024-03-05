import React, { Fragment, useState, useEffect } from 'react';
import { Icon } from 'ming-ui';
import { Select } from 'antd';
import sheetApi from 'src/api/worksheet';
import Input from 'src/pages/worksheet/common/Sheet/QuickFilter/Inputs';
import { FilterItemTexts, FilterDialog } from 'src/pages/widgetConfig/widgetSetting/components/FilterData';
import { formatFilterValues } from 'src/pages/worksheet/common/Sheet/QuickFilter/utils';
import { getTitleTextFromRelateControl } from 'src/components/newCustomFields/tools/utils';
import { handleCondition } from 'src/pages/widgetConfig/util/data';

const SHOW_ITEMS = [
  { text: _l('全部'), value: '1' },
  { text: _l('显示指定项'), value: '2' },
  { text: _l('显示满足筛选条件的项'), value: '3' },
];

const filterShowItem = control => {
  return SHOW_ITEMS.filter(o => {
    const type = control.type === 30 ? control.sourceControlType : control.type;
    if ([9, 10, 11, 26].includes(type)) {
      return o.value !== '3';
    } else {
      return true;
    }
  });
}


function FilterShowItem(props) {
  const { filterId, dataType, sheet, allControls, control, advancedSetting, onChangeAdvancedSetting } = props;
  const { navshow = '1', navfilters } = advancedSetting;
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState([]);
  const [relateControls, setRelateControls] = useState([]);
  const showNavfilters = advancedSetting.showNavfilters ? JSON.parse(advancedSetting.showNavfilters) : (navfilters ? JSON.parse(navfilters) : []);
  const globalSheetControls = allControls.filter(data => data && data.controlId !== control.controlId);

  useEffect(() => {
    if (control.type === 29 && control.dataSource) {
      sheetApi.getWorksheetInfo({
        worksheetId: control.dataSource,
        getTemplate: true
      }).then(data => {
        setRelateControls(_.get(data, ['template', 'controls']));
      });
    }
  }, [control.controlId]);
  

  return (
    <div className="mBottom15">
      <div className="valignWrapper mBottom8">
        <div className="flex Font13 bold">{_l('显示项')}</div>
      </div>
      <Select
        className="customPageSelect mBottom8 w100"
        value={navshow}
        suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
        placeholder={_l('请选择筛选字段')}
        getPopupContainer={() => document.querySelector('.customPageFilterWrap .setting')}
        onSelect={value => {
          onChangeAdvancedSetting({
            navshow: value,
            navfilters: JSON.stringify([]),
            showNavfilters: JSON.stringify([])
          });
          if (value === '3') {
            setFilterVisible(true);
          }
        }}
      >
        {filterShowItem(control).map(data => (
          <Select.Option
            className="selectOptionWrapper"
            key={data.value}
            value={data.value}
          >
            <div className="valignWrapper h100 w100">
              <span className="mLeft5 Font13 ellipsis">{data.text}</span>
            </div>
          </Select.Option>
        ))}
      </Select>
      {navshow === '2' && (
        <div className="WhiteBG">
          <Input
            {...sheet}
            controlId={control.controlId}
            active={false}
            from={control.type === 26 && _.get(control, 'advancedSetting.usertype') === '2' ? '' : 'NavShow'}
            control={{
              ...control,
              advancedSetting: _.includes([9, 10, 11])
                ? { ...control.advancedSetting, allowadd: '0' }
                : control.advancedSetting,
            }}
            advancedSetting={{ direction: '2', allowitem: '2' }}
            values={formatFilterValues(dataType, showNavfilters)}
            onChange={info => {
              if (control.type === 29) {
                const navfilters = JSON.stringify(info.values.map(o => o.rowid));
                const res = info.values.map(data => {
                  const name = getTitleTextFromRelateControl(control, data);
                  return JSON.stringify({
                    id: data.rowid,
                    name: name
                  })
                });
                onChangeAdvancedSetting({
                  navfilters,
                  showNavfilters: JSON.stringify(res),
                });
              } else if (control.type === 26) {
                const navfilters = JSON.stringify(info.values.map(o => o.accountId));
                const res = info.values.map(data => {
                  return JSON.stringify({
                    id: data.accountId,
                    name: data.fullname,
                    avatar: data.avatar
                  })
                });
                onChangeAdvancedSetting({
                  navfilters,
                  showNavfilters: JSON.stringify(res)
                });
              } else {
                const navfilters = JSON.stringify(info.values);
                onChangeAdvancedSetting({
                  navfilters,
                  showNavfilters: navfilters
                });
              }
            }}
          />
        </div>
      )}
      {navshow === '3' && (
        <Fragment>
          {filterVisible && (
            <FilterDialog
              data={control}
              overlayClosable={false}
              relationControls={relateControls}
              title={'筛选'}
              filters={showNavfilters}
              allControls={_.get(sheet, 'template.controls') || []}
              globalSheetInfo={sheet}
              globalSheetControls={globalSheetControls}
              onChange={({ filters }) => {
                onChangeAdvancedSetting({
                  navfilters: JSON.stringify(filters.map(handleCondition)),
                  showNavfilters: JSON.stringify(filters)
                });
                setFilterVisible(false);
              }}
              fromCondition="fastFilter"
              onClose={() => {
                setFilterVisible(false);
              }}
            />
          )}
          {showNavfilters.length > 0 && (
            <FilterItemTexts
              className="WhiteBG"
              fromCondition="fastFilter"
              data={control}
              filters={showNavfilters}
              controls={relateControls}
              allControls={_.get(sheet, 'template.controls') || []}
              globalSheetControls={globalSheetControls}
              loading={false}
              editFn={() => setFilterVisible(true)}
            />
          )}
        </Fragment>
      )}
    </div>
  );
}

export default FilterShowItem;
