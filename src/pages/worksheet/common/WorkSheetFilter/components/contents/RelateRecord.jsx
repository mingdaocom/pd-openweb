import React from 'react';
import _, { omit } from 'lodash';
import PropTypes from 'prop-types';
import { Select } from 'ming-ui/antd-components';
import { withOpeners } from 'ming-ui/hooks/useFunctionWrapComponent';
import { useSelectRecords } from 'src/components/SelectRecords';
import { getTitleTextFromControls } from 'src/utils/domain/control/display';
import { FILTER_CONDITION_TYPE } from 'src/utils/domain/worksheet/filterConstants';

function safeParse(str) {
  try {
    return JSON.parse(str);
  } catch (err) {
    console.error(err);
    return {};
  }
}

class RelateRecord extends React.Component {
  static propTypes = {
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
    openSelectRecords: PropTypes.func,
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

  get selectSingle() {
    const { type, control = {} } = this.props;
    return control.enumDefault === 1 && _.includes([FILTER_CONDITION_TYPE.ARREQ, FILTER_CONDITION_TYPE.ARRNE], type);
  }

  addRecord = selectedRecords => {
    const { control, onChange } = this.props;
    const { records } = this.state;
    const { relationControls } = control;
    const newRecords = (
      this.selectSingle ? [] : records.filter(r => !_.find(selectedRecords, sr => r.id === sr.rowid))
    ).concat(
      selectedRecords.map(sr => ({
        name: getTitleTextFromControls(relationControls, sr),
        id: sr.rowid,
      })),
    );
    this.setState({
      records: newRecords,
    });
    onChange({ values: newRecords.map(r => r.id), fullValues: newRecords.map(v => JSON.stringify(v)) });
  };

  removeRecord = record => {
    const { onChange } = this.props;
    const { records } = this.state;
    const newRecords = records.filter(r => r.id !== record.id);
    this.setState({
      records: newRecords,
    });
    onChange({ values: newRecords.map(r => r.id), fullValues: newRecords.map(v => JSON.stringify(v)) });
  };

  render() {
    const { control, worksheetId, disabled } = this.props;
    const { records } = this.state;
    return (
      <div className="worksheetFilterRelateRecordCondition">
        <Select
          className="w100"
          mode="multiple"
          open={false}
          showSearch={false}
          disabled={disabled}
          placeholder={_l('请选择')}
          options={records.map(record => ({
            label: (
              <span className="flexRow alignItemsCenter">
                <i className="icon icon-link-worksheet Font14 mRight4" />
                <span>{record.name}</span>
              </span>
            ),
            value: record.id,
          }))}
          value={records.map(record => record.id)}
          onDeselect={id => this.removeRecord({ id })}
          onClick={
            disabled
              ? undefined
              : () => {
                  this.props.openSelectRecords({
                    control: {
                      ...control,
                      advancedSetting: omit(control.advancedSetting, 'filters'),
                    },
                    getType: 32,
                    allowNewRecord: false,
                    multiple: !this.selectSingle,
                    coverCid: control.coverCid,
                    filterRowIds: records.map(r => r.id),
                    showControls: control.showControls,
                    appId: control.appId,
                    viewId: control.viewId,
                    worksheetId: control.dataSource,
                    controlId: control.controlId,
                    parentWorksheetId: worksheetId,
                    visible: true,
                    onOk: this.addRecord,
                  });
                }
          }
        />
      </div>
    );
  }
}

export default withOpeners(RelateRecord, {
  openSelectRecords: useSelectRecords,
});
