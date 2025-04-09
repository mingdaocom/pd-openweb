import React, { useState, useEffect, createRef } from 'react';
import { useSetState } from 'react-use';
import { LoadDiv, RadioGroup, Dialog, Tooltip } from 'ming-ui';
import { Dropdown } from 'antd';
import cx from 'classnames';
import {
  filterControlsFromAll,
  getIconByType,
  resortControlByColRow,
  filterOnlyShowField,
  parseDataSource,
} from '../../util';
import { useSheetInfo } from '../../hooks';
import { isSingleRelateSheet, updateConfig } from '../../util/setting';
import { CAN_NOT_AS_OTHER_FIELD } from '../../config';
import { SettingItem, DropdownPlaceholder, DropdownOverlay } from '../../styled';
import { SYSTEM_CONTROLS } from 'src/pages/worksheet/constants/enum';
import { isEmpty, get, find } from 'lodash';
import { SYS_CONTROLS } from '../../config/widget';
import WorksheetReference from '../components/WorksheetReference';

const SHEET_FIELD_TYPES = [
  {
    value: '1',
    text: _l('仅显示'),
  },
  {
    value: '0',
    text: _l('存储数据'),
  },
];

export default function SheetField(props) {
  const {
    data,
    allControls,
    onChange,
    globalSheetInfo = {},
    status: { saveIndex },
  } = props;
  const { controlId, dataSource, strDefault = '10' } = data;

  const showType = strDefault.split('')[0] || '0';

  const $ref = createRef(null);

  const parsedDataSource = parseDataSource(dataSource);
  const [searchValue, setSearchValue] = useState('');
  const [visible, setVisible] = useState(false);
  const [{ sheetName, controlName, sheetDel, controlDel, dataSourceDisabled, sheetFieldDisabled }, setInfo] =
    useSetState({
      sheetName: '',
      controlName: '',
      sheetDel: false,
      controlDel: false,
      dataSourceDisabled: false,
      sheetFieldDisabled: false,
    });
  const saveControlId =
    _.get(
      _.find(allControls, i => i.controlId === controlId),
      'controlId',
    ) || '';
  const isSaved = controlId && saveControlId && !saveControlId.includes('-');
  // 取关联单条
  const sheetList = filterControlsFromAll(allControls, item => isSingleRelateSheet(item) || item.type === 35);

  const getFieldsByControls = (controls = []) => {
    return resortControlByColRow(controls.filter(i => !_.includes(SYS_CONTROLS, i.controlId))).filter(
      ({ type, enumDefault }) => !(_.includes(CAN_NOT_AS_OTHER_FIELD, type) || (type === 38 && enumDefault === 3)),
    );
  };

  const worksheetId = _.get(
    allControls.find(item => _.get(item, 'controlId') === parsedDataSource),
    'dataSource',
  );

  const {
    loading,
    data: { info, controls },
  } = useSheetInfo({ worksheetId, relationWorksheetId: globalSheetInfo.worksheetId });

  const fields = getFieldsByControls(controls);
  const filterBySearch = searchValue ? _.filter(fields, item => _.includes(item.controlName, searchValue)) : fields;
  const filteredFields = filterOnlyShowField(filterBySearch);

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

  const sureChangeToOnlyShow = () => {
    Dialog.confirm({
      title: <span className="Bold Font16">{_l('修改他表字段类型为：仅显示')}</span>,
      description: (
        <span className="Gray_9e">
          {_l(
            '修改后将清除此字段存储的数据。此字段将不能在用于搜索、筛选、公式、文本组合、统计。请确认以上位置都不再需要此字段的数据后执行操作。',
          )}
        </span>
      ),
      footerLeftElement: () => <WorksheetReference {...props} className="LineHeight36" />,
      buttonType: 'danger',
      onOk: () => {
        updateValue('1');
      },
    });
  };

  const updateValue = value => {
    onChange({ strDefault: updateConfig({ config: strDefault, value, index: 0 }) });
  };

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
          visible={visible}
          onVisibleChange={visible => {
            if (visible) setSearchValue('');
            setVisible(visible);
          }}
          disabled={sheetFieldDisabled}
          getPopupContainer={() => $ref.current}
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
                          size: data.size,
                        });
                        setInfo({ controlDel: false });
                      }}
                    >
                      <i className={`Font16 icon-${getIconByType(item.type)}`}></i>
                      <span className="flex ellipsis">{item.controlName}</span>
                    </li>
                  ))}
                </ul>
              )}
            </DropdownOverlay>
          }
        >
          <DropdownPlaceholder
            ref={$ref}
            className={cx({
              deleted: data.sourceControlId && controlDel,
              disabled: sheetFieldDisabled,
              invalid: !loading && data.sourceControlId && !worksheetId,
            })}
          >
            {data.sourceControlId ? (
              <Tooltip
                text={<span>{_l('ID: %0', data.sourceControlId)}</span>}
                popupPlacement="bottom"
                disable={!controlDel}
              >
                <span className="breakAll">{controlDel ? _l('字段已删除') : controlName}</span>
              </Tooltip>
            ) : (
              <span className="Gray_9e">{_l('请选择')}</span>
            )}
            {!sheetFieldDisabled && <i className="icon-arrow-down-border Font14 Gray_9e"></i>}
          </DropdownPlaceholder>
        </Dropdown>
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle">{_l('类型')}</div>
        <RadioGroup
          size="middle"
          checkedValue={showType}
          data={SHEET_FIELD_TYPES}
          onChange={type => {
            if (type === '1') {
              if (isSaved) {
                sureChangeToOnlyShow();
              } else {
                updateValue('1');
              }
            } else {
              updateValue('0');
            }
          }}
        />
      </SettingItem>
      {showType === '1' ? (
        <div className="Gray_9e mTop10">{_l('在加载记录时实时获取数据。适合只需要显示字段的场景。')}</div>
      ) : (
        <div>
          <div className="Gray_9e mTop10">
            {_l(
              '在当前表中存储数据并保持同步，存储后他表字段可用于工作表搜索、筛选、排序、统计，或被公式、文本组合字段使用。',
            )}
          </div>
          <div className="mTop10">
            <span>
              {_l(
                '注意：1.存储的数据与实际数据存在一定延时；2.当显示字段的数据变更后，最大支持更新与之关联的1000行数据。',
              )}
            </span>
            <span className="Gray_9e">
              {_l('所以此方式适合显示字段的值不会变更，或虽然变更但关联的记录数量较少（不超过1000行）的场景。')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
