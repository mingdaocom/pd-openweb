import React, { Fragment, useState, useEffect } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { Icon, LoadDiv } from 'ming-ui';
import { Select, Divider } from 'antd';
import { enumWidgetType } from 'src/pages/customPage/util';
import sheetApi from 'src/api/worksheet';
import { getIconByType, filterOnlyShowField } from 'src/pages/widgetConfig/util';
import FilterSetting from './FilterSetting';
import FilterDefaultValue from './FilterDefaultValue';
import { FASTFILTER_CONDITION_TYPE, getSetDefault } from 'worksheet/common/ViewConfig/components/fastFilter/util';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';

export default function FilterControl(props) {
  const { filter, setFilter } = props;
  const [sheetList, setSheetList] = useState([]);
  const [initLoading, setInitLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  const { objectControls = [], dataType } = filter;
  const filterObjectControls = _.uniqBy(objectControls, 'worksheetId');

  useEffect(() => {
    const request = filterObjectControls.filter(item => {
      return !_.find(sheetList, { worksheetId: item.worksheetId })
    }).map(item => {
      return sheetApi.getWorksheetInfo({
        worksheetId: item.worksheetId,
        getTemplate: true
      });
    });
    if (request.length) {
      setLoading(true);
      Promise.all(request).then(data => {
        setInitLoading(false);
        setLoading(false);
        setSheetList(sheetList.concat(data));
      });
    }
  }, [objectControls]);

  const firstSheet = _.find(sheetList, { worksheetId: _.get(filterObjectControls[0], 'worksheetId') });
  const firstControlData = _.find(_.get(firstSheet, 'template.controls'), { controlId: _.get(filterObjectControls[0], 'controlId') }) || {};

  const renderSelect = (item, index) => {
    const lastControl = filterObjectControls[index - 1] || {};
    const sheet = _.find(sheetList, { worksheetId: item.worksheetId });
    const templateControls = _.get(sheet, 'template.controls') || [];
    const currentControl = _.find(templateControls, { controlId: item.controlId });
    const firstSheet = _.find(sheetList, { worksheetId: _.get(lastControl, 'worksheetId') });
    const firstControlData = _.find(_.get(firstSheet, 'template.controls'), { controlId: _.get(lastControl, 'controlId') }) || {};
    const isOptionControl = [WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU, WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT, WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN].includes(firstControlData.type);
    const isRelateControl = [WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET].includes(firstControlData.type);
    const notFoundContent = () => {
      if (isOptionControl) {
        return (
          <div className="valignWrapper">{_l('暂无数据，选项需要用同一个选项集的字段')}</div>
        );
      }
      if (isRelateControl) {
        return (
          <div className="valignWrapper">{_l('暂无数据，关联记录需要使用同关联表的字段')}</div>
        );
      }
      return (
        <div className="valignWrapper">{_l('暂无数据')}</div>
      );
    }
    return (
      <div key={item.worksheetId} className={index === filterObjectControls.length - 1 ? 'mBottom16' : 'mBottom20'}>
        <div className="mBottom12 flexRow">
          {loading ? (
            <LoadDiv className="mLeft0" size="small" />
          ) : (
            sheet ? (
              <span className="Gray bold">{_l('工作表：%0', _.get(sheet, 'name'))}</span>
            ) : (
              <span className="Red">{_l('工作表已删除')}</span>
            )
          )}
        </div>
        <Select
          className={cx('customPageSelect w100', { Red: item.controlId && !currentControl })}
          value={item.controlId ? (currentControl ? item.controlId : _l('字段已删除')) : undefined}
          disabled={index && (lastControl.controlId ? false : true)}
          suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
          placeholder={_l('请选择筛选字段')}
          notFoundContent={notFoundContent()}
          getPopupContainer={() => document.querySelector('.customPageFilterWrap .setting')}
          onChange={value => {
            const { objectControls = [] } = filter;
            const newControls = objectControls.map(f => {
              const data = { ...f }
              if (f.worksheetId === item.worksheetId) {
                data.controlId =  value;
              } else if (!index) {
                data.controlId = '';
              }
              return data;
            });
            const param = { objectControls: newControls };
            if (!index) {
              const control = _.find(_.get(sheetList[0], 'template.controls'), { controlId: value }) || {};
              const { type } = control;
              const { controlId, ...data } = getSetDefault(control);
              param.control = control;
              param.values = [];
              param.value = '';
              param.minValue = '';
              param.maxValue = '';
              Object.assign(param, data);
            }
            setFilter(param);
          }}
        >
          {filterOnlyShowField(templateControls)
          .filter(c => FASTFILTER_CONDITION_TYPE.includes(c.type) || (c.type === WIDGETS_TO_API_TYPE_ENUM.SHEET_FIELD && FASTFILTER_CONDITION_TYPE.includes((c.sourceControl || {}).type)))
          .filter(c => index ? c.type === firstControlData.type : true)
          .filter(c => {
            if (isOptionControl || isRelateControl) {
              if (c.dataSource && firstControlData.dataSource) {
                return c.dataSource === firstControlData.dataSource;
              } else {
                return false;
              }
            } else {
              return true;
            }
          })
          .map(c => (
            <Select.Option
              className="selectOptionWrapper"
              key={c.controlId}
              value={c.controlId}
            >
              <div className="valignWrapper h100">
                <Icon className="Gray_9e Font16" icon={getIconByType(c.type)} />
                <span className="mLeft5 Font13 ellipsis">{c.controlName}</span>
              </div>
            </Select.Option>
          ))}
        </Select>
      </div>
    );
  }

  if (initLoading) {
    return (
      <LoadDiv />
    );
  }

  return (
    <Fragment>
      <div className="valignWrapper mBottom8">
        <div className="flex Font13 bold">{_l('筛选字段')}</div>
      </div>
      <div className="Gray_75 Font13 mBottom14 Font13">
        {filterObjectControls.length <= 1 ? _l('选择筛选对象的数据源表中的字段进行筛选') : _l('选择了来源于多个工作表数据的组件，请选择同类型字段以进行合并筛选')}
      </div>
      <div>
        {filterObjectControls.map((item, index) => (
          renderSelect(item, index)
        ))}
      </div>
      <Divider className="mTop0 mBottom15" />
      {!!dataType && (
        <Fragment>
          <FilterSetting
            dataType={dataType}
            filter={filter}
            setFilter={setFilter}
          />
          <FilterDefaultValue
            firstControlData={_.cloneDeep(firstControlData)}
            dataType={dataType}
            filter={filter}
            setFilter={setFilter}
          />
        </Fragment>
      )}
    </Fragment>
  );
}
