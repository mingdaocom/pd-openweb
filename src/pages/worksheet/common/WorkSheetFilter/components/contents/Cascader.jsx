import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import CascaderDropdown from 'src/components/Form/DesktopForm/widgets/Cascader';
import { FILTER_CONDITION_TYPE } from '../../enum';

export default class RelateRecord extends React.Component {
  static propTypes = {
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
    control: PropTypes.shape({}),
    fullValues: PropTypes.arrayOf(PropTypes.string),
  };

  static defaultProps = {
    fullValues: [],
  };

  constructor(props) {
    super(props);
    let { fullValues = [] } = props;
    this.state = {
      records: fullValues?.length > 0 ? _.map(fullValues, r => safeParse(r)) : [],
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.fullValues?.length !== this.props.fullValues?.length) {
      this.setState({
        records: nextProps.fullValues?.length > 0 ? _.map(nextProps.fullValues, r => safeParse(r)) : [],
      });
    }
  }

  get isFuzzy() {
    return _.includes([FILTER_CONDITION_TYPE.BETWEEN, FILTER_CONDITION_TYPE.NBETWEEN], this.props.type);
  }

  get isAnyLevel() {
    return this.props.control.advancedSetting.anylevel === '0' || this.isFuzzy;
  }

  handleChange = selected => {
    const newRecords = selected ? JSON.parse(selected || '[]').map(r => ({ name: r.name, id: r.sid })) : [];

    this.setState(
      {
        records: newRecords,
      },
      () => {
        this.props.onChange({
          values: selected ? newRecords.map(r => r.id) : [],
          fullValues: selected ? newRecords.map(v => JSON.stringify(v)) : [],
        });
      },
    );
  };

  render() {
    const { control, disabled, from, worksheetId } = this.props;
    const { records } = this.state;

    const isTree = control.advancedSetting.showtype === '4';
    return (
      <div className="worksheetFilterRelateRecordCondition worksheetFilterCascaderCondition">
        <div
          className="cascaderDropdown"
          style={
            isTree
              ? {
                  marginTop: 14,
                }
              : {}
          }
        >
          <CascaderDropdown
            worksheetId={worksheetId}
            popupClassName="worksheetFilterCascaderPopup"
            disabled={disabled}
            notLimitCount={true}
            onChange={this.handleChange}
            {...{
              ...control,
              advancedSetting: _.assign(
                {},
                from === 'rule'
                  ? _.omit(control.advancedSetting, ['limitlayer', 'minlayer', 'topfilters', 'topshow'])
                  : control.advancedSetting,
                this.isFuzzy ? { anylevel: '0' } : {},
              ),
              value: JSON.stringify((records || []).map(r => ({ name: r.name, sid: r.id }))),
            }}
          />
        </div>
      </div>
    );
  }
}
