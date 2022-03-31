import React, { Fragment } from 'react';
import cx from 'classnames';
import { TRIGGER_ID_TYPE } from '../../enum';
import { Radio } from 'ming-ui';
import { TriggerCondition } from '../components';

export default ({ data, updateSource, processId, selectNodeId, companyId, renderConditionBtn }) => {
  const TYPES = {
    20: {
      icon: 'icon-hr_structure',
      title: _l('人员'),
      actions: [
        { text: _l('当新人入职时'), value: TRIGGER_ID_TYPE.ADD },
        { text: _l('当人员离职时'), value: TRIGGER_ID_TYPE.DELETE },
      ],
    },
    21: {
      icon: 'icon-workflow',
      title: _l('部门'),
      actions: [
        { text: _l('当创建部门时'), value: TRIGGER_ID_TYPE.ADD },
        { text: _l('当解散部门时'), value: TRIGGER_ID_TYPE.DELETE },
      ],
    },
    23: {
      icon: 'icon-language',
      title: _l('外部用户'),
      actions: [
        { text: _l('当新用户注册时'), value: TRIGGER_ID_TYPE.ADD },
        { text: _l('当用户登录时'), value: TRIGGER_ID_TYPE.ONLY_EDIT },
        { text: _l('当用户被删除时'), value: TRIGGER_ID_TYPE.DELETE },
      ],
    },
  };

  return (
    <Fragment>
      <div className="flowDetailStartHeader flexColumn BGGreen">
        <div className="flowDetailStartIcon flexRow">
          <i className={cx('Font40 green', TYPES[data.appType].icon)} />
        </div>
        <div className="Font16 mTop10">{TYPES[data.appType].title}</div>
      </div>
      <div className="workflowDetailBox mTop20">
        <div className="bold">{_l('触发方式')}</div>
        {TYPES[data.appType].actions.map(item => (
          <div className="mTop15" key={item.value}>
            <Radio
              text={item.text}
              checked={data.triggerId === item.value}
              onClick={() => updateSource({ triggerId: item.value, operateCondition: [] })}
            />
          </div>
        ))}

        {!data.operateCondition.length && renderConditionBtn()}

        <div className="pTop15">
          <TriggerCondition
            processId={processId}
            selectNodeId={selectNodeId}
            sourceAppId={data.appId}
            controls={data.controls}
            data={data.operateCondition}
            updateSource={data => updateSource({ operateCondition: data })}
            projectId={companyId}
          />
        </div>
      </div>
    </Fragment>
  );
};
