import React, { Fragment } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Select, TimePicker, Tooltip } from 'ming-ui/antd-components';
import { getControlTypeName } from '../../utils';
import { TimeSelect, TriggerCondition } from '../components';

export default ({
  data,
  switchWorksheet,
  updateSource,
  processId,
  selectNodeId,
  companyId,
  renderConditionBtn,
  triggerConditionHeader,
  relationId,
}) => {
  const renderTitle = item => {
    if (!item) {
      return (
        <Tooltip title={`ID：${data.assignFieldId}`}>
          <span style={{ color: 'var(--color-error)' }}>{_l('字段已删除')}</span>
        </Tooltip>
      );
    }

    return (
      <Fragment>
        <span className="textSecondary mRight5">[{getControlTypeName(item)}]</span>
        <span>{item.controlName}</span>
      </Fragment>
    );
  };

  const appList = data.appList.map(item => {
    return {
      label: item.name,
      value: item.id,
    };
  });
  const getList = () =>
    data.controls
      .filter(o => o.type === 15 || o.type === 16)
      .map(item => {
        return {
          label: renderTitle(item),
          value: item.controlId,
        };
      });
  const dateNoTime = (_.find(data.controls, obj => obj.controlId === data.assignFieldId) || {}).type === 15;
  const frequencyData = [
    { label: _l('不重复'), value: 0 },
    { label: _l('每年'), value: 1 },
    { label: _l('每月'), value: 2 },
    { label: _l('每周'), value: 3 },
  ];

  return (
    <Fragment>
      <div className="flowDetailStartHeader flexColumn BGBlue">
        <div className="flowDetailStartIcon flexRow">
          <i className="icon-task_custom_today Font40 blue" />
        </div>
        <div className="Font16 mTop10">{_l('日期字段')}</div>
      </div>
      <div className="workflowDetailBox mTop20">
        <div className="Font13 bold">{_l('选择工作表')}</div>
        <Select
          className="flowDropdown flowDropdownBorder mTop10"
          options={appList}
          value={data.appId || undefined}
          showSearch
          optionFilterProp="label"
          notFoundContent={_l('暂无工作表，请先在应用里创建')}
          placeholder={_l('请选择一个工作表，开始配置流程')}
          onChange={switchWorksheet}
        />

        <div className="Font13 bold mTop20">{_l('指定日期字段')}</div>
        <div className="Font13 textSecondary mTop10">{_l('将按照此字段的日期作为日期表来触发流程')}</div>
        <Select
          className="flowDropdown mTop10"
          options={getList()}
          value={data.assignFieldId || undefined}
          placeholder={_l('请选择字段')}
          onChange={value => updateSource({ assignFieldId: value })}
          labelRender={() =>
            data.assignFieldId && renderTitle(_.find(data.controls, item => item.controlId === data.assignFieldId))
          }
        />

        {!!data.assignFieldId && (
          <Fragment>
            <div className="Font13 bold mTop20">{_l('开始执行时间')}</div>
            <TimeSelect data={data} dateNoTime={dateNoTime} updateSource={updateSource} />

            <div className="Font13 bold mTop20">{_l('重复周期')}</div>
            <Select
              className="flowDropdown mTop10"
              options={frequencyData}
              value={data.frequency}
              onChange={value => updateSource({ frequency: value })}
            />

            {data.frequency !== 0 && (
              <Fragment>
                <div className="Font13 bold mTop20">{_l('结束执行时间')}</div>
                <div className="Font13 textSecondary mTop5">{_l('当到达此时间点后将停止循环')}</div>
                <Select
                  allowClear
                  className="flowDropdown mTop10"
                  options={getList()}
                  value={data.executeEndTime || undefined}
                  placeholder={_l('请选择字段')}
                  onChange={value => {
                    const executeEndTime = value || '';

                    updateSource({
                      executeEndTime,
                      endTime:
                        executeEndTime && _.find(data.controls, item => item.controlId === executeEndTime).type === 15
                          ? '08:00'
                          : '',
                    });
                  }}
                  labelRender={() =>
                    data.executeEndTime &&
                    renderTitle(_.find(data.controls, item => item.controlId === data.executeEndTime))
                  }
                />
                {(_.find(data.controls, item => item.controlId === data.executeEndTime) || {}).type === 15 && (
                  <div className="mTop10 flexRow alignItemsCenter">
                    <TimePicker
                      allowClear={false}
                      format="HH:mm"
                      inputReadOnly
                      showNow={false}
                      value={moment(data.endTime || '08:00', 'HH:mm')}
                      onChange={(time, timeString) => updateSource({ endTime: timeString })}
                    />
                  </div>
                )}
              </Fragment>
            )}
          </Fragment>
        )}

        {!data.operateCondition.length && renderConditionBtn()}
        {!!data.operateCondition.length && (
          <TriggerCondition
            processId={processId}
            relationId={relationId}
            selectNodeId={selectNodeId}
            sourceAppId={data.appId}
            controls={data.controls}
            Header={triggerConditionHeader}
            data={data.operateCondition}
            updateSource={data => updateSource({ operateCondition: data })}
            projectId={companyId}
          />
        )}
      </div>
    </Fragment>
  );
};
