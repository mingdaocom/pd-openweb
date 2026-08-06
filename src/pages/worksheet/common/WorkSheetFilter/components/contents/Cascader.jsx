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

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (this.props.fullValues?.length !== prevProps.fullValues?.length) {
        this.setState({
          records: this.props.fullValues?.length > 0 ? _.map(this.props.fullValues, r => safeParse(r)) : [],
        });
      }
    }
  }

  get isFuzzy() {
    return _.includes([FILTER_CONDITION_TYPE.BETWEEN, FILTER_CONDITION_TYPE.NBETWEEN], this.props.type);
  }

  get isAnyLevel() {
    return this.props.control.advancedSetting.anylevel === '0' || this.isFuzzy;
  }

  // 只有“是”是单值条件；是其中一个/不是任何一个/属于/不属于都可以填多个值，
  // 级联单选字段在筛选器里不应被字段自身的单选配置限制成只能选一个。
  get selectSingle() {
    const { type, control = {} } = this.props;
    return control.enumDefault !== 2 && type === FILTER_CONDITION_TYPE.EQ_FOR_SINGLE;
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
              enumDefault: this.selectSingle ? 1 : 2,
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
