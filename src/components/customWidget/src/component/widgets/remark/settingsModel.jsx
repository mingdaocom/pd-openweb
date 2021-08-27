import React from 'react';
import config from '../../../config';
import firstInputSelect from '../../common/firstInputSelect';

@firstInputSelect
class SettingsModel extends React.Component {
  handleChange() {
    this.props.changeWidgetData(this.props.widget.id, {
      controlName: this.controlName.value,
    });
  }

  descChange() {
    this.props.changeWidgetData(this.props.widget.id, {
      dataSource: this.dataSource.value,
    });
  }

  render() {
    let { widget } = this.props;
    return (
      <div>
        <div className="wsItem">
          <span className="wsLf">{_l('名称')}</span>
          <input
            className="ThemeBorderColor3"
            data-editcomfirm="true"
            type="text"
            ref={controlName => {
              this.controlName = controlName;
            }}
            value={widget.data.controlName}
            onChange={this.handleChange.bind(this)}
            maxLength="100"
          />
        </div>
        <div className="wsItem">
          <span className="wsLf">
            <span>{_l('备注内容')}</span>
          </span>
          <textarea
            className="ThemeBorderColor3 allowEmpty multipleLine"
            ref={dataSource => {
              this.dataSource = dataSource;
            }}
            placeholder={widget.defaultHint}
            value={widget.data.dataSource}
            rows="2"
            maxLength="3000"
            onChange={this.descChange.bind(this)}
          />
        </div>
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.REMARK.type,
  SettingsModel,
};
