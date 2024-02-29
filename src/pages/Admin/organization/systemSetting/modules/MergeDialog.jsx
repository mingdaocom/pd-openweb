import React, { Component } from 'react';
import { Radio } from 'antd';
import { Dialog } from 'ming-ui';
import workSiteController from 'src/api/workSite';

export default class MergeDialog extends Component {
  constructor() {
    super();
    this.state = {
      toMergerIds: '',
    };
  }

  onChange(e) {
    this.setState({ toMergerIds: e.target.value });
  }

  handleSave() {
    const reqData = {
      workSiteId: this.state.toMergerIds,
      toMergerIds: this.props.selectedRowKeys,
      projectId: this.props.projectId,
    };
    if (this.state.toMergerIds) {
      if (confirm(_l('确认合并所选择的工作地点？'))) {
        workSiteController.mergeWorkSites(reqData).then(data => {
          if (data) {
            alert(_l('合并成功'), 1);
            this.setState({
              toMergerIds: '',
            });
            this.props.closeMergeDialog(true);
          } else {
            alert(_l('合并失败'), 2);
          }
        });
      }
    } else alert(_l('请选择合并到哪个工作地点'), 3);
  }

  render() {
    const { options = [] } = this.props;
    return (
      <Dialog
        visible={this.props.visible}
        title={_l('合并工作地点')}
        cancelText={_l('取消')}
        okText={_l('确定')}
        width="413"
        overlayClosable={false}
        onCancel={() => {
          this.props.closeMergeDialog();
        }}
        onOk={() => this.handleSave()}>
        <div className="warpMerge">
          <div>{_l('合并到')}</div>
          <Radio.Group className="content" onChange={this.onChange.bind(this)} value={this.state.toMergerIds}>
            {options.map(item => {
              return (
                <Radio className="mTop10" value={item.workSiteId} key={item.workSiteId}>
                  {item.workSiteName}
                </Radio>
              );
            })}
          </Radio.Group>
        </div>
      </Dialog>
    );
  }
}
