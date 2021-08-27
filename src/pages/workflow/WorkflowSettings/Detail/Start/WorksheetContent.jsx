import React, { Fragment } from 'react';
import { TRIGGER_ID_TYPE } from '../../enum';
import { TriggerCondition, SelectFields } from '../components';
import { Dropdown, Radio } from 'ming-ui';

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
  const appList = data.appList.map(item => {
    return {
      text: item.name,
      value: item.id,
      className: item.id === data.appId ? 'ThemeColor3' : '',
    };
  });

  const TYPES = [
    { text: _l('当新增或更新记录时'), value: TRIGGER_ID_TYPE.EDIT, selectFields: true },
    { text: _l('仅新增记录时'), value: TRIGGER_ID_TYPE.ADD, desc: _l('当新增记录时触发流程') },
    { text: _l('仅更新记录时'), value: TRIGGER_ID_TYPE.ONLY_EDIT, selectFields: true },
    { text: _l('删除记录时'), value: TRIGGER_ID_TYPE.DELETE },
  ];

  return (
    <Fragment>
      <div className="flowDetailStartHeader flexColumn BGYellow">
        <div className="flowDetailStartIcon flexRow">
          <i className="icon-worksheet Font40 yellow" />
        </div>
        <div className="Font16 mTop10">{_l('工作表')}</div>
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

        <div className="Font13 bold mTop20">{_l('触发方式')}</div>

        {TYPES.map(item => (
          <div className="mTop15" key={item.value}>
            <Radio
              text={item.text}
              checked={data.triggerId === item.value}
              onClick={() => updateSource({ triggerId: item.value })}
            />
            {item.selectFields && data.triggerId === item.value && (
              <div className="mLeft30">
                <SelectFields
                  controls={data.filedControls}
                  selectedIds={data.assignFieldIds}
                  placeholder={_l('选择触发字段')}
                  updateSource={ids => updateSource({ assignFieldIds: ids })}
                />
                <div className="Gray_9e mTop5 Font12">
                  {_l('当以上指定的其中一个字段更新时将触发流程，如未指定则表示任何字段更新时都会触发')}
                </div>
              </div>
            )}
            {item.desc && data.triggerId === item.value && <div className="mTop10 mLeft30 Gray_9e">{item.desc}</div>}
          </div>
        ))}

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
