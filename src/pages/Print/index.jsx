import React, { Fragment } from 'react';
import cx from 'classnames';
import Sidenav from './components/sidenav';
import Header from './components/header';
import Con from './components/content';
import { Icon, Dialog, LoadDiv } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import instance from 'src/pages/workflow/api/instanceVersion';
import './index.less';
import SaveDia from './components/saveDia';
import { fromType, typeForCon, PRINT_TYPE, DEFAULT_FONT_SIZE, FILTER_SYS } from './config';
import mdNotification from 'ming-ui/functions/notify';
import webCacheAjax from 'src/api/webCache';
import renderCellText from 'src/pages/worksheet/components/CellControls/renderText';
import { updateRulesData } from 'src/components/newCustomFields/tools/filterFn';
import axios from 'axios';
import { getControlsForPrint, sysToPrintData, isRelation } from './util';
import appManagementAjax from 'src/api/appManagement';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import _ from 'lodash';
import { addBehaviorLog } from 'src/util';
import { getFilter } from 'src/pages/worksheet/common/WorkSheetFilter/util';

class PrintForm extends React.Component {
  constructor(props) {
    super(props);
    const { match = {} } = this.props;
    let { params } = match;
    const { projectId, worksheetId, viewId, appId } = params;
    this.state = {
      params,
      printData: {
        workflow: [], // 工作流的信息
        systemControl: [],
        name: params.name,
        showData: false, // 空值是否隐藏 默认隐藏
        printOption: false, //选择平铺 //打印未选中的项
        shareType: 0, //0 = 默认，1= 内部
        approval: [],
        views: [],
      },
      isChange: false, // 当前模板是否修改
      appId,
      viewId,
      worksheetId,
      projectId,
      showSaveDia: false,
      pdfUrl: null,
      isLoading: true,
      error: false,
      ajaxUrlStr: '',
      showPdf: false,
      saveLoading: false,
      approval: [],
      useWps: false,
    };
  }
  componentWillMount = () => {
    this.getParamFn();
  };
  componentDidMount() {
    $('html').addClass('printPage');
  }
  componentWillUnmount() {
    $('html').removeClass('printPage');
    const { match = {} } = this.props;
    let { params } = match;
    const { key } = params;
    if (key) {
      webCacheAjax.clear({
        key: `${key}`,
      });
    }
  }
  getParamFn = () => {
    if (location.href.indexOf('printForm') > -1) {
      const { params = {} } = this.state;
      const { key } = params;
      webCacheAjax
        .get({
          key: `${key}`,
        })
        .then(res => {
          if (res) {
            let data = JSON.parse(res);
            this.setState(
              {
                params: {
                  ...this.state.params,
                  ...data,
                },
                printData: {
                  ...this.state.printData,
                  name: data.name,
                },
              },
              () => {
                this.getWorksheet();
              },
            );
          }
        });
    } else {
      this.getWorksheet();
    }
  };
  getWorksheet = () => {
    const { params } = this.state;
    const { worksheetId } = params;
    sheetAjax
      .getWorksheetInfo({
        worksheetId: worksheetId,
        getSwitchPermit: true,
      })
      .then(res => {
        this.setInfo(res);
      });
  };
  setInfo = res => {
    const { params } = this.state;
    const {
      printId,
      isDefault,
      from = '',
      name = '',
      attriData = {}, // 标题字段
      isBatch, // 是否批量打印
    } = params;
    this.setState(
      {
        downLoadUrl: res.downLoadUrl,
        sheetSwitchPermit: res.switches,
      },
      () => {
        if (isDefault) {
          if (params.printType === 'flow') {
            this.initWorkflow();
          } else {
            this.getData();
          }
        } else {
          this.setState({
            isLoading: false,
          });
          if (from === fromType.PRINT && printId) {
            document.title = `${name}-${isBatch ? _l('批量打印') : renderCellText(attriData) || _l('未命名')}`;
          }
          this.getDownLoadUrl(res.downLoadUrl);
        }
      },
    );
  };

  getDownLoadUrl = async downLoadUrl => {
    const { params } = this.state;
    const { worksheetId, rowId, printId, projectId, appId, viewId, fileTypeNum } = params;
    //功能模块 token枚举，3 = 导出excel，4 = 导入excel生成表，5= word打印
    const token = await appManagementAjax.getToken({ worksheetId, viewId, tokenType: 5 });
    let payload = {
      id: printId,
      rowId: rowId,
      accountId: md.global.Account.accountId,
      worksheetId,
      appId,
      projectId,
      t: new Date().getTime(),
      viewId,
      token,
    };
    $.ajax({
      url: downLoadUrl + `/Export${fileTypeNum === 5 ? 'Xlsx' : 'Word'}/Get${fileTypeNum === 5 ? 'Xlsx' : 'Word'}Path`,
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify(payload),
    })
      .done(r => {
        this.setState(
          {
            ajaxUrlStr: r.data,
          },
          () => {
            this.getFiles();
          },
        );
      })
      .fail(() => {
        this.setState({ ajaxUrlStr: 'error' });
      });
  };

  getApproval = () => {
    const { params, printData } = this.state;
    if (params.printType && params.printType === 'flow') return;
    const { worksheetId, rowId, workId } = params;
    let approvalIds = printData.approvalIds;
    let promiseList = [
      instance.getTodoList2({
        startAppId: worksheetId,
        startSourceId: rowId || printData.rowIdForQr,
        complete: true,
      }),
      instance.getTodoList2({
        startAppId: worksheetId,
        startSourceId: rowId || printData.rowIdForQr,
      }),
    ];
    Promise.all(promiseList).then(([res1, res2]) => {
      let ajaxList = [];
      let res = res1.concat(res2);
      res.forEach(item => {
        ajaxList.push(instance.get2({ id: item.id, workId }));
      });
      axios.all(ajaxList).then(resData => {
        let list = res.map((l, index) => {
          return {
            ...l,
            processInfo: resData[index],
          };
        });
        let _approval = [];
        list.forEach(item => {
          if (_approval.find(l => l.processId === item.process.parentId)) {
            let _index = _approval.findIndex(m => m.processId === item.process.parentId);
            _approval[_index].child.push({
              ...item,
              checked:
                params.type === typeForCon.NEW
                  ? true
                  : approvalIds.find(l => l === item.process.parentId)
                  ? true
                  : false,
            });
          } else {
            _approval.push({
              name: item.process.name,
              processId: item.process.parentId,
              checked:
                params.type === typeForCon.NEW
                  ? true
                  : approvalIds.find(l => l === item.process.parentId)
                  ? true
                  : false,
              child: [].concat({
                ...item,
                checked:
                  params.type === typeForCon.NEW
                    ? true
                    : approvalIds.find(l => l === item.process.parentId)
                    ? true
                    : false,
              }),
            });
          }
        });
        this.setState({
          printData: {
            ...this.state.printData,
            approval: _approval,
          },
          approval: _approval,
        });
      });
    });
  };

  getRowRelationRows = () => {
    const { printData, params } = this.state;
    const { worksheetId, rowId } = params;
    const { receiveControls = [] } = printData;
    let controls = receiveControls.filter(l => l.type === 51);
    if (controls.length === 0) return;
    let promiseList = controls.map(control => {
      const newFilter = getFilter({
        control: { ...control, recordId: rowId || printData.rowIdForQr },
        formData: receiveControls,
        filterKey: 'resultfilters',
      });

      return newFilter
        ? sheetAjax.getRowRelationRows({
            worksheetId,
            controlId: control.controlId,
            getRules: true,
            getWorksheet: true,
            keywords: '',
            pageIndex: 1,
            pageSize: 1000,
            rowId,
            filterControls: newFilter,
          })
        : [];
    });
    let _printData = _.cloneDeep(printData);
    Promise.all(promiseList).then(res => {
      printData.receiveControls.forEach((item, index) => {
        let _index = controls.findIndex(l => l.controlId === item.controlId);
        if (_index > -1 && item.type === 51) {
          _printData.receiveControls[index].relationControls = res[_index].template.controls.map(l => {
            return {
              ...l,
              checked: true,
            };
          });
          _printData.receiveControls[index].value =
            res[_index].data.length === 0 ? '' : JSON.stringify(res[_index].data);
          _printData.receiveControls[index].relationsData = res[_index];
        }
      });
      this.setState({
        printData: _printData,
      });
    });
  };

  getData = () => {
    const { params } = this.state;
    const {
      printId,
      projectId,
      worksheetId,
      rowId,
      getType,
      viewId,
      appId,
      isDefault,
      from,
      printType,
      id,
      workId,
      type,
    } = params;
    const sheetArgs = {
      id: printId,
      projectId,
      worksheetId,
      rowId,
      pageIndex: 1,
      pageSize: 100000,
      getType,
      viewId,
      appId,
      instanceId: id,
      workId: workId,
    };
    let ajaxFn = printId ? sheetAjax.getPrint(sheetArgs) : sheetAjax.getPrintTemplate(sheetArgs);
    let ajaxList = [
      ajaxFn,
      sheetAjax.getControlRules({
        //系统打印 请求规则
        worksheetId,
        type: 1, // 1字段显隐
      }),
    ];
    axios.all(ajaxList).then(resData => {
      const res = resData[0];
      if (res.resultCode === 4 && !(isDefault && from === fromType.FORMSET)) {
        this.setState({
          error: true,
          isLoading: false,
        });
        return;
      }

      const rules = resData[1];
      //通过规则计算
      let receiveControls = updateRulesData({
        rules: [typeForCon.NEW, typeForCon.EDIT].includes(type) && from === fromType.FORMSET ? [] : rules,
        recordId: rowId,
        data: res.receiveControls,
      });
      receiveControls = getControlsForPrint(receiveControls, res.relations)
        .filter(o => ![43, 49].includes(o.type) && !FILTER_SYS.includes(o.controlId))
        .filter(o =>
          printId || (!printId && type === typeForCon.NEW && from === fromType.FORMSET) // 模版打印/配置（新建模版）=> 不考虑显隐设置
            ? true
            : controlState(o).visible,
        ); //系统打印需要根据用户权限显示
      let dat = (res.receiveControls || []).filter(o => ![43, 49].includes(o.type)); //去除 文本识别 43 接口查询按钮
      let attribute = dat.find(it => it.attribute === 1);
      let attributeName = !attribute ? _l('未命名') : renderCellText(attribute) || _l('未命名');
      if (from === fromType.PRINT && printType !== 'flow') {
        document.title = printId ? `${res.name}-${attributeName}` : `${_l('系统打印')}-${attributeName}`;
      }
      let _printData = {
        ...this.state.printData,
        ..._.omit(res, ['rowId']),
        rowIdForQr: res.rowId,
        receiveControls,
        rules,
        attributeName,
        font: Number(res.font || DEFAULT_FONT_SIZE),
        orderNumber: dat
          .filter(control => isRelation(control))
          .map(it => {
            // res.orderNumber取消序号呈现的关联表id
            return { receiveControlId: it.controlId, checked: !(res.orderNumber || []).includes(it.controlId) };
          }),
        systemControl: sysToPrintData(res),
        approvalIds: res.approvalIds,
      };

      let infoPromiseList = [];
      receiveControls.forEach(l => {
        if (l.type === 51) {
          infoPromiseList.push(
            sheetAjax.getWorksheetInfo({
              worksheetId: l.dataSource,
              getTemplate: true,
            }),
          );
        }
      });

      if (infoPromiseList.length === 0) {
        this.setState(
          {
            printData: _printData,
            isLoading: false,
          },
          () => {
            this.getApproval();
            this.getRowRelationRows();
          },
        );
      } else {
        Promise.all(infoPromiseList).then(res => {
          let _receiveControls = receiveControls.map(item => {
            return {
              ...item,
              relationControls:
                item.type === 51
                  ? (res.find(l => l.worksheetId === item.dataSource) || { template: {} }).template.controls || []
                  : item.relationControls || [],
            };
          });
          this.setState(
            {
              printData: {
                ..._printData,
                receiveControls: _receiveControls,
              },
              isLoading: false,
            },
            () => {
              this.getApproval();
              this.getRowRelationRows();
            },
          );
        });
      }
    });
  };

  initWorkflow = () => {
    const { params } = this.state;
    const { id, workId } = params;
    document.title = _l('工作流打印');
    sheetAjax
      .getWorkItem({
        instanceId: id,
        workId: workId,
      })
      .then(res => {
        this.setState(
          {
            params: {
              ...this.state.params,
              rowId: res.rowId,
              worksheetId: res.worksheetId,
            },
          },
          () => {
            this.getData();
            instance.get({ id: id, workId }).then(result => {
              this.setState({
                printData: {
                  ...this.state.printData,
                  workflow: result.works.map(item => {
                    item.checked = true;
                    return item;
                  }),
                  processName: result.processName,
                },
              });
            });
          },
        );
      });
  };

  handChange = printData => {
    this.setState({
      printData: printData,
      isChange: true,
    });
  };

  saveTem = () => {
    this.setState({
      showSaveDia: true,
    });
  };

  saveFn = () => {
    const { params, printData, saveLoading } = this.state;
    if (saveLoading) {
      return;
    }
    this.setState({
      saveLoading: true,
    });
    const { name, views, orderNumber, titleChecked, receiveControls } = printData;
    if (!_.trim(name)) {
      alert(_l('请输入模板名称'), 3);
      return;
    }
    const { printId, projectId, worksheetId } = params;
    let controls = [];
    receiveControls.map(o => {
      if (o.checked) {
        let data = _.pick(o, ['controlId', 'type']);
        if (
          o.relationControls &&
          o.relationControls.length > 0 &&
          (o.advancedSetting.showtype === '2' || [34, 51].includes(o.type)) //关联表列表||子表||查询列表
        ) {
          //关联表 列表
          let relations = [];
          o.relationControls.map(it => {
            if (it.checked) {
              relations.push(_.pick(it, ['controlId', 'type']));
            }
          });
          data = { ...data, relations };
        }
        controls.push(data);
      }
    });
    let approvalIds = [];
    if (printData.approval.length) {
      printData.approval.forEach(item => {
        if (item.checked) {
          approvalIds.push(item.processId);
        } else if (item.child.some(l => l.checked)) {
          approvalIds.push(item.processId);
        }
      });
    }
    sheetAjax
      .editPrint({
        id: printId,
        data: {
          titleChecked, //标题是否打印
          id: printId,
          type: PRINT_TYPE.SYS_PRINT, //系统打印
          ..._.pick(printData, [
            'range',
            'formNameChecked',
            'logoChecked',
            'companyNameChecked',
            'companyName',
            'qrCode',
            'printTime',
            'remark',
            'controlStyles',
            'relationStyle',
            'createTime',
            'updateTime',
            'ownerAccount',
            'createTimeChecked',
            'createAccountChecked', // 创建者
            'updateTimeChecked',
            'updateAccountChecked', // 最近修改人
            'ownerAccountChecked',
            'showData', // 空值是否隐藏
            'printOption',
            'shareType',
            'formName',
            'name',
            'font',
            'approvePosition',
          ]),
          approvalIds: approvalIds,
          projectId,
          worksheetId,
          views: typeof views[0] === 'string' ? views : views.map(it => it.viewId), // string??
          orderNumber: orderNumber
            .filter(it => !it.checked)
            .map(it => {
              return it.receiveControlId;
            }),
        },
        saveControls: controls,
      })
      .then(res => {
        alert('保存成功');
        this.setState(
          {
            isChange: false,
            saveLoading: false,
          },
          () => {
            if (this.props.onBack) {
              this.props.onBack();
            } else {
              this.setState({
                params: {
                  ...params,
                  type: typeForCon.PREVIEW,
                },
              });
              mdNotification.success({
                title: _l('保存成功，请到打印模板中查看'),
                btnList: [
                  {
                    text: _l('前往查看'),
                    onClick: () => {
                      window.open(`/worksheet/formSet/edit/${worksheetId}/printTemplate`);
                    },
                  },
                ],
              });
            }
          },
        );
      });
  };

  getFiles = () => {
    let { params, ajaxUrlStr } = this.state;

    this.setState({
      pdfUrl: `${md.global.Config.AjaxApiUrl}file/docview?fileName=${params.name}.docx&filePath=${ajaxUrlStr.replace(/\?.*/, '')}`,
      isLoading: false,
    });
  };

  downFn = () => {
    let ajaxUrl = this.state.ajaxUrlStr;
    window.open(ajaxUrl);
  };

  // 埋点
  handleBehaviorLog = () => {
    const { params = {} } = this.state;
    const { isBatch, worksheetId, rowId, printId } = params;
    if (isBatch) {
      addBehaviorLog('batchPrintWord', worksheetId, { printId, msg: [rowId.split(',').length] });
    } else {
      addBehaviorLog('printWord', worksheetId, { printId, rowId });
    }
  };

  renderWordCon = () => {
    const { ajaxUrlStr, showPdf, params, printData, showHeader, useWps } = this.state;
    const { fileTypeNum } = params;

    if (!showPdf) {
      return (
        <div className="toWordLoadCon">
          {!ajaxUrlStr ? (
            <React.Fragment>
              <div className="wordPng"></div>
              <p className="dec">
                <LoadDiv size="small" className="mRight10" />
                {_l(fileTypeNum === 5 ? '正在导出Excel文件...' : '正在导出Word文件...')}
              </p>
              <p className="txt">{_l('包含图片时生成速度较慢，请耐心等待...')}</p>
            </React.Fragment>
          ) : (
            <React.Fragment>
              {ajaxUrlStr === 'error' ? <div className='icon-error_outline Red Font64'></div> : <div className="exportPng"></div>}
              <p className="dec">{ajaxUrlStr === 'error' ? _l('导出失败') : _l('导出成功！')}</p>

              {ajaxUrlStr !== 'error' && (
                <Fragment>
                  <p
                    className="downWord"
                    onClick={() => {
                      this.handleBehaviorLog();
                      this.downFn();
                    }}
                  >
                    <Icon
                      icon={'file_download'}
                      className="Font16"
                      style={{ marginLeft: -14, 'vertical-align': 'bottom' }}
                    />
                    {_l(fileTypeNum === 5 ? '下载Excel文件' : '下载Word文件')}
                  </p>
                  {/* {fileTypeNum !== 5 && ( */}
                  <div
                    className="toPdf"
                    onClick={() => {
                      this.handleBehaviorLog();
                      this.setState({
                        showPdf: true,
                      });
                    }}
                  >
                    {_l('在线预览，直接用浏览器打印')}
                  </div>
                  {/* )} */}
                </Fragment>
              )}
              <p className="txt">{_l('文件复杂时可能会失败')}</p>{' '}
            </React.Fragment>
          )}
        </div>
      );
    } else {
      return (
        <div className={cx('previewContainer')}>
          <div className="iframeLoad">
            <div className="pdfPng"></div>
            <p className="dec">
              <LoadDiv size="small" className="mRight10 InlineBlock" />
              {_l('正在生成...')}
            </p>
          </div>
          <iframe
            className="iframeDiv"
            onLoad={() => {
              $('.iframeLoad').hide();
              $('.iframeDiv').show();
            }}
            src={
              this.state.pdfUrl
            }
            width="100%"
            height="100%"
          />
        </div>
      );
    }
  };

  render() {
    const {
      params,
      printData,
      isChange,
      showSaveDia,
      isLoading,
      error,
      showPdf,
      sheetSwitchPermit,
      showHeader,
      approval,
    } = this.state;
    const { type, isDefault, worksheetId, viewId } = params;
    let { receiveControls = [], systemControl = [] } = printData;
    if (!worksheetId) {
      return '';
    }
    if (isLoading) {
      return <LoadDiv className="loadDivPrint" />;
    }
    if (error) {
      return (
        <div className="error TxtMiddle TxtCenter">
          <div
            className="unnormalCon"
            style={{
              paddingTop: window.innerHeight / 3,
            }}
          >
            <div className="unnormalIcon InlineBlock"></div>
            <div className="Gray_75 mTop30">{_l('记录或模板已删除')}</div>
          </div>
        </div>
      );
    }
    let data = {
      handChange: this.handChange,
      params,
      systemControl,
      controls: receiveControls.filter(control => control.type !== 42), // 除去 签名
      signature: receiveControls.filter(control => control.type === 42), // 签名
      onCloseFn: () => {
        if (!isChange) {
          this.props.onBack && this.props.onBack();
        } else {
          return Dialog.confirm({
            title: <span className="">{_l('您是否保存本次修改？')}</span>,
            description: _l('当前有尚未保存的修改，你在离开页面前是否需要保存这些修改？'),
            cancelText: _l('否，放弃保存'),
            okText: _l('是，保存修改'),
            onCancel: evt => {
              !this.state.showSaveDia && this.props.onBack && this.props.onBack();
            },
            onOk: () => {
              this.saveFn();
            },
          });
        }
      },
      printData: {
        ...printData,
        approval: approval,
      },
      saveTem: this.saveTem,
      saveFn: this.saveFn,
      downFn: this.downFn,
      showPdf,
      sheetSwitchPermit: sheetSwitchPermit,
    };

    return (
      <div className="printTem">
        <Header {...data} />
        {isDefault ? ( // 系统模板
          <div className="printTemCon">
            {type !== typeForCon.PREVIEW && <Sidenav {...data} />}
            <Con {...data} />
            {showSaveDia && (
              <SaveDia
                viewId={viewId}
                type={type}
                printData={printData}
                showSaveDia={showSaveDia}
                onCancel={() => {
                  this.setState({
                    showSaveDia: false,
                  });
                }}
                setValue={data => {
                  this.setState(
                    {
                      showSaveDia: false,
                      printData: {
                        ...printData,
                        ...data,
                      },
                    },
                    () => {
                      this.saveFn();
                    },
                  );
                }}
                worksheetId={worksheetId}
                handChange={this.handChange}
              />
            )}
          </div>
        ) : (
          this.renderWordCon()
        )}
      </div>
    );
  }
}

export default PrintForm;
