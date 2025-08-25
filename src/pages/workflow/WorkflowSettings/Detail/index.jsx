import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Drawer } from 'antd';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { updateNodeData } from '../../redux/actions';
import { NODE_TYPE } from '../enum';
import nodeModules from './nodeModules';
import './index.less';

class Detail extends Component {
  static propTypes = {
    companyId: PropTypes.string,
    processId: PropTypes.string,
    relationId: PropTypes.string,
    relationType: PropTypes.number,
    flowInfo: PropTypes.any,
    selectNodeId: PropTypes.string.isRequired,
    selectNodeType: PropTypes.any.isRequired,
    selectNodeName: PropTypes.string,
    closeDetail: PropTypes.func.isRequired,
    haveChange: PropTypes.func,
    isIntegration: PropTypes.bool,
    customNodeName: PropTypes.string,
    updateNodeData: PropTypes.func,
    connectId: PropTypes.string,
    hasAuth: PropTypes.bool,
    isPlugin: PropTypes.bool,
  };

  static defaultProps = {
    flowInfo: {},
    haveChange: () => {},
    connectId: '',
    hasAuth: false,
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

    if (!NodeComponent) return null;

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
    const { selectNodeId, selectNodeType, flowInfo, instanceId } = this.props;
    const NodeComponent = nodeModules[selectNodeType];

    // 分支
    if (selectNodeType === NODE_TYPE.BRANCH_ITEM) {
      return <NodeComponent updateNodeData={this.updateNodeData} {...this.props} />;
    }

    return (
      <Drawer
        placement="right"
        visible={!!selectNodeId}
        closable={false}
        mask={false}
        bodyStyle={{ padding: 0 }}
        width={800}
      >
        <div className="workflowSettings h100">
          <div
            className={cx('workflowDetail flexColumn h100', {
              workflowDetailRelease: !!flowInfo.parentId || instanceId,
            })}
          >
            {this.renderContent()}
          </div>
        </div>
      </Drawer>
    );
  }
}

export default connect(state => state.workflow)(Detail);
