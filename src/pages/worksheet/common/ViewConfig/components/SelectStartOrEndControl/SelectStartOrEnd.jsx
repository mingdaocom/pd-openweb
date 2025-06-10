import React, { useEffect, useState } from 'react';
import { Select } from 'antd';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { isIllegal, isTimeStyle } from 'src/pages/worksheet/views/CalendarView/util';
import { setSysWorkflowTimeControlFormat } from 'src/pages/worksheet/views/CalendarView/util.js';
import { SYS } from '../../../../../widgetConfig/config/widget';
import AddControlDiaLog from './AddControlDiaLog';
import './SelectStartOrEnd.less';

const TimeSelect = ({
  value,
  options,
  onChange,
  allowClear = false,
  isError,
  errorMessage,
  canAddControl,
  onAddControl,
}) => {
  const renderOptionLabel = item => (
    <div className="flexRow alignItemsCenter">
      <i className={cx('icon Gray_9e mRight12 Font16', 'icon-' + getIconByType(item.type))} />
      <span className="flex WordBreak overflow_ellipsis">{item.controlName}</span>
    </div>
  );
  const renderErrorValue = () => (
    <div className="flexRow alignItemsCenter Red">
      <Icon icon="error1" className="Font14 mRight8" />
      <span className="flex WordBreak overflow_ellipsis">{errorMessage}</span>
    </div>
  );
  const getSelectValue = () => {
    if (isError) {
      return {
        value: value,
        label: renderErrorValue(),
      };
    }
    return value && value.controlId
      ? {
        value: value.controlId,
        label: renderOptionLabel(value),
      }
      : undefined;
  };

  return (
    <Select
      className={cx('dropCon', {
        'error-select': isError,
        'disabled-select': isError,
      })}
      allowClear={allowClear}
      value={getSelectValue()}
      placeholder={_l('请选择')}
      labelInValue
      optionLabelProp="label"
      suffixIcon={<Icon icon="arrow-down-border Font14" />}
      dropdownClassName="dropConOption"
      onChange={(selectedValue = {}) => {
        if (selectedValue.value === (value || {}).controlId) return;
        if (selectedValue.value === 'add') {
          onAddControl();
          return;
        }
        onChange(selectedValue.value);
      }}
      notFoundContent={
        <div className="addControl">
          <i className={cx('icon mRight12 Font16', 'icon-plus')} />
          {_l('添加日期字段')}
        </div>
      }
    >
      {options.map(item => (
        <Select.Option
          value={item.controlId}
          key={item.controlId}
          label={renderOptionLabel(item)}
          disabled={isIllegal(item)}
        >
          {renderOptionLabel(item)}
        </Select.Option>
      ))}
      {canAddControl && (
        <Select.Option className="addControl" value="add">
          <i className={cx('icon mRight12 Font16', 'icon-plus')} />
          {_l('添加日期字段')}
        </Select.Option>
      )}
    </Select>
  );
};

const SelectRow = ({ label, children, hasValue = false, className = '' }) => (
  <div className={cx('startCom flexRow alignItemsCenter', className)}>
    <span className={cx('tag', { has: hasValue })} />
    <span className="txt">{label}</span>
    <div className="con Relative flex flexRow alignItemsCenter">{children}</div>
  </div>
);

export default function SelectStartOrEnd(props) {
  const {
    handleChange,
    timeControls = [],
    canAddTimeControl,
    mustSameType,
    controls = [],
    worksheetId,
    updateWorksheetControls,
    allowClear,
    sheetSwitchPermit = [],
    beginIsDel,
    endIsDel,
    classNames,
  } = props;

  const getData = () => {
    const timeControlsList = setSysWorkflowTimeControlFormat(timeControls, sheetSwitchPermit);
    const begindate = props.begindate;
    const enddate = props.enddate;
    const startData = begindate ? timeControlsList.find(it => it.controlId === begindate) || {} : {};
    const endData = enddate ? timeControlsList.find(it => it.controlId === enddate) || {} : {};
    return {
      begindate,
      startData,
      startControls: timeControlsList.filter(
        it =>
          it.controlId !== enddate &&
          it.controlId !== begindate &&
          (mustSameType && endData.controlId ? isTimeStyle(it) === isTimeStyle(endData) : true),
      ),
      enddate,
      endData,
      endControls: timeControlsList.filter(
        it =>
          it.controlId !== begindate &&
          it.controlId !== enddate &&
          (mustSameType && startData.controlId ? isTimeStyle(it) === isTimeStyle(startData) : true),
      ),
    };
  };

  const [{ begindate, startControls, enddate, endControls, startData = {}, endData = {} }, setSetting] =
    useState(getData());
  const [visible, setVisible] = useState(false);
  const [addName, setAddName] = useState('');
  const [addKey, setAddKey] = useState('');
  useEffect(() => {
    setSetting(getData());
  }, [timeControls, props.begindate, props.enddate]);

  const handleStartChange = value => {
    handleChange({ begindate: value, enddate });
  };

  const handleEndChange = value => {
    handleChange({ begindate, enddate: value });
  };

  const showAddDialog = (name, key) => {
    setAddName(name);
    setAddKey(key);
    setVisible(true);
  };

  return (
    <React.Fragment>
      <div className={cx(`settingContent ${classNames}`)}>
        <div className="selectBox selectStartOrEndCon flex">
          <SelectRow label={_l('开始')} hasValue={!!begindate}>
            <TimeSelect
              type="start"
              value={startData}
              options={startControls}
              onChange={handleStartChange}
              isError={beginIsDel || isIllegal(startData)}
              errorMessage={beginIsDel ? _l('该字段已删除') : _l('不支持使用年、年月的字段类型')}
              canAddControl={canAddTimeControl}
              onAddControl={() => showAddDialog(_l('开始时间'), 'begindate')}
            />
          </SelectRow>

          <SelectRow label={_l('结束')} className="mTop16 end" hasValue={!!enddate}>
            <TimeSelect
              type="end"
              value={endData}
              options={endControls}
              onChange={handleEndChange}
              allowClear={allowClear}
              isError={endIsDel || isIllegal(endData)}
              errorMessage={endIsDel ? _l('该字段已删除') : _l('不支持使用年、年月的字段类型')}
              canAddControl={canAddTimeControl}
              onAddControl={() => showAddDialog(_l('结束时间'), 'enddate')}
            />
          </SelectRow>
        </div>
        {mustSameType &&
          begindate &&
          enddate &&
          startData &&
          isTimeStyle(startData) !== isTimeStyle(endData) &&
          startData.controlName &&
          endData.controlName && (
            <div className="endCom">
              <Icon className="Font18 error" icon="info" />
              <p className="pLeft12 Gray_75">
                {_l(
                  '当前视图使用的"%0"和"%1"的字段类型不同，视图将使用日期时间的字段类型绘制。建议使用两个同为日期类型或同为日期时间类型的字段。',
                  startData.controlName,
                  endData.controlName,
                )}
              </p>
            </div>
          )}
      </div>
      {visible && (
        <AddControlDiaLog
          visible={visible}
          setVisible={setVisible}
          type={(addKey !== 'begindate' ? startData.type : undefined) || endData.type}
          addName={addName}
          controls={controls}
          onAdd={data => {
            let constrolInfo = data;
            if (data.filter(o => SYS.includes(o.controlId)).length <= 0) {
              const sys = controls.filter(o => SYS.includes(o.controlId));
              constrolInfo = constrolInfo.concat(sys);
            }
            updateWorksheetControls(constrolInfo);
          }}
          onChange={value => handleChange({ begindate, enddate, [addKey]: value })}
          title={_l('添加日期字段')}
          enumType={
            ((addKey !== 'begindate' ? startData.type : undefined) || endData.type) === 16 ? 'DATE_TIME' : 'DATE'
          }
          worksheetId={worksheetId}
        />
      )}
    </React.Fragment>
  );
}
