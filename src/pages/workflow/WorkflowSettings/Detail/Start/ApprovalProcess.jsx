import React, { Fragment } from 'react';
import { Checkbox, Icon } from 'ming-ui';
import { ProcessDetails } from '../components';

export default props => {
  const { data, updateSource } = props;
  const LIST = [
    {
      title: _l('发起人操作'),
      source: [
        { text: _l('允许发起人撤回'), key: 'allowRevoke' },
        { text: _l('允许发起人催办'), key: 'allowUrge' },
      ],
    },
    {
      title: _l('自动通过'),
      source: [
        { text: _l('发起人无需审批自动通过'), key: 'startEventPass' },
        { text: _l('已审批过的审批人自动通过'), key: 'userTaskPass' },
        { text: _l('审批人为空时自动通过'), key: 'userTaskNullPass' },
        {
          text: _l('验证必填字段'),
          key: 'required',
          tip: _l('勾选后，当有必填字段为空时不自动通过，仍需进行审批操作。[审批人为空时自动通过]不受此配置影响。'),
        },
      ],
    },
  ];

  return (
    <Fragment>
      <div className="flowDetailStartHeader flexColumn BGDarkBlue" style={{ height: 245 }}>
        <div className="flowDetailStartIcon flexRow" style={{ background: 'rgba(0, 0, 0, 0.24)' }}>
          <i className="icon-approval Font40 white" />
        </div>
        <div className="Font16 mTop10">{_l('发起审批流程')}</div>
        <div className="Font14 mTop10">{_l('对自动化工作流中的数据发起审批流程，实现业务自动化和人工审批的打通')}</div>
      </div>
      <div className="workflowDetailBox mTop20">
        <div className="Font13 bold">{_l('被以下工作流触发')}</div>
        <div className="Font13 mTop15 flexRow alignItemsCenter">
          <div className="ellipsis">
            {data.triggerName || <span style={{ color: '#f44336' }}>{_l('流程已删除')}</span>}
          </div>
          {data.triggerName && (
            <i
              className="mLeft5 icon-task-new-detail Font12 ThemeColor3 ThemeHoverColor2 pointer"
              onClick={() => window.open(`/workflowedit/${data.triggerId}`)}
            />
          )}
          <div className="flex" />
        </div>

        <div className="Font13 bold mTop20">{_l('发起审批的数据对象')}</div>
        <div className="workflowDetailDesc mTop10 subProcessDesc bold alignItemsCenter flexRow">
          <i className="icon-worksheet Gray_9e mRight8 Font16" />
          {_l('工作表“%0”', data.appName)}
        </div>

        {LIST.map((item, index) => {
          return (
            <Fragment key={index}>
              <div className="Font13 mTop20 bold">{item.title}</div>
              {item.source.map(o => (
                <div key={o.key} className="mTop15 flexRow alignItemsCenter">
                  <Checkbox
                    className=" flexRow"
                    text={o.text}
                    checked={data.processConfig[o.key]}
                    onClick={checked =>
                      updateSource({
                        processConfig: Object.assign({}, data.processConfig, { [o.key]: !checked }),
                      })
                    }
                  />
                  {o.tip && (
                    <span className="workflowDetailTipsWidth mLeft5" data-tip={o.tip}>
                      <Icon icon="info" className="Gray_9e" />
                    </span>
                  )}
                </div>
              ))}
            </Fragment>
          );
        })}

        <ProcessDetails {...props} />
      </div>
    </Fragment>
  );
};
