import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import cx from 'classnames';
import { Dialog, Dropdown, RadioGroup, Input, Button, Support } from 'ming-ui';
import { renderCellText } from 'src/pages/worksheet/components/CellControls';
import sheetAjax from 'src/api/worksheet';
import renderQr from './renderWorksheetRowQrCode';
import './PrintQrCode.less';

const PRINT_TYPE = {
  A4: 1,
  QRCODE_RPITER: 2,
};

export default class PrintQrCode extends Component {
  static propTypes = {
    appId: PropTypes.string,
    viewId: PropTypes.string,
    visible: PropTypes.bool,
    worksheetId: PropTypes.string,
    worksheetName: PropTypes.string,
    columns: PropTypes.arrayOf(PropTypes.shape({})),
    selectedRows: PropTypes.arrayOf(PropTypes.shape({})),
    onHide: PropTypes.func,
  };
  constructor(props) {
    super(props);
    const titleControl = props.columns.filter(column => column.attribute)[0];
    this.state = {
      printType: PRINT_TYPE.A4,
      layoutType: 1,
      customText: _l('扫描二维码查看'),
      printColumns: [titleControl],
      isGenerating: false,
      shareType: 1,
    };
  }

  get maxColumnLength() {
    const { printType, layoutType } = this.state;
    return printType === PRINT_TYPE.QRCODE_RPITER && (layoutType === 0 || layoutType === 1) ? 1 : 3;
  }

  @autobind
  handleAddColumn() {
    const { columns } = this.props;
    const { printColumns } = this.state;
    const newPrintColumns = printColumns.slice(0);
    newPrintColumns.push(
      columns.filter(c => !c.attribute && !_.find(printColumns, cc => cc.controlId === c.controlId))[0],
    );
    this.setState({ printColumns: newPrintColumns });
  }
  @autobind
  handleChangeColumn(i, value) {
    const { columns } = this.props;
    const { printColumns } = this.state;
    const newPrintColumns = printColumns.slice(0);
    newPrintColumns[i] = _.find(columns, c => c.controlId === value);
    this.setState({ printColumns: newPrintColumns });
  }
  @autobind
  handleDeleteColumn(i) {
    const { printColumns } = this.state;
    const newPrintColumns = printColumns.slice(0);
    newPrintColumns.splice(i, 1);
    this.setState({ printColumns: newPrintColumns });
  }
  @autobind
  getShortUrl(cb = () => {}) {
    const { appId, viewId, worksheetId, selectedRows } = this.props;
    const noShortUrlIds = selectedRows.map(data => data.rowid);
    sheetAjax
      .getRowsShortUrl({
        appId,
        viewId,
        worksheetId,
        rowIds: noShortUrlIds,
      })
      .then(data => {
        if (data && _.isObject(data)) {
          cb(data);
        }
      });
  }
  @autobind
  handlePrint() {
    const _this = this;
    const { appId, worksheetId, viewId, selectedRows, worksheetName, columns } = this.props;
    const { printType, layoutType, shareType, printColumns, customText } = this.state;
    const { maxColumnLength } = this;
    this.setState({
      isGenerating: true,
    });
    function execute(urls) {
      const qrs = selectedRows.map((data, i) => ({
        url: urls[data.rowid] || urls[i] || '/404',
        texts: printColumns
          .slice(0, maxColumnLength)
          .map(column => {
            return renderCellText(Object.assign({}, column, { value: data[column.controlId] }));
          })
          .concat(customText || []),
      }));
      renderQr(printType, layoutType, qrs, {
        worksheetName,
        cb: () => {
          _this.setState({
            isGenerating: false,
          });
        },
      });
    }
    if (shareType === 1) {
      this.getShortUrl(execute);
    } else {
      execute(selectedRows.map(r => `${location.origin}/app/${appId}/${worksheetId}/row/${r.rowid}`));
    }
  }
  getSizeData(type) {
    return type === PRINT_TYPE.A4
      ? [
          {
            value: 1,
            text: '1*1',
          },
          {
            value: 2,
            text: '1*2',
          },
          {
            value: 3,
            text: '2*2',
          },
          {
            value: 4,
            text: '2*5',
          },
          {
            value: 5,
            text: '3*6',
          },
        ]
      : [
          {
            value: 0,
            text: '30mm*20mm',
          },
          {
            value: 1,
            text: '40mm*30mm',
          },
          {
            value: 2,
            text: '60mm*40mm',
          },
          {
            value: 3,
            text: '80mm*60mm',
          },
          {
            value: 4,
            text: '100mm*80mm',
          },
        ];
  }
  @autobind
  renderLayoutTypes() {
    const { layoutType, printType, printColumns } = this.state;
    return (
      <RadioGroup
        className={cx('layoutTypes', { qr: printType === PRINT_TYPE.QRCODE_RPITER })}
        data={this.getSizeData(printType)}
        checkedValue={layoutType}
        onChange={value => {
          this.setState({
            layoutType: value,
          });
        }}
      />
    );
  }
  render() {
    const { columns, visible, onHide } = this.props;
    const { isGenerating, layoutType, shareType, printColumns, printType, customText } = this.state;
    const { maxColumnLength } = this;
    const titleControl = columns.filter(column => column.attribute)[0];
    return (
      <Dialog
        className="printWorksheetRowQrCode"
        headerClass="hide"
        bodyClass="pAll0"
        visible={visible}
        anim={false}
        width={760}
        okText={_l('打印')}
        onCancel={onHide}
        footer={null}
        onOk={this.handlePrint}
      >
        <div className="printCon flexRow">
          <div className="configPanel flex">
            <div className="title">
              {_l('打印设置')}
              <span className="Right">
                <Support type={2} href="https://help.mingdao.com/operation13.html" text={_l('使用帮助')} />
              </span>
            </div>
            <Dropdown
              data={[
                {
                  text: _l('A4纸打印'),
                  value: PRINT_TYPE.A4,
                },
                {
                  text: _l('二维码打印机'),
                  value: PRINT_TYPE.QRCODE_RPITER,
                },
              ]}
              style={{
                width: '100%',
              }}
              menuClass="printQrDownlist"
              isAppendToBody
              border
              value={printType}
              onChange={value => {
                this.setState({
                  printType: value,
                  layoutType: value === PRINT_TYPE.A4 ? 1 : 0,
                  printColumns: value === PRINT_TYPE.QRCODE_RPITER ? [titleControl] : printColumns,
                });
              }}
            />
            <div className="configItem">
              <div className="itemLabel">{printType === PRINT_TYPE.A4 ? _l('排版') : _l('二维码尺寸')}</div>
              <div className="itemContent">{this.renderLayoutTypes()}</div>
            </div>
            <div className="configItem">
              <div className="itemLabel">{_l('显示文字')}</div>
              <div className="desc">
                {_l('选择字段')}
                {printColumns.length < maxColumnLength && (
                  <span className="addColumn Hand Right" onClick={this.handleAddColumn}>
                    {_l('+ 添加字段')}
                  </span>
                )}
              </div>
              <div className="itemContent">
                {printColumns.slice(0, maxColumnLength).map((column, i) => (
                  <div key={i} className="selectColumn flexRow">
                    <Dropdown
                      data={columns.map(c => ({
                        text: c.controlName + (c.attribute === 1 ? _l('（标题）') : ''),
                        value: c.controlId,
                        disabled: !!_.find(printColumns, cc => cc.controlId === c.controlId),
                      }))}
                      menuClass="printQrDownlist"
                      isAppendToBody
                      maxHeight={150}
                      value={column.controlId}
                      border
                      style={{
                        width: '100%',
                      }}
                      onChange={value => {
                        this.handleChangeColumn(i, value);
                      }}
                    />
                    {i !== 0 && (
                      <i
                        className="icon icon-delete deleteColumnBtn Hand"
                        onClick={() => {
                          this.handleDeleteColumn(i);
                        }}
                      ></i>
                    )}
                  </div>
                ))}
                <div className="desc mTop10">{_l('自定义文字')}</div>
                <Input
                  className="w100"
                  defaultValue={customText}
                  onChange={value => {
                    this.setState({ customText: value });
                  }}
                />
              </div>
            </div>
            <div className="configItem">
              <div className="itemLabel">{_l('二维码权限')}</div>
              <div className="itemContent">
                <Dropdown
                  data={[
                    {
                      text: _l('公开分享'),
                      value: 1,
                    },
                    {
                      text: _l('仅限应用成员访问'),
                      value: 2,
                    },
                  ]}
                  style={{
                    width: '100%',
                  }}
                  isAppendToBody
                  border
                  value={shareType}
                  onChange={v => {
                    this.setState({ shareType: v });
                  }}
                />
              </div>
            </div>
          </div>
          <div className="layoutPreview">
            <div
              className={cx(
                'previewImage',
                printType === PRINT_TYPE.A4 ? `img${layoutType}` : layoutType === 1 || layoutType === 0 ? 'qr2' : 'qr',
              )}
            ></div>
            <div className="btns">
              <Button type="link" onClick={onHide}>
                {_l('取消')}
              </Button>
              <Button type="primary" loading={isGenerating} onClick={this.handlePrint}>
                {_l('打印')}
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    );
  }
}
