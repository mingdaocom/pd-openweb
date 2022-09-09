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
      data: {},
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
          data: result.data,
        });
      },
    });
  }

  renderTitle = () => {
    const { data } = this.state;
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

  render() {
    const { fileKey } = this.props;
    const { complete, data } = this.state;

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
            <div>{this.renderTitle()}</div>
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
            {data.excelLogs.map((item, index) => {
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
