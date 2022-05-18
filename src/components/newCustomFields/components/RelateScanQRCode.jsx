import React, { Component } from 'react';
import PropTypes from 'prop-types';
import sheetAjax from 'src/api/worksheet';
import { Toast } from 'antd-mobile';
import ScanQRCode from './ScanQRCode';

export default class Widgets extends Component {
  static propTypes = {
    projectId: PropTypes.string,
    onChange: PropTypes.func,
    children: PropTypes.element,
  };
  getRowById = ({ appId, worksheetId, viewId, rowId }) => {
    const { filterControls } = this.props;
    sheetAjax.getFilterRows({
      appId,
      worksheetId,
      rowId,
      filterControls,
      rowId,
      getType: 7,
      status: 1,
      searchType: 1,
    }).then(result => {
      const row = _.find(result.data, { rowid: rowId });
      if (row) {
        this.props.onChange(row);
      } else {
        Toast.fail(_l('无法关联，此记录不在可关联的范围内'));
      }
    });
  }
  handleRelateRow = content => {
    const { worksheetId } = this.props;
    if (content.includes('worksheetshare')) {
      const shareId = content.match(/\/worksheetshare\/(.*)/)[1];
      sheetAjax.getShareInfoByShareId({
        shareId,
      }).then(result => {
        if (worksheetId === result.worksheetId) {
          this.getRowById(result);
        } else {
          Toast.fail(_l('无法关联，此记录不在可关联的范围内'));
        }
      });
      return;
    } else {
      this.props.onOpenRecordCardListDialog(content);
    }
  }
  render() {
    const { projectId, children } = this.props;
    return (
      <ScanQRCode projectId={projectId} onScanQRCodeResult={this.handleRelateRow}>{children}</ScanQRCode>
    );
  }
}
