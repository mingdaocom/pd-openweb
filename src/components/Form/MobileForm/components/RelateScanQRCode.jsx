import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import publicWorksheetAjax from 'src/api/publicWorksheet';
import sheetAjax from 'src/api/worksheet';
import { getCurrentValue } from 'src/components/Form/core/formUtils';
import { compatibleMDJS } from 'src/utils/project';
import ScanQRCode from './ScanQRCode';

export default class Widgets extends Component {
  static propTypes = {
    projectId: PropTypes.string,
    onChange: PropTypes.func,
    children: PropTypes.element,
  };

  // 关联记录关联成功将当前关联数据通过js sdk返回给APP
  handleScanRelationLoaded = ({ enumDefault, controlId, controlName, title, rowId, type, msg }) => {
    if (enumDefault !== 2) {
      return;
    }
    compatibleMDJS('scanRelationLoaded', {
      cid: controlId,
      cname: controlName,
      relation: _.includes(['2', '3'], type)
        ? {}
        : {
            title: title, //关联记录的标题, 注意转换为纯文本提供
            rowId: rowId, //关联记录的Id
          },
      error: !type
        ? undefined
        : {
            type, //"1": 无数据, "2": 不在关联范围内,
            msg, // 对应描述
          },
    });
  };

  getRowById = ({ appId, worksheetId, rowId }) => {
    const { filterControls = [], parentWorksheetId, control = {}, relateRecordIds = [] } = this.props;
    const { controlId, controlName, enumDefault } = control;

    const getFilterRowsPromise = window.isPublicWorksheet
      ? publicWorksheetAjax.getRelationRows
      : sheetAjax.getFilterRows;
    getFilterRowsPromise({
      appId,
      worksheetId,
      filterControls: [
        ...filterControls,
        {
          controlId: 'rowid',
          dataType: 2,
          spliceType: 1,
          filterType: 2,
          dynamicSource: [],
          values: [rowId],
        },
      ],
      relationWorksheetId: parentWorksheetId,
      getType: 7,
      status: 1,
      searchType: 1,
      controlId: window.isPublicWorksheet ? control.controlId : undefined,
    }).then(result => {
      const row = _.find(result.data, { rowid: rowId });
      if (row) {
        const titleControl = _.find(_.get(control, 'relationControls'), i => i.attribute === 1) || {};
        const nameValue = titleControl ? row[titleControl.controlId] : undefined;
        if (!_.includes(relateRecordIds, row.rowid)) {
          this.props.onChange(row);
        }
        this.handleScanRelationLoaded({
          controlId,
          controlName,
          enumDefault,
          title: getCurrentValue(titleControl, nameValue, { type: 2 }),
          rowId: row.rowid,
          type: _.includes(relateRecordIds, row.rowid) ? '3' : undefined,
        });
      } else {
        if (window.isMingDaoApp) {
          this.handleScanRelationLoaded({
            controlId,
            controlName,
            enumDefault,
            title: '',
            rowId: '',
            type: '2',
            msg: _l('无法关联，此记录不在可关联的范围内'),
          });
          return;
        }
        alert(_l('无法关联，此记录不在可关联的范围内'), 3);
      }
    });
  };
  handleRelateRow = content => {
    const currentWorksheetId = this.props.worksheetId;
    const { controlId, controlName, enumDefault } = _.get(this.props, 'control') || {};
    if (content.includes('worksheetshare') || content.includes('public/record')) {
      const shareId = (content.match(/\/worksheetshare\/(.*)/) || content.match(/\/public\/record\/(.*)/))[1];
      sheetAjax
        .getShareInfoByShareId({
          shareId,
        })
        .then(result => {
          result = result.data || {};
          if (currentWorksheetId === result.worksheetId) {
            this.getRowById(result);
          } else {
            if (window.isMingDaoApp) {
              this.handleScanRelationLoaded({
                controlId,
                controlName,
                enumDefault,
                title: '',
                rowId: '',
                type: '2',
                msg: _l('无法关联，此记录不在可关联的范围内'),
              });
              return;
            }
            alert(_l('无法关联，此记录不在可关联的范围内'), 3);
          }
        });
      return;
    } else {
      const result = content.match(/app\/(.*)\/(.*)\/(.*)\/row\/(.*)/);
      if (result) {
        const [, appId, worksheetId, viewId, rowId] = result;
        const { scanlink } = _.get(this.props, 'control.advancedSetting') || {};
        if (appId && worksheetId && viewId && rowId) {
          if (scanlink !== '1') {
            return;
          }
          if (currentWorksheetId === worksheetId) {
            this.getRowById({
              appId,
              worksheetId,
              viewId,
              rowId,
            });
          } else {
            if (window.isMingDaoApp) {
              this.handleScanRelationLoaded({
                controlId,
                controlName,
                enumDefault,
                title: '',
                rowId: '',
                type: '2',
                msg: _l('无法关联，此记录不在可关联的范围内'),
              });
              return;
            }
            alert(_l('无法关联，此记录不在可关联的范围内'), 3);
          }
        } else {
          this.props.onOpenRecordCardListDialog(content);
        }
      } else {
        this.props.onOpenRecordCardListDialog(content);
      }
    }
  };
  render() {
    const { className, projectId, children, control } = this.props;
    return (
      <ScanQRCode
        className={className}
        projectId={projectId}
        control={control}
        onScanQRCodeResult={this.handleRelateRow}
      >
        {children}
      </ScanQRCode>
    );
  }
}
