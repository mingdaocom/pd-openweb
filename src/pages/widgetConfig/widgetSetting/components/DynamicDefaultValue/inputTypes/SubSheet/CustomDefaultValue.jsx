import React, { Component } from 'react';
import { Dialog } from 'ming-ui';
import { v4 as uuidv4 } from 'uuid';
import ChildTable from 'worksheet/components/ChildTable';
import { handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';
import './style.less';

export default class CustomDefaultValue extends Component {
  constructor(props) {
    super(props);
    const { dynamicValue = [] } = props;
    const defaultValue = (dynamicValue[0] || {}).staticValue;
    const rows = defaultValue ? JSON.parse(defaultValue) : [];
    const rowData = rows.map(item => {
      const tempRowId = `temp-${uuidv4()}`;
      return { ...item, rowid: tempRowId, allowedit: true, addTime: new Date().getTime() };
    });
    this.state = {
      filterRows: rows,
      rowData,
    };
  }

  render() {
    const { onClose, data = {}, globalSheetInfo = {}, onChange } = this.props;
    const { filterRows = [], rowData = [] } = this.state;
    const controls = (data.relationControls || []).map(i => ({
      ...i,
      controlPermissions: i.controlPermissions || '111',
    }));
    return (
      <Dialog
        visible={true}
        className="CustomDefaultValueDialog"
        title={<span className="Bold">{_l('自定义默认值')}</span>}
        width={800}
        onCancel={onClose}
        onOk={() => {
          if (filterRows && filterRows.length > 0) {
            const value = [
              {
                rcid: '',
                cid: '',
                staticValue: JSON.stringify(filterRows),
                isAsync: false,
              },
            ];
            onChange(
              handleAdvancedSettingChange(data, {
                defsource: JSON.stringify(value),
                dynamicsrc: '',
                defaulttype: '0',
              }),
            );
          }
          onClose();
        }}
      >
        <div style={{ minHeight: 74, margin: '10px 0 12px' }}>
          <ChildTable
            from={0}
            control={{
              ...data,
              value: JSON.stringify(rowData),
              advancedSetting: { ...data.advancedSetting, batchcids: '[]' },
            }}
            controls={controls}
            projectId={globalSheetInfo.projectId}
            registerCell={() => {}}
            onChange={({ rows = [] }) => {
              const filterRows = rows.map(row => {
                let itemValue = {};
                (data.showControls || []).map(controlId => (itemValue[controlId] = row[controlId] || ''));
                return itemValue;
              });
              this.setState({ filterRows });
            }}
          />
        </div>
      </Dialog>
    );
  }
}
