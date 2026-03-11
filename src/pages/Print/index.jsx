import React from 'react';
import axios from 'axios';
import cx from 'classnames';
import _ from 'lodash';
import { Dialog, LoadDiv } from 'ming-ui';
import { mdNotification } from 'ming-ui/functions';
import attachmentAjax from 'src/api/attachment';
import homeAppApi from 'src/api/homeApp';
import webCacheAjax from 'src/api/webCache';
import sheetAjax from 'src/api/worksheet';
import instance from 'src/pages/workflow/api/instanceVersion';
import { updateRulesData } from 'src/components/Form/core/formUtils/updateRulesData';
import { permitList } from 'src/pages/FormSet/config';
import { isOpenPermit } from 'src/pages/FormSet/util';
import CommonHeader from 'src/pages/kc/common/AttachmentsPreview/previewHeader/CommonHeader/index';
import { handleCondition } from 'src/pages/widgetConfig/util/data';
import { canEditApp, isHaveCharge } from 'src/pages/worksheet/redux/actions/util';
import { getAppLangDetail, getTranslateInfo } from 'src/utils/app';
import { browserIsMobile } from 'src/utils/common';
import { renderText as renderCellText } from 'src/utils/control';
import { VersionProductType } from 'src/utils/enum';
import { addBehaviorLog, getFeatureStatus } from 'src/utils/project';
import Header from './components/Header';
import PrintContentBox from './components/PrintContentBox';
import SaveDia from './components/SaveDia';
import SideBar from './components/SideBar';
import { DEFAULT_FONT_SIZE, fromType, PRINT_TYPE, typeForCon } from './core/config';
import { getControlsForPrint, isRelation, isRToC, SYST_PRINTData } from './core/util';
import { getDownLoadUrl } from './core/util';
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
      // 从 rowIds 中获取的第一个 rowId，用于请求接口（rowIds 可公用）
      basicRowId: '',
      rowValues: [],
      // 手动更新字段
      flagUpdate: 0,
      updateFlagType: '',
      approvalCheckedMap: {},
      // 原始审批数据源
      originalApproval: [],
      pagesInfo: '',
      // 分享链接
      shareShortUrls: {},
      approvalParentId: '',
      immediateGetApprovalDetail: {},
      // 是否可以显示打印和保存按钮
      showPrintAndSaveButtons: false,
    };

    this.confirmOk = false;
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
    if (location.href.indexOf('printForm') > -1 || location.href.indexOf('printFormBatch') > -1) {
      const { params = {} } = this.state;
      const { key } = params;

      webCacheAjax.get({ key }).then(res => {
        if (res.data) {
          const data = safeParse(res.data);
          const { params, printData } = this.state;
          this.setState(
            {
              params: {
                ...params,
                ...data,
              },
              printData: {
                allowDownloadPermission: data.allowDownloadPermission,
                allowEditAfterPrint: data.allowEditAfterPrint,
                ...printData,
                name: data.name,
              },
              basicRowId: data.rowIds?.[0] || '',
            },
            () => {
              this.getWorksheet();
            },
          );
        }
      });
    } else {
      // 表单设置 - 编辑模板进入
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
      });
  };

  handleKeyDown = evt => {
    if (evt.key === 'Escape') {
      this.setState({ showPdf: false, showHeader: true });
    }
  };

  getData = () => {
    const { params, info, basicRowId } = this.state;
    const { printId, worksheetId, viewId, appId, isDefault, from, printType, type, rowIds } = params;

    const rowIdsList = rowIds?.[0] ? rowIds : [];
    let ajaxList = [
      sheetAjax.getPrintDetailList({
        appId,
        worksheetId,
        viewId,
        printId,
        rowIds: rowIdsList,
      }),
      sheetAjax.getControlRules({
        //系统打印 请求规则
        worksheetId,
        type: 1, // 1字段显隐
      }),
    ];

    const isBatchShortUrl = rowIdsList?.length && viewId;
    if (isBatchShortUrl) {
      ajaxList.push(
        sheetAjax.getRowsShortUrl({
          appId,
          viewId,
          worksheetId,
          rowIds: rowIdsList,
        }),
      );
    }

    axios.all(ajaxList).then(resData => {
      let { printDot, rowValues } = resData[0];
      const shareShortUrls = isBatchShortUrl ? resData[2] : {};

      if (!rowValues.length) {
        const receiveControls = printDot.receiveControls;
        const tempData = receiveControls.map(({ controlId }) => ({
          id: controlId,
          value: '',
        }));
        rowValues = [{ rowId: 'emptyRowId', controlValues: tempData }];
      }
      const res = printDot;

      if (res.resultCode === 4 && !(isDefault && from === fromType.FORM_SET)) {
        this.setState({
          error: true,
          isLoading: false,
        });
        return;
      }

      if (from === fromType.PRINT && printType !== 'flow') {
        document.title = printId ? `${res.name}` : `${_l('系统打印')}`;
        // 设置打印 header 页码
        this.updatePagesInfo(`1/${rowValues.length}`);
      }

      res.formName = getTranslateInfo(appId, null, worksheetId).name || res.formName;

      const rules = resData[1];
      // 通过规则计算
      let receiveControls = updateRulesData({
        rules: [typeForCon.NEW, typeForCon.EDIT].includes(type) && from === fromType.FORM_SET ? [] : rules,
        recordId: basicRowId,
        data: res.receiveControls,
      });
      const needVisible = printId || (type === typeForCon.NEW && from === fromType.FORM_SET);
      receiveControls = getControlsForPrint({
        receiveControls,
        relationMaps: res.relationMaps,
        needVisible,
        info,
      });

      // 读取表格的展示方式
      const relationStyle = printId
        ? res.relationStyle
        : res.receiveControls.filter(o => isRToC(o)).map(o => ({ controlId: o.controlId, type: 3 }));

      const _printData = {
        ...this.state.printData,
        ...res,
        receiveControls,
        rules,
        font: Number(res.font || DEFAULT_FONT_SIZE),
        orderNumber: receiveControls
          .filter(control => isRelation(control))
          .map(it => ({ receiveControlId: it.controlId, checked: !(res.orderNumber || []).includes(it.controlId) })),
        systemControl: SYST_PRINTData(res),
        approvalIds: res.approvalIds,
        filters: res.filters,
        allControls: res.receiveControls,
        relationStyle,
      };

      this.setState({
        printData: _printData,
        rowValues,
        shareShortUrls,
        isLoading: false,
      });
    });
  };

  initWorkflow = () => {
    const { appId, params } = this.state;
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
              worksheetId: res.worksheetId,
            },
            basicRowId: res.rowId,
          },
          () => {
            this.getData();
            instance.get({ id: id, workId }).then(result => {
              this.setState({
                printData: {
                  ...this.state.printData,
                  workflow: result.works.map(item => {
                    item.checked = true;
                    item.flowNode.name =
                      getTranslateInfo(appId, result.parentId, item.flowNode.id).nodename || item.flowNode.name;
                    return item;
                  }),
                  processName: getTranslateInfo(appId, null, result.parentId).name || result.processName,
                },
              });
            });
          },
        );
      });
  };

  extractApprovalChecked = arr => {
    const result = {};

    arr.forEach(item => {
      result[item.processId] = item.checked;
    });
    return result;
  };

  handChange = (changeData, extraData = {}) => {
    this.setState({
      printData: Object.assign(this.state.printData, changeData),
      isChange: true,
      flagUpdate: this.state.flagUpdate + 1,
      ...(_.has(changeData, 'approval')
        ? {
            approvalCheckedMap: this.extractApprovalChecked(changeData.approval),
            updateFlagType: 'approval',
            approvalParentId: extraData.approvalParentId,
          }
        : { updateFlagType: 'receiveControls' }),
    });
  };

  setApprovalList = ({ list, rowId }) => {
    this.setState(preState => {
      const { approval, approvalCheckedMap, immediateGetApprovalDetail } = preState;
      const nextApproval = _.cloneDeep(approval);

      list.forEach(item => {
        const processIndex = _.findIndex(nextApproval, l => l.processId === item.processId);
        if (processIndex === -1) {
          nextApproval.push(item);
        }
      });
      const cloneApprovalCheckedMap = _.cloneDeep(approvalCheckedMap);
      nextApproval.forEach(item => {
        cloneApprovalCheckedMap[item.processId] = item.checked;
      });

      return {
        approval: nextApproval,
        approvalCheckedMap: cloneApprovalCheckedMap,
        immediateGetApprovalDetail: { ...immediateGetApprovalDetail, [rowId]: true },
      };
    });
  };

  updateShowPrintAndSaveButtons = bool => {
    this.setState({ showPrintAndSaveButtons: bool });
  };

  saveTem = () => this.setState({ showSaveDia: true });

  saveFn = () => {
    const { params, printData, saveLoading } = this.state;

    if (saveLoading) {
      return;
    }

    const { name, views, orderNumber, titleChecked, receiveControls, approval = [] } = printData;

    if (!_.trim(name)) {
      alert(_l('请输入模板名称'), 3);
      return;
    }

    this.setState({ saveLoading: true });
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
      .then(() => {
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
      .catch(() => {
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
    const { params = {}, basicRowId } = this.state;
    const { isBatch, worksheetId, printId, rowIds, rowId } = params;

    if (isBatch || rowIds?.length > 1) {
      addBehaviorLog('batchPrintWord', worksheetId, { printId, msg: [(rowIds || rowId.split(',')).length] });
    } else {
      addBehaviorLog('printWord', worksheetId, { printId, rowId: basicRowId || rowId });
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
    const { fileTypeNum, allowDownloadPermission, from, projectId, allowEditAfterPrint, isBatch } = params;
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
          className={cx('iframeDiv', { Block: browserIsMobile() })}
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
        onCancel: () => {
          !this.confirmOk && !this.state.showSaveDia && this.props.onBack && this.props.onBack();
          this.confirmOk = false;
        },
        onOk: () => {
          // 防止触发onCancel
          this.confirmOk = true;
          this.saveFn();
        },
      });
    }
  };

  onClickPrint = () => {
    this.handleBehaviorLog();
    this.setState({ showPdf: true, showHeader: false });
  };

  updatePagesInfo = pagesInfo => {
    this.setState({ pagesInfo });
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
      showSaveDia,
      isLoading,
      error,
      showPdf,
      sheetSwitchPermit,
      showHeader,
      approval,
      isUserAdmin,
      isHaveCharge,
      rowValues,
      flagUpdate,
      updateFlagType,
      approvalCheckedMap,
      approvalParentId,
      pagesInfo,
      shareShortUrls,
      immediateGetApprovalDetail,
      showPrintAndSaveButtons,
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
            <div className="textSecondary mTop30">{_l('记录或模板已删除')}</div>
          </div>
        </div>
      );
    }

    let data = {
      handChange: this.handChange,
      params,
      systemControl,
      controls: receiveControls.filter(control => control.type !== 42 && control.controlId !== 'wfcotime'), // 除去 签名
      signature: receiveControls.filter(control => control.type === 42), // 签名
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
      showApproval: isOpenPermit(permitList.approveDetailsSwitch, sheetSwitchPermit, viewId),
    };
    const isMobile = browserIsMobile();

    return (
      <div className="printTem">
        {showHeader && <Header pagesInfo={pagesInfo} showPrintAndSaveButtons={showPrintAndSaveButtons} {...data} />}
        {isDefault ? ( // 系统模板
          <div className={cx('printTemCon', { mobilePrintCon: isMobile })}>
            {type !== typeForCon.PREVIEW && <SideBar {...data} />}
            <PrintContentBox
              rowValues={rowValues}
              shareShortUrls={shareShortUrls}
              params={params}
              flagUpdate={flagUpdate}
              updateFlagType={updateFlagType}
              approvalCheckedMap={approvalCheckedMap}
              approvalParentId={approvalParentId}
              immediateGetApprovalDetail={immediateGetApprovalDetail}
              setApprovalList={this.setApprovalList}
              updatePagesInfo={this.updatePagesInfo}
              updateShowPrintAndSaveButtons={this.updateShowPrintAndSaveButtons}
              {...data}
            />
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
