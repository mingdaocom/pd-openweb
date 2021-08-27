import React from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import Dropdown from 'ming-ui/components/Dropdown';
import RadioGroup from '../../common/radioGroup';
import config from '../../../config';
import firstInputSelect from '../../common/firstInputSelect';

@firstInputSelect
class SettingsModel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  @autobind
  handleChange(value) {
    this.props.changeWidgetData(this.props.widget.id, value);
  }

  render() {
    let { widget } = this.props;
    const { controlName, enumDefault, enumDefault2 } = widget.data;
    const autoTypes = [
      {
        name: _l('自然数编号'),
        value: 0,
      },
      {
        name: _l('指定编号位数'),
        value: 1,
      },
    ];
    return (
      <div className="flexRow autoIdSetting">
        <div className="flex newformulaSetting">
          <div className="wsItem">
            <span className="wsLf">{_l('名称')}</span>
            <input
              className="ThemeBorderColor3"
              type="text"
              ref="controlName"
              value={controlName}
              onChange={(e) => { this.handleChange({ controlName: e.target.value }); }}
              maxLength="100"
            />
          </div>
          <div className="wsItem">
            <span className="wsLf">{_l('编号方式')}</span>
            <RadioGroup data={autoTypes} checkedValue={enumDefault} changeRadioValue={(value) => { this.handleChange({ enumDefault: value }); }} size="small" />
          </div>
          { enumDefault === 1 && <div className="wsItem">
              <span className="wsLf formatNumsTitle">{_l('位数')}</span>
              <div className="formatNums">
                <Dropdown
                  className="calType"
                  data={[...new Array(5)].map((a, index) => ({
                    text: _l('%0 位数', index + 2),
                    value: index + 2,
                  }))}
                  value={enumDefault2}
                  onChange={(type) => { this.handleChange({ enumDefault2: type }); }}
                />
                <div className="tip Gray_a mTop10">{ _l('自动从 %0 开始计数，当计数达到最大值后继续递增', _.times(enumDefault2 - 1, () => '0').join('') + '1') }</div>
              </div>
            </div>
          }
        </div>
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.AUTOID.type,
  SettingsModel,
};
