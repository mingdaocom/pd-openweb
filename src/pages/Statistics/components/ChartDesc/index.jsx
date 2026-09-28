import React, { Component } from 'react';
import { Button, Input } from 'ming-ui/antd-components';
import reportConfig from '../../api/reportConfig';

const { TextArea } = Input;

export default class ChartDesc extends Component {
  constructor(props) {
    super(props);
    const { desc } = props;
    this.state = {
      desc,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (this.props.desc !== prevProps.desc) {
        this.setState({
          desc: this.props.desc,
        });
      }
    }
  }
  handleSave = () => {
    const newDesc = this.state.desc.trim();
    const { desc, reportId, onSave, onClose } = this.props;

    if (!reportId) {
      onSave(newDesc);
      onClose();
      return;
    }

    if (newDesc !== desc) {
      reportConfig
        .updateReportName({
          reportId,
          desc: newDesc,
        })
        .then(result => {
          if (result) {
            onSave(newDesc);
          }
        });
      onClose();
    }
  };
  render() {
    const { desc } = this.state;
    return (
      <div>
        <TextArea
          autoFocus
          rows={4}
          autoSize={{ minRows: 4, maxRows: 6 }}
          placeholder={_l('添加图表描述')}
          value={desc}
          onChange={e => {
            this.setState({
              desc: e.target.value,
            });
          }}
        />
        <div className="TxtRight pTop20 pBottom5">
          <Button
            type="text"
            size="small"
            className="textSecondary hoverColorPrimaryLight"
            onClick={this.props.onClose}
          >
            {_l('取消')}
          </Button>
          <Button type="primary" size="small" className="mLeft10 hoverBgColorPrimaryDark" onClick={this.handleSave}>
            {_l('保存')}
          </Button>
        </div>
      </div>
    );
  }
}
