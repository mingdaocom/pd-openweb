import React, { Fragment } from 'react';
import { APP_TYPE, TRIGGER_ID } from '../../enum';
import { TriggerCondition, SelectFields } from '../components';
import { Dropdown, Radio } from 'ming-ui';
import cx from 'classnames';

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
  const isSheet = data.appType === APP_TYPE.SHEET;
  const appList = data.appList.map(item => {
    return {
      text: item.name,
      value: item.id,
      className: item.id === data.appId ? 'ThemeColor3' : '',
    };
  });
  const TYPES = [
    { text: _l('当新增或更新记录时'), value: TRIGGER_ID.EDIT, selectFields: true },
    { text: _l('仅新增记录时'), value: TRIGGER_ID.ADD, desc: _l('当新增记录时触发流程') },
    { text: _l('仅更新记录时'), value: TRIGGER_ID.ONLY_EDIT, selectFields: true },
    { text: _l('删除记录时'), value: TRIGGER_ID.DELETE },
  ];

  return (
    <Fragment>
      <div className={cx('flowDetailStartHeader flexColumn', isSheet ? 'BGYellow' : 'BGBlueAsh')}>
        <div className="flowDetailStartIcon flexRow">
          <i className={cx('Font40', isSheet ? 'icon-table yellow' : 'icon-sending gray')} />
        </div>
        <div className="Font16 mTop10">{isSheet ? _l('工作表') : _l('事件推送')}</div>
      </div>
      <div className="workflowDetailBox mTop20">
        <div className="Font13 bold">{_l('选择工作表')}</div>
        <Dropdown
          className="flowDropdown flowDropdownBorder mTop10"
          disabled={data.appId && !isSheet}
          data={appList}
          value={data.appId || undefined}
          border
          openSearch
          noData={_l('暂无工作表，请先在应用里创建')}
          placeholder={_l('请选择一个工作表，开始配置流程')}
          onChange={switchWorksheet}
        />

        <div className="Font13 bold mTop20">{isSheet ? _l('触发方式') : _l('订阅事件类型')}</div>

        {TYPES.filter(o => o.value !== TRIGGER_ID.EDIT || isSheet).map(item => (
          <div className="mTop15" key={item.value}>
            <Radio
              text={item.text}
              className="Font15"
              checked={data.triggerId === item.value}
              onClick={() => updateSource({ triggerId: item.value })}
            />
            {item.selectFields && data.triggerId === item.value && (
              <Fragment>
                <div className="mLeft30 bold mTop8 Font13" style={{ marginBottom: -5 }}>
                  {_l('选择触发字段')}
                </div>
                <div className="mLeft30">
                  <SelectFields
                    controls={data.filedControls}
                    selectedIds={data.assignFieldIds}
                    updateSource={ids => updateSource({ assignFieldIds: ids })}
                  />
                  <div className="Gray_75 mTop5 Font13">
                    {_l('当以上指定的其中一个字段更新时将触发流程，如未指定则表示任何字段更新时都会触发')}
                  </div>
                </div>
              </Fragment>
            )}
            {item.desc && data.triggerId === item.value && <div className="mTop10 mLeft30 Gray_75">{item.desc}</div>}
          </div>
        ))}

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
