import React, { Component } from 'react';
import { connect } from 'react-redux';
import './index.less';
import nodeModules from './nodeModules';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { NODE_TYPE } from '../enum';
import { updateNodeData } from '../../redux/actions';
import cx from 'classnames';

class Detail extends Component {
  constructor(props) {
    super(props);
  }

  /**
   * 渲染内容
   */
  renderContent() {
    const { selectNodeType } = this.props;
    const NodeComponent = nodeModules[selectNodeType];

    return <NodeComponent {...Object.assign({}, this.props, { updateNodeData: this.updateNodeData })} />;
  }

  /**
   * 更新节点数据
   */
  updateNodeData = data => {
    this.props.dispatch(updateNodeData(data));
  };

  render() {
    const { selectNodeId, selectNodeType, isCopy, isRelease } = this.props;
    const NodeComponent = nodeModules[selectNodeType];

    // 分支
    if (selectNodeType === NODE_TYPE.BRANCH_ITEM) {
      return <NodeComponent {...this.props} updateNodeData={this.updateNodeData} />;
    }

    return (
      <ReactCSSTransitionGroup
        transitionName="workflowDetailTransition"
        transitionEnterTimeout={250}
        transitionLeaveTimeout={250}
      >
        {!!selectNodeId && (
          <div
            className={cx(
              'workflowDetail flexColumn',
              { workflowDetailDisabled: isCopy },
              { 'workflowDetailRelease pBottom20': isRelease },
            )}
          >
            {this.renderContent()}
          </div>
        )}
      </ReactCSSTransitionGroup>
    );
  }
}

export default connect(state => state.workflow)(Detail);
