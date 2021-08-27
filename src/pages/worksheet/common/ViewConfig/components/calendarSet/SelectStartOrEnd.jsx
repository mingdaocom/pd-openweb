import React, { useState, useEffect } from 'react';
import { Icon } from 'ming-ui';
import { Select } from 'antd';
import cx from 'classnames';
import './SelectStartOrEnd.less';
import { getIconByType } from 'src/pages/widgetConfig/util';

export default function SelectStartOrEnd(props) {
  const { worksheetControls = [], view = {}, updateCurrentView, handleChange } = props;
  const { advancedSetting = {} } = view;

  //排除系统字段的"最近修改时间"
  let timeControls = worksheetControls.filter(item => item.controlId !== 'utime' && _.includes([15, 16], item.type));
  const setDataFn = () => {
    return {
      begindate: advancedSetting.begindate || timeControls[0].controlId,
      startData: advancedSetting.begindate
        ? timeControls.find((it, i) => it.controlId === advancedSetting.begindate) || {}
        : timeControls[0],
      startControls: timeControls.filter(it => it.controlId !== advancedSetting.enddate),
      enddate: advancedSetting.enddate,
      endData: timeControls.find(it => it.controlId === advancedSetting.enddate) || {},
      endControls: timeControls.filter(it => it.controlId !== (advancedSetting.begindate || timeControls[0].controlId)),
    };
  };
  const [{ begindate, startControls, enddate, endControls, startData, endData }, setSetting] = useState(setDataFn);
  const [isDeleteN, setIsDeleteN] = useState(props.isDelete);

  useEffect(() => {
    setSetting(setDataFn);
  }, [advancedSetting.begindate, advancedSetting.enddate]);
  useEffect(() => {
    setIsDeleteN(props.isDelete);
  }, [props.isDelete]);

  return (
    <React.Fragment>
      <div className="settingContent">
        <div className="selectBox selectStartOrEndCon">
          <div className="startCom">
            <span className="tag"></span>
            <span className="txt">{_l('开始')}</span>
            <Select
              className={cx('dropCon', { isDelete: isDeleteN })}
              value={
                isDeleteN ? (
                  <span className="Red">
                    <Icon icon="error_outline" className={cx('Font14 Red mRight8')} />
                    {_l('该字段已删除')}
                  </span>
                ) : (
                  <span className="Gray">{startData.controlName}</span>
                )
              }
              suffixIcon={<Icon icon="arrow-down-border Font14" />}
              dropdownClassName="dropConOption"
              onChange={value => {
                if (value === begindate) {
                  return;
                }
                handleChange({ begindate: value });
                setIsDeleteN(false);
              }}
            >
              {startControls.map((item, i) => {
                return (
                  <Select.Option value={item.controlId} key={i} className="">
                    <i className={cx('icon Gray_9e mRight5 Font14', 'icon-' + getIconByType(item.type))}></i>
                    {item.controlName}
                  </Select.Option>
                );
              })}
            </Select>
            {isDeleteN && <span className="Red errorTxtOption">{_l('点击下拉框显示下拉菜单')}</span>}
          </div>
          <div className="startCom end mTop16">
            <span className={cx('tag', { has: enddate })}></span>
            <span className="txt">{_l('结束')}</span>
            <Select
              className={cx('dropCon', { isDelete: enddate && !endData.controlId })}
              value={
                enddate ? (
                  enddate && !endData.controlId ? (
                    <span className="Red">
                      <Icon icon="error_outline" className={cx('Font14 Red mRight8')} />
                      {_l('该字段已删除')}
                    </span>
                  ) : (
                    <span className="Gray">{endData.controlName || ''}</span>
                  )
                ) : (
                  <span className="Gray_bd">{_l('请选择')}</span>
                )
              }
              suffixIcon={<Icon icon="arrow-down-border Font14" />}
              allowClear={enddate}
              dropdownClassName="dropConOption"
              onChange={value => {
                if (value === enddate) {
                  return;
                }
                handleChange({
                  begindate: begindate,
                  enddate: value,
                });
              }}
            >
              {endControls.map((item, i) => {
                return (
                  <Select.Option value={item.controlId} key={i}>
                    <i className={cx('icon Gray_9e mRight5 Font14', 'icon-' + getIconByType(item.type))}></i>
                    {item.controlName}
                  </Select.Option>
                );
              })}
            </Select>
          </div>
        </div>
        {begindate &&
          enddate &&
          startData &&
          startData.type !== (endData.type || '') &&
          startData.controlName &&
          endData.controlName && (
            <div className="endCom">
              <Icon className="Font18 error" icon="info" />
              <p className="pLeft12 Gray_75">
                {_l(
                  '当前视图使用的“%0”和“%1”的字段类型不同，视图将使用开始时间的字段类型绘制。建议使用两个同为日期类型或同为日期时间类型的字段。',
                  startData.controlName,
                  endData.controlName,
                )}
              </p>
            </div>
          )}
        <div className="err"></div>
      </div>
    </React.Fragment>
  );
}
