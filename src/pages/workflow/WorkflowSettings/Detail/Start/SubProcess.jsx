import React, { Fragment } from 'react';
import { APP_TYPE, APP_TYPE_TEXT } from '../../enum';

export default ({ data }) => {
  return (
    <Fragment>
      <div className="flowDetailStartHeader flexColumn BGBlueAsh">
        <div className="flowDetailStartIcon flexRow">
          <i className="icon-subprocess Font40 gray" />
        </div>
        <div className="Font16 mTop10">{_l('子流程')}</div>
      </div>
      <div className="workflowDetailBox mTop20">
        <div className="Font13 bold">{_l('数据源')}</div>
        <div className="Font13 mTop10">
          {data.appType === APP_TYPE.SHEET
            ? _l('工作表：%0', data.appName)
            : _l('其他：%0', APP_TYPE_TEXT[data.appType])}
        </div>

        <div className="Font13 bold mTop20">{_l('被以下工作流触发')}</div>
        {!data.processList.length && (
          <div className="Font12 Gray_75 workflowDetailDesc mTop10 subProcessDesc">{_l('未被任何流程触发')}</div>
        )}

        {data.processList.map((item, i) => {
          return (
            <div className="workflowDetailDesc mTop10 subProcessDesc" key={i}>
              <div className="Font13">
                <span
                  className="ThemeColor3 ThemeHoverColor2"
                  onClick={() => window.open(`/workflowedit/${item.processId}`)}
                >
                  {item.processName}
                </span>
              </div>
              <div className="Font12">
                <span className="Gray_75 mRight5">{_l('节点')}</span>
                <span>{item.flowNodes.map(obj => `“${obj.name}”`).join('、')}</span>
                <span className="Gray_75 mLeft5">{_l('触发')}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Fragment>
  );
};
