import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Icon from 'ming-ui/components/Icon';
import RadioGroup from 'ming-ui/components/RadioGroup';
import LoadDiv from 'ming-ui/components/LoadDiv';
import Dropdown from 'ming-ui/components/Dropdown';
import cx from 'classnames';
import moment from 'moment';
import projectAjax from 'src/api/projectSetting';
import sheetAjax from 'src/api/worksheet';
import postAjax from 'src/api/taskCenter';
import renderCellText from 'src/pages/worksheet/components/CellControls/renderText';
import PrintOptDialog from './PrintOptDialog';
import { formatFormulaDate } from 'src/pages/worksheet/util';
import model from './model';
import nzh from 'nzh';
import './Print.less';
import { langFormat, htmlDecodeReg, accAdd, accDiv, accMul } from 'src/util';
import _ from 'lodash';

const nzhCn = nzh.cn;
const { task } = model;

const systemControl = [
  {
    controlId: 'ownerid',
    controlName: _l('拥有者'),
    type: 26,
  },
  {
    controlId: 'caid',
    controlName: _l('创建者'),
    type: 26,
  },
  {
    controlId: 'ctime',
    controlName: _l('创建时间'),
    type: 16,
  },
  {
    controlId: 'utime',
    controlName: _l('最近修改时间'),
    type: 16,
  },
];

const allocationTask = result => {
  return task.map(item => {
    if (item.key === 'startTime') {
      item.value = `${result.startTime} - ${result.deadline}`;
    } else if (item.key === 'actualStartTime') {
      item.value = `${result.actualStartTime} - ${result.completedTime}`;
    } else if (item.key === 'member') {
      item.value = result.member.join('、');
    } else if (item.key === 'tag') {
      item.value = result.tag.join('、');
    } else if (item.key === 'desc') {
      item.value = <span dangerouslySetInnerHTML={{ __html: htmlDecodeReg(result.desc) }} />;
    } else {
      item.value = result[item.key];
    }
    return item;
  });
};

export default class Print extends Component {
  static propTypes = {
    reqId: PropTypes.string,
  };
  constructor(props) {
    super(props);
    const { params } = props.match;
    this.state = {
      reqId: params.typeId,
      type: params.printType,
      processOption: window.localStorage.getItem('hrPrintProcessOption') || 'all',
      configOptions: {
        showWorkflowQrCode: true,
      },
      formDetail: {},
      workList: [],
      controls: [], // 打印筛选后要打印的表单控件
      signatureControls: [], // 签名控件
      formControls: [], // 表单明细内容
      logo: '',
      detailsType: 2, // 明细的显示方式：1纵向，2横向
      showPrintDialog: false, // 显隐设置弹层
      controlOption: 'all',
      reqInfo: {}, // 表单控件内容
      reqWorks: {}, // 表单审批流程内容
      printCheckAll: true, // 打印选项弹层是否全选
      fontSize: 14,
      appId: window.location.search.slice(1).split('&&')[0],
      viewId: window.location.search.slice(1).split('&&')[1],
      worksheetId: window.location.search.slice(1).split('&&')[2],
      projectId: window.location.search.slice(1).split('&&')[3],
      workSheetGetType: window.location.search.slice(1).split('&&')[4] || 1,
      sheetInfo: {}, // 工作表记录详情
      rowInfo: [], // 工作表记录打印控件
      task: [],
      workflow: [],
    };
  }
  componentWillMount = () => {
    const { params } = this.props.match;
    if (params.printType === 'task') {
      this.initTask();
    }
  };
  initTask() {
    document.title = _l('任务打印');
    postAjax
      .getTaskDetail4Print({
        taskId: this.state.reqId,
      })
      .then(source => {
        const { data } = source;
        const controlData = _.groupBy(data.controls, 'row');
        const url = `${md.global.Config.AjaxApiUrl}code/CreateQrCodeImage?url=${encodeURIComponent(
          `${md.global.Config.WebUrl}apps/task/task_${this.state.reqId}`,
        )}`;
        this.setState({
          task: allocationTask(data),
          logo: url,
          reqInfo: {
            title: htmlDecodeReg(data.taskName),
            reqNo: htmlDecodeReg(data.folder) || _l('未关联项目'),
            controls: data.controls,
            formControls: [],
          },
          controls: controlData,
        });
      });
  }
  componentDidUpdate = function () {
    $('#container, .AppHr form').addClass('hrApprovalBox');
    $('html.AppHr').addClass('hrApprovalAppHr');
  };
  /*
  获取控件呈现内容
  sourceControlType: 他表字段type
  valueItem: 他表字段valueItem；[valueItem, valueItem]
  relationItemKey: 他表字段选择关联控件，循环key
  */
  getShowContent = function (item, sourceControlType, valueItem, relationItemKey) {
    const value = sourceControlType ? valueItem : item.value;
    const type = sourceControlType || item.type;
    switch (type) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 7:
      case 19:
      case 23:
      case 24:
      case 25:
      case 32:
      case 33:
      case 10001:
      case 10002:
      case 10003:
      case 10004:
      case 10005:
      case 10006:
      case 10007:
      case 10008:
      case 10009:
        return value || '';
      case 15:
        return value ? moment(value).format('YYYY-MM-DD') : '';
      case 16:
        return value ? moment(value).format('YYYY-MM-DD HH:mm') : '';
      case 36:
        return value === '1' ? '✓' : '';
      case 6:
      case 8:
        const newvalue = value ? Number(value).toFixed(item.dot) : '';
        return (
          <div style={{ textAlign: item.isRelateMultipleSheet ? 'right' : 'left' }}>
            {newvalue
              ? (newvalue.indexOf('.') > -1
                  ? newvalue.toString().replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
                  : newvalue.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1,')) + (item.unit ? item.unit : '')
              : ''}
          </div>
        );
      case 20:
      case 31:
      case 37:
        const _value = value ? Number(value).toFixed(item.dot) : '';
        return _value
          ? (_value.indexOf('.') > -1
              ? _value.toString().replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
              : _value.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1,')) + (item.unit ? item.unit : '')
          : '';
      case 9: {
        const selectItem = item.options.filter(optionItem => optionItem.key == value);
        return selectItem.length > 0 ? selectItem[0].value : '';
      }
      case 11: {
        if (value && item.dataSource && !item.sourceControlId) {
          try {
            return JSON.parse(JSON.parse(value).label).join(' / ') || '';
          } catch (err) {
            return JSON.parse(value).label || '';
          }
        }
        const selectItem = item.options.filter(optionItem => optionItem.key == value);
        return selectItem.length > 0 ? selectItem[0].value : '';
      }
      case 10: {
        let text = '';
        if (value) {
          const keys = [];
          for (let i = 0; i < value.length; i++) {
            if (value[i] !== '0') {
              keys.push('1' + value.slice(i + 1).replace(/1/g, 0));
            }
          }
          text = item.options
            .filter(option => keys.indexOf(option.key) > -1)
            .map(option => option.value)
            .join(',');
        }
        return text;
      }
      case 14:
        if (this.state.type === 'worksheet' || this.state.type === 'workflow') {
          return this.renderRecordAttachments(value, item.isRelateMultipleSheet);
        }
        return value
          ? JSON.parse(value)
              .map(item => item.originalFilename)
              .join(',')
          : ' ';
      case 17: {
        let showContent = '';
        if (value) {
          let newValue = '';
          if (this.state.type === 'worksheet' || this.state.type === 'workflow') {
            try {
              newValue =
                JSON.parse(value).filter(item => item).length > 0
                  ? JSON.parse(value).map(item => {
                      return item ? moment(item).format('x') : '';
                    })
                  : '';
            } catch (error) {
              newValue = value;
            }
          } else {
            newValue = value.split(',');
          }
          const days = moment(new Date(Number(newValue[1]))).diff(moment(new Date(Number(newValue[0]))), 'days') + 1; // 时间差
          if (item.enumDefault2 === 1) {
            showContent = '    ' + _l('时长:  %0天', days);
          }
          return value && newValue
            ? _l(
                '%0 至 %1',
                newValue[0] ? moment(Number(newValue[0])).format('YYYY-MM-DD') : '-',
                newValue[1] ? moment(Number(newValue[1])).format('YYYY-MM-DD') : '-',
              ) + showContent
            : '';
        }
        return null;
      }
      case 18: {
        let showContent = '';
        if (value) {
          let newValue = '';
          if (this.state.type === 'worksheet' || this.state.type === 'workflow') {
            try {
              newValue =
                JSON.parse(value).filter(item => item).length > 0
                  ? JSON.parse(value).map(item => {
                      return item ? moment(item).format('x') : '';
                    })
                  : '';
            } catch (error) {
              newValue = value;
            }
          } else {
            newValue = value.split(',');
          }
          const timeDifference = Number(newValue[1]) - Number(newValue[0]); // 时间差
          // const days = Math.floor(timeDifference / (24 * 3600 * 1000)); // 时间差转化成天数
          // const leave1 = timeDifference % (24 * 3600 * 1000); // 计算天数后剩余的毫秒数
          const hours = Number(timeDifference / (3600 * 1000)).toFixed(1); // 相差的小时
          if (item.enumDefault2 === 1) {
            showContent = `    ${_l('时长')}: ${_l('%0小时', hours)}`;
            if (this.state.type === 'worksheet' || this.state.type === 'workflow') {
              const time = Number(newValue[1]) - Number(newValue[0]);
              // 计算出相差天数
              const days = Math.floor(time / (24 * 3600 * 1000));
              // 计算出小时数
              const leave1 = time % (24 * 3600 * 1000);
              // 计算天数后剩余的毫秒数
              const hours = Math.floor(leave1 / (3600 * 1000));
              // 计算相差分钟数
              const leave2 = leave1 % (3600 * 1000);
              // 计算小时数后剩余的毫秒数
              const minutes = Math.floor(leave2 / (60 * 1000));
              // 计算相差秒数
              const leave3 = leave2 % (60 * 1000);
              // 计算分钟数后剩余的毫秒数
              const seconds = Math.round(leave3 / 1000);

              showContent = `    ${_l('时长')}: ${days > 0 ? _l('%0天', days) : ''} ${
                hours > 0 ? _l('%0小时', hours) : ''
              } ${minutes > 0 ? _l('%0分钟', minutes) : ''} `;
            }
          }
          return value && newValue
            ? _l(
                '%0 至 %1',
                newValue[0] ? moment(Number(newValue[0])).format('YYYY-MM-DD HH:mm') : '-',
                newValue[1] ? moment(Number(newValue[1])).format('YYYY-MM-DD HH:mm') : '-',
              ) + showContent
            : '';
        }
        return null;
      }
      case 20:
        return value ? item.value + item.unit : '';
      case 21: {
        if (value) {
          const getTypeName = type => {
            switch (type) {
              case 1:
                return _l('任务') + _l('：');
              case 2:
                return _l('项目') + _l('：');
              case 3:
                return _l('日程') + _l('：');
              case 4:
                return _l('文件') + _l('：');
              case 5:
                return _l('申请单') + _l('：');
              case 7:
                return _l('重复日程') + _l('：');
            }
          };
          const relationshipItem = (relationValueItem, index) => {
            return (
              <div className="relationshipItem" key={item.controlId + '-relationValueItem-' + index}>
                <span className="typeName">{getTypeName(relationValueItem.type)}</span>
                <span className="name">{relationValueItem.name} </span>
                {/* <span className="link"> {relationValueItem.link}</span>*/}
              </div>
            );
          };
          const newValue = JSON.parse(value);
          const content = (
            <div key={relationItemKey || item.controlId} className="relationshipBox">
              {newValue.map((relationValueItem, index) => relationshipItem(relationValueItem, index))}
            </div>
          );
          return content;
        }
        return '';
      }
      case 26:
        return value
          ? this.state.type === 'worksheet' || this.state.type === 'workflow'
            ? JSON.parse(value)
                .map(item => item.fullname)
                .join(',')
            : JSON.parse(value).fullname
          : '';
      case 27:
        return value
          ? _.isArray(JSON.parse(value))
            ? JSON.parse(value)[0]
              ? JSON.parse(value)[0].departmentName
              : ''
            : JSON.parse(value).departmentName
          : '';
      case 28:
        return value ? (item.enumDefault === 1 ? value + '星' : value + '/10') : '';
      case 29:
        if (item.enumDefault === 1) {
          let records = [];
          try {
            records = JSON.parse(value);
          } catch (err) {}
          return records
            .map(
              r =>
                renderCellText(Object.assign({}, item, { value: r.name, type: item.sourceControlType })) ||
                _l('未命名') ||
                _l('未命名'),
            )
            .join('，');
        } else {
          const { relateRecords } = this.state;
          if (relateRecords && relateRecords[item.controlId]) {
            return this.renderTable(relateRecords[item.controlId], item);
          } else {
            return (
              <div className="textCenter">
                <LoadDiv />
              </div>
            );
          }
        }
      case 30: {
        const showContent = this.getShowContent(item, item.sourceControlType, value, item.controlId);
        return showContent || '';
      }
      case 40: {
        let location;
        try {
          location = JSON.parse(value);
        } catch (err) {
          return '';
        }
        return location.title + ' ' + location.address;
      }
      case 38: {
        const { enumDefault, unit } = item;
        let content;
        if (!value) {
          content = '';
        } else {
          content = enumDefault === 1 ? formatFormulaDate({ value, unit }) : value;
        }
        return content;
      }
      case 41: {
        return <div className="richText" dangerouslySetInnerHTML={{ __html: value }}></div>;
      }
      case 42: {
        return <img src={value} style={{ width: 168 }} />;
      }
      case 10010:
        return <div className="richText" dangerouslySetInnerHTML={{ __html: value }}></div>;
      default:
        break;
    }
  };
  renderRecordAttachments(value, isRelateMultipleSheet) {
    let attachments;
    try {
      attachments = JSON.parse(value);
    } catch (err) {
      return <span className="mBottom5 InlineBlock" dangerouslySetInnerHTML={{ __html: '&nbsp;' }}></span>;
    }
    const pictureAttachments = attachments.filter(attachment => File.isPicture(attachment.ext));
    const otherAttachments = attachments.filter(attachment => !File.isPicture(attachment.ext));
    return (
      <div className={cx('recordAttachments', { isMultiple: isRelateMultipleSheet })}>
        {!!pictureAttachments.length && (
          <div className={cx('recordAttachmentPictures', { bottomNoLine: !otherAttachments.length })}>
            {[
              ...new Array(
                isRelateMultipleSheet ? pictureAttachments.length : Math.ceil(pictureAttachments.length / 2) * 2,
              ),
            ].map((a, index) => (
              <div className="pictureAttachment">
                {pictureAttachments[index] && (
                  <div className="imgCon">
                    <img
                      src={
                        pictureAttachments[index].previewUrl.slice(
                          0,
                          pictureAttachments[index].previewUrl.indexOf('?'),
                        ) + '?imageMogr2/auto-orient/thumbnail/1200x600/q/90'
                      }
                      alt=""
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {isRelateMultipleSheet ? (
          <div className="recordAttachmentPictures">
            {otherAttachments.map(item => (
              <div className="pictureAttachment onlyText">
                <p className="imageAttachmentName ellipsis"> {item.originalFilename + item.ext} </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="otherAttachments mTop4">
            <div className="pictureAttachment">
              {otherAttachments.map(item => item.originalFilename + item.ext).join(', ')}
            </div>
          </div>
        )}
      </div>
    );
  }
  renderTable(relateRecord, control) {
    const { detailsType } = this.state;
    const controls = control.showControls
      .map(controlId => _.find(relateRecord.template.controls.concat(systemControl), c => c.controlId === controlId))
      .filter(c => c && !((c.type === 29 && c.enumDefault === 2) || c.type === 41));
    return detailsType === 2 ? (
      <table className="detailsTable" style={{ tableLayout: 'fixed' }} cellpadding="0" cellspacing="0">
        <tr>
          {[<td width="20"></td>].concat(
            controls.map(c => <th style={c.type === 14 ? { width: 200 } : {}}>{c.controlName || ''}</th>),
          )}
        </tr>
        {relateRecord.data.map((item, i) => (
          <tr>
            {[<td> {i + 1} </td>].concat(
              controls.map(c => (
                <td className="textPreLine">
                  {this.getShowContent(Object.assign({}, c, { value: item[c.controlId], isRelateMultipleSheet: true }))}
                </td>
              )),
            )}
          </tr>
        ))}
      </table>
    ) : (
      <div className="verticalLayout">
        {relateRecord.data.map((item, i) => (
          <table className="detailItem" cellpadding="0" cellspacing="0" style={{ tableLayout: 'fixed' }}>
            {_.chunk(controls, 4).map((rowData, rowIndex) => (
              <tr className="detailItemControlRow">
                {rowIndex === 0 && (
                  <td
                    rowSpan={Math.ceil(controls.length / 4)}
                    width="30"
                    className="detailRowItem verticalLayoutRowNum"
                  >
                    {i + 1}
                  </td>
                )}
                {[...new Array(4)].map((c, colIndex) => (
                  <td className="detailRowItem">
                    <span className="Bold TxtMiddle mLeft10">
                      {rowData[colIndex] && (rowData[colIndex].controlName || '')}
                    </span>
                    <span className="detailValue TxtMiddle mLeft20">
                      {rowData[colIndex] &&
                        this.getShowContent(
                          Object.assign({}, rowData[colIndex], {
                            value: item[rowData[colIndex].controlId],
                            isRelateMultipleSheet: true,
                          }),
                        )}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </table>
        ))}
      </div>
    );
  }
  getEvaluateValue = function (controls, mapControl) {
    const controlId = mapControl.controlId;
    const evaluateType = mapControl.enumDefault2;
    const showMoney = mapControl.enumDefault;
    const { unit, dot } = mapControl;
    const controlArray = [];
    controls.forEach(item => {
      controlArray.push(
        Number((item.filter(controlItem => controlItem.controlId === controlId)[0] || { value: '' }).value),
      );
    });
    let result;
    switch (evaluateType) {
      case 2: {
        let evaluateValue = 0;
        controlArray.forEach(item => {
          evaluateValue = accAdd(evaluateValue, item);
        });
        result = evaluateValue;
        break;
      }
      case 3: {
        let evaluateValue = 0;
        controlArray.forEach(item => {
          evaluateValue = accAdd(evaluateValue, item);
        });
        result = accDiv(evaluateValue, controlArray.length);
        break;
      }
      case 4: {
        result = _.min(controlArray);
        break;
      }
      case 5: {
        result = _.max(controlArray);
        break;
      }
      case 6: {
        let evaluateValue = 1;
        controlArray.forEach(item => {
          evaluateValue = accMul(evaluateValue, item);
        });
        result = evaluateValue;
        break;
      }
    }
    result = evaluateType !== 2 ? result.toFixed(dot).toString() : result.toString();
    const montyCn = mapControl.type === 8 && showMoney ? nzhCn.toMoney(result).substring(3) : '';
    result =
      (result.indexOf('.') > -1
        ? result.toString().replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
        : result.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1,')) + (unit || '');
    return (
      <span>
        {result}
        <span className="Block">{montyCn}</span>
      </span>
    );
  };
  showPrintDialog = function () {
    const controlOption = this.state.controlOption || [];
    if (controlOption.length === 0) {
      this.state.reqInfo.controls
        .filter(item => !item.printHide)
        .forEach((item, index) => {
          if (item && item.controlId) {
            controlOption.push(item.controlId);
          }
        });
      this.state.reqInfo.formControls.forEach(formControlItem => {
        if (formControlItem.tempControls.filter(item => item.needEvaluate).length > 0) {
          controlOption.push('formDetailEvaluate-' + formControlItem.formId);
        }
      });
    }
    this.setState({ showPrintDialog: true, printCheckAll: this.state.printCheckAll, controlOption });
  }.bind(this);
  changePrintVisible = function (processOption, printCheckAll, controlOption, options) {
    let controls = [];
    if (this.state.type === 'worksheet') {
      controls = this.state.rowInfo.controls;
    } else {
      controls = this.state.reqInfo.controls;
    }
    const formDetailEvaluate = [];
    // 单独把统计的打印放到一个数组
    controlOption
      .filter(item => item.indexOf('formDetailEvaluate-') > -1)
      .forEach(evaluateItem => {
        formDetailEvaluate.push(evaluateItem.split('-')[1]);
      });
    // printDetailType:打印明细的类型  1：明细和统计都打印 2：只打印明细 3：只打印统计
    if (controlOption !== 'all') {
      const newControls = controls.filter(item => controlOption.indexOf(item.controlId) > -1);
      newControls.forEach((item, index) => {
        if (item.type === 0) {
          newControls[index].printDetailType = 2;
        }
      });
      formDetailEvaluate.forEach(item => {
        if (newControls.filter(newControlItem => newControlItem.controlId === item).length > 0) {
          newControls.forEach((controlsItem, index) => {
            if (controlsItem.controlId === item) {
              newControls[index].printDetailType = 1;
            }
          });
        } else {
          const newDetail = controls.filter(controlItem => controlItem.controlId === item)[0];
          newDetail.printDetailType = 3;
          newControls.push(newDetail);
        }
      });
      controls = newControls;
    } else {
      controls.forEach((item, index) => {
        if (item.type === 0) {
          controls[index].printDetailType = 1;
        }
      });
    }
    const controlData = _.groupBy(controls, 'row');
    if (this.state.type === 'worksheet' || this.state.type === 'task' || this.state.type === 'workflow') {
      this.setState({
        showPrintDialog: false,
        configOptions: Object.assign({}, this.state.configOptions, options),
        controlOption,
        printCheckAll,
        controls: controlData,
      });
    } else if (this.state.type === 'hr') {
      this.state.reqWorks.manageList.forEach(manageItem => {
        manageItem.workType = 2;
      });
      const newWorkList = JSON.parse(JSON.stringify(this.state.reqWorks));
      if (processOption === 'some') {
        newWorkList.taskList.forEach(taskItem => {
          if (taskItem.countersignType) {
            taskItem.workItems.forEach(countersignItem => {
              countersignItem.workItemLogList = countersignItem.workItemLogList.filter(
                countersignWorkItem =>
                  countersignWorkItem.action === 4 ||
                  countersignWorkItem.action === 5 ||
                  countersignWorkItem.action === 8 ||
                  countersignWorkItem.action === 16 ||
                  countersignWorkItem.action === 17 ||
                  countersignWorkItem.action === 18,
              );
            });
          } else {
            taskItem.workItemLogList = taskItem.workItemLogList.filter(
              item =>
                item.action === 4 ||
                item.action === 5 ||
                item.action === 8 ||
                item.action === 16 ||
                item.action === 17 ||
                item.action === 18,
            );
          }
        });
        newWorkList.manageList.forEach(manageItem => {
          manageItem.workItemLogList = manageItem.workItemLogList.filter(
            item =>
              item.action === 12 ||
              item.action === 14 ||
              item.action === 15 ||
              item.action === 20 ||
              item.action === 21,
          );
        });
      }
      const workList = newWorkList.taskList.concat(newWorkList.manageList);
      this.setState({
        showPrintDialog: false,
        processOption,
        controlOption,
        printCheckAll,
        taskList: processOption === 'no' ? [] : newWorkList.taskList,
        manageList: processOption === 'no' ? [] : newWorkList.manageList,
        printWorkList: workList,
        controls: controlData,
      });
    }
  }.bind(this);
  getEvaluateType = function (detailsEvaluateItem) {
    switch (detailsEvaluateItem.enumDefault2) {
      case 2:
        return _l('求和');
      case 3:
        return _l('平均值');
      case 4:
        return _l('最小值');
      case 5:
        return _l('最大值');
      case 6:
        return _l('乘积');
    }
  };
  beforeControlIsDetail = function (key) {
    const { type } = this.state;
    if (type !== 'hr') {
      return false;
    }
    if (this.state.controls[Number(key) - 1]) {
      if (this.state.controls[Number(key) - 1][0].type === 0) {
        return true;
      }
      return false;
    } else if (Number(key) - 1 >= 0) {
      return this.beforeControlIsDetail(Number(key) - 1);
    }
  }.bind(this);
  renderTaskItem(name, value, key, classname) {
    return (
      <tr className="row clearfix Relative notDetails" key={key}>
        <td className="noHalf rowItem BorderRight0 taskRowItem" colSpan={1}>
          <span className="controlName TxtMiddle">{name}</span>
          <span className={cx('controlValue TxtMiddle', classname)} style={{ width: 'calc(100% - 150px)' }}>
            {value}
          </span>
        </td>
      </tr>
    );
  }
  renderTaskHeader() {
    const { task } = this.state;
    return (
      <table className="formDetail mBottom32" cellPadding="0" cellSpacing="0" style={{ fontSize: this.state.fontSize }}>
        <tbody>
          {task.map(item => item.show && !item.independent && this.renderTaskItem(item.name, item.value, item.key))}
        </tbody>
      </table>
    );
  }
  renderTaskInventory() {
    const { task } = this.state;
    const result = task.filter(item => item.key === 'checklist')[0];
    const checklist = result.value;
    return checklist.map((item, checklistIndex) => (
      <div className="workDetail clearfix" style={{ display: result.show ? 'block' : 'none' }} key={checklistIndex}>
        <div className="workName Bold">
          <h3>{`${item.checkListName} ${item.checkListData.reduce((count, item) => count + (item.status ? 1 : 0), 0)}/${
            item.checkListData.length
          }`}</h3>
        </div>
        <div className="workPersons">
          <table
            className="formDetail taskInventory"
            cellPadding="0"
            cellSpacing="0"
            style={{ fontSize: this.state.fontSize }}
          >
            <tbody>
              {item.checkListData.map((item, index) =>
                this.renderTaskItem(index + 1, item.name, index, item.status ? 'lineThrough' : ''),
              )}
            </tbody>
          </table>
          {item.checkListData.length ? undefined : <div style={{ borderBottom: '1px solid #555' }}></div>}
        </div>
      </div>
    ));
  }
  renderTaskSubTask() {
    const { task } = this.state;
    const result = task.filter(item => item.key === 'subTask')[0];
    const subTask = result.value;
    const completedCount = subTask.reduce((count, item) => count + (item.status ? 1 : 0), 0);
    return (
      <div className="workDetail clearfix" style={{ display: result.show ? 'block' : 'none' }}>
        <div className="workName Bold">
          <h3>{`${result.name} ${completedCount}/${subTask.length}`}</h3>
        </div>
        <div className="workPersons">
          <table
            className="formDetail taskSubTask"
            cellPadding="0"
            cellSpacing="0"
            style={{ fontSize: this.state.fontSize }}
          >
            <tbody>
              {subTask.map((item, index) =>
                this.renderTaskItem(index + 1, item.name, index, item.status ? 'lineThrough' : ''),
              )}
            </tbody>
          </table>
          {subTask.length ? undefined : <div style={{ borderBottom: '1px solid #555' }}></div>}
        </div>
      </div>
    );
  }
  renderControls() {
    const colSpan =
      Object.keys(this.state.controls).filter(item => this.state.controls[item].length > 1).length > 0 ? 2 : 1;
    const { params } = this.props.match;
    return (
      <table
        className="formDetail"
        cellPadding="0"
        cellSpacing="0"
        id="formDetail"
        style={{ fontSize: this.state.fontSize }}
      >
        <tbody>
          {params.printType === 'hr' && (
            <tr className="row clearfix Relative notDetails">
              <td className="noHalf rowItem BorderRight0" colSpan={colSpan}>
                <span className="controlName TxtMiddle">{_l('标题')}</span>
                <span className="controlValue TxtMiddle" style={{ width: 'calc(100% - 105px)' }}>
                  {this.state.reqInfo.reqTitle}
                </span>
              </td>
            </tr>
          )}
          {Object.keys(this.state.controls).map(key => {
            const controlItem = this.state.controls[key];
            if (controlItem.length === 1) {
              if (controlItem[0].type === 0 && !controlItem[0].printHide) {
                if (this.state.detailsType === 2) {
                  return (
                    <tr
                      key={key}
                      className={cx(
                        'details row clearfix',
                        key !== '0' && this.beforeControlIsDetail(key) && 'borderTop0',
                      )}
                    >
                      <td className="rowItem detailsRowItem" colSpan={colSpan}>
                        <div
                          className={cx('detailsName Bold', key !== '0' && this.beforeControlIsDetail(key) && 'mTop0')}
                        >
                          {controlItem[0].controlName}
                        </div>
                        <table className="detailsTable" cellPadding="0" cellSpacing="0">
                          <tbody>
                            <tr>
                              <th className="titleTd" style={{ width: 25 }} />
                              {this.state.formControls
                                .filter(item => item.formId === controlItem[0].formId)[0]
                                .tempControls.sort((a, b) => a.innerRow - b.innerRow)
                                .map((tempControlItem, index) =>
                                  (tempControlItem.type === 17 || tempControlItem.type === 18) &&
                                  tempControlItem.dataSource &&
                                  tempControlItem.dataSource !== 0 &&
                                  typeof tempControlItem.value !== 'string' ? (
                                    tempControlItem.value.map((item2, index2) => (
                                      <th
                                        style={{
                                          width:
                                            975 /
                                            (this.state.formControls.filter(
                                              item => item.formId === controlItem[0].formId,
                                            )[0].tempControls.length +
                                              this.state.formControls
                                                .filter(item => item.formId === controlItem[0].formId)[0]
                                                .tempControls.filter(
                                                  item =>
                                                    (item.type === 17 || item.type === 18) &&
                                                    item.dataSource &&
                                                    item.dataSource !== 0 &&
                                                    typeof item.value !== 'string',
                                                ).length *
                                                3),
                                        }}
                                        key={key + 'th' + index + 'dataTh' + index2}
                                      >
                                        {item2.controlName}
                                      </th>
                                    ))
                                  ) : (
                                    <th
                                      style={{
                                        width:
                                          975 /
                                          (this.state.formControls.filter(
                                            item => item.formId === controlItem[0].formId,
                                          )[0].tempControls.length +
                                            this.state.formControls
                                              .filter(item => item.formId === controlItem[0].formId)[0]
                                              .tempControls.filter(
                                                item =>
                                                  (item.type === 17 || item.type === 18) &&
                                                  item.dataSource &&
                                                  item.dataSource !== 0 &&
                                                  typeof item.value !== 'string',
                                              ).length *
                                              3),
                                      }}
                                      key={key + 'th' + index}
                                    >
                                      {tempControlItem.controlName}
                                    </th>
                                  ),
                                )}
                            </tr>
                            {(controlItem[0].printDetailType === 1 || controlItem[0].printDetailType === 2) &&
                              this.state.formControls
                                .filter(item => item.formId === controlItem[0].formId)[0]
                                .controls.map((detailsChildItem, index) => (
                                  <tr key={key + 'tr' + index}>
                                    <td className="titleTd">{index + 1}</td>
                                    {detailsChildItem
                                      .sort((a, b) => a.innerRow - b.innerRow)
                                      .map((detailsChildItemControl, index2) =>
                                        (detailsChildItemControl.type === 17 || detailsChildItemControl.type === 18) &&
                                        detailsChildItemControl.dataSource &&
                                        detailsChildItemControl.dataSource !== 0 &&
                                        typeof detailsChildItemControl.value !== 'string' ? (
                                          detailsChildItemControl.value.map((item2, index3) => (
                                            <td
                                              className={cx(
                                                (detailsChildItemControl.type === 6 ||
                                                  detailsChildItemControl.type === 8 ||
                                                  detailsChildItemControl.type === 20) &&
                                                  'TxtRight',
                                              )}
                                              style={{ width: 975 / detailsChildItem.length }}
                                              key={key + 'td' + index2 + 'dataTd' + index3}
                                            >
                                              {this.getShowContent(item2)}
                                            </td>
                                          ))
                                        ) : (
                                          <td
                                            className={cx(
                                              (detailsChildItemControl.type === 6 ||
                                                detailsChildItemControl.type === 8 ||
                                                detailsChildItemControl.type === 20) &&
                                                'TxtRight',
                                            )}
                                            style={{ width: 975 / detailsChildItem.length }}
                                            key={key + 'td' + index2}
                                          >
                                            {this.getShowContent(detailsChildItemControl)}
                                          </td>
                                        ),
                                      )}
                                  </tr>
                                ))}
                            {this.state.formControls
                              .filter(item => item.formId === controlItem[0].formId)[0]
                              .tempControls.filter(item => item.needEvaluate).length > 0 &&
                              (controlItem[0].printDetailType === 1 || controlItem[0].printDetailType === 3) && (
                                <tr key={key + 'evaluateTr'} className="evaluateTr">
                                  <td className="titleTd">=</td>
                                  {this.state.formControls
                                    .filter(item => item.formId === controlItem[0].formId)[0]
                                    .tempControls.map((detailsEvaluateItem, index) => (
                                      <td
                                        style={{
                                          width:
                                            975 /
                                            this.state.formControls.filter(
                                              item => item.formId === controlItem[0].formId,
                                            )[0].tempControls.length,
                                        }}
                                        key={key + 'evaluateTd' + index}
                                      >
                                        {detailsEvaluateItem.needEvaluate
                                          ? this.getEvaluateType(detailsEvaluateItem) + ':'
                                          : ''}
                                        {detailsEvaluateItem.needEvaluate
                                          ? this.getEvaluateValue(
                                              this.state.formControls.filter(
                                                item => item.formId === controlItem[0].formId,
                                              )[0].controls,
                                              detailsEvaluateItem,
                                              detailsEvaluateItem.controlId,
                                              detailsEvaluateItem.enumDefault2,
                                              detailsEvaluateItem.unit,
                                              detailsEvaluateItem.dot,
                                              detailsEvaluateItem.enumDefault,
                                            )
                                          : ''}
                                      </td>
                                    ))}
                                </tr>
                              )}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  );
                }
                return (
                  <tr
                    key={key}
                    className={cx(
                      'details row clearfix',
                      key !== '0' && this.beforeControlIsDetail(key) && 'borderTop0',
                    )}
                  >
                    <td className="rowItem detailsRowItem" colSpan={colSpan}>
                      <div
                        className={cx('detailsName Bold', key !== '0' && this.beforeControlIsDetail(key) && 'mTop0')}
                      >
                        {controlItem[0].controlName}
                      </div>
                      {(() => {
                        if (controlItem[0].printDetailType === 1 || controlItem[0].printDetailType === 2) {
                          return this.state.formControls
                            .filter(item => item.formId === controlItem[0].formId)[0]
                            .controls.map((detailItem, index1) => (
                              <table className="detailItem" key={index1} cellPadding="0" cellSpacing="0">
                                <tbody>
                                  {(() => {
                                    const newItemControl = [];
                                    detailItem.forEach(detailItemChildrenItem => {
                                      if (
                                        (detailItemChildrenItem.type === 17 || detailItemChildrenItem.type === 18) &&
                                        detailItemChildrenItem.dataSource &&
                                        detailItemChildrenItem.dataSource !== 0 &&
                                        typeof detailItemChildrenItem.value !== 'string'
                                      ) {
                                        detailItemChildrenItem.innerRow = -1;
                                      }
                                    });
                                    detailItem
                                      .filter(item => item.innerRow < 0)
                                      .map(item2 => newItemControl.push(item2.value));
                                    const newDetailItem = detailItem.filter(item => item.innerRow >= 0);
                                    newDetailItem
                                      .sort((a, b) => a.innerRow - b.innerRow)
                                      .forEach((item, index) => {
                                        if (index % 4 === 0) {
                                          if (
                                            newDetailItem[index + 1] &&
                                            newDetailItem[index + 2] &&
                                            newDetailItem[index + 3]
                                          ) {
                                            newItemControl.push([
                                              item,
                                              newDetailItem[index + 1],
                                              newDetailItem[index + 2],
                                              newDetailItem[index + 3],
                                            ]);
                                          } else if (newDetailItem[index + 1] && newDetailItem[index + 2]) {
                                            newItemControl.push([
                                              item,
                                              newDetailItem[index + 1],
                                              newDetailItem[index + 2],
                                            ]);
                                          } else if (newDetailItem[index + 1]) {
                                            newItemControl.push([item, newDetailItem[index + 1]]);
                                          } else {
                                            newItemControl.push([item]);
                                          }
                                        }
                                      });
                                    return newItemControl.map((newControlRow, index2) => (
                                      <tr className="clearfix detailItemControlRow" key={'newControlRow' + index2}>
                                        {index2 === 0 && (
                                          <td className="detailItemName" rowSpan={newItemControl.length}>
                                            {index1 + 1}
                                          </td>
                                        )}
                                        {newControlRow.map((newControlRowItem, index) => (
                                          <td
                                            style={{
                                              width:
                                                newControlRow.length === 1
                                                  ? '97.5%'
                                                  : newControlRow.length === 2
                                                  ? '48.75%'
                                                  : '24.375%',
                                            }}
                                            className="clearfix detailRowItem"
                                            colSpan={
                                              newControlRow.length === 2 ? '2' : newControlRow.length === 1 ? '4' : '1'
                                            }
                                            key={'newControlRowItem' + index}
                                          >
                                            <span className="detailName TxtMiddle">
                                              {newControlRowItem.controlName}
                                            </span>
                                            <span
                                              className="detailValue TxtMiddle"
                                              style={{ width: 'calc(100% - 105px)' }}
                                            >
                                              {this.getShowContent(newControlRowItem)}
                                            </span>
                                          </td>
                                        ))}
                                        {newControlRow.length === 3 && <td style={{ width: '24.375%' }} />}
                                      </tr>
                                    ));
                                  })()}
                                </tbody>
                              </table>
                            ));
                        }
                      })()}
                      {this.state.formControls
                        .filter(item => item.formId === controlItem[0].formId)[0]
                        .tempControls.filter(item => item.needEvaluate).length > 0 &&
                        (controlItem[0].printDetailType === 1 || controlItem[0].printDetailType === 3) && (
                          <div className="evaluateItemBox">
                            {(() => {
                              const tempControls = this.state.formControls
                                .filter(item => item.formId === controlItem[0].formId)[0]
                                .tempControls.filter(item => item.needEvaluate);
                              const newTempControls = [];
                              tempControls
                                .sort((a, b) => a.innerRow - b.innerRow)
                                .forEach((item, index) => {
                                  if (index % 4 === 0) {
                                    if (tempControls[index + 1] && tempControls[index + 2] && tempControls[index + 3]) {
                                      newTempControls.push([
                                        item,
                                        tempControls[index + 1],
                                        tempControls[index + 2],
                                        tempControls[index + 3],
                                      ]);
                                    } else if (tempControls[index + 1] && tempControls[index + 2]) {
                                      newTempControls.push([item, tempControls[index + 1], tempControls[index + 2]]);
                                    } else if (tempControls[index + 1]) {
                                      newTempControls.push([item, tempControls[index + 1]]);
                                    } else {
                                      newTempControls.push([item]);
                                    }
                                  }
                                });
                              return (
                                <table className="evaluateItem" cellPadding="0" cellSpacing="0">
                                  <tbody>
                                    {newTempControls.map((newTempControlRow, index2) => (
                                      <tr className="clearfix detailEvaluateRow" key={'newTempControlRow' + index2}>
                                        {index2 === 0 && (
                                          <td className="evaluateItemName" rowSpan={newTempControls.length}>
                                            =
                                          </td>
                                        )}
                                        {newTempControlRow.map((newTempControlRowItem, index) => (
                                          <td
                                            style={{
                                              width:
                                                newTempControlRow.length === 1
                                                  ? '97.5%'
                                                  : newTempControlRow.length === 2
                                                  ? '48.75%'
                                                  : '24.375%',
                                            }}
                                            className="clearfix detailEvaluateRowItem"
                                            colSpan={
                                              newTempControlRow.length === 2
                                                ? '2'
                                                : newTempControlRow.length === 1
                                                ? '4'
                                                : '1'
                                            }
                                            key={'newTempControlRowItem' + index}
                                          >
                                            <span className="evaluateName Bold TxtMiddle">
                                              {newTempControlRowItem.controlName}
                                              {this.getEvaluateType(newTempControlRowItem)}
                                            </span>
                                            <span
                                              style={{ width: 'calc(100% - 105px)' }}
                                              className="evaluateValue TxtMiddle"
                                            >
                                              {this.getEvaluateValue(
                                                this.state.formControls.filter(
                                                  item => item.formId === controlItem[0].formId,
                                                )[0].controls,
                                                newTempControlRowItem,
                                                newTempControlRowItem.controlId,
                                                newTempControlRowItem.enumDefault2,
                                                newTempControlRowItem.unit,
                                                newTempControlRowItem.dot,
                                              )}
                                            </span>
                                          </td>
                                        ))}
                                        {newTempControlRow.length === 3 && <td style={{ width: '24.375%' }} />}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              );
                            })()}
                          </div>
                        )}
                    </td>
                  </tr>
                );
              } else if (controlItem[0].type === 29 && controlItem[0].enumDefault === 2) {
                return (
                  <tr
                    key={key}
                    className={cx(
                      'details row clearfix',
                      key !== '0' && this.beforeControlIsDetail(key) && 'borderTop0',
                    )}
                  >
                    <td className="rowItem detailsRowItem" colSpan={colSpan}>
                      <div
                        className={cx('detailsName Bold', key !== '0' && this.beforeControlIsDetail(key) && 'mTop0')}
                      >
                        {controlItem[0].controlName}
                      </div>
                      {this.getShowContent(controlItem[0])}
                    </td>
                  </tr>
                );
              } else if (
                (controlItem[0].type === 17 || controlItem[0].type === 18) &&
                typeof controlItem[0].value !== 'string' &&
                !controlItem[0].printHide
              ) {
                if (controlItem[0].dataSource && controlItem[0].dataSource !== 0) {
                  return controlItem[0].value.map((dataItem, dataIndex) => (
                    <tr key={'dataTime' + dataIndex} className="row clearfix Relative notDetails">
                      <td
                        style={{
                          borderTopColor:
                            key !== '0' && dataIndex === 0 && this.beforeControlIsDetail(key) ? '#555' : '#bbb',
                        }}
                        className="noHalf rowItem BorderRight0"
                        colSpan={colSpan}
                      >
                        <span className="controlName TxtMiddle">{dataItem.controlName}</span>
                        <span style={{ width: 'calc(100% - 105px)' }} className="controlValue TxtMiddle">
                          {this.getShowContent(dataItem)}
                        </span>
                      </td>
                    </tr>
                  ));
                }
                return (
                  <tr
                    key={key}
                    className={cx('row clearfix Relative notDetails', controlItem[0].type === 10010 && 'remarks')}
                  >
                    <td
                      style={{
                        borderTopColor: key !== '0' && this.beforeControlIsDetail(key) ? '#555' : '#bbb',
                      }}
                      className="noHalf rowItem BorderRight0"
                      colSpan={colSpan}
                    >
                      <span className="controlName TxtMiddle">{controlItem[0].controlName}</span>
                      <span
                        style={{ width: 'calc(100% - 105px)' }}
                        className={cx('controlValue TxtMiddle', controlItem[0].type === 2 && 'textPreLine')}
                      >
                        {this.getShowContent(controlItem[0])}
                      </span>
                    </td>
                  </tr>
                );
              } else if (controlItem[0].type === 22 && !controlItem[0].printHide) {
                return (
                  <tr key={key} className="noneContent clearfix">
                    <td colSpan={colSpan}>{controlItem[0].controlName ? controlItem[0].controlName : ''}</td>
                  </tr>
                );
              } else if (controlItem[0].type === 14 && !controlItem[0].printHide) {
                return this.state.type === 'worksheet' || this.state.type === 'workflow' ? (
                  <tr
                    key={key}
                    className={cx('row clearfix Relative notDetails', controlItem[0].type === 10010 && 'remarks')}
                  >
                    <td
                      style={{
                        borderTopColor: key !== '0' && this.beforeControlIsDetail(key) ? '#555' : '#bbb',
                        paddingLeft: 105,
                      }}
                      className="noHalf rowItem BorderRight0 pLeft0"
                      colSpan={colSpan}
                    >
                      <span
                        className="controlName TxtMiddle Left"
                        style={{
                          top: 6,
                          left: 0,
                        }}
                      >
                        {controlItem[0].controlName}
                      </span>
                      <span
                        className={cx('controlValue TxtMiddle Block', controlItem[0].type === 2 && 'textPreLine')}
                        style={{ width: '100%' }}
                      >
                        {this.getShowContent(controlItem[0])}
                      </span>
                    </td>
                  </tr>
                ) : null;
              } else if (!controlItem[0].printHide) {
                return (
                  <tr
                    key={key}
                    className={cx('row clearfix Relative notDetails', controlItem[0].type === 10010 && 'remarks')}
                  >
                    <td
                      style={{
                        borderTopColor:
                          key !== '0' && this.beforeControlIsDetail(key)
                            ? '#555'
                            : this.state.type !== 'hr' && key === '0'
                            ? '#555'
                            : '#bbb',
                      }}
                      className="noHalf rowItem BorderRight0"
                      colSpan={colSpan}
                    >
                      {controlItem[0].type !== 10010 && (
                        <span className="controlName TxtMiddle">{controlItem[0].controlName}</span>
                      )}
                      <span
                        style={{ width: 'calc(100% - 105px)' }}
                        className={cx('controlValue TxtMiddle', controlItem[0].type === 2 && 'textPreLine')}
                      >
                        {this.getShowContent(controlItem[0])}
                      </span>
                    </td>
                  </tr>
                );
              } else if (controlItem[0].printHide && controlItem[0].printHide) {
                return null;
              }
            }
            return (
              controlItem.filter(item => !item.printHide).length > 0 && (
                <tr key={key} className="row clearfix Relative notDetails">
                  {/* {controlItem.filter(item => !item.printHide).length === 2 && <i className="firstLine" />}*/}
                  {!controlItem.filter(rowChildren => rowChildren.col === 0)[0].printHide && (
                    <td
                      style={{
                        borderTopColor: key !== '0' && this.beforeControlIsDetail(key) ? '#555' : '#bbb',
                      }}
                      className="half rowItem"
                    >
                      <span className="controlName TxtMiddle">
                        {controlItem.filter(rowChildren => rowChildren.col === 0)[0].controlName}
                      </span>
                      <span
                        style={{ width: 'calc(100% - 105px)' }}
                        className={cx('controlValue TxtMiddle', controlItem[0].type === 2 && 'textPreLine')}
                      >
                        {this.getShowContent(controlItem.filter(rowChildren => rowChildren.col === 0)[0])}
                      </span>
                    </td>
                  )}
                  {!(controlItem.filter(rowChildren => rowChildren.col === 1)[0]
                    ? controlItem.filter(rowChildren => rowChildren.col === 1)[0].printHide
                    : controlItem.filter(rowChildren => rowChildren.col === 0)[1].printHide) && (
                    <td
                      style={{
                        borderTopColor: key !== '0' && this.beforeControlIsDetail(key) ? '#555' : '#bbb',
                      }}
                      className="half rowItem Relative"
                    >
                      <span className="controlName TxtMiddle">
                        {controlItem.filter(rowChildren => rowChildren.col === 1)[0]
                          ? controlItem.filter(rowChildren => rowChildren.col === 1)[0].controlName
                          : controlItem.filter(rowChildren => rowChildren.col === 0)[1].controlName}
                      </span>
                      <span
                        style={{ width: 'calc(100% - 105px)' }}
                        className={cx('controlValue TxtMiddle', controlItem[1].type === 2 && 'textPreLine')}
                      >
                        {this.getShowContent(
                          controlItem.filter(rowChildren => rowChildren.col === 1)[0]
                            ? controlItem.filter(rowChildren => rowChildren.col === 1)[0]
                            : controlItem.filter(rowChildren => rowChildren.col === 0)[1],
                        )}
                      </span>
                    </td>
                  )}
                </tr>
              )
            );
          })}
        </tbody>
      </table>
    );
  }
  render() {
    const { params } = this.props.match;
    const { task, configOptions, rowInfo } = this.state;
    let { logo } = this.state;
    const code = task.filter(item => item.key === 'code')[0] || {};
    if (this.state.worksheetId && configOptions.showWorkflowQrCode && rowInfo && rowInfo.shortUrl) {
      logo = md.global.Config.AjaxApiUrl + 'code/CreateQrCodeImage?url=' + rowInfo.shortUrl;
    }
    setInterval(() => {
      if ($('.kf5-support-chat, #containerBg, #topBarContainer').length > 0) {
        $('.kf5-support-chat, #containerBg, #topBarContainer').remove();
      }
    }, 1000);
    return (
      <div className="printBox" id="hrApprovalPrint">
        {this.state.showPrintDialog && (
          <PrintOptDialog
            visible={this.state.showPrintDialog}
            changePrintVisible={this.changePrintVisible}
            options={{
              showWorkflowQrCode: configOptions.showWorkflowQrCode,
            }}
            hidePrintOptDialog={() => {
              this.setState({ showPrintDialog: false });
            }}
            reqInfo={this.state.worksheetId ? this.state.rowInfo : this.state.reqInfo}
            controlOption={this.state.controlOption}
            printCheckAll={this.state.printCheckAll}
            worksheetId={this.state.worksheetId}
            type={params.printType}
            task={_.cloneDeep(this.state.task)}
            onUpdateTask={newTask => {
              this.setState({
                task: newTask,
              });
            }}
            workflow={_.cloneDeep(this.state.workflow)}
            onUpdateWorkflow={newWorkflow => {
              this.setState({
                workflow: newWorkflow,
              });
            }}
          />
        )}
        <div className="printStartBox clearfix">
          <div className="width1000">
            <span className="contentHide InlineBlock pointer TxtMiddle" onClick={this.showPrintDialog}>
              <Icon icon="circulated" className="Gray_9e font14 mRight8 InlineBlock TxtMiddle" />
              <span className="TxtMiddle">{_l('设置打印内容显隐')}</span>
            </span>
            {(params.printType === 'hr' || params.printType === 'worksheet') && (
              <span className="TxtMiddle InlineBlock mRight60">
                <span className="TxtMiddle">{_l('明细显示方式：')}</span>
                <RadioGroup
                  className="TxtMiddle InlineBlock"
                  data={[
                    {
                      text: _l('纵向(单条明细)'),
                      value: 1,
                    },
                    {
                      text: _l('横向(列表)'),
                      value: 2,
                    },
                  ]}
                  size="small"
                  checkedValue={this.state.detailsType}
                  onChange={value => {
                    this.setState({ detailsType: value });
                  }}
                />
              </span>
            )}
            <span className="TxtMiddle InlineBlock mRight60">
              <span className="TxtMiddle">{_l('文字大小：')}</span>
              <Dropdown
                style={{ width: 140 }}
                menuStyle={{ width: 140 }}
                value={this.state.fontSize || 14}
                onChange={value => {
                  this.setState({ fontSize: value });
                }}
                data={[
                  { text: _l('标准'), value: 14 },
                  { text: _l('中'), value: 16 },
                  { text: _l('大'), value: 18 },
                ]}
              />
            </span>
            <div
              className="printButton Right pointer"
              onClick={() => {
                window.print();
                return false;
              }}
            >
              <i className="icon-print"></i>
              {_l('打印')}
            </div>
          </div>
        </div>
        {(!this.state.reqInfo && !this.state.temControl) ||
        (params.printType === 'hr' && this.state.workList.length <= 0) ? (
          <LoadDiv className="mTop64" />
        ) : (
          <div className="printContent clearfix pTop20" id="printContent">
            <div className="titleContent clearfix mBottom32">
              <div className="title TxtLeft mTop5">
                <span className="font24 reqTitle mBottom5">{this.state.printTitle || this.state.reqInfo.title}</span>
                <span className="font15 reqNo" title={this.state.reqInfo.reqNo}>
                  {params.printType === 'hr' && _l('单据编号：')}
                  {(params.printType === 'hr' || params.printType === 'task' || params.printType === 'workflow') &&
                    this.state.reqInfo.reqNo}
                  {params.printType === 'worksheet' && this.state.sheetInfo.name}
                </span>
              </div>
              <div className="logo" style={{ display: params.printType === 'task' ? (code.show ? '' : 'none') : '' }}>
                <img
                  className="img"
                  src={logo}
                  alt=""
                  style={{
                    height:
                      params.printType === 'task' ||
                      (params.printType === 'worksheet' && configOptions.showWorkflowQrCode)
                        ? 100
                        : 60,
                  }}
                />
              </div>
            </div>
            {params.printType === 'task' && this.renderTaskHeader()}
            {_.isEmpty(this.state.controls) ? undefined : this.renderControls()}
            {params.printType === 'task' && this.state.task.length && this.renderTaskInventory()}
            {params.printType === 'task' && this.state.task.length && this.renderTaskSubTask()}
            {this.state.signatureControls.length ? (
              <div className="flexRow pTop30 pBottom30 signatureContentWrapper">
                {this.state.signatureControls.map(item => (
                  <div key={item.controlId}>
                    <div className="bold">{item.controlName}</div>
                    <img className="mTop10" src={item.value} />
                  </div>
                ))}
              </div>
            ) : null}
            <div className="clearfix createBy Font14 mTop15">
              <span className="mBottom10 Right">
                {_l('打印时间：')}
                {moment().format('YYYY-MM-DD HH:mm:ss')}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
}
