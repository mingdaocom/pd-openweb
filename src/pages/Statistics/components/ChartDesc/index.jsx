import React, { Component } from 'react';
import { Button, Input } from 'antd';
import styled from 'styled-components';
import reportConfig from '../../api/reportConfig';

const { TextArea } = Input;

const Con = styled.div`
  .ant-input:focus,
  .ant-input-focused {
    box-shadow: none !important;
  }
`;

export default class ChartDesc extends Component {
  constructor(props) {
    super(props);
    const { desc } = props;
    this.state = {
      desc,
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.desc !== this.props.desc) {
      this.setState({ desc: nextProps.desc });
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
      <Con className="WhiteBG z-depth-2 boderRadAll_4" style={{ width: 300, padding: 12 }}>
        <TextArea
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
          <Button type="text" size="small" onClick={this.props.onClose}>
            {_l('取消')}
          </Button>
          <Button type="primary" size="small" className="mLeft10" onClick={this.handleSave}>
            {_l('保存')}
          </Button>
        </div>
      </Con>
    );
  }
}
