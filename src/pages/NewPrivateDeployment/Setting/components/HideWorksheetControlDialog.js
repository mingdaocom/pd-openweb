import React, { Component, Fragment } from 'react';
import { Dialog, Icon } from 'ming-ui';
import { Checkbox, Tooltip } from 'antd';
import privateSysSetting from 'src/api/privateSysSetting';
import { WIDGET_GROUP_TYPE } from 'src/pages/widgetConfig/config/widget';

export default class HideWorksheetControlDialog extends Component {
  constructor(props) {
    super(props);
    const { hideWorksheetControl } = md.global.SysSettings;
    this.state = {
      hideWorksheetControl: hideWorksheetControl ? hideWorksheetControl.split('|') : [],
    };
  }
  handleSave = () => {
    const { hideWorksheetControl } = this.state;
    const value = hideWorksheetControl.join('|');

    privateSysSetting
      .editSysSettings({
        settings: {
          hideWorksheetControl: value,
        },
      })
      .then(result => {
        if (result) {
          md.global.SysSettings.hideWorksheetControl = value;
          this.props.onCancel();
          this.props.onChange(hideWorksheetControl);
          alert(_l('修改成功'), 1);
        }
      });
  };
  render() {
    const { visible } = this.props;
    const { hideWorksheetControl } = this.state;
    const style = { width: 120 }
    return (
      <Dialog
        visible={visible}
        anim={false}
        title={(
          <div className="flexRow">
            <span>{_l('选择启用的工作表控件')}</span>
            <Tooltip title={_l('取消勾选, 配置过程中将隐藏该工作表控件。该功能不影响已配置字段的使用')} placement="top">
              <Icon className="Font16 Gray_bd pointer mLeft3" icon="info_outline" />
            </Tooltip>
          </div>
        )}
        width={560}
        onOk={this.handleSave}
        onCancel={this.props.onCancel}
      >
        {
          _.keys(WIDGET_GROUP_TYPE).map(group => {
            const { widgets, title } = WIDGET_GROUP_TYPE[group];
            return (
              <Fragment key={group}>
                <div className="Gray bold mTop20 mBottom10">{title}</div>
                <div className="flexRow" style={{ flexFlow: 'wrap' }}>
                  {_.keys(widgets).map(key => {
                    const control = widgets[key];
                    return (
                      <div className="mBottom10" style={{ width: '50%' }} key={key}>
                        <Checkbox
                          style={{ verticalAlign: 'sub' }}
                          className="flexRow"
                          checked={!hideWorksheetControl.includes(key)}
                          onChange={event => {
                            const { checked } = event.target;
                            this.setState({
                              hideWorksheetControl: checked ? hideWorksheetControl.filter(n => n !== key) : hideWorksheetControl.concat(key)
                            });
                          }}
                        >
                          <Icon className="Gray_9e Font16 mRight5" icon={control.icon} />
                          {control.widgetName}
                        </Checkbox>
                      </div>
                    );
                  })}
                </div>
              </Fragment>
            );
          })
        }
      </Dialog>
    );
  }
}
