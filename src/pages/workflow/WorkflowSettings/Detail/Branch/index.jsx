import React, { Component } from 'react';
import { Dialog, Support } from 'ming-ui';
import { TriggerCondition } from '../components';
import flowNode from '../../../api/flowNode';
import { checkConditionsIsNull } from '../../utils';

export default class Branch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      controls: [],
      saveRequest: false,
    };
  }

  componentDidMount() {
    const { processId, selectNodeId, selectNodeType } = this.props;

    flowNode.getNodeDetail({ processId, nodeId: selectNodeId, flowNodeType: selectNodeType }).then(result => {
      this.setState({
        name: result.name,
        data: result.conditions,
        controls: result.flowNodeAppDtos,
      });
    });
  }

  /**
   * 筛选条件头
   */
  triggerConditionHeader() {
    return <div className="Font13 Gray_9e">{_l('设置筛选条件后，满足条件的数据才能进入该分支')}</div>;
  }

  /**
   * 更新data数据
   */
  updateSource = data => {
    this.setState({ data });
  };

  /**
   * 保存
   */
  onSave = () => {
    const { data, saveRequest } = this.state;
    const { processId, selectNodeId, selectNodeType, updateNodeData } = this.props;

    if (saveRequest) {
      return;
    }

    if (checkConditionsIsNull(data)) {
      alert(_l('筛选条件的判断值不能为空'), 2);
      return;
    }

    flowNode
      .saveNode({ nodeId: selectNodeId, flowNodeType: selectNodeType, operateCondition: data, processId })
      .then(result => {
        updateNodeData(result);
        this.props.closeDetail();
      });

    this.setState({ saveRequest: true });
  };

  render() {
    const { closeDetail } = this.props;
    const { data, controls, name } = this.state;

    return (
      <Dialog
        className="workflowDialogBox"
        overlayClosable={false}
        visible
        title={
          <div className="flexRow" style={{ height: 24 }}>
            <span className="ellipsis">{name || _l('分支')}</span>
            <span className="mLeft10">
              <Support type={1} className="workflowDialogSupport" href="https://help.mingdao.com/flow41" />
            </span>
            <span className="flex" />
          </div>
        }
        onCancel={closeDetail}
        width={560}
        onOk={this.onSave}
      >
        <TriggerCondition
          processId={this.props.processId}
          selectNodeId={this.props.selectNodeId}
          isNodeHeader={true}
          controls={controls}
          Header={this.triggerConditionHeader}
          data={data}
          updateSource={this.updateSource}
          projectId={this.props.companyId}
        />
        {!data.length && (
          <div
            className="Font13 addConditionBtn ThemeColor3 ThemeHoverColor2 mTop15"
            onClick={() => this.setState({ data: [[{}]] })}
          >
            {_l('添加筛选条件')}
          </div>
        )}
      </Dialog>
    );
  }
}
