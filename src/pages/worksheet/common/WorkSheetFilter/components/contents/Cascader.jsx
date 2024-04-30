import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { autobind } from 'core-decorators';
import CascaderDropdown from 'src/components/newCustomFields/widgets/Cascader';
import { FILTER_CONDITION_TYPE } from '../../enum';
import _ from 'lodash';

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
      records: _.map(fullValues, r => safeParse(r)),
      selectRecordVisible: false,
    };
  }

  get isFuzzy() {
    return _.includes([FILTER_CONDITION_TYPE.BETWEEN, FILTER_CONDITION_TYPE.NBETWEEN], this.props.type);
  }

  get isAnyLevel() {
    return this.props.control.advancedSetting.anylevel === '0' || this.isFuzzy;
  }

  triggerChange() {
    const { onChange } = this.props;
    const { records } = this.state;
    onChange({ values: records.map(r => r.id), fullValues: records.map(v => JSON.stringify(v)) });
  }

  @autobind
  addRecord(selectedRecords, cb = () => {}) {
    const { onChange } = this.props;
    const { records } = this.state;
    const newRecords = records
      .filter(r => !_.find(selectedRecords, sr => r.id === sr.sid))
      .concat(
        selectedRecords.map(sr => ({
          name: sr.name,
          id: sr.sid,
        })),
      );
    this.setState(
      {
        records: newRecords,
      },
      cb,
    );
  }

  @autobind
  removeRecord(record) {
    const { onChange } = this.props;
    const { records } = this.state;
    const newRecords = records.filter(r => r.id !== record.id);
    this.setState(
      {
        records: newRecords,
      },
      this.triggerChange,
    );
  }

  @autobind
  handleChange(selected, text) {
    const { control } = this.props;
    const isTree = control.advancedSetting.showtype === '4';
    // const fullPath = control.advancedSetting.allpath === '1'; // 5.10.1 后端不支持 后面放开
    selected = JSON.parse(selected);
    // if (fullPath && selected.length) {
    //   selected[0].name = text;
    // }
    if (isTree) {
      this.addRecord(selected, this.triggerChange);
    } else {
      if (!this.isAnyLevel) {
        this.addRecord(selected, this.triggerChange);
      } else {
        this.setState({
          tempRecord: selected,
        });
        this.tempRecord = selected;
      }
    }
  }

  render() {
    const { control, disabled } = this.props;
    const { selectRecordVisible, tempRecord } = this.state;
    let { records } = this.state;
    if (tempRecord) {
      records = records.concat(
        tempRecord.map(sr => ({
          name: sr.name,
          id: sr.sid,
        })),
      );
    }
    const isTree = control.advancedSetting.showtype === '4';
    return (
      <div className="worksheetFilterRelateRecordCondition worksheetFilterCascaderCondition">
        <div className={cx('recordsCon', { disabled })} onClick={() => this.setState({ selectRecordVisible: true })}>
          {records.length ? (
            records.map((record, index) => (
              <div className="recordItem" key={index}>
                <span className="recordname ellipsis">{record.name}</span>
                <span
                  className="remove"
                  onClick={e => {
                    e.stopPropagation();
                    this.removeRecord(record);
                  }}
                >
                  <i className="icon icon-delete" style={{ marginRight: 2 }}></i>
                </span>
              </div>
            ))
          ) : (
            <span className="placeholder">{_l('请选择')}</span>
          )}
        </div>
        <div onClick={e => e.stopPropagation()}>
          {selectRecordVisible && (
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
                popupClassName="worksheetFilterCascaderPopup"
                visible={selectRecordVisible}
                disabled={disabled}
                onChange={this.handleChange}
                dataSource={control.dataSource}
                viewId={control.viewId}
                advancedSetting={_.assign({}, control.advancedSetting, this.isFuzzy ? { anylevel: '0' } : {})}
                onPopupVisibleChange={visible => {
                  if (!visible && !isTree && this.isAnyLevel) {
                    if (this.tempRecord) {
                      this.addRecord(this.tempRecord, () => {
                        this.setState({
                          tempRecord: undefined,
                        });
                        this.tempRecord = undefined;
                        this.triggerChange();
                      });
                    }
                  }
                  this.setState({ selectRecordVisible: visible });
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
}
