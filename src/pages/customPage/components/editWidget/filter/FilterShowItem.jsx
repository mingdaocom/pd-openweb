import React, { Fragment, useEffect, useState } from 'react';
import { Select } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import sheetApi from 'src/api/worksheet';
import { getTitleTextFromRelateControl } from 'src/components/newCustomFields/tools/utils';
import { EditInfo } from 'src/pages/widgetConfig/styled';
import { handleCondition } from 'src/pages/widgetConfig/util/data';
import { FilterDialog, FilterItemTexts } from 'src/pages/widgetConfig/widgetSetting/components/FilterData';
import SortCustom from 'src/pages/worksheet/common/ViewConfig/components/NavSort/customSet';

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
};

function FilterShowItem(props) {
  const { sheet, allControls, control, advancedSetting, onChangeAdvancedSetting } = props;
  const { navshow = '1', navfilters } = advancedSetting;
  const [filterVisible, setFilterVisible] = useState(false);
  const [showCustomVisible, setShowCustomVisible] = useState(false);
  const [relateControls, setRelateControls] = useState([]);
  const showNavfilters = advancedSetting.showNavfilters
    ? JSON.parse(advancedSetting.showNavfilters)
    : navfilters
      ? JSON.parse(navfilters)
      : [];
  const globalSheetControls = allControls.filter(data => data && data.controlId !== control.controlId);

  useEffect(() => {
    if (control.type === 29 && control.dataSource) {
      sheetApi
        .getWorksheetInfo({
          worksheetId: control.dataSource,
          getTemplate: true,
          relationWorksheetId: sheet.worksheetId,
        })
        .then(data => {
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
            showNavfilters: JSON.stringify([]),
          });
          if (value === '3') {
            setFilterVisible(true);
          }
        }}
      >
        {filterShowItem(control).map(data => (
          <Select.Option className="selectOptionWrapper" key={data.value} value={data.value}>
            <div className="valignWrapper h100 w100">
              <span className="mLeft5 Font13 ellipsis">{data.text}</span>
            </div>
          </Select.Option>
        ))}
      </Select>
      {navshow === '2' && (
        <div className="WhiteBG">
          <EditInfo className="pointer flexRow" onClick={() => setShowCustomVisible(true)}>
            <div className={cx('overflow_ellipsis flex', showNavfilters.length <= 0 ? 'Gray_75' : 'Gray')}>
              {showNavfilters.length <= 0 ? _l('设置指定项') : _l('选中%0个', showNavfilters.length)}
            </div>
            <div className="edit">
              <i className="icon-edit"></i>
            </div>
          </EditInfo>
          {showCustomVisible && (
            <SortCustom
              canShowNull
              fromCondition="fastFilter"
              maxCount={50}
              view={{
                advancedSetting: {
                  ...advancedSetting,
                  navfilters: showNavfilters,
                },
              }}
              advancedSetting={{
                ...advancedSetting,
                navfilters: showNavfilters,
              }}
              projectId={sheet.projectId}
              appId={sheet.appId}
              controlInfo={control}
              title={_l('设置显示项')}
              addTxt={_l('显示项')}
              advancedSettingKey="navfilters"
              onChange={infos => {
                let values = [];
                let showNavfilters = [];
                const type = control.type === 30 ? control.sourceControlType : control.type;
                switch (type) {
                  case 29:
                  case 26:
                  case 27:
                  case 48:
                    const key =
                      29 === type ? 'rowid' : 26 === type ? 'accountId' : 27 === type ? 'departmentId' : 'organizeId';
                    values = infos.map(o => o[key]);
                    break;
                  default:
                    values = infos;
                    break;
                }
                if (type === 29) {
                  showNavfilters = infos.map(data => {
                    const name = getTitleTextFromRelateControl(control, data);
                    return JSON.stringify({
                      id: data.rowid,
                      name: name,
                    });
                  });
                } else if (type === 26) {
                  showNavfilters = infos.map(data => {
                    return JSON.stringify({
                      id: data.accountId,
                      name: data.fullname,
                      avatar: data.avatar,
                    });
                  });
                } else {
                  showNavfilters = infos.map(item => (_.isObject(item) ? JSON.stringify(item) : item));
                }
                onChangeAdvancedSetting({
                  navfilters: JSON.stringify(values),
                  showNavfilters: JSON.stringify(showNavfilters),
                });
              }}
              onClose={() => setShowCustomVisible(false)}
            />
          )}
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
                  showNavfilters: JSON.stringify(filters),
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
