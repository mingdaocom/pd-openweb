import React, { Component, Fragment } from 'react';
import { Dialog, Input } from 'ming-ui';
import privateSysSetting from 'src/api/privateSysSetting';

const formattingValue = (value = 1, maxValue) => {
  value = parseInt(value);
  if (isNaN(value)) {
    return '';
  }
  if (maxValue && value > maxValue) {
    return maxValue;
  }
  return value;
};

export default class RecycleBinDialog extends Component {
  constructor(props) {
    super(props);
    const { appRecycleDays, appItemRecycleDays, worksheetRowRecycleDays } = md.global.SysSettings;
    this.state = {
      appRecycleDays,
      appItemRecycleDays,
      worksheetRowRecycleDays,
    };
  }
  handleSave = () => {
    const { appRecycleDays, appItemRecycleDays, worksheetRowRecycleDays } = this.state;

    if (appRecycleDays && appItemRecycleDays && worksheetRowRecycleDays) {
      privateSysSetting
        .editSysSettings({
          settings: {
            appRecycleDays,
            appItemRecycleDays,
            worksheetRowRecycleDays,
          },
        })
        .then(result => {
          if (result) {
            md.global.SysSettings.appRecycleDays = appRecycleDays;
            md.global.SysSettings.appItemRecycleDays = appItemRecycleDays;
            md.global.SysSettings.worksheetRowRecycleDays = worksheetRowRecycleDays;
            this.props.onCancel();
            this.props.onChange(md.global.SysSettings);
            alert(_l('修改成功'), 1);
          }
        });
    } else {
      alert(_l('请输入0以上的整数'), 2);
    }
  };
  render() {
    const { visible } = this.props;
    const { appRecycleDays, appItemRecycleDays, worksheetRowRecycleDays } = this.state;
    const style = { width: 120 };
    return (
      <Dialog
        visible={visible}
        anim={false}
        title={_l('数据回收站保留时长')}
        width={560}
        onOk={this.handleSave}
        onCancel={this.props.onCancel}
      >
        <div className="mTop20 mBottom20 flexRow valignWrapper">
          <div className="mBottom5 Font14" style={style}>{_l('应用')}</div>
          <Input
            className="Width120 mRight10"
            value={appRecycleDays}
            onChange={value => {
              this.setState({ appRecycleDays: formattingValue(value, 1000) });
            }}
          />
          <span>{_l('天')}</span>
        </div>
        <div className="mBottom20 flexRow valignWrapper">
          <div className="mBottom5 Font14" style={style}>{_l('应用项')}</div>
          <Input
            className="Width120 mRight10"
            value={appItemRecycleDays}
            onChange={value => {
              this.setState({ appItemRecycleDays: formattingValue(value, 1000) });
            }}
          />
          <span>{_l('天')}</span>
        </div>
        <div className="mBottom20 flexRow valignWrapper">
          <div className="mBottom5 Font14" style={style}>{_l('工作表数据')}</div>
          <Input
            className="Width120 mRight10"
            value={worksheetRowRecycleDays}
            onChange={value => {
              this.setState({ worksheetRowRecycleDays: formattingValue(value, 1000) });
            }}
          />
          <span>{_l('天')}</span>
        </div>
      </Dialog>
    );
  }
}
