import React, { Component } from 'react';
import moment from 'moment';
import styled from 'styled-components';
import { Checkbox, Input, Modal } from 'ming-ui/antd-components';
import DatePickerFilter from 'src/pages/Admin/common/datePickerFilter';
import { addToken } from 'src/utils/platform/browser/download';

const Wrap = styled.div`
  color: var(--color-text-title);
  font-size: 13px;
  display: flex;
  flex-direction: column;
  .hap-checkbox-group {
    display: flex;
    flex-direction: column;
    .hap-checkbox-group-item {
      margin-top: 8px;
    }
    .hap-checkbox {
      input {
        display: none;
      }
    }
  }
  .exportLine {
    width: 100%;
    height: 1px;
    background-color: var(--color-border-secondary);
    margin: 20px 0;
  }
  .exportData {
    width: 203px;
    height: 36px;
    border: 1px solid var(--color-border-primary);
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    box-sizing: border-box;
    color: var(--color-text-secondary);
    font-size: 12px;
    margin-top: 10px;
    letter-spacing: 1px;
    cursor: pointer;
  }
`;

const plainOptions = [
  {
    label: _l('用户列表'),
    value: 'userList',
  },
  {
    label: _l('群组列表'),
    value: 'groupList',
  },
  {
    label: _l('任务列表'),
    value: 'task',
  },
];

export default class ExportDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: moment(new Date()).format('YYYY-MM-DD'),
      endDate: moment(new Date()).format('YYYY-MM-DD'),
      typeList: [],
    };
  }

  onChange(value) {
    this.setState({
      typeList: value,
    });
  }

  exportList() {
    const { typeList, startDate } = this.state;

    if (!typeList.length) {
      alert(_l('请选择要导出的列表'), 3);
    } else if (!startDate) {
      alert(_l('请选择时间段'), 3);
    } else {
      $('#__VIEWSTATE').remove();
      if (!window.isMDClient) {
        $('#outPutFormBox').attr('target', '_blank');
      }

      $('#outPutFormBox').submit();
    }
  }

  render() {
    const { startDate, endDate, typeList } = this.state;
    let outPutList = '';
    typeList.forEach(item => {
      outPutList += item + '|';
    });
    return (
      <Modal
        open={this.props.visible}
        title={<span className="Bold">{_l('导出数据')}</span>}
        cancelText={_l('取消')}
        okText={_l('导出')}
        width={480}
        mask={{ closable: false }}
        keyboard
        onCancel={() => {
          this.props.handleChangeVisible('exportVisible', false);
        }}
        onOk={() => this.exportList()}
      >
        <Wrap>
          <div className="bold mTop8 mBottom8">{_l('导出的类别')}</div>
          <Checkbox.Group options={plainOptions} onChange={e => this.onChange(e)} />
          <div className="exportLine"></div>
          <div className="bold">{_l('导出的时间范围')}</div>
          <DatePickerFilter
            updateData={data => {
              this.setState({
                startDate: data.startDate,
                endDate: data.endDate,
              });
            }}
          >
            <div className="exportData mBottom8">{startDate && endDate ? _l('%0 至 %1', startDate, endDate) : ''}</div>
          </DatePickerFilter>
          <form
            id="outPutFormBox"
            method="get"
            action={addToken(`${md.global.Config.AjaxApiUrl}download/exportProjectEntityToExcel`)}
          >
            <Input type="hidden" name="list" value={outPutList} />
            <Input type="hidden" name="startDate" value={startDate} />
            <Input type="hidden" name="endDate" value={endDate} />
            <Input type="hidden" name="projectId" value={this.props.projectId} />
          </form>
        </Wrap>
      </Modal>
    );
  }
}
