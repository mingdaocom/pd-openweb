import React, { Fragment, useState, useEffect } from 'react';
import { useSetState } from 'react-use';
import { LoadDiv } from 'ming-ui';
import { Dropdown } from 'antd';
import cx from 'classnames';
import { filterControlsFromAll, getDefaultSizeByType, getIconByType, resortControlByColRow } from '../../util';
import { useSheetInfo } from '../../hooks';
import { parseDataSource, isSingleRelateSheet } from '../../util/setting';
import { CAN_NOT_AS_OTHER_FIELD } from '../../config';
import { SettingItem, DropdownPlaceholder, DropdownOverlay } from '../../styled';
import { isEmpty } from 'lodash';

export default function SheetField(props) {
  const { data, allControls, onChange } = props;
  const { controlId, dataSource } = data;

  const parsedDataSource = parseDataSource(dataSource);
  const [searchValue, setSearchValue] = useState('');
  const [{ sheetName, controlName }, setName] = useSetState({ sheetName: '', controlName: '' });

  const isSaved = controlId && !controlId.includes('-');
  // 取关联单条
  const sheetList = filterControlsFromAll(allControls, item => isSingleRelateSheet(item) || item.type === 35);

  const getFieldsByControls = (controls = []) => {
    return resortControlByColRow(controls).filter(
      ({ type, enumDefault }) => !_.includes(CAN_NOT_AS_OTHER_FIELD, type) && !(type === 29 && enumDefault !== 1),
    );
  };

  const worksheetId = _.get(
    allControls.find(item => _.get(item, 'controlId') === parsedDataSource),
    'dataSource',
  );

  const {
    loading,
    data: { info, controls },
  } = useSheetInfo({ worksheetId });

  const fields = getFieldsByControls(controls);
  const filteredFields = searchValue ? _.filter(fields, item => _.includes(item.controlName, searchValue)) : fields;

  useEffect(() => {
    const name = _.get(
      _.find(sheetList, item => item.value === parsedDataSource),
      'text',
    );
    setName({ sheetName: name });
  }, [parsedDataSource]);

  useEffect(() => {
    if (!data.sourceControlId) return;
    const name =
      _.get(
        _.find(fields, item => item.controlId === data.sourceControlId),
        'controlName',
      ) || _l('字段已删除');
    setName({ controlName: name });
  }, [data.sourceControlId, controls]);

  const dataSourceDisabled = isSaved && parsedDataSource;
  const sheetFieldDisabled = !dataSource || (isSaved && data.sourceControlId);
  return (
    <div className="settingItemWrap">
      <SettingItem>
        <div className="settingItemTitle">{_l('关联记录')}</div>
        {loading ? (
          <LoadDiv />
        ) : (
          <Dropdown
            trigger={['click']}
            disabled={parsedDataSource && isSaved}
            overlay={
              <DropdownOverlay>
                {_.isEmpty(sheetList) ? (
                  <div className="emptyText">{_l('请先添加一个 ”关联记录“ 字段')}</div>
                ) : (
                  <ul className="dropdownContent">
                    {sheetList.map(({ value, text }) => (
                      <li
                        key={value}
                        className="item"
                        onClick={() => onChange({ dataSource: `$${value}$`, sourceControlId: '', sourceControl: '' })}>
                        <span>{text}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </DropdownOverlay>
            }>
            <DropdownPlaceholder
              className={cx({ invalid: parsedDataSource && !worksheetId && !loading, disabled: dataSourceDisabled })}>
              {parsedDataSource ? (
                <span>{sheetName || _l('关联记录已删除')}</span>
              ) : (
                <span className="Gray_9e">{_l('选择配置的 “关联记录” 字段')}</span>
              )}
              {!dataSourceDisabled && <i className="icon-arrow-down-border Font14 Gray_9e"></i>}
            </DropdownPlaceholder>
          </Dropdown>
        )}
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle">{_l('显示字段')}</div>
        <Dropdown
          trigger={['click']}
          disabled={parsedDataSource && isSaved}
          overlay={
            <DropdownOverlay>
              <div className="searchWrap" onClick={e => e.stopPropagation()}>
                <i className="icon-search Gray_9e" />
                <input
                  autoFocus
                  value={searchValue}
                  onChange={e => setSearchValue(e.target.value)}
                  placeholder={_l('搜索字段')}></input>
              </div>
              {isEmpty(filteredFields) ? (
                <div className="emptyText">{_l('搜索结果为空')}</div>
              ) : (
                <ul className="dropdownContent">
                  {filteredFields.map(item => (
                    <li
                      className="item overflow_ellipsis"
                      key={item.controlId}
                      onClick={() =>
                        onChange({
                          sourceControlId: item.controlId,
                          sourceControl: item,
                          controlName: item.controlName,
                          size: getDefaultSizeByType(item.type),
                        })
                      }>
                      <i className={`Font16 icon-${getIconByType(item.type)}`}></i>
                      {item.controlName}
                    </li>
                  ))}
                </ul>
              )}
            </DropdownOverlay>
          }>
          <DropdownPlaceholder
            className={cx({
              disabled: sheetFieldDisabled,
              invalid: !loading && data.sourceControlId && !worksheetId,
            })}>
            {!loading && data.sourceControlId && worksheetId ? (
              <span>{controlName}</span>
            ) : (
              <span className="Gray_9e">{_l('请选择')}</span>
            )}
            {!sheetFieldDisabled && <i className="icon-arrow-down-border Font14 Gray_9e"></i>}
          </DropdownPlaceholder>
        </Dropdown>
      </SettingItem>
    </div>
  );
}
