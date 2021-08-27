import React, { Fragment } from 'react';
import { CONTROLS_NAME } from '../../enum';
import { TriggerCondition, TimeSelect } from '../components';
import { Dropdown } from 'ming-ui';

export default ({
  data,
  switchWorksheet,
  updateSource,
  processId,
  selectNodeId,
  companyId,
  renderConditionBtn,
  triggerConditionHeader,
}) => {
  const renderTitle = item => {
    if (!item) {
      return <span style={{ color: '#f44336' }}>{_l('字段已删除')}</span>;
    }

    return (
      <Fragment>
        <span className="Gray_9e mRight5">[{CONTROLS_NAME[item.type]}]</span>
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
  const list = data.controls
    .filter(o => o.type === 15 || o.type === 16)
    .map(item => {
      return {
        text: renderTitle(item),
        value: item.controlId,
        className: item.controlId === data.assignFieldId ? 'ThemeColor3' : '',
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
          <i className="icon-hr_time Font40 blue" />
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
        <div className="Font13 Gray_9e mTop10">{_l('将按照此字段的日期作为日期表来触发流程')}</div>
        <Dropdown
          className="flowDropdown mTop10"
          data={list}
          value={data.assignFieldId || undefined}
          border
          placeholder={_l('请选择字段')}
          onChange={value => updateSource({ assignFieldId: value })}
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
          </Fragment>
        )}

        {!data.operateCondition.length && renderConditionBtn()}
        {!!data.operateCondition.length && (
          <TriggerCondition
            processId={processId}
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
