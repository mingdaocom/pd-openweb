import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import Textarea from 'ming-ui/components/Textarea';
import Dialog from 'ming-ui/components/Dialog/Dialog';
import './index.less';

export default class WorkflowInfo extends Component {
  static propTypes = {
    onCancel: PropTypes.func,
    onOk: PropTypes.func,
    flowName: PropTypes.string,
    explain: PropTypes.string,
  };

  static defaultProps = {
    onCancel: () => {},
    onOk: () => {},
    flowName: '',
    explain: '',
  };

  constructor(props) {
    super(props);
    this.state = {
      flowName: props.flowName,
      explain: props.explain,
    };
  }

  componentDidMount() {
    this.name.select();
  }

  /**
   * 确定按钮点击事件
   */
  onOk = () => {
    let { flowName, explain } = this.state;
    flowName = flowName.trim();
    explain = explain.trim();

    if (!flowName) {
      alert(_l('请输入工作流名称'), 2);
      this.name.focus();
      return;
    }

    this.props.onOk({ name: flowName, explain });
  };

  render() {
    const { onCancel } = this.props;
    const { explain, flowName } = this.state;

    return (
      <Dialog visible type="scroll" width={560} onCancel={onCancel} onOk={this.onOk} title={_l('基本信息')}>
        <div className="workflowInfo">
          <div className="Gray_9">{_l('名称')}</div>
          <div className="mTop10">
            <input
              type="text"
              ref={name => {
                this.name = name;
              }}
              className="ThemeHoverBorderColor3 ThemeBorderColor3"
              autoFocus
              value={flowName}
              onChange={e => this.setState({ flowName: e.target.value })}
            />
          </div>
          <div className="mTop15 mBottom10 Gray_9">{_l('说明')}</div>
          <Textarea minHeight={72} name="explain" value={explain} onChange={explain => this.setState({ explain })} />
        </div>
      </Dialog>
    );
  }
}
