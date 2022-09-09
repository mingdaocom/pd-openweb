import React, { useState, useEffect } from 'react';
import { Icon } from 'ming-ui';
import { Select } from 'antd';
import cx from 'classnames';
import './SelectStartOrEnd.less';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { isTimeStyle, isIllegal } from 'src/pages/worksheet/views/CalendarView/util';
import AddControlDiaLog from './AddControlDiaLog';
import { SYS } from '../../../../../widgetConfig/config/widget';
export default function SelectStartOrEnd(props) {
  const {
    handleChange,
    timeControls = [],
    canAddTimeControl, //能否添加新的时间控件
    mustSameType, //必须同类型
    begindateOrFirst, //begindate为空时可以以第一个控件为begindate
    controls = [],
    worksheetId,
    updateWorksheetControls,
    allowClear,
    i,
  } = props;
  const getData = () => {
    let begindate = props.begindate;
    let enddate = props.enddate;
    let startData = begindate ? timeControls.find((it, i) => it.controlId === begindate) || {} : [];
    let endData = enddate ? timeControls.find(it => it.controlId === enddate) || {} : {};
    return {
      begindate,
      startData,
      startControls: timeControls.filter(
        it =>
          it.controlId !== enddate &&
          it.controlId !== begindate &&
          (mustSameType && endData.controlId ? isTimeStyle(it) === isTimeStyle(endData) : true),
      ),
      enddate,
      endData,
      endControls: timeControls.filter(
        it =>
          it.controlId !== begindate &&
          it.controlId !== enddate &&
          (mustSameType && startData.controlId ? isTimeStyle(it) === isTimeStyle(startData) : true),
      ),
    };
  };
  const [{ begindate, startControls, enddate, endControls, startData = {}, endData = {} }, setSetting] = useState(
    getData(),
  );
  const [visible, setVisible] = useState(false);
  const [addName, setAddName] = useState('');
  const [addKey, setAddKey] = useState('');
  useEffect(() => {
    setSetting(getData());
  }, [timeControls, props.begindate, props.enddate]);
  return (
    <React.Fragment>
      <div className={cx(`settingContent ${props.classNames}`)}>
        <div className="selectBox selectStartOrEndCon ">
          <div className="startCom flexRow">
            <span className="tag"></span>
            <span className="txt">{_l('开始')}</span>
            <div className="con Relative flex">
              <Select
                className={cx('dropCon', { isDelete: props.beginIsDel || isIllegal(startData) })}
                allowClear={false}
                value={[startData.controlId]}
                placeholder={_l('请选择')}
                optionLabelProp="label"
                suffixIcon={<Icon icon="arrow-down-border Font14" />}
                dropdownClassName="dropConOption"
                onChange={value => {
                  if (value === begindate) {
                    return;
                  }
                  if (value === 'add') {
                    setAddName(_l('开始时间'));
                    setAddKey('begindate');
                    setVisible(true);
                    return;
                  }
                  handleChange({ begindate: value, enddate: enddate });
                }}
              >
                {startControls.map((item, i) => {
                  const labelNode = (
                    <div>
                      <i className={cx('icon Gray_9e mRight12 Font16', 'icon-' + getIconByType(item.type))}></i>
                      {item.controlName}
                    </div>
                  );
                  return (
                    <Select.Option value={item.controlId} key={i} className="" label={labelNode}>
                      {labelNode}
                    </Select.Option>
                  );
                })}
                {canAddTimeControl && (
                  <Select.Option className="addControl" value={'add'}>
                    <i className={cx('icon mRight12 Font16', 'icon-plus')}></i>
                    {_l('添加日期字段')}
                  </Select.Option>
                )}
              </Select>
              {props.beginIsDel ||
                (isIllegal(startData) ? (
                  <span className="breakAll overflow_ellipsis Red err">
                    <Icon icon="error1" className={cx('Font14 Red mRight8')} />
                    {isIllegal(startData) ? _l('不支持使用年、年月的字段类型') : _l('该字段已删除')}
                  </span>
                ) : (
                  <span
                    className={cx('txtCon breakAll overflow_ellipsis', {
                      Gray: startData.controlName,
                      Gray_bd: !startData.controlName,
                    })}
                  >
                    {startData.controlName || _l('请选择')}
                  </span>
                ))}
            </div>
          </div>
          <div className="startCom end mTop16 flexRow">
            <span className={cx('tag', { has: enddate })}></span>
            <span className="txt">{_l('结束')}</span>
            <div className="con Relative flex">
              <Select
                className={cx('dropCon', { isDelete: props.endIsDel || isIllegal(endData) })}
                allowClear={allowClear}
                value={[endData.controlId]}
                placeholder={_l('请选择')}
                optionLabelProp="label"
                suffixIcon={<Icon icon="arrow-down-border Font14" />}
                dropdownClassName="dropConOption"
                onChange={value => {
                  if (value === enddate) {
                    return;
                  }
                  if (value === 'add') {
                    setAddName(_l('结束时间'));
                    setAddKey('enddate');
                    setVisible(true);
                    return;
                  }
                  handleChange({
                    begindate: begindate,
                    enddate: value,
                  });
                }}
              >
                {endControls.map((item, i) => {
                  const labelNode = (
                    <div>
                      <i className={cx('icon Gray_9e mRight12 Font16', 'icon-' + getIconByType(item.type))}></i>
                      {item.controlName}
                    </div>
                  );
                  return (
                    <Select.Option value={item.controlId} key={i} label={labelNode}>
                      {labelNode}
                    </Select.Option>
                  );
                })}
                {canAddTimeControl && (
                  <Select.Option className="addControl" value={'add'}>
                    <i className={cx('icon mRight12 Font16', 'icon-plus')}></i>
                    {_l('添加日期字段')}
                  </Select.Option>
                )}
              </Select>
              {(enddate && !endData.controlId) ||
                (isIllegal(endData) ? (
                  <span className="breakAll overflow_ellipsis Red err">
                    <Icon icon="error1" className={cx('Font14 Red mRight8')} />
                    {!isIllegal(endData) ? _l('该字段已删除') : _l('不支持使用年、年月的字段类型')}
                  </span>
                ) : (
                  <span
                    className={cx('txtCon breakAll overflow_ellipsis', {
                      Gray: endData.controlName,
                      Gray_bd: !endData.controlName,
                    })}
                  >
                    {endData.controlName || _l('请选择')}
                  </span>
                ))}
            </div>
          </div>
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
                  '当前视图使用的“%0”和“%1”的字段类型不同，视图将使用日期时间的字段类型绘制。建议使用两个同为日期类型或同为日期时间类型的字段。',
                  startData.controlName,
                  endData.controlName,
                )}
              </p>
            </div>
          )}
        <div className="err"></div>
      </div>
      {visible && (
        <AddControlDiaLog
          visible={visible}
          setVisible={setVisible}
          type={startData.type || endData.type}
          addName={addName}
          controls={controls}
          onAdd={data => {
            let constrolInfo = data;
            if (data.filter(o => SYS.includes(o.controlId)).length <= 0) {
              let sys = controls.filter(o => SYS.includes(o.controlId));
              constrolInfo = constrolInfo.concat(sys);
            }
            updateWorksheetControls(constrolInfo);
          }}
          onChange={value => {
            handleChange({
              begindate: begindate,
              enddate: enddate,
              [addKey]: value,
            });
          }}
          title={_l('添加日期字段')}
          withoutIntro={true}
          enumType={'DATE'}
          worksheetId={worksheetId}
        />
      )}
    </React.Fragment>
  );
}
