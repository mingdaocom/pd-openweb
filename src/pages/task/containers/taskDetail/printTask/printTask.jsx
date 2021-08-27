import React, { Component } from 'react';
import DialogLayer from 'mdDialog';
import './less/printTask.less';
import cx from 'classnames';
import ajaxRequest from 'src/api/taskCenter';

export default class PrintTask extends Component {
  constructor(props) {
    super(props);
    this.state = {
      taskArry: [
        { key: 'TaskName', name: _l('任务标题'), disabled: true },
        { key: null },
        { key: 'Desc', name: _l('任务描述') },
        { key: 'Folder', name: _l('关联项目') },
        { key: 'Parent', name: _l('母任务') },
        { key: 'Charger', name: _l('主负责人') },
        { key: 'Time', name: _l('起止时间') },
        { key: 'Member', name: _l('任务参与者') },
        { key: 'Tag', name: _l('分类标签') },
        { key: 'Checklist', name: _l('检查清单') },
        { key: 'SubTask', name: _l('子任务'), noSelect: true },
        { key: 'qrCode', name: _l('二维码') },
      ],
      customArray: props.customArray,
    };
  }

  componentDidMount() {
    $('#printTask_container').on('click', '.printOperation .checkOperation', function () {
      $(this).toggleClass('checked');
    });
  }

  submit() {
    const printList = [];
    const cids = [];

    $('.printTaskBaseMsg .checkOperation.checked').each(function () {
      printList.push($(this).attr('name'));
    });

    $('.printTaskCustomMsg .checkOperation.checked').each(function () {
      cids.push($(this).attr('name'));
    });

    const source = JSON.stringify({
      taskId: this.props.taskId,
      options: printList.join('|'),
      cids,
    });

    let printWindow = '';
    if (navigator.userAgent.indexOf('MDClient') === -1) {
      printWindow = window.open();
    }

    ajaxRequest.saveData({ str: source }).then((data) => {
      if (printWindow) {
        printWindow.location.href = '/apps/task/print/' + data;
      } else {
        location.href = '/apps/task/print/' + data;
      }
    });
  }

  render() {
    const settings = {
      dialogBoxID: 'printTask',
      oneScreen: true,
      container: {
        header: _l('选择您需要打印的部分'),
        yesText: _l('预览'),
        yesFn: () => {
          this.submit();
        },
      },
    };

    return (
      <DialogLayer {...settings}>
        <div className="printMessage Font16">{_l('任务')}</div>
        <ul className="printOperation printTaskBaseMsg">
          {this.state.taskArry.map((item, i) => {
            if (item.key) {
              return (
                <li key={i}>
                  <div className={cx({ checked: !item.noSelect }, item.disabled ? 'checkOperationDisabled' : 'checkOperation')} name={item.key}>
                    <i className="operationCheckbox icon-ok ThemeBGColor3 ThemeBorderColor3" />
                    {item.name}
                    {item.key === 'qrCode' ? (
                      <span className="mLeft5 operationTips tip-top" data-tip={_l('可将二维码贴于办公场地或设备旁，协作者可直接扫码查看任务')}>
                        <i className="icon-knowledge-message" />
                      </span>
                    ) : (
                      undefined
                    )}
                  </div>
                </li>
              );
            }
            return <li key={i} />;
          })}
        </ul>
        {this.state.customArray.length ? <div className="printMessage Font16 mTop15">{_l('任务自定义字段内容')}</div> : undefined}
        <ul className="printOperation printTaskCustomMsg">
          {this.state.customArray.map((item, i) => {
            return (
              <li key={i}>
                <div className="checked checkOperation" name={item.key}>
                  <i className="operationCheckbox icon-ok ThemeBGColor3 ThemeBorderColor3" />
                  <span className="overflow_ellipsis">{item.name}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </DialogLayer>
    );
  }
}
