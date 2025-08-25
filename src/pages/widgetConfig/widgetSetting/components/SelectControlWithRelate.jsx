import React, { useRef, useState } from 'react';
import { useClickAway } from 'react-use';
import _ from 'lodash';
import { SelectFieldsWrap } from '../../styled';
import { getIconByType } from '../../util';
import { isSingleRelateSheet } from '../../util/setting';

export default function SelectControlWithRelate({
  from = '',
  // 数据筛选函数
  filter = item => item,
  allControls,
  globalSheetControls,
  globalSheetInfo,
  className,
  searchable = true,
  onClick,
  onClickAway,
}) {
  const ref = useRef(null);
  useClickAway(ref, onClickAway);
  const [searchValue, setSearchValue] = useState('');
  const { worksheetId: globalSheetId } = globalSheetInfo;

  const getAvailableControlCount = list => {
    return _.keys(list).reduce((p, c) => p + (list[c] || []).length, 0);
  };

  const getSheetList = () => {
    return _.filter(allControls, item => {
      if (item.type === 35) return true;
      if (isSingleRelateSheet(item) && item.dataSource !== globalSheetId) return true;
      return false;
    });
  };

  const getDataList = () => {
    const initSheetList =
      from === 'subList'
        ? [
            { id: globalSheetId, name: _l('主记录'), type: 29 },
            { id: 'current', name: _l('当前子表记录') },
          ]
        : [{ id: 'current', name: _l('当前记录') }];
    // 获取当前记录和关联表控件
    const sheetList = initSheetList.concat(
      getSheetList().map(item => ({
        id: item.controlId,
        type: item.type,
        name: item.controlName,
      })),
    );
    // 获取当前表的控件
    const fieldList = {
      current: filter(allControls),
      [globalSheetId]: filter(globalSheetControls),
    };
    // 获取关联表控件下的所有符合条件的字段
    sheetList.slice(initSheetList.length).forEach(({ id }) => {
      const relateSheetControl = _.find(allControls, ({ controlId }) => controlId === id);
      const filteredRelationControls = filter(_.get(relateSheetControl, 'relationControls'));
      fieldList[id] = filteredRelationControls;
    });
    if (!searchValue) return { sheetList, filteredFieldList: fieldList };
    const filteredFieldList = {};
    _.keys(fieldList).forEach(key => {
      const item = fieldList[key];
      filteredFieldList[key] = item.filter(field => _.includes(field.controlName, searchValue));
    });
    return { sheetList, filteredFieldList };
  };

  const { sheetList, filteredFieldList } = getDataList();
  return (
    <SelectFieldsWrap ref={ref} className={className}>
      {searchable && (
        <div className="search">
          <i className="icon-search Gray_9e" />
          <input
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            placeholder={_l('搜索字段')}
          ></input>
        </div>
      )}
      <div className="fieldsWrap">
        {sheetList.map(({ id: recordId, name, type: relationControlType }) => {
          const fieldList = filteredFieldList[recordId];
          let relationName = name;
          if (relationControlType) {
            relationName = relationControlType.type === 35 ? _l('级联选择 “%0”', name) : _l('关联记录 “%0”', name);
          }
          return fieldList.length > 0 ? (
            <ul className="relateSheetList">
              <li>
                <div className="title overflow_ellipsis">
                  <span>{relationName}</span>
                </div>
                <ul className="fieldList">
                  {fieldList.map(({ type, controlName, controlId }) => {
                    const obj =
                      recordId === 'current'
                        ? {
                            controlName,
                            controlType: type,
                            fieldId: controlId,
                            relationControlName: '',
                            relateSheetControlId: '',
                          }
                        : {
                            controlName,
                            controlType: type,
                            relateSheetControlId: recordId,
                            relationControlName: name,
                            fieldId: controlId,
                          };
                    return (
                      <li key={controlId} onClick={() => onClick(obj)}>
                        <i className={`icon-${getIconByType(type)}`}></i>
                        <span className="overflow_ellipsis flex">{controlName}</span>
                      </li>
                    );
                  })}
                </ul>
              </li>
            </ul>
          ) : null;
        })}
        {searchValue && getAvailableControlCount(filteredFieldList) < 1 && (
          <div className="emptyText">{_l('暂无搜索结果')}</div>
        )}
      </div>
    </SelectFieldsWrap>
  );
}
