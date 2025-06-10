import React from 'react';
import axios from 'axios';
import cx from 'classnames';
import _ from 'lodash';
import { Dialog, Icon, LoadDiv } from 'ming-ui';
import { mdNotification } from 'ming-ui/functions';
import attachmentAjax from 'src/api/attachment';
import homeAppApi from 'src/api/homeApp';
import webCacheAjax from 'src/api/webCache';
import sheetAjax from 'src/api/worksheet';
import instance from 'src/pages/workflow/api/instanceVersion';
import processAjax from 'src/pages/workflow/api/processVersion';
import { updateRulesData } from 'src/components/newCustomFields/tools/formUtils';
import CommonHeader from 'src/pages/kc/common/AttachmentsPreview/previewHeader/CommonHeader/index';
import { handleCondition } from 'src/pages/widgetConfig/util/data';
import { getFilter } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { canEditApp, isHaveCharge } from 'src/pages/worksheet/redux/actions/util.js';
import { getAppLangDetail, getTranslateInfo } from 'src/utils/app';
import { renderText as renderCellText } from 'src/utils/control';
import { VersionProductType } from 'src/utils/enum';
import { addBehaviorLog, getFeatureStatus } from 'src/utils/project';
import { replaceControlsTranslateInfo } from 'src/utils/translate';
import Con from './components/content';
import Header from './components/header';
import SaveDia from './components/saveDia';
import SideNav from './components/sideNav/index';
import { DEFAULT_FONT_SIZE, fromType, PRINT_TYPE, typeForCon } from './config';
import { getControlsForPrint, getVisibleControls, isRelation, SYST_PRINTData, useUserPermission } from './util';
import { getDownLoadUrl } from './util';
import './index.less';

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
        filters: [], // 过滤条件
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
      isUserAdmin: false,
      isHaveCharge: false,
      isWps: false,
      showSavePreviewService: false,
      showHeader: true,
      editLoading: false,
    };
  }

  componentWillMount = () => {
    this.getApp(() => this.getParamFn());
    window.addEventListener('keydown', this.handleKeyDown);
  };

  componentDidMount() {
    $('html').addClass('printPage');
  }

  componentWillUnmount() {
    $('html').removeClass('printPage');
    window.removeEventListener('keydown', this.handleKeyDown);
    const { match = {} } = this.props;
    let { params } = match;
    const { key } = params;

    if (key) {
      webCacheAjax.clear({
        key: `${key}`,
      });
    }
  }

  getApp = cb => {
    const { params } = this.state;
    const { type, from, appId, printType } = params;

    homeAppApi.getApp({ appId: appId, getLang: true }, { silent: true }).then(data => {
      window[`timeZone_${appId}`] = data.timeZone;

      this.setState({
        isHaveCharge: isHaveCharge(data.permissionType, data.isLock),
        isUserAdmin:
          from === fromType.PRINT && type === typeForCon.NEW && appId && printType !== 'flow'
            ? canEditApp(data.permissionType, data.isLock)
            : this.state.isUserAdmin,
      });

      if (
        from === fromType.PRINT &&
        [typeForCon.NEW, typeForCon.PREVIEW].includes(type) &&
        appId &&
        printType !== 'flow'
      ) {
        getAppLangDetail(data).then(() => {
          cb && cb();
        });
      } else {
        cb && cb();
      }
    });
  };

  getParamFn = () => {
    if (location.href.indexOf('printForm') > -1) {
      const { params = {} } = this.state;
      const { key } = params;

      webCacheAjax
        .get({
          key: `${key}`,
        })
        .then(res => {
          if (res.data) {
            let data = JSON.parse(res.data);

            this.setState(
              {
                params: {
                  ...this.state.params,
                  ...data,
                },
                printData: {
                  allowDownloadPermission: data.allowDownloadPermission,
                  allowEditAfterPrint: data.allowEditAfterPrint,
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
        getTemplate: true,
      })
      .then(res => {
        res.name = getTranslateInfo(res.appId, null, worksheetId).name || res.name;
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
        info: res,
      },
      () => {
        if (isDefault) {
          if (params.printType === 'flow') {
            this.initWorkflow();
          } else {
            this.getData();
          }
        } else {
          this.setState({ isLoading: false });

          if (from === fromType.PRINT && printId) {
            document.title = `${name}-${isBatch ? _l('批量打印') : renderCellText(attriData) || _l('未命名')}`;
          }

          getDownLoadUrl(res.downLoadUrl, params, link => {
            this.setState({ ajaxUrlStr: link }, () => {
              link !== 'error' && this.getFiles();
            });
          });
        }
      },
    );
  };

  handleKeyDown = evt => {
    if (evt.key === 'Escape') {
      this.setState({ showPdf: false, showHeader: true });
    }
  };

  getApproval = () => {
    const { params, printData } = this.state;
    const { from, printType, type } = params;

    if (printType && printType === 'flow') return;

    const { worksheetId, rowId, workId, appId } = params;

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

    if (from === fromType.FORM_SET && type !== typeForCon.PREVIEW) {
      promiseList.push(
        processAjax.list({
          relationId: appId,
          processListType: '11',
        }),
      );
    }

    Promise.all(promiseList).then(([res1, res2, res3 = []]) => {
      let ajaxList = [];
      let res = res1.concat(res2);
      const otherProcess = res3.find(l => l.groupId === worksheetId);
      const otherApproval = otherProcess
        ? otherProcess.processList
            .filter(l => !res.find(m => l.id === _.get(m, 'process.parentId')))
            .map(l => ({ ...l, checked: !!approvalIds.find(m => m === l.id), processId: l.id }))
        : [];

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
              checked: !!approvalIds.find(l => l === item.process.parentId),
            });
          } else {
            _approval.push({
              name: item.process.name,
              processId: item.process.parentId,
              checked: !!approvalIds.find(l => l === item.process.parentId),
              child: [].concat({
                ...item,
                checked: !!approvalIds.find(l => l === item.process.parentId),
              }),
            });
          }
        });

        this.setState({
          printData: {
            ...this.state.printData,
            approval: _approval.concat(otherApproval),
          },
          approval: _approval.concat(otherApproval),
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
            getType: 5,
          })
        : [];
    });

    let _printData = _.cloneDeep(printData);

    Promise.all(promiseList).then(res => {
      printData.receiveControls.forEach((item, index) => {
        let _index = controls.findIndex(l => l.controlId === item.controlId);

        if (_index > -1 && item.type === 51) {
          res[_index].template.controls = replaceControlsTranslateInfo(
            res[_index].worksheet.appId,
            res[_index].worksheet.worksheetId,
            res[_index].template.controls,
          );
          _printData.receiveControls[index].value =
            (res[_index].data || []).length === 0 ? '' : JSON.stringify(res[_index].data);
          _printData.receiveControls[index].relationsData = res[_index];

          if ((_printData.receiveControls[index].relationControls || []).length === 0 && res[_index].template) {
            _printData.receiveControls[index].relationControls = res[_index].template.controls;
          } else {
            _printData.receiveControls[index].relationControls = replaceControlsTranslateInfo(
              res[_index].worksheet.appId,
              res[_index].worksheet.worksheetId,
              _printData.receiveControls[index].relationControls,
            );
          }
        }
      });

      this.setState({ printData: _printData });
    });
  };

  getData = () => {
    const { params, info } = this.state;
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

      if (res.resultCode === 4 && !(isDefault && from === fromType.FORM_SET)) {
        this.setState({
          error: true,
          isLoading: false,
        });
        return;
      }

      res.formName = getTranslateInfo(appId, null, worksheetId).name || res.formName;

      _.forEach(res.relationMaps, function (value, key) {
        const relaControl = res.receiveControls.find(l => l.controlId === key);

        relaControl.relationControls = relaControl.relationControls.map(l => {
          return _.assign(
            l,
            _.pick(
              _.find(res.relationMaps[key].template.controls, m => m.controlId === l.controlId),
              ['dot', 'advancedSetting'],
            ),
          );
        });

        res.relationMaps[key].template.controls = replaceControlsTranslateInfo(
          appId,
          relaControl.dataSource,
          relaControl.relationControls,
        );
      });

      const rules = resData[1];
      //通过规则计算
      let receiveControls = updateRulesData({
        rules: [typeForCon.NEW, typeForCon.EDIT].includes(type) && from === fromType.FORM_SET ? [] : rules,
        recordId: rowId,
        data: res.receiveControls,
      });
      const needVisible = printId || (type === typeForCon.NEW && from === fromType.FORM_SET);
      receiveControls = getControlsForPrint(receiveControls, res.relationMaps, needVisible, {
        info: info,
        fileStyle: (_.get(res, 'advanceSettings') || []).find(l => l.key === 'atta_style'),
        user_info: (_.get(res, 'advanceSettings') || []).find(l => l.key === 'user_info'),
      });
      receiveControls = replaceControlsTranslateInfo(appId, worksheetId, receiveControls);

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
        systemControl: SYST_PRINTData(res),
        approvalIds: res.approvalIds,
        filters: res.filters,
        allControls: res.receiveControls,
      };

      let infoPromiseList = [];
      let controlIndexList = [];
      receiveControls.forEach((l, i) => {
        if (l.type === 34 && useUserPermission(l)) {
          controlIndexList.push(i);
          infoPromiseList.push(
            sheetAjax.getWorksheetInfo({
              worksheetId: l.dataSource,
              getTemplate: true,
              relationWorksheetId: worksheetId,
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
          res.map((item, index) => {
            const oldControls = receiveControls[controlIndexList[index]].relationControls.map(l => l.controlId);
            let newControls = getVisibleControls(
              (
                _.get(
                  _printData.relationMaps,
                  `${receiveControls[controlIndexList[index]].controlId}.template.controls`,
                ) || []
              ).filter(it => {
                const itIndex = _.findIndex(oldControls, l => l === it.controlId);
                const itControl = (_.get(item, 'template.controls') || []).find(l => l.controlId === it.controlId);

                if (itIndex > -1) {
                  it.checked = _.get(receiveControls[controlIndexList[index]], `relationControls[${itIndex}]`).checked;
                }

                if (itControl) {
                  _.assign(it, _.pick(itControl, ['fieldPermission', 'controlPermissions', 'advancedSetting']));
                }

                return index > -1;
              }),
              true,
            );

            newControls = replaceControlsTranslateInfo(item.appId, item.worksheetId, newControls);
            receiveControls[controlIndexList[index]].relationControls = newControls;
            _printData.relationMaps[controlIndexList[index]] &&
              (_printData.relationMaps[controlIndexList[index]].template.controls = newControls);
          });

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

  handChange = changeData =>
    this.setState({
      printData: Object.assign(this.state.printData, changeData),
      isChange: true,
    });

  saveTem = () => this.setState({ showSaveDia: true });

  saveFn = () => {
    const { params, printData, saveLoading } = this.state;

    if (saveLoading) {
      return;
    }

    this.setState({ saveLoading: true });
    const { name, views, orderNumber, titleChecked, receiveControls, approval = [] } = printData;

    if (!_.trim(name)) {
      alert(_l('请输入模板名称'), 3);
      return;
    }

    const { printId, projectId, worksheetId, type } = params;
    let controls = [];

    receiveControls.map(o => {
      if (o.checked) {
        let data = _.pick(o, ['controlId', 'type']);

        if (
          o.relationControls &&
          o.relationControls.length > 0 &&
          (['2', '5', '6'].includes(o.advancedSetting.showtype) || [34, 51].includes(o.type)) //关联表列表||子表||查询列表
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

    if (approval.length) {
      approval.forEach(item => {
        if (item.checked) {
          approvalIds.push(item.processId);
        } else if (item.child && item.child.some(l => l.checked)) {
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
            'printAccount',
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
            'allowDownloadPermission',
            'advanceSettings',
          ]),
          approvalIds: type === 'edit' && !approval.length ? printData.approvalIds : approvalIds,
          projectId,
          worksheetId,
          views: typeof views[0] === 'string' ? views : views.map(it => it.viewId), // string??
          orderNumber: orderNumber
            .filter(it => !it.checked)
            .map(it => {
              return it.receiveControlId;
            }),
          filters: (_.get(printData, 'filters') || []).map(handleCondition),
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
      })
      .catch(err => {
        this.setState({ saveLoading: false });
      });
  };

  getFiles = () => {
    let { params, ajaxUrlStr } = this.state;

    this.setState(
      {
        pdfUrl: `${md.global.Config.AjaxApiUrl}file/docview?fileName=${params.name}.${
          params.fileTypeNum === 5 ? 'xlsx' : 'docx'
        }&filePath=${ajaxUrlStr.replace(/\?.*/, '')}`,
        isLoading: false,
      },
      () => {
        if (_.get(this.state, 'params.from') === fromType.PRINT) {
          this.onClickPrint();
        }
      },
    );
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

  onEdit = () => {
    const { params = {}, ajaxUrlStr } = this.state;
    const { worksheetId, printId, from } = params;
    const isFormSet = from === fromType.FORM_SET;
    this.setState({ editLoading: true });

    attachmentAjax
      .getAttachmentEditDetail({
        fileId: printId,
        editType: isFormSet ? 2 : 3,
        worksheetId,
        fileUrl: isFormSet ? undefined : ajaxUrlStr,
      })
      .then(res => {
        if (res.wpsEditUrl) location.href = res.wpsEditUrl;
      });
  };

  renderShowPdf = () => {
    const { params, printData, showHeader, useWps, isHaveCharge, info, editLoading } = this.state;
    const { fileTypeNum, allowDownloadPermission, from, projectId, worksheetId, allowEditAfterPrint, isBatch } = params;
    const allowDown = isHaveCharge || !allowDownloadPermission;
    const canEditFile =
      (from === fromType.FORM_SET ? _.get(info, 'roleType') === 2 && fileTypeNum !== 5 : allowEditAfterPrint) &&
      getFeatureStatus(projectId, VersionProductType.editAttachment);

    return (
      <div className={cx('previewContainer', { top0: !showHeader })}>
        <div className="iframeLoad">
          <div className="pdfPng"></div>
          <p className="dec">
            <LoadDiv size="small" className="mRight10 InlineBlock" />
            {_l('正在生成文件...')}
          </p>
        </div>
        <CommonHeader
          editNameInfo={{
            name: printData.name,
            ext: fileTypeNum === 5 ? 'xlsx' : 'docx',
            canEditFileName: false,
          }}
          showKcVersionPanel={false}
          attachmentActionInfo={{
            editLoading: editLoading,
            cauUseWpsPreview: fileTypeNum !== 5,
            userWps: useWps,
            showEdit: !isBatch && canEditFile && md.global.Config.EnableDocEdit !== false,
            changePreview: type => this.setState({ useWps: type === 'wps' }),
            clickEdit: this.onEdit,
          }}
          addKc={false}
          showOpenNewPage={false}
          showShare={false}
          showDownload={allowDown}
          showRefresh={true}
          clickDownLoad={() => {
            this.handleBehaviorLog();
            this.downFn();
          }}
          clickRefresh={() => $('.iframeDiv').attr('src', $('.iframeDiv').attr('src'))}
          onClose={() => this.setState({ showPdf: false, showHeader: true })}
        />
        <iframe
          className="iframeDiv"
          onLoad={() => {
            $('.iframeLoad').hide();
            $('.iframeDiv').show();
          }}
          src={this.state.pdfUrl}
          width="100%"
          height="100%"
          style={{ height: 'calc(100% - 54px)' }}
        />
      </div>
    );
  };

  onCloseFn = () => {
    if (!this.state.isChange) {
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
  };

  onClickPrint = () => {
    this.handleBehaviorLog();
    this.setState({ showPdf: true, showHeader: false });
  };

  renderExportRes = () => {
    const { ajaxUrlStr, params, isHaveCharge } = this.state;
    const { allowDownloadPermission, fileTypeNum } = params;
    const allowDown = isHaveCharge || !allowDownloadPermission;

    return (
      <React.Fragment>
        {ajaxUrlStr === 'error' ? (
          <div className="icon-error_outline Red Font64"></div>
        ) : (
          <div className="exportPng" key="printExportPng"></div>
        )}
        <p className="dec">{ajaxUrlStr === 'error' ? _l('导出失败') : _l('导出成功！')}</p>
        {ajaxUrlStr !== 'error' && (
          <div className="mTop20">
            <div className="toPdf mBottom16" onClick={this.onClickPrint}>
              <span className="Font15">{_l('打印')}</span>
            </div>
            {allowDown && (
              <div
                className="downWord"
                onClick={() => {
                  this.handleBehaviorLog();
                  this.downFn();
                }}
              >
                <span className="Font15">{_l('下载%0文件', fileTypeNum === 5 ? 'Excel' : 'Word')}</span>
              </div>
            )}
          </div>
        )}
      </React.Fragment>
    );
  };

  renderWordCon = () => {
    const { ajaxUrlStr, showPdf, params } = this.state;
    const { fileTypeNum } = params;

    if (!showPdf) {
      return (
        <div className="toWordLoadCon">
          {!ajaxUrlStr ? (
            <React.Fragment>
              <div className="wordPng"></div>
              <p className="dec">
                <LoadDiv size="small" className="mRight10" />
                {fileTypeNum === 5 ? _l('正在导出Excel文件...') : _l('正在导出Word文件...')}
              </p>
              <p className="txt">{_l('包含图片时生成速度较慢，请耐心等待...')}</p>
            </React.Fragment>
          ) : (
            this.renderExportRes()
          )}
        </div>
      );
    } else {
      return this.renderShowPdf();
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
      isUserAdmin,
      isHaveCharge,
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

    const visibleControls = getVisibleControls(receiveControls);
    let data = {
      handChange: this.handChange,
      params,
      systemControl,
      controls: visibleControls.filter(control => control.type !== 42), // 除去 签名
      signature: visibleControls.filter(control => control.type === 42), // 签名
      onCloseFn: this.onCloseFn,
      printData: {
        ...printData,
        approval: approval,
      },
      saveTem: this.saveTem,
      saveFn: this.saveFn,
      downFn: this.downFn,
      showPdf,
      sheetSwitchPermit: sheetSwitchPermit,
      isUserAdmin: isUserAdmin,
      isHaveCharge: isHaveCharge,
    };

    return (
      <div className="printTem">
        {showHeader && <Header {...data} />}
        {isDefault ? ( // 系统模板
          <div className="printTemCon">
            {type !== typeForCon.PREVIEW && <SideNav {...data} />}
            <Con {...data} />
            {showSaveDia && (
              <SaveDia
                viewId={viewId}
                type={type}
                printData={printData}
                showSaveDia={showSaveDia}
                onCancel={() =>
                  this.setState({
                    showSaveDia: false,
                  })
                }
                setValue={data =>
                  this.setState(
                    {
                      showSaveDia: false,
                      printData: {
                        ...printData,
                        ...data,
                      },
                    },
                    () => this.saveFn(),
                  )
                }
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
