import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImportExcel from './ImportExcel';
import ImportConfig from './ImportConfig';
import ConfigControl from './ConfigControl';
import ErrorDialog from './ErrorDialog';
import { antNotification } from 'ming-ui';
import _ from 'lodash';

export const wsexcelSocketInit = () => {
  if (!window.IM) return;

  IM.socket.on(
    'wsexcel',
    ({
      accountIds,
      addCount,
      errorCount,
      repeatCount,
      skipCount,
      updateCount,
      id,
      wsServiceErrorCount,
      repeated,
      isErrorMsg,
    }) => {
      if (_.includes(accountIds, md.global.Account.accountId)) {
        const formatNum = num => {
          return num.toString().replace(/(\d{1,3})(?=(?:\d{3})+$)/g, '$1,');
        };
        const aCount = addCount;
        const eCount = errorCount;
        const rCount = repeatCount;
        const sCount = skipCount;
        const uCount = updateCount;
        const title = () => {
          const txt1 = [
            repeated !== 3 ? _l('新增%0行', formatNum(aCount)) : '',
            uCount || repeated === 3 ? _l('更新%0行', formatNum(uCount)) : '',
            eCount ? _l('其中%0行错误', formatNum(eCount)) : '',
          ]
            .filter(o => o)
            .join(', ');
          const txt2 =
            sCount && rCount && sCount - rCount
              ? '；' +
                _l('跳过%0行（%1行重复，%2行错误）', formatNum(sCount), formatNum(rCount), formatNum(sCount - rCount))
              : sCount && rCount
              ? '；' + _l('跳过%0行重复', formatNum(sCount))
              : sCount
              ? '；' + _l('跳过%0行错误', formatNum(sCount))
              : '';

          return txt1 + txt2;
        };

        antNotification.close(id);
        antNotification.success({
          message: _l('导入完成'),
          description: wsServiceErrorCount > 0 ? _l('导入完成，有部分数据未被导入,请删除重复值后重试') : title(),
          btnText: isErrorMsg ? _l('查看错误报告') : '',
          onBtnClick: () => {
            new ErrorDialog({ fileKey: id });
          },
        });
      }
    },
  );
};

export default class ImportDataFromExcel extends Component {
  static propTypes = {
    isCharge: PropTypes.bool,
    hideImportDataFromExcel: PropTypes.func,
    appId: PropTypes.string,
    worksheetId: PropTypes.string,
    worksheetName: PropTypes.string,
  };
  constructor(props) {
    super(props);
    this.state = {
      showUploadExcel: true, // 上传excel
      showImportConfigDialog: false, // 导入配置弹层
      showConfigControl: false, // 映射控件弹层

      fileList: [], // 上传的excel文件行列信息
      fileInfo: {}, // 上传的excel信息 fileName名称 filePath链接 fileId知识文件Id
      fileKey: '', // 后端的excelKey
      importSheetInfo: {}, // 导入的sheet内容
      selectRow: {}, // 导入的sheet表头行信息
    };
  }

  render() {
    const { isCharge, appId, worksheetId, worksheetName, hideImportDataFromExcel } = this.props;
    const {
      showImportConfigDialog,
      showConfigControl,
      importExcelInfo,
      fileList,
      fileInfo,
      fileKey,
      importSheetInfo,
      selectRow,
    } = this.state;
    if (showImportConfigDialog) {
      return (
        <ImportConfig
          hideImportConfig={hideImportDataFromExcel}
          fileName={fileInfo.fileName}
          fileList={fileList}
          nextStep={(selectRow, importSheetInfo) => {
            this.setState({ showImportConfigDialog: false, showConfigControl: true, selectRow, importSheetInfo });
          }}
        />
      );
    } else if (showConfigControl) {
      return (
        <ConfigControl
          isCharge={isCharge}
          appId={appId}
          worksheetId={worksheetId}
          filePath={fileInfo.filePath}
          fileId={fileInfo.fileId}
          fileKey={fileKey}
          importExcelInfo={importExcelInfo}
          onSave={key => {
            antNotification.info({
              key,
              loading: true,
              message: _l('正在导入数据“%0”', worksheetName),
              description: _l('这可能需要一段时间。现在您可以进行其他操作，全部导入完成后将会通知您'),
            });
          }}
          onCancel={hideImportDataFromExcel}
          selectRow={selectRow}
          importSheetInfo={importSheetInfo}
          onPrevious={() => {
            this.setState({ showConfigControl: false, showImportConfigDialog: true });
          }}
        />
      );
    }

    return (
      <ImportExcel
        hideUploadExcel={(fileList, fileInfo, fileKey) => {
          if (!fileList) {
            hideImportDataFromExcel();
          }

          this.setState({
            showUploadExcel: false,
            showImportConfigDialog: !!fileList,
            fileList: fileList ? fileList.filter(item => item.rows.length) : [],
            fileInfo,
            fileKey,
          });
        }}
        worksheetId={worksheetId}
      />
    );
  }
}
