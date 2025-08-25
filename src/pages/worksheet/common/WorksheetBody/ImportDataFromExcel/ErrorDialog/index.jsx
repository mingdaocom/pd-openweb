import React, { Component, Fragment } from 'react';
import { createRoot } from 'react-dom/client';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Dialog, Icon, ScrollView } from 'ming-ui';
import WorksheetItem from 'src/pages/worksheet/components/DialogImportExcelCreate/SetImportExcelCreateWorksheetOrApp/WorksheetItem';
import './index.less';

class ErrorDialog extends Component {
  static propTypes = {
    fileKey: PropTypes.string,
    isBatch: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.state = {
      complete: false,
      data: {},
      currentSheetInfo: {},
      visible: true,
    };
  }

  componentDidMount() {
    if (this.props.isBatch) {
      this.getBatchErrorLog();
    } else {
      this.getSuccess();
    }
  }

  getSuccess() {
    const { fileKey } = this.props;
    const requestData = { randomKey: fileKey };

    window
      .mdyAPI('', '', requestData, {
        ajaxOptions: {
          type: 'GET',
          url: `${md.global.Config.WorksheetDownUrl}/ExportExcel/GetSuccessCount`,
        },
        customParseResponse: true,
      })
      .then(result => {
        this.setState({
          complete: true,
          data: result.data,
        });
      });
  }
  getBatchErrorLog = () => {
    const { fileKey } = this.props;
    const requestData = { randomKey: fileKey };

    window
      .mdyAPI('', '', requestData, {
        ajaxOptions: {
          type: 'GET',
          url: `${md.global.Config.WorksheetDownUrl}/ExportExcel/GetImportLogs`,
        },
        customParseResponse: true,
      })
      .then(result => {
        const errorData = (result.data || []).filter(it => it.errorCount);
        this.setState({
          complete: true,
          data: result.data.map(it => ({
            ...it,
            sheetName: it.worksheetName,
            sheetId: it.worksheetId,
          })),
          currentSheetInfo: errorData
            ? { ...errorData[0], sheetName: errorData[0].worksheetName, sheetId: errorData[0].worksheetId }
            : {},
          selectedImportSheetIds: errorData.map(it => it.worksheetId),
        });
      });
  };

  renderTitle = () => {
    const { isBatch } = this.props;
    const { currentSheetInfo = {} } = this.state;
    const temp = _.isEmpty(currentSheetInfo)
      ? this.state.data[0]
      : _.find(this.state.data, it => it.worksheetId === currentSheetInfo.worksheetId) || {};
    const data = isBatch ? temp : this.state.data;
    const { addCount, errorCount, repeatCount, skipCount, updateCount, repeated } = data;
    const formatNum = num => {
      return num.toString().replace(/(\d{1,3})(?=(?:\d{3})+$)/g, '$1,');
    };
    const aCount = addCount;
    const eCount = errorCount;
    const rCount = repeatCount;
    const sCount = skipCount;
    const uCount = updateCount;
    const txt1 = [
      repeated !== 3 ? _l('新增%0行', formatNum(aCount)) : '',
      uCount || repeated === 3 ? _l('更新%0行', formatNum(uCount)) : '',
      eCount ? _l('其中%0行错误', formatNum(eCount)) : '',
    ]
      .filter(o => o)
      .join(', ');
    const txt2 =
      sCount && rCount && sCount - rCount
        ? '；' + _l('跳过%0行（%1行重复，%2行错误）', formatNum(sCount), formatNum(rCount), formatNum(sCount - rCount))
        : sCount && rCount
          ? '；' + _l('跳过%0行重复', formatNum(sCount))
          : sCount
            ? '；' + _l('跳过%0行错误', formatNum(sCount))
            : '';

    return txt1 + txt2;
  };

  renderBatch = () => {
    const { data, currentSheetInfo, selectedImportSheetIds = [] } = this.state;
    const temp = _.find(data, it => it.worksheetId === currentSheetInfo.worksheetId) || {};
    return (
      <div className="flexColumn h100">
        <WorksheetItem
          excelDetailData={data}
          currentSheetInfo={currentSheetInfo}
          selectedImportSheetIds={selectedImportSheetIds}
          updateCurrentSheetInfo={data => {
            this.setState({ currentSheetInfo: data });
          }}
          updateSelectedImportSheetIds={data => {
            this.setState({ selectedImportSheetIds: data });
          }}
          disabled={true}
        />
        {this.renderErroContent(temp.excelLogs)}
      </div>
    );
  };

  renderErroContent = (data = []) => {
    const { fileKey, isBatch } = this.props;
    const { currentSheetInfo } = this.state;
    return (
      <Fragment>
        <div className={cx('flexRow', { pTop15: isBatch })}>
          <div>{this.renderTitle()}</div>
          <div
            className="successText"
            data-tip={_l('错误单元格分两种，非留白和留白类错误，留白类错误在错误报告中红字提示')}
          >
            <Icon icon="help" className="Font14 pointer Gray_9e mLeft5" />
          </div>
          <div className="flex" />
          <a
            className="ThemeColor3 ThemeHoverColor2 pointer"
            href={`${md.global.Config.WorksheetDownUrl}/ExportExcel/LoadErrorLog?randomKey=${fileKey}${
              isBatch ? '&worksheetId=' + currentSheetInfo.sheetId : ''
            }`}
            target="_blank"
          >
            {_l('下载错误报告')}
          </a>
        </div>
        <ScrollView className="importErrorBox flex mTop15">
          {data.map((item, index) => {
            return (
              <div key={index} className="mBottom10 pLeft12 pRight12">
                <span className={cx('mRight5', item.logLvl !== 1 ? 'Red' : 'Gray_9e')}>
                  ({_l('第%0行', item.rowNumber)})
                </span>
                <span className={cx('Bold mRight8', item.logLvl !== 1 ? 'Red' : 'Gray')}>{item.columnName}</span>
                <span className={item.logLvl !== 1 && 'Red'}>{item.describe}</span>
              </div>
            );
          })}
        </ScrollView>
      </Fragment>
    );
  };

  render() {
    const { isBatch } = this.props;
    const { complete, data, visible } = this.state;
    if (!complete) return null;

    if (isBatch) {
      return (
        <Dialog
          className="importErrorDialog"
          visible={visible}
          width="640"
          title={_l('错误报告')}
          footer={null}
          onCancel={() => {
            this.setState({ visible: false });
          }}
        >
          {this.renderBatch()}
        </Dialog>
      );
    }

    return (
      <Dialog.confirm
        className="importErrorDialog"
        visible={true}
        width="640"
        title={_l('错误报告')}
        noFooter={true}
        anim={false}
      >
        <div className="flexColumn h100">{this.renderErroContent(data.excelLogs)}</div>
      </Dialog.confirm>
    );
  }
}

export default ({ fileKey, isBatch }) => {
  const root = createRoot(document.createElement('div'));

  root.render(<ErrorDialog fileKey={fileKey} isBatch={isBatch} />);
};
