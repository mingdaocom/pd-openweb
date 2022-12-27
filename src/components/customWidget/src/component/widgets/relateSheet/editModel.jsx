import React from 'react';
import sheetAjax from 'src/api/worksheet';
import LoadDiv from 'ming-ui/components/LoadDiv';
import config from '../../../config';
import _ from 'lodash';

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

class EditModel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      controls: [],
    };
  }
  componentDidMount() {
    this.setControls(this.props.widget);
  }
  componentWillReceiveProps(nextProps) {
    if (
      (nextProps.widget.data.enumDefault !== this.props.widget.data.enumDefault &&
        nextProps.widget.data.enumDefault === 2) ||
      nextProps.widget.data.dataSource !== this.props.widget.data.dataSource
    ) {
      this.setControls(nextProps.widget);
    }
  }
  setControls(widget) {
    const enumDefault = widget.data.enumDefault;
    const worksheetId = widget.data.dataSource;
    const showControls = widget.data.showControls;
    if (worksheetId && enumDefault === 2) {
      if (window.customWidgetWorksheetControlsCache && window.customWidgetWorksheetControlsCache[worksheetId]) {
        if (showControls) {
          this.setState({
            loading: false,
            controls: window.customWidgetWorksheetControlsCache[worksheetId],
          });
        }
      } else {
        this.setState({
          loading: true,
        });
        sheetAjax.getWorksheetInfo({ worksheetId, getTemplate: true }).then(data => {
          if (!window.customWidgetWorksheetControlsCache) {
            window.customWidgetWorksheetControlsCache = {};
          }
          window.customWidgetWorksheetControlsCache[worksheetId] = data.template.controls;
          this.setState({
            loading: false,
            controls: window.customWidgetWorksheetControlsCache[worksheetId],
          });
        });
      }
    }
  }
  getTableWidth(columns) {
    let width = 'auto';
    const table = document.createElement('div');
    table.innerHTML = `
      <div style="width: 10000px">
        <table cellPadding="0" cellSpacing="0">
          <tr>
            ${columns.map(
              (
                column,
                i,
              ) => `<td style="font-size: 12px;line-height: 38px;height: 38px;padding: 0 30px;border: 1px solid #ddd;">
              ${column.controlName}
            </td>`,
            )}
          </tr>
        <table>
    `;
    document.body.appendChild(table);
    width = table.querySelector('table').clientWidth;
    document.body.removeChild(table);
    return width;
  }
  renderTable() {
    const { widget } = this.props;
    const { loading, controls } = this.state;
    if (loading) {
      return (
        <div className="mutipleRelateSheetModel tableLoading">
          <LoadDiv />
        </div>
      );
    }
    let columns = widget.data.showControls
      .map(showControl => _.find(controls.concat(systemControl), control => control.controlId === showControl))
      .filter(c => c);
    if (!columns.length) {
      return this.renderEmpty(_l('请从右侧选择需要显示的字段'));
    }
    const tableWidth = this.getTableWidth(columns);
    return (
      <div
        className="editModel mutipleRelateSheetModel"
        ref={modelCon => (this.modelCon = modelCon)}
        onClick={() => {
          this.props.changeEffictiveWidget(widget.id);
        }}
        onMouseDown={e => {
          e.stopPropagation();
        }}
        onMouseUp={e => {
          e.stopPropagation();
        }}
      >
        <div
          className="columnPreviewTable"
          ref={tableCon => (this.tableCon = tableCon)}
          style={{ width: tableWidth || 'auto' }}
        >
          <table ref={table => (this.table = table)} cellPadding="0" cellSpacing="0">
            <tbody>
              <tr>
                {columns.map((column, i) => (
                  <td key={i}>{column.controlName}</td>
                ))}
              </tr>
              <tr>
                {columns.map((column, i) => (
                  <td key={i}></td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  renderEmpty(tip) {
    const { widget } = this.props;
    return (
      <div
        className="editModel mutipleRelateSheetModel empty"
        onClick={() => {
          this.props.changeEffictiveWidget(widget.id);
        }}
      >
        {tip || _l('从右侧选择关联表')}
      </div>
    );
  }
  render() {
    const { data } = this.props.widget;
    const { enumDefault } = data;
    if (enumDefault === 1) {
      return (
        <div className="editModel" style={{ lineHeight: '32px', color: '#ccc' }}>
          <i className="icon-plus Font16 mRight5" />
          {_l('关联记录')}
        </div>
      );
    } else {
      return data.dataSource ? this.renderTable() : this.renderEmpty();
    }
  }
}

export default {
  type: 29,
  EditModel,
};
