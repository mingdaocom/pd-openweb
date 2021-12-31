import React, { useState, useEffect } from 'react';
import { useSetState } from 'react-use';
import { LoadDiv } from 'ming-ui';
import { Dropdown } from 'antd';
import cx from 'classnames';
import { filterControlsFromAll, getDefaultSizeByType, getIconByType, resortControlByColRow } from '../../util';
import { useSheetInfo } from '../../hooks';
import { parseDataSource, isSingleRelateSheet } from '../../util/setting';
import { CAN_NOT_AS_OTHER_FIELD } from '../../config';
import { SettingItem, DropdownPlaceholder, DropdownOverlay } from '../../styled';
import { SYSTEM_CONTROLS } from 'src/pages/worksheet/constants/enum';
import { isEmpty } from 'lodash';

export default function SheetField(props) {
  const {
    data,
    allControls,
    onChange,
    status: { saveIndex },
  } = props;
  const { controlId, dataSource } = data;

  const parsedDataSource = parseDataSource(dataSource);
  const [searchValue, setSearchValue] = useState('');
  const [{ sheetName, controlName, sheetDel, controlDel, dataSourceDisabled, sheetFieldDisabled }, setInfo] =
    useSetState({
      sheetName: '',
      controlName: '',
      sheetDel: false,
      controlDel: false,
      dataSourceDisabled: false,
      sheetFieldDisabled: false,
    });

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

  const updateDisabledInfo = () => {
    const sheetObj = _.find(sheetList, item => item.value === parsedDataSource);
    const relationControls = _.get(
      allControls.find(item => _.get(item, 'controlId') === parsedDataSource),
      'relationControls',
    );
    const controlObj = _.find(
      (relationControls || []).concat(SYSTEM_CONTROLS),
      i => i.controlId === data.sourceControlId,
    );
    const sheetDel = parsedDataSource && !sheetObj;
    const controlDel = data.sourceControlId && !controlObj;
    const oneDelete = sheetDel || controlDel;
    const tempSaved = isSaved && parsedDataSource && data.sourceControlId;
    setInfo({
      sheetDel,
      controlDel,
      dataSourceDisabled: tempSaved ? !oneDelete : false,
      sheetFieldDisabled: tempSaved ? !oneDelete : !parsedDataSource,
    });
  };

  useEffect(updateDisabledInfo, [controlId]);
  useEffect(() => {
    // 关联记录被删除
    if (_.isUndefined(worksheetId) && parsedDataSource && isSaved) {
      updateDisabledInfo();
    }
    if (saveIndex) {
      setTimeout(updateDisabledInfo, 50);
    }
  }, [worksheetId, saveIndex]);

  useEffect(() => {
    const name = _.find(sheetList, item => item.value === parsedDataSource);
    setInfo({ sheetName: (name || {}).text });
  }, [controlId, allControls]);

  useEffect(() => {
    const name = _.find(fields, item => item.controlId === data.sourceControlId);
    setInfo({ controlName: (name || {}).controlName });
  }, [controlId, data.sourceControlId, controls, allControls]);

  return (
    <div className="settingItemWrap">
      <SettingItem>
        <div className="settingItemTitle">{_l('关联记录')}</div>
        {loading ? (
          <LoadDiv />
        ) : (
          <Dropdown
            trigger={['click']}
            disabled={dataSourceDisabled}
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
                        onClick={() => {
                          if (parsedDataSource === value) return;
                          onChange({ dataSource: `$${value}$`, sourceControlId: '', sourceControl: '' });
                          setInfo({
                            sheetDel: false,
                            sheetFieldDisabled: !isSaved ? false : sheetFieldDisabled,
                          });
                        }}
                      >
                        <span>{text}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </DropdownOverlay>
            }
          >
            <DropdownPlaceholder
              className={cx({
                invalid: parsedDataSource && !worksheetId,
                disabled: dataSourceDisabled,
                deleted: sheetDel,
              })}
            >
              {parsedDataSource ? (
                <span>{sheetDel ? _l('关联记录已删除') : sheetName}</span>
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
          disabled={sheetFieldDisabled}
          overlay={
            <DropdownOverlay>
              <div className="searchWrap" onClick={e => e.stopPropagation()}>
                <i className="icon-search Gray_9e" />
                <input
                  autoFocus
                  value={searchValue}
                  onChange={e => setSearchValue(e.target.value)}
                  placeholder={_l('搜索字段')}
                ></input>
              </div>
              {isEmpty(filteredFields) ? (
                <div className="emptyText">{_l('搜索结果为空')}</div>
              ) : (
                <ul className="dropdownContent">
                  {filteredFields.map(item => (
                    <li
                      className="item overflow_ellipsis"
                      key={item.controlId}
                      onClick={() => {
                        onChange({
                          sourceControlId: item.controlId,
                          sourceControl: item,
                          controlName: item.controlName,
                          size: getDefaultSizeByType(item.type),
                        });
                        setInfo({ controlDel: false });
                      }}
                    >
                      <i className={`Font16 icon-${getIconByType(item.type)}`}></i>
                      {item.controlName}
                    </li>
                  ))}
                </ul>
              )}
            </DropdownOverlay>
          }
        >
          <DropdownPlaceholder
            className={cx({
              deleted: data.sourceControlId && controlDel,
              disabled: sheetFieldDisabled,
              invalid: !loading && data.sourceControlId && !worksheetId,
            })}
          >
            {data.sourceControlId ? (
              <span>{controlDel ? _l('字段已删除') : controlName}</span>
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
