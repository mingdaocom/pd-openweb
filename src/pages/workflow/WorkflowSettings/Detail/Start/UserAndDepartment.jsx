import React, { Fragment } from 'react';
import cx from 'classnames';
import { TRIGGER_ID } from '../../enum';
import { Radio } from 'ming-ui';
import { TriggerCondition } from '../components';

export default ({ data, updateSource, processId, selectNodeId, companyId, renderConditionBtn, relationId }) => {
  const TYPES = {
    20: {
      icon: 'icon-hr_structure',
      title: _l('人员'),
      actions: [
        { text: _l('当新人入职时'), value: TRIGGER_ID.ADD },
        { text: _l('当人员离职时'), value: TRIGGER_ID.DELETE },
      ],
    },
    21: {
      icon: 'icon-workflow',
      title: _l('部门'),
      actions: [
        { text: _l('当创建部门时'), value: TRIGGER_ID.ADD },
        { text: _l('当解散部门时'), value: TRIGGER_ID.DELETE },
      ],
    },
    23: {
      icon: 'icon-language',
      title: _l('外部用户'),
      actions: [
        { text: _l('当新用户注册时'), value: TRIGGER_ID.ADD },
        { text: _l('当用户登录时'), value: TRIGGER_ID.ONLY_EDIT },
        { text: _l('当用户注销时'), value: TRIGGER_ID.DELETE },
        { text: _l('当用户被停用时'), value: TRIGGER_ID.STOP },
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
            {item.value === TRIGGER_ID.DELETE && (
              <span
                className="Gray_75"
                data-tip={_l('包括用户自行注销或被管理员注销')}
                style={{ marginLeft: -15, marginTop: 2, verticalAlign: 'top', height: 14 }}
              >
                <i className="Font14 icon-workflow_help Gray_9e" />
              </span>
            )}
          </div>
        ))}

        {!data.operateCondition.length && renderConditionBtn()}

        <div className="pTop15">
          <TriggerCondition
            processId={processId}
            relationId={relationId}
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
