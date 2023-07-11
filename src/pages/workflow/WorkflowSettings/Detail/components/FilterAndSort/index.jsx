import React, { Fragment } from 'react';
import TriggerCondition from '../TriggerCondition';
import Sort from '../Sort';
import { Checkbox } from 'ming-ui';
import { switchFilterConditions } from '../../../utils';

export default ({
  companyId,
  processId,
  selectNodeId,
  data,
  updateSource,
  filterText,
  sortText,
  showRandom = false,
  openNewFilter = false,
  disabledNewFilter = false,
  filterEncryptCondition = false,
}) => {
  return (
    <Fragment>
      <div className="mTop20 bold">{_l('筛选条件')}</div>
      {filterText && <div className="Gray_75 mTop5">{filterText}</div>}

      {!!data.conditions.length || !!data.filters.length ? (
        <TriggerCondition
          projectId={companyId}
          processId={processId}
          selectNodeId={selectNodeId}
          openNewFilter={openNewFilter}
          controls={data.controls}
          data={openNewFilter ? data.filters : data.conditions}
          updateSource={data => updateSource(openNewFilter ? { filters: data } : { conditions: data })}
          singleCondition={!openNewFilter}
          filterEncryptCondition={filterEncryptCondition}
        />
      ) : (
        <div className="mTop15">
          <span
            className="workflowDetailStartBtn ThemeColor3 ThemeBorderColor3 ThemeHoverColor2 ThemeHoverBorderColor2"
            onClick={() =>
              updateSource(
                openNewFilter ? { filters: [{ conditions: [[{}]], spliceType: 2 }] } : { conditions: [[{}]] },
              )
            }
          >
            {_l('设置筛选条件')}
          </span>
        </div>
      )}

      {!!data.conditions.length && !disabledNewFilter && (
        <div className="workflowDetailDesc pTop15 pBottom15 mTop20" style={{ background: 'rgba(255, 163, 64, 0.12)' }}>
          <div className="Gray_9e mBottom5">
            {_l('筛选器现已支持且或组合；手动切换后，不会丢失您现有的配置，可以直接在现有筛选条件的基础上进一步配置')}
          </div>
          <span
            className="ThemeColor3 ThemeHoverColor2 pointer"
            onClick={() => updateSource({ conditions: [], filters: switchFilterConditions(data.conditions) })}
          >
            {_l('使用支持且或组合的筛选器')}
          </span>
        </div>
      )}

      <div className="mTop20 flexRow">
        <div className="flex bold">{_l('排序规则')}</div>
        {showRandom && (
          <Checkbox
            className="flexRow"
            text={_l('忽略排序规则，随机获取一条')}
            checked={data.random}
            onClick={checked => updateSource({ random: !checked })}
          />
        )}
      </div>
      {sortText && <div className="Gray_75 mTop5">{sortText}</div>}

      <Sort sorts={data.sorts} controls={data.controls} updateSource={updateSource} />
    </Fragment>
  );
};
