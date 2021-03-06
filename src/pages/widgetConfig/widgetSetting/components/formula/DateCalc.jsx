import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import cx from 'classnames';
import { Dropdown, TagTextarea, Button } from 'ming-ui';
import { getIconByType } from 'src/pages/widgetConfig/util';
import ColumnListDropdown from '../ColumnListDropdown';
import DateCalcPicker from './DateCalcPicker';
import { getFormulaControls, createWorksheetColumnTag, formatColumnToText } from '../../../util/data';
import ToTodaySetting from './toTodaySetting';
import { Tooltip } from 'antd';

export default class DateCalc extends Component {
  static propTypes = {
    widget: PropTypes.shape({}),
    worksheetData: PropTypes.shape({}),
    editWidgets: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.shape({}))),
    onDataChange: PropTypes.func,
    onFormulaEditStatusChange: PropTypes.func,
  };
  static defaultProps = {
    editWidgets: [],
    worksheetData: {},
    onDataChange: () => {},
  };
  constructor(props) {
    super(props);
    const { dataSource } = props.widget.data;
    this.state = {
      formulaStr: dataSource || '',
      changed: !dataSource,
      formulaColumnSelectVisible: false,
    };
  }

  componentDidMount() {
    const { widget, onFormulaEditStatusChange, onDataChange } = this.props;
    if (widget.data.dot !== 0) {
      onDataChange({ dot: 0 });
    }
    if (this.state.changed && widget.data.enumDefault === 2) {
      onFormulaEditStatusChange(true);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { widget } = nextProps;
    if (widget.id !== this.props.widget.id) {
      const dataSource = widget.data.dataSource;
      this.setState({
        formulaStr: dataSource || '',
        changed: !dataSource,
        formulaColumnSelectVisible: false,
      });
      if (this.tagtextarea) {
        this.tagtextarea.setValue(dataSource || '');
      }
    }
  }

  @autobind
  handleCalTypeChange(type) {
    const { onDataChange } = this.props;
    const newValue = {
      enumDefault: type,
      dataSource: '',
      sourceControlId: '',
    };
    onDataChange(newValue);
    this.setState({
      formulaStr: '',
    });
  }

  @autobind
  saveFormula() {
    const { onDataChange, onFormulaEditStatusChange } = this.props;
    const sourceControlId = this.props.widget.data.sourceControlId;
    const { formulaStr } = this.state;
    if (!sourceControlId) {
      alert(_l('?????????????????????'), 3);
      return;
    }
    if (!/^([+-]\d+[YMdhm])+$/.test(formulaStr.replace(/\$(.+?)\$/g, '1'))) {
      alert(_l('?????????????????????'), 3);
      return;
    }
    onDataChange({
      dataSource: formulaStr,
    });
    onFormulaEditStatusChange(false);
    this.setState({
      changed: false,
    });
  }

  @autobind
  cancelEdit() {
    const { widget, onFormulaEditStatusChange } = this.props;
    this.tagtextarea.setValue(widget.data.dataSource);
    onFormulaEditStatusChange(false);
    this.setState({
      changed: false,
      dataSource: widget.data.dataSource,
    });
  }

  render() {
    const { widget, editWidgets, worksheetData, onDataChange, onFormulaEditStatusChange } = this.props;
    const { formulaColumnSelectVisible, formulaStr, changed } = this.state;
    const { data } = widget;
    const { enumDefault, unit, strDefault, sourceControlId = '', dataSource = '' } = data;
    return (
      <div className="DateCalc">
        <div className="settingItem">
          <div className="settingItemTitle">{_l('????????????')}</div>
          <Dropdown
            className="calType WhiteBG"
            data={[
              {
                text: _l('????????????????????????'),
                value: 1,
              },
              {
                text: _l('?????????????????????'),
                value: 2,
              },
              { text: _l('?????????????????????'), value: 3 },
            ]}
            value={enumDefault}
            onChange={this.handleCalTypeChange}
          />
        </div>
        {enumDefault === 3 && <ToTodaySetting {...this.props} />}
        {_.includes([1, 2], enumDefault) && (
          <div className="settingItem">
            <div className="settingItemTitle">{enumDefault === 2 ? _l('????????????') : _l('??????')}</div>
            <div className={cx('settingItem', { mTop10: enumDefault === 1 })}>
              {enumDefault === 1 && <div className="mBottom8">{_l('????????????')}</div>}
              <DateCalcPicker
                value={sourceControlId}
                widgets={editWidgets}
                onChange={id => {
                  onDataChange({ sourceControlId: id });
                }}
                hidedIds={[dataSource]}
                worksheetData={worksheetData}
                emptyText={_l('?????????????????????????????????????????????????????????')}
              />
            </div>
            {enumDefault === 1 && (
              <div className="settingItem mTop10">
                <div className="mBottom8">{_l('????????????')}</div>
                <DateCalcPicker
                  value={dataSource}
                  widgets={editWidgets}
                  onChange={id => {
                    onDataChange({ dataSource: id });
                  }}
                  hidedIds={[sourceControlId]}
                  worksheetData={worksheetData}
                  emptyText={_l('?????????????????????????????????????????????????????????')}
                />
              </div>
            )}
            {enumDefault === 1 && (
              <div className="settingItem mTop10">
                <div className="mBottom8">{_l('?????????')}</div>
                <div className="Font12 Gray_9e mBottom8">{_l('???????????????????????????????????????????????????????????????')}</div>
                <Dropdown
                  className="WhiteBG calType"
                  data={[
                    { text: _l('???????????? 00:00??????????????? 24:00'), value: '1' },
                    { text: _l('???????????? 00:00??????????????? 00:00'), value: '0' },
                  ]}
                  value={strDefault || '0'}
                  onChange={type => {
                    onDataChange({ strDefault: type });
                  }}
                />
              </div>
            )}
            {enumDefault === 1 && (
              <div className="settingItem mTop10">
                <div className="mBottom8">{_l('????????????')}</div>
                <Dropdown
                  className="outputType WhiteBG"
                  data={[
                    { text: _l('???'), value: '5' },
                    { text: _l('???'), value: '4' },
                    { text: _l('???'), value: '3' },
                    { text: _l('??????'), value: '2' },
                    { text: _l('??????'), value: '1' },
                  ]}
                  value={unit}
                  onChange={type => {
                    onDataChange({ unit: type });
                  }}
                />
              </div>
            )}
          </div>
        )}
        {enumDefault === 2 && (
          <div className="settingItem">
            <div className="settingItemTitle">{_l('??????')}</div>
            <p className="Font12 Gray_9e">
              {_l('??????????????? ??????/?????? ??????????????????+8h+1m???-1d+8h???????????????????????????????????????????????????????????????????????????')}
              <Tooltip
                title={
                  <Fragment>
                    <div>{_l('??????Y?????????')}</div>
                    <div>{_l('??????M?????????')}</div>
                    <div>{_l('??????d')}</div>
                    <div>{_l('?????????h')}</div>
                    <div>{_l('??????m')}</div>
                  </Fragment>
                }
              >
                <span>{_l('??????????????????')}</span>
              </Tooltip>
            </p>
          </div>
        )}
        {enumDefault === 2 && (
          <TagTextarea
            rightIcon
            mode={4}
            defaultValue={formulaStr}
            maxHeight={140}
            getRef={tagtextarea => {
              this.tagtextarea = tagtextarea;
            }}
            renderTag={(id, options) =>
              createWorksheetColumnTag(
                id,
                _.assign({}, options, {
                  mode: 4,
                  errorCallback: this.handleChange,
                  editWidgets,
                  worksheetData,
                }),
              )
            }
            onAddClick={() => this.setState({ formulaColumnSelectVisible: true })}
            onChange={(err, value, obj) => {
              onFormulaEditStatusChange(true);
              this.setState({
                formulaStr: value,
                changed: true,
              });
            }}
            onFocus={() => {
              this.setState({ selectColumnVisible: true });
            }}
          />
        )}
        {enumDefault === 2 && (
          <ColumnListDropdown
            visible={formulaColumnSelectVisible}
            onClickAway={() => this.setState({ formulaColumnSelectVisible: false })}
            list={getFormulaControls(allControls, data).map(widget => ({
              value: widget.id,
              filterValue: widget.data.controlName,
              element: (
                <span className="controlItem">
                  <i className={`controlIcon icon-${getIconByType(widget.data.type)}`}></i>
                  <span className="controlName ellipsis">{widget.data.controlName}</span>
                  <span className="controlValue ellipsis">
                    {formatColumnToText(
                      _.assign({}, widget.data, { value: worksheetData[widget.data.controlId] }),
                      true,
                    ) || _l('???')}
                  </span>
                </span>
              ),
              onClick: (id, i) => {
                this.tagtextarea.insertColumnTag(id);
              },
            }))}
          />
        )}
        {enumDefault === 2 && changed && (
          <div className="saveOperation">
            <Button className="savelEdit" size="small" onClick={this.saveFormula}>
              {_l('??????')}
            </Button>
            <Button className="cancelEdit" type="link" size="small" onClick={this.cancelEdit}>
              {_l('??????')}
            </Button>
          </div>
        )}
      </div>
    );
  }
}
