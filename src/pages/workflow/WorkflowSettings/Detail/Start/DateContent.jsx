import React, { Fragment } from 'react';
import { Tooltip } from 'antd';
import _ from 'lodash';
import { Dropdown } from 'ming-ui';
import Time from 'ming-ui/components/NewTimePicker';
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
          <span style={{ color: '#f44336' }}>{_l('字段已删除')}</span>
        </Tooltip>
      );
    }

    return (
      <Fragment>
        <span className="Gray_75 mRight5">[{getControlTypeName(item)}]</span>
        <span>{item.controlName}</span>
      </Fragment>
    );
  };
  const appList = data.appList.map(item => {
    return {
      text: item.name,
      value: item.id,
      className: item.id === data.appId ? 'ThemeColor3' : '',
    };
  });
  const getList = selectId =>
    data.controls
      .filter(o => o.type === 15 || o.type === 16)
      .map(item => {
        return {
          text: renderTitle(item),
          value: item.controlId,
          className: item.controlId === selectId ? 'ThemeColor3' : '',
        };
      });
  const dateNoTime = (_.find(data.controls, obj => obj.controlId === data.assignFieldId) || {}).type === 15;
  const frequencyData = [
    { text: _l('不重复'), value: 0 },
    { text: _l('每年'), value: 1 },
    { text: _l('每月'), value: 2 },
    { text: _l('每周'), value: 3 },
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
        <Dropdown
          className="flowDropdown flowDropdownBorder mTop10"
          data={appList}
          value={data.appId || undefined}
          border
          openSearch
          noData={_l('暂无工作表，请先在应用里创建')}
          placeholder={_l('请选择一个工作表，开始配置流程')}
          onChange={switchWorksheet}
        />

        <div className="Font13 bold mTop20">{_l('指定日期字段')}</div>
        <div className="Font13 Gray_75 mTop10">{_l('将按照此字段的日期作为日期表来触发流程')}</div>
        <Dropdown
          className="flowDropdown mTop10"
          data={getList(data.assignFieldId)}
          value={data.assignFieldId || undefined}
          border
          placeholder={_l('请选择字段')}
          onChange={value => updateSource({ assignFieldId: value })}
          disabledClickElement=".ant-tooltip"
          renderTitle={() =>
            data.assignFieldId && renderTitle(_.find(data.controls, item => item.controlId === data.assignFieldId))
          }
        />

        {!!data.assignFieldId && (
          <Fragment>
            <div className="Font13 bold mTop20">{_l('开始执行时间')}</div>
            <TimeSelect data={data} dateNoTime={dateNoTime} updateSource={updateSource} />

            <div className="Font13 bold mTop20">{_l('重复周期')}</div>
            <Dropdown
              className="flowDropdown mTop10"
              data={frequencyData}
              value={data.frequency}
              border
              onChange={value => updateSource({ frequency: value })}
            />

            {data.frequency !== 0 && (
              <Fragment>
                <div className="Font13 bold mTop20">{_l('结束执行时间')}</div>
                <div className="Font13 Gray_75 mTop5">{_l('当到达此时间点后将停止循环')}</div>
                <Dropdown
                  className="flowDropdown mTop10"
                  data={
                    data.executeEndTime
                      ? [{ text: _l('清除选择'), value: '' }].concat(getList(data.executeEndTime))
                      : getList(data.executeEndTime)
                  }
                  value={data.executeEndTime || undefined}
                  border
                  placeholder={_l('请选择字段')}
                  onChange={value =>
                    updateSource({
                      executeEndTime: value,
                      endTime:
                        value && _.find(data.controls, item => item.controlId === value).type === 15 ? '08:00' : '',
                    })
                  }
                  renderTitle={() =>
                    data.executeEndTime &&
                    renderTitle(_.find(data.controls, item => item.controlId === data.executeEndTime))
                  }
                />
                {(_.find(data.controls, item => item.controlId === data.executeEndTime) || {}).type === 15 && (
                  <div className="mTop10 flexRow alignItemsCenter timeWidth">
                    <Time
                      type="minute"
                      value={{
                        hour: data.endTime ? parseInt(data.endTime.split(':')[0]) : 8,
                        minute: data.endTime ? parseInt(data.endTime.split(':')[1]) : 0,
                        second: 0,
                      }}
                      onChange={(event, value) => {
                        updateSource({
                          endTime:
                            value.hour.toString().padStart(2, '0') + ':' + value.minute.toString().padStart(2, '0'),
                        });
                      }}
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
