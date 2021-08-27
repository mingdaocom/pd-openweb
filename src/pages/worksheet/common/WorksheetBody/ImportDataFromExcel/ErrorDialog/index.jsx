import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Icon, Dialog, ScrollView } from 'ming-ui';
import './index.less';

class ErrorDialog extends Component {
  static propTypes = {
    fileKey: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      complete: false,
      successCount: 0,
      errorCount: 0,
      excelLogs: [],
    };
  }

  componentDidMount() {
    this.getSuccess();
  }

  getSuccess() {
    const { fileKey } = this.props;

    $.ajax(md.global.Config.WorksheetDownUrl + '/ExportExcel/GetSuccessCount', {
      data: {
        randomKey: fileKey,
      },
      beforeSend: xhr => {
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      },
      success: result => {
        this.setState({
          complete: true,
          errorCount: result.data.errorCount,
          successCount: result.data.successCount,
          excelLogs: result.data.excelLogs,
        });
      },
    });
  }

  render() {
    const { fileKey } = this.props;
    const { complete, successCount, errorCount, excelLogs } = this.state;

    if (!complete) return null;

    return (
      <Dialog.confirm
        className="importErrorDialog"
        visible={true}
        width="640"
        title={_l('错误报告')}
        noFooter={true}
        anim={false}
      >
        <div className="flexColumn h100">
          <div className="flexRow">
            <div>
              {_l(
                '导入 %0 行数据，%1 行错误',
                successCount.toString().replace(/(\d{1,3})(?=(?:\d{3})+$)/g, '$1,'),
                errorCount.toString().replace(/(\d{1,3})(?=(?:\d{3})+$)/g, '$1,'),
              )}
            </div>
            <div
              className="successText"
              data-tip={_l('错误单元格分两种，非留白和留白类错误，留白类错误在错误报告中红字提示')}
            >
              <Icon icon="novice-circle" className="Font14 pointer Gray_9e mLeft5" />
            </div>
            <div className="flex" />
            <a
              className="ThemeColor3 ThemeHoverColor2 pointer"
              href={`${md.global.Config.WorksheetDownUrl}/ExportExcel/LoadErrorLog?randomKey=${fileKey}`}
              target="_blank"
            >
              {_l('下载错误报告')}
            </a>
          </div>
          <ScrollView className="importErrorBox flex mTop15">
            {excelLogs.map((item, index) => {
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
        </div>
      </Dialog.confirm>
    );
  }
}

export default ({ fileKey }) => {
  ReactDOM.render(<ErrorDialog fileKey={fileKey} />, document.createElement('div'));
};
