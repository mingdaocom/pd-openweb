import React, { Fragment } from 'react';
import TriggerCondition from '../TriggerCondition';
import Sort from '../Sort';
import { Checkbox } from 'ming-ui';

export default ({
  companyId,
  processId,
  selectNodeId,
  data,
  updateSource,
  filterText,
  sortText,
  singleCondition = true,
  showRandom = false,
}) => {
  return (
    <Fragment>
      <div className="mTop20 bold">{_l('筛选条件')}</div>
      {filterText && <div className="Gray_75 mTop5">{filterText}</div>}

      {data.conditions.length ? (
        <TriggerCondition
          projectId={companyId}
          processId={processId}
          selectNodeId={selectNodeId}
          controls={data.controls}
          data={data.conditions}
          updateSource={data => updateSource({ conditions: data })}
          singleCondition={singleCondition}
        />
      ) : (
        <div className="mTop15">
          <span
            className="workflowDetailStartBtn ThemeColor3 ThemeBorderColor3 ThemeHoverColor2 ThemeHoverBorderColor2"
            onClick={() => updateSource({ conditions: [[{}]] })}
          >
            {_l('设置筛选条件')}
          </span>
        </div>
      )}

      <div className="mTop20 flexRow">
        <div className="flex bold">{_l('排序规则')}</div>
        {showRandom && (
          <Checkbox
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
