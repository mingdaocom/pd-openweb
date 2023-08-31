import React from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import { SYS_CONTROLS_WORKFLOW } from 'src/pages/widgetConfig/config/widget.js';
import PublicFormDisplay from '../../widgetConfig/widgetDisplay/publicFormDisplay';
import { isRelateRecordTableControl } from 'src/pages/worksheet/util.js';

export default class FormPreview extends React.Component {
  static propTypes = {
    controls: PropTypes.arrayOf(PropTypes.shape({})),
    onChange: PropTypes.func,
    hideControl: PropTypes.func,
    changeControls: PropTypes.func,
  };

  static defaultProps = {
    controls: [],
    onChange: () => {},
    hideControl: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  @autobind
  handleHideControl(controlId, controls) {
    const { hideControl, onChange } = this.props;
    onChange(controls);
    hideControl(controlId);
  }

  render() {
    const { advancedSetting, controls, onChange } = this.props;
    return (
      <div className="customWidgetForWorksheetWrap publicWorksheetForm">
        <PublicFormDisplay
          styleInfo={{ info: advancedSetting }}
          controls={controls
            .filter(c => !_.includes(SYS_CONTROLS_WORKFLOW.concat(['rowid']), c.controlId))
            .map(item => {
              // 公开表单关联多条列表改成卡片显示，让配置能随意拖动
              if (isRelateRecordTableControl(item)) {
                return { ...item, advancedSetting: Object.assign({}, item.advancedSetting, { showtype: '1' }) };
              }
              return item;
            })}
          fromType="public"
          onChange={(newControls, hidedControlId) => {
            if (hidedControlId) {
              this.handleHideControl(hidedControlId, newControls);
            } else {
              onChange(newControls);
            }
          }}
        />
      </div>
    );
  }
}
