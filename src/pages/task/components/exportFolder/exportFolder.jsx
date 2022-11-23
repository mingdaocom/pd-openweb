import React, { Component } from 'react';
import DialogLayer from 'src/components/mdDialog/dialog';
import './less/exportFolder.less';
import cx from 'classnames';
import { addToken } from 'src/util';

export default class ExportFolder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      folderArry: [
        { key: 'folderDesc', name: _l('项目名称'), disabled: true },
        { key: null },
        { key: 'folderCharge', name: _l('项目负责人') },
        { key: 'folderDesc', name: _l('项目描述') },
        { key: 'stageName', name: _l('看板名称') },
        { key: 'control', name: _l('自定义任务内容') },
      ],
      taskType: [{ key: 'topLevelTask', name: '项目下一级任务', disabled: true }, { key: 'subtask', name: _l('各级子任务'), noSelect: true }],
      taskArray: [
        { key: 'taskName', name: '任务标题', disabled: true },
        { key: null },
        { key: 'taskCharge', name: _l('任务负责人') },
        { key: 'taskDesc', name: _l('任务描述') },
        { key: 'completeTime', name: _l('完成状态及完成时间') },
        { key: 'taskMember', name: _l('任务参与者') },
        { key: 'time', name: _l('起止时间') },
        { key: 'createTime', name: _l('创建日期') },
        { key: 'tag', name: _l('分类标签') },
        { key: 'checklist', name: _l('检查清单') },
        { key: 'parentTaskName', name: _l('母任务名称') },
        { key: 'subtaskName', name: _l('子任务名称') },
      ],
    };
  }

  componentDidMount() {
    $('#exportFolder_container').on('click', '.printOperation .checkOperation', function () {
      $(this).toggleClass('checked');
    });
  }

  submit() {
    this.props.onClose();
    let obj = `folderId=${this.props.folderId}&timestamp=${new Date().getTime()}`;
    $('.printOperation .checkOperation:not(.checkOperationDisabled)').each(function () {
      obj += `&${$(this).attr('name')}=${$(this).hasClass('checked')}`;
    });

    window.open(addToken(`${md.global.Config.AjaxApiUrl}download/exportFolderToExcel?${obj}`));
  }

  render() {
    const settings = {
      dialogBoxID: 'exportFolder',
      oneScreen: true,
      container: {
        header: _l('选择您需要导出的部分'),
        yesText: _l('导出'),
        yesFn: () => {
          this.submit();
        },
        noFn: this.props.onClose,
      },
    };

    return (
      <DialogLayer {...settings}>
        <div className="printMessage Font16">{_l('项目')}</div>
        <ul className="printOperation">
          {this.state.folderArry.map((item, i) => {
            if (item.key) {
              return (
                <li key={i}>
                  <div className={cx({ checked: !item.noSelect }, item.disabled ? 'checkOperationDisabled' : 'checkOperation')} name={item.key}>
                    <i className="operationCheckbox icon-ok ThemeBGColor3 ThemeBorderColor3" />
                    {item.name}
                  </div>
                </li>
              );
            }
            return <li key={i} />;
          })}
        </ul>
        <div className="printMessage Font16 mTop15">{_l('任务')}</div>
        <ul className="printOperation">
          {this.state.taskType.map((item, i) => {
            if (item.key) {
              return (
                <li key={i}>
                  <div className={cx({ checked: !item.noSelect }, item.disabled ? 'checkOperationDisabled' : 'checkOperation')} name={item.key}>
                    <i className="operationCheckbox icon-ok ThemeBGColor3 ThemeBorderColor3" />
                    {item.name}
                  </div>
                </li>
              );
            }
            return <li key={i} />;
          })}
        </ul>
        <div className="printMessage Font16 mTop15">{_l('任务信息')}</div>
        <ul className="printOperation">
          {this.state.taskArray.map((item, i) => {
            if (item.key) {
              return (
                <li key={i}>
                  <div className={cx({ checked: !item.noSelect }, item.disabled ? 'checkOperationDisabled' : 'checkOperation')} name={item.key}>
                    <i className="operationCheckbox icon-ok ThemeBGColor3 ThemeBorderColor3" />
                    {item.name}
                  </div>
                </li>
              );
            }
            return <li key={i} />;
          })}
        </ul>
      </DialogLayer>
    );
  }
}
