import React, { Component } from 'react';
import './index.less';
import cx from 'classnames';
import BranchItem from './BranchItem';
import { CreateNode } from '../components';

export default class Branch extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { data, item, isCopy } = this.props;
    const showAddBtn = !item.resultTypeId;

    return (
      <div className="flexColumn">
        <div className={cx('workflowBranch', { pTop0: !showAddBtn })}>
          {showAddBtn && (
            <i
              className="workflowBranchBtn icon-workflow_add"
              onClick={() => !isCopy && this.props.addFlowNode({ prveId: item.id, name: '', typeId: 2 })}
            />
          )}
          {item.flowIds.map((id, i) => {
            return (
              <BranchItem
                key={id}
                {...this.props}
                prveId={item.id}
                item={data[id]}
                clearBorderType={i === 0 ? -1 : i === item.flowIds.length - 1 ? 1 : 0}
              />
            );
          })}
        </div>
        <CreateNode {...this.props} />
      </div>
    );
  }
}
