import React from 'react';
import { autobind } from 'core-decorators';
import config from '../../../config';
import firstInputSelect from '../../common/firstInputSelect';
import Concatenate from './Concatenate';

@firstInputSelect
class SettingsModel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  @autobind
  handleChange(value) {
    this.props.changeWidgetData(this.props.widget.id, {
      controlName: this.refs.controlName.value,
    });
  }

  @autobind
  hideSelectColumn() {
    this.setState({ selectColumnVisible: false });
  }

  render() {
    let { widget, editWidgets } = this.props;
    return (
      <div className="flexRow">
        <div className="flex">
          <div className="wsItem">
            <span className="wsLf">{_l('名称')}</span>
            <input
              className="ThemeBorderColor3"
              type="text"
              ref="controlName"
              value={widget.data.controlName}
              onChange={this.handleChange}
              maxLength="100"
            />
          </div>

          <div className="wsItem">
            <span className="wsLf">{_l('选择字段')}</span>
            <Concatenate
              widget={widget}
              editWidgets={editWidgets}
              onChange={(value) => {
                this.props.changeWidgetData(this.props.widget.id, {
                  dataSource: value,
                });
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.CONCATENATE.type,
  SettingsModel,
};
