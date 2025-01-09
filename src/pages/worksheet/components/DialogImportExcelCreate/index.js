import React, { Component, Fragment } from 'react';
import { LoadDiv, antNotification } from 'ming-ui';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import DialogUpload from './DialogUpload';
import SetImportExcelCreateWorksheetOrApp from './SetImportExcelCreateWorksheetOrApp';
import {
  changeDialogUploadVisible,
  changeSetDataDialogVisible,
  changeDialogCreateAppVisible,
  changeCreateAppLoading,
  updateExcelDetailData,
  updateCurrentSheetInfo,
  updateSelectedImportSheetIds,
  updateAppInfo,
} from 'src/pages/worksheet/redux/actions/excelCreateAppAndSheet';
import DialogCreateApp from './DialogCreateApp';
import ErrorDialog from 'src/pages/worksheet/common/WorksheetBody/ImportDataFromExcel/ErrorDialog';
import appManagementController from 'src/api/appManagement';
import { DEFAULT_DATA } from 'src/pages/widgetConfig/config/widget.js';
import { enumWidgetType } from 'src/pages/widgetConfig/util';
import { VersionProductType } from 'src/util/enum';
import _ from 'lodash';
import SelectDBInstance from 'src/pages/AppHomepage/AppCenter/components/SelectDBInstance';
import { getFeatureStatus } from 'src/util';
import homeAppAjax from 'src/api/homeApp';
import { checkPermission } from 'src/components/checkPermission';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';

export const wsexcelbatchSocketInit = () => {
  IM.socket.on('wsexcelbatch', ({ sheetCount, id, addCount, appId, appName, errorCount }) => {
    antNotification.close(id);
    antNotification.success({
      message: _l('表数据导入完成'),
      description: _l('共导入%0张表，总计%1行数据', sheetCount, addCount),
      btnText: errorCount ? _l('查看错误报告') : '',
      onBtnClick: () => {
        new ErrorDialog({ fileKey: id, isBatch: true });
      },
    });
  });
};

class DialogImportExcelCreate extends Component {
  static propTypes = {
    createType: PropTypes.string,
    appId: PropTypes.string,
    projectId: PropTypes.string,
  };
  constructor(props) {
    super(props);
    this.state = {
      DBInstances: [],
      DBInstancesDialog: false,
    };
  }
  componentDidMount() {
    this.props.changeDialogUploadVisible(true);
  }
  componentWillUnmount() {
    this.props.onCancel();
    this.props.changeDialogUploadVisible(false);
    this.props.changeSetDataDialogVisible(false);
    this.props.changeDialogCreateAppVisible(false);
  }
  getToken = params => {
    const { projectId, createType } = this.props;
    appManagementController
      .getToken({
        tokenType: createType === 'app' ? 6 : 4,
        projectId,
      })
      .then(res => {
        this.setState({ token: res });
        this.getPreviewData({
          token: res,
          ...params,
        });
      });
  };
  getPreviewData = (params = {}) => {
    const { projectId, appId } = this.props;
    const { filePath, fileType, fileName, token } = params;

    const questParams = {
      accountId: md.global.Account.accountId,
      projectId,
      appId,
      csvName: _.includes(fileType, 'csv') ? fileName : undefined,
      filePath,
      token,
    };

    window
      .mdyAPI('', '', questParams, {
        ajaxOptions: {
          type: 'GET',
          url: md.global.Config.WorksheetDownUrl + '/Import/Preview',
        },
        customParseResponse: true,
      })
      .then(res => {
        this.props.changeSetDataDialogVisible(true);
        this.props.changeDialogUploadVisible(false);
        const { data: sheetList, id, versionLimitSheetCount, currentSheetCount, freeRowCount } = res.data || {};
        const overImportLength = versionLimitSheetCount - currentSheetCount;
        let data = sheetList.map(item => {
          const temp =
            item.matchControl &&
            Object.values(item.matchControl).map(it => {
              const cells = _.get(item.rows[0], 'cells');

              const controlName = _.get(
                _.find(cells, v => v.columnNumber === it.row),
                'value',
              );
              let defaultData = _.omit(DEFAULT_DATA[enumWidgetType[item.type]], ['controlName']);
              if (item.advancedSetting) {
                defaultData.advancedSetting = _.defaults(item.advancedSetting, defaultData.advancedSetting || {});
              }
              if (controlName) {
                defaultData.controlName = controlName;
              }
              return { ...it, ...defaultData };
            });
          return {
            ...item,
            matchControl: temp ? Object.assign({}, temp) : {},
            rowNum: 1,
            disabled:
              !item.rows ||
              !item.rows.length ||
              item.total - 1 > 20000 ||
              (item.rows && item.rows.some(v => v.cells && v.cells.length > 200)),
          };
        });
        let selectedSheetIds = [];
        let filterSheets = data.filter(item => !item.isMerge && !item.disabled);

        if (versionLimitSheetCount !== 0) {
          _.reduce(
            filterSheets || [],
            (result, current, index) => {
              if (index < overImportLength) {
                selectedSheetIds.push(current.sheetId);
              }
              return result + current.total;
            },
            0,
          );
        } else {
          _.reduce(
            filterSheets || [],
            (result, current, index) => {
              selectedSheetIds.push(current.sheetId);
              return result + current.total;
            },
            0,
          );
        }
        data =
          versionLimitSheetCount !== 0
            ? data.map(it => {
                if (!_.includes(selectedSheetIds, it.sheetId)) {
                  return { ...it, disabled: true };
                }
                return it;
              })
            : data;

        const sheetInfo = !_.isEmpty((data || []).filter(it => !it.disabled)) ? data.filter(it => !it.disabled)[0] : {};
        this.props.updateExcelDetailData(data);
        this.props.updateSelectedImportSheetIds(selectedSheetIds);
        this.props.updateCurrentSheetInfo({
          ...sheetInfo,
          selectCells: (_.get(sheetInfo, 'rows[0].cells') || []).map(it => it.columnNumber),
        });
        this.setState({ id, versionLimitSheetCount, currentSheetCount, freeRowCount, socketId: res.message });
      });
  };
  fileUploaded = file => {
    const { appInfo } = this.props;
    const { name, key, type, serverName } = file;
    let temp = name.split('.');
    temp.splice(temp.length - 1);
    let appName = temp.join('.');

    this.props.updateAppInfo({ ...appInfo, appName });
    this.setState({ filePath: serverName + key });
    this.getToken({ filePath: serverName + key, fileType: type, fileName: appName });
  };
  cancelDialogUpload = () => {
    this.props.onCancel();
    this.props.changeDialogUploadVisible(false);
  };
  handleLast = () => {
    this.props.changeSetDataDialogVisible(true);
    this.props.changeDialogCreateAppVisible(false);
  };

  getCells = (rows = [], matchControl = [], selectCells = []) => {
    const cells = rows.length && rows[0].cells ? rows[0].cells : [];
    return _.filter(cells, it => _.includes(selectCells, it.columnNumber)).map(item => {
      return {
        ...item,
        control: _.find(matchControl, v => v.row === item.columnNumber) || {},
      };
    });
  };

  getParams = isMore => {
    const { id, filePath, freeRowCount } = this.state;
    const {
      createType,
      projectId,
      appId,
      groupId,
      excelDetailData = [],
      selectedImportSheetIds,
      appInfo,
      appGroupId,
      appGroupType,
    } = this.props;
    const importSheets = excelDetailData.filter(it => _.includes(selectedImportSheetIds, it.sheetId));
    const extra =
      createType === 'app'
        ? { ...appInfo, groupId: appGroupId, groupType: appGroupType }
        : { appId, sectionId: groupId };
    let hasEmptyRows = importSheets.some(it => !it.rows || !it.rows.length);
    let hasEmptyCells = importSheets.some(
      it => it.rows && it.rows.length && it.rows.some(v => !v.cells || !v.cells.length),
    );
    let noRowNum = importSheets.some(it => !it.rowNum);
    const licenseType = _.get(
      _.find(md.global.Account.projects, project => project.projectId === projectId) || {},
      'licenseType',
    );
    let totalRows = _.reduce(
      importSheets,
      (result, current) => {
        return result + (current.total - current.rowNum);
      },
      0,
    );
    if (licenseType === 0 && totalRows + freeRowCount > 50000 && createType !== 'app') {
      alert(_l('超过导入上限(上限 50000 行)，请调整导入数据'), 3);
      return;
    }
    // 最多20个Sheet，单个Sheet最多20000行，最多200列、免费版本总行数不得超过5w行
    if (importSheets.length > 20) {
      alert(_l('当前版本最多支持20个Sheet'), 3);
      return;
    } else if (importSheets.some(item => item.total - 1 > 20000)) {
      alert(_l('当前版本单个sheet最多支持20000行'), 3);
      return;
    } else if (importSheets.some(item => item.rows && item.rows.some(it => it.cells && it.cells.length > 200))) {
      alert(_l('当前版本单个sheet最多支持200列'), 3);
      return;
    } else if (noRowNum || hasEmptyRows || hasEmptyCells) {
      return alert(_l('表头第一列不得为空'), 3);
    }
    const sheetList = importSheets.map(item => {
      return {
        sheetNumber: item.sheetNumber,
        sheetName: item.sheetName.slice(0, 100),
        sheetId: item.sheetId,
        titleNumber: item.rowNum - 1,
        cells: this.getCells(item.rows, item.matchControl, item.selectCells),
      };
    });
    const configs = isMore ? sheetList.slice(10) : sheetList.slice(0, 10);
    const params = isMore
      ? { id, configs }
      : {
          id,
          projectId,
          accountId: md.global.Account.accountId,
          filePath,
          importType: createType === 'worksheet' ? 1 : 2,
          importDataed: true,
          total: selectedImportSheetIds.length,
          configs,
          ...extra,
        };
    return params;
  };

  handleNext = () => {
    if (!this.getParams()) return;
    const { createType, excelDetailData = [], selectedImportSheetIds, refreshPage = () => {} } = this.props;
    const importSheets = excelDetailData.filter(it => _.includes(selectedImportSheetIds, it.sheetId));
    const isMore = importSheets.length > 10;
    if (createType === 'worksheet') {
      antNotification.info({
        key: this.state.socketId,
        loading: true,
        message: _l('正在导入表数据'),
        description: _l('数据将在后台持续导入，导入完成后会给您发送系统通知。'),
      });
      this.setState({ importLoading: true });

      window
        .mdyAPI('', '', this.getParams(), {
          ajaxOptions: {
            url: md.global.Config.WorksheetDownUrl + '/Import/Create',
          },
          customParseResponse: true,
        })
        .then(res => {
          this.props.onCancel();
          if (isMore) {
            this.importMore();
          } else {
            refreshPage();
            this.setState({ importLoading: false });
          }
        });
    } else if (createType === 'app') {
      this.props.changeSetDataDialogVisible(false);
      this.props.changeDialogCreateAppVisible(true);
    }
  };
  createApp = dbInstanceId => {
    const { excelDetailData = [], selectedImportSheetIds } = this.props;
    const importSheets = excelDetailData.filter(it => _.includes(selectedImportSheetIds, it.sheetId));
    const isMore = importSheets.length > 10;
    antNotification.info({
      key: this.state.socketId,
      loading: true,
      message: _l('正在导入表数据'),
      description: _l('数据将在后台持续导入，导入完成后会给您发送系统通知。'),
    });
    this.setState({ importLoading: true });

    window
      .mdyAPI(
        '',
        '',
        { ...this.getParams(), dbInstanceId },
        {
          ajaxOptions: {
            url: md.global.Config.WorksheetDownUrl + '/Import/Create',
          },
          customParseResponse: true,
        },
      )
      .then(res => {
        this.props.updateAppInfo({ ...this.props.appInfo, appId: res.data });
        if (isMore) {
          this.importMore();
        } else {
          this.setState({ importLoading: false, createAppStatus: 1 });
        }
      });
  };
  importMore = () => {
    const { createType, refreshPage = () => {} } = this.props;

    window
      .mdyAPI('', '', this.getParams(true), {
        ajaxOptions: {
          url: md.global.Config.WorksheetDownUrl + '/Import/CreateSheet',
        },
        customParseResponse: true,
      })
      .then(res => {
        if (createType === 'app') {
          this.setState({ importLoading: false, createAppStatus: 1 });
          this.props.updateAppInfo({ ...this.props.appInfo, appId: res.data });
        } else {
          this.setState({ importLoading: false, importLoading: false });
          this.props.onCancel();
          refreshPage();
        }
      });
  };

  handleCreate = () => {
    const { projectId } = this.props;
    const hasDataBase =
      getFeatureStatus(projectId, VersionProductType.dataBase) === '1' && !md.global.Config.IsPlatformLocal;
    const hasAppResourceAuth = checkPermission(projectId, PERMISSION_ENUM.APP_RESOURCE_SERVICE);

    if (hasDataBase && hasAppResourceAuth) {
      homeAppAjax
        .getMyDbInstances({
          projectId: this.props.projectId,
        })
        .then(res => {
          if (res && res.length) {
            this.props.changeDialogCreateAppVisible(false);
            this.setState({ DBInstances: res, DBInstancesDialog: true });
          } else {
            this.createApp();
          }
        });
      return;
    }
    this.createApp();
  };

  renderDBInstances = () => {
    const { DBInstancesDialog, DBInstances = [] } = this.state;

    const options = [{ value: '', label: _l('系统默认数据库') }].concat(
      DBInstances.map(l => {
        return {
          value: l.id,
          label: l.name,
        };
      }),
    );

    return (
      <SelectDBInstance
        visible={DBInstancesDialog}
        options={options}
        onOk={id => this.createApp(id)}
        onCancel={() => this.setState({ DBInstancesDialog: false })}
      />
    );
  };

  render() {
    const { createAppStatus, importLoading, versionLimitSheetCount, currentSheetCount, freeRowCount } = this.state;
    const {
      projectId,
      dialogUploadVisible,
      setDataDialogVisible,
      dialogCreateAppVisible,
      excelDetailData = [],
      currentSheetInfo = {},
      selectedImportSheetIds = [],
      appInfo,
    } = this.props;

    return (
      <Fragment>
        <DialogUpload
          visible={dialogUploadVisible}
          onCancel={this.cancelDialogUpload}
          fileUploaded={this.fileUploaded}
        />
        <SetImportExcelCreateWorksheetOrApp
          visible={setDataDialogVisible}
          createType={this.props.createType}
          excelDetailData={excelDetailData}
          currentSheetInfo={currentSheetInfo}
          versionLimitSheetCount={versionLimitSheetCount}
          currentSheetCount={currentSheetCount}
          selectedImportSheetIds={selectedImportSheetIds}
          updateCurrentSheetInfo={this.props.updateCurrentSheetInfo}
          updateSelectedImportSheetIds={this.props.updateSelectedImportSheetIds}
          updateExcelDetailData={this.props.updateExcelDetailData}
          importLoading={importLoading}
          handleNext={this.handleNext}
          onCancel={() => {
            this.props.changeSetDataDialogVisible(false);
            this.props.onCancel();
          }}
        />
        {dialogCreateAppVisible && (
          <DialogCreateApp
            visible={dialogCreateAppVisible}
            createAppStatus={createAppStatus}
            createAppLoading={importLoading}
            excelDetailData={excelDetailData}
            importSheets={excelDetailData.filter(it => _.includes(selectedImportSheetIds, it.sheetId))}
            appInfo={appInfo}
            projectId={projectId}
            updateExcelDetailData={this.props.updateExcelDetailData}
            updateAppInfo={this.props.updateAppInfo}
            handleLast={this.handleLast}
            createApp={this.handleCreate}
            freeRowCount={freeRowCount}
            onCancel={() => {
              this.props.changeDialogCreateAppVisible(false);
              this.props.onCancel();
            }}
          />
        )}
        {this.renderDBInstances()}
      </Fragment>
    );
  }
}

export default connect(
  state => {
    const { excelCreateAppAndSheet = {} } = state.sheet;
    return excelCreateAppAndSheet;
  },
  dispatch =>
    bindActionCreators(
      {
        changeDialogUploadVisible,
        changeSetDataDialogVisible,
        changeDialogCreateAppVisible,
        changeCreateAppLoading,
        updateExcelDetailData,
        updateCurrentSheetInfo,
        updateSelectedImportSheetIds,
        updateAppInfo,
      },
      dispatch,
    ),
)(DialogImportExcelCreate);
