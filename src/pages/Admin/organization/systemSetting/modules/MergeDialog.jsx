import React, { Component } from 'react';
import { Modal, Radio } from 'ming-ui/antd-components';
import workSiteController from 'src/api/workSite';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';

export default class MergeDialog extends Component {
  constructor() {
    super();
    this.state = {
      toMergerIds: '',
      merging: false,
    };
    this.mergeRequestPending = false;
  }

  onChange(e) {
    this.setState({ toMergerIds: e.target.value });
  }

  handleSave() {
    if (this.mergeRequestPending) return;

    const reqData = {
      workSiteId: this.state.toMergerIds,
      toMergerIds: this.props.selectedRowKeys,
      projectId: this.props.projectId,
    };
    if (this.state.toMergerIds) {
      if (confirm(_l('确认合并所选择的工作地点？'))) {
        this.mergeRequestPending = true;
        this.setState({ merging: true });
        return workSiteController
          .mergeWorkSites(reqData)
          .then(data => {
            if (data) {
              alert(_l('合并成功'), 1);
              this.setState({
                toMergerIds: '',
              });
              this.props.closeMergeDialog(true);
            } else {
              alert(_l('合并失败'), 2);
            }
          })
          .catch(_requestError => alertIfNotUnauthorized(_requestError, _l('合并失败'), 2))
          .finally(() => {
            this.mergeRequestPending = false;
            this.setState({ merging: false });
          });
      }
    } else alert(_l('请选择合并到哪个工作地点'), 3);
  }

  render() {
    const { options = [] } = this.props;
    const { merging } = this.state;
    return (
      <Modal
        open={this.props.visible}
        title={_l('合并工作地点')}
        cancelText={_l('取消')}
        okText={_l('确定')}
        confirmLoading={merging}
        width={413}
        mask={{ closable: false }}
        keyboard
        onCancel={() => {
          this.props.closeMergeDialog();
        }}
        onOk={() => this.handleSave()}
      >
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
      </Modal>
    );
  }
}
