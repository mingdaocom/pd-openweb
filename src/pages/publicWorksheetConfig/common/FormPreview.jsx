import React from 'react';
import PropTypes from 'prop-types';
import { SYS_CONTROLS_WORKFLOW } from 'src/pages/widgetConfig/config/widget.js';
import PublicFormDisplay from '../../widgetConfig/widgetDisplay/publicFormDisplay';
import { isOldSheetList } from 'src/pages/widgetConfig/util';

export default class FormPreview extends React.Component {
  static propTypes = {
    controls: PropTypes.arrayOf(PropTypes.shape({})),
    onChange: PropTypes.func,
    onHideControl: PropTypes.func,
  };

  static defaultProps = {
    controls: [],
    onChange: () => {},
    onHideControl: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { advancedSetting, controls, onChange, onHideControl } = this.props;
    return (
      <div className="customWidgetForWorksheetWrap publicWorksheetForm">
        <PublicFormDisplay
          styleInfo={{ info: advancedSetting }}
          controls={controls
            .filter(c => !_.includes(SYS_CONTROLS_WORKFLOW.concat(['rowid']), c.controlId))
            .map(item => {
              // 公开表单关联多条列表(旧)改成卡片显示，让配置能随意拖动
              if (isOldSheetList(item)) {
                return { ...item, advancedSetting: Object.assign({}, item.advancedSetting, { showtype: '1' }) };
              }
              return item;
            })}
          fromType="public"
          onChange={(newControls, hidedControlId) => {
            if (hidedControlId) {
              onHideControl(hidedControlId);
            } else {
              onChange(newControls);
            }
          }}
        />
      </div>
    );
  }
}
