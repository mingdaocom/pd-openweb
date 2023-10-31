import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import './index.less';
import nodeModules from './nodeModules';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { NODE_TYPE } from '../enum';
import { updateNodeData } from '../../redux/actions';
import cx from 'classnames';

class Detail extends Component {
  static propTypes = {
    companyId: PropTypes.string.isRequired,
    processId: PropTypes.string.isRequired,
    relationId: PropTypes.string,
    relationType: PropTypes.number,
    flowInfo: PropTypes.any,
    selectNodeId: PropTypes.string.isRequired,
    selectNodeType: PropTypes.any.isRequired,
    selectNodeName: PropTypes.string,
    isCopy: PropTypes.bool,
    closeDetail: PropTypes.func.isRequired,
    haveChange: PropTypes.func,
    isIntegration: PropTypes.bool,
    updateNodeData: PropTypes.func,
  };

  static defaultProps = {
    flowInfo: {},
    haveChange: () => {},
  };

  constructor(props) {
    super(props);
  }

  /**
   * 渲染内容
   */
  renderContent() {
    const { selectNodeType, relationId, isIntegration } = this.props;
    const NodeComponent = nodeModules[selectNodeType];

    return (
      <NodeComponent
        {...Object.assign({}, { updateNodeData: this.updateNodeData }, this.props, {
          relationId: isIntegration ? '' : relationId,
        })}
      />
    );
  }

  /**
   * 更新节点数据
   */
  updateNodeData = data => {
    const { processId } = this.props;

    this.props.dispatch(updateNodeData(processId, data));
  };

  render() {
    const { selectNodeId, selectNodeType, isCopy, flowInfo } = this.props;
    const NodeComponent = nodeModules[selectNodeType];

    // 分支
    if (selectNodeType === NODE_TYPE.BRANCH_ITEM) {
      return <NodeComponent updateNodeData={this.updateNodeData} {...this.props} />;
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
              { 'workflowDetailRelease pBottom20': !!flowInfo.parentId },
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
