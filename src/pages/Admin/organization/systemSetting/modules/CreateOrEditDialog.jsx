import React, { Component } from 'react';
import { Dialog } from 'ming-ui';
import fixedDataAjax from 'src/api/fixedData.js';
import workSiteController from 'src/api/workSite';

export default class SiteName extends Component {
  constructor(props) {
    super(props);
    this.dialogtype = this.props.workSiteId ? _l('编辑') : _l('创建');
    this.state = {
      workSiteName: '',
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      workSiteName: nextProps.workSiteId ? nextProps.workSiteName : '',
    });
    setTimeout(() => {
      $(this.processName).focus();
    }, 300);
  }

  handleChange(e) {
    this.setState({ workSiteName: e.target.value });
  }

  handleOk() {
    if (this.state.workSiteName) {
      fixedDataAjax.checkSensitive({ content: this.state.workSiteName }).then(res => {
        if (res) {
          this.showMes(_l('输入内容包含敏感词，请重新填写'));
          return;
        } else {
          const workFn = this.props.workSiteId ? 'updateWorkSiteName' : 'addWorkSite';
          workSiteController[workFn]({
            workSiteId: this.props.workSiteId,
            workSiteName: this.state.workSiteName.trim(),
            projectId: this.props.projectId,
          }).then(data => {
            if (data === 1) {
              alert(this.props.workSiteId ? _l('编辑成功') : _l('创建成功'));
              this.setState({
                workSiteName: '',
              });
              this.props.updateValue(true);
            } else if (data === 2) {
              this.showMes(_l('此工作地点已存在'));
            } else {
              alert(this.props.workSiteId ? _l('编辑失败') : _l('创建失败'), 2);
            }
          });
        }
      });
    } else {
      this.showMes(_l('工作地点名称不能为空'));
    }
  }

  showMes(str) {
    $('.existResult').fadeIn().html(str);
    setTimeout(function () {
      $('.existResult').fadeOut().html('');
    }, 3000);
  }

  render() {
    return (
      <Dialog
        visible={this.props.visible}
        title={this.props.workSiteId ? _l('编辑工作地点') : _l('创建工作地点')}
        cancelText={_l('取消')}
        okText={_l('确定')}
        width="413"
        overlayClosable={false}
        onCancel={() => {
          this.props.updateValue();
        }}
        onOk={() => this.handleOk()}
      >
        <input
          ref={processName => {
            this.processName = processName;
          }}
          onChange={e => this.handleChange(e)}
          type="text"
          placeholder={_l('请输入工作地点名称')}
          className="ming Input Input--default w100"
          maxLength="64"
          defaultValue={this.state.workSiteName}
        />
        <div className="pTop10">
          <div className="existResult"></div>
        </div>
      </Dialog>
    );
  }
}
