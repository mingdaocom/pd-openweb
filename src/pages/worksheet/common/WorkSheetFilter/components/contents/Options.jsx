import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import cx from 'classnames';
import { CityPicker } from 'ming-ui';
import { quickSelectRole, quickSelectDept } from 'ming-ui/functions';
import TagCon from './TagCon';
import { FILTER_CONDITION_TYPE } from '../../enum';
import _ from 'lodash';

const SCORE_TEXT = [
  _l('一级'),
  _l('二级'),
  _l('三级'),
  _l('四级'),
  _l('五级'),
  _l('六级'),
  _l('七级'),
  _l('八级'),
  _l('九级'),
  _l('十级'),
];
export default class Options extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
    control: PropTypes.shape({}),
    fullValues: PropTypes.arrayOf(PropTypes.string), // 未格式化的数据
    values: PropTypes.arrayOf(PropTypes.string),
  };
  static defaultProps = {
    folded: true,
  };
  constructor(props) {
    super(props);
    this.state = {
      selectedOptions: this.getDefaultSelectedOptions(props.fullValues, props.control),
      keywords: '',
      search: undefined,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.fullValues, this.props.fullValues)) {
      this.setState({ selectedOptions: this.getDefaultSelectedOptions(nextProps.fullValues, nextProps.control) });
    }
  }

  getDefaultSelectedOptions(values, control) {
    values = values || [];
    if (_.includes([19, 23, 24], control.type)) {
      return values.map(value => JSON.parse(value));
    } else if (control.type === 27 || control.type === 48) {
      return values.map(value => JSON.parse(value));
    } else if (control.type === 28) {
      return values
        .filter(v => !_.isEmpty(v))
        .map(i => {
          if (_.isObject(safeParse(i))) return safeParse(i);
          return {
            id: i,
            name: SCORE_TEXT[Number(i) - 1],
          };
        });
    } else if (_.includes([9, 10, 11], control.type)) {
      return values.length
        ? _.compact(
            values.map(value =>
              _.find(control.options, option => option.key === (value.startsWith('{') ? safeParse(value).id : value)),
            ),
          ).map(option => ({
            id: option.key,
            name: option.value,
          }))
        : [];
    } else {
      return [];
    }
  }
  getAreaLevel(type, filterType) {
    const isAreaContain = _.includes([FILTER_CONDITION_TYPE.LIKE, FILTER_CONDITION_TYPE.NCONTAIN], filterType);
    if (isAreaContain) {
      return 3;
    }
    if (type === 19) {
      return 1; // 省
    }
    if (type === 23) {
      return 2; // 省-市
    }
    if (type === 24) {
      return 3; // 省-市-县
    }
    return 3;
  }

  onFetchData = _.debounce(value => {
    this.setState({ keywords: value });
  }, 500);

  @autobind
  addItem(item, { clearSelected } = {}) {
    this.setState(
      {
        selectedOptions: clearSelected
          ? _.isArray(item)
            ? item
            : [item]
          : _.uniqBy(this.state.selectedOptions.concat(item), 'id'),
      },
      () => {
        this.props.onChange({
          values: this.state.selectedOptions.map(option => option.id),
          fullValues: this.state.selectedOptions.map(v => JSON.stringify(v)),
        });
      },
    );
  }
  @autobind
  updateItem(id, item) {
    const newOptions = this.state.selectedOptions.map(option =>
      option.id === id ? _.assign({}, option, item) : option,
    );
    this.setState(
      {
        selectedOptions: newOptions,
      },
      () => {
        this.props.onChange({
          values: newOptions.map(option => option.id),
          fullValues: newOptions.map(v => JSON.stringify(v)),
        });
      },
    );
  }
  @autobind
  clearTemp() {
    const newOptions = this.state.selectedOptions.map(option => _.omit(option, ['temp']));
    this.setState(
      {
        selectedOptions: newOptions,
      },
      () => {
        this.props.onChange({
          values: newOptions.map(option => option.id),
          fullValues: newOptions.map(v => JSON.stringify(v)),
        });
      },
    );
  }
  @autobind
  removeItem(item) {
    this.setState(
      {
        selectedOptions: this.state.selectedOptions.filter(seletedOption => item.id !== seletedOption.id),
      },
      () => {
        this.props.onChange({
          values: this.state.selectedOptions.map(option => option.id),
          fullValues: this.state.selectedOptions.map(v => JSON.stringify(v)),
        });
      },
    );
  }
  @autobind
  renderSelect(TagComp) {
    const { type, disabled, folded, control, projectId, onChange, from } = this.props;
    const { selectedOptions, search, keywords } = this.state;
    if (disabled) {
      return <TagCon disabled={disabled} data={selectedOptions} onRemove={this.removeItem} />;
    }
    if (_.includes([19, 23, 24], control.type)) {
      const areaLevel = this.getAreaLevel(control.type, type);

      return (
        <div className="worksheetFilterOptionsCondition" ref={con => (this.con = con)}>
          <CityPicker
            search={keywords}
            destroyPopupOnHide
            defaultValue={undefined}
            level={areaLevel}
            callback={(area, level) => {
              const last = _.last(area);
              search && this.setState({ keywords: undefined, search: '' });
              const tempItem = _.find(selectedOptions, o => o.temp);

              if (!tempItem) {
                this.addItem({
                  temp: true,
                  id: last.id,
                  name: last.path,
                });
              } else {
                this.updateItem(tempItem.id, {
                  id: last.id,
                  name: last.path,
                });
              }
            }}
            handleClose={() => {
              setTimeout(this.clearTemp, 10);
              search && this.setState({ keywords: undefined, search: '' });
            }}
          >
            <TagCon
              data={selectedOptions}
              onRemove={this.removeItem}
              needInput={true}
              search={search}
              keywords={keywords}
              onChangeInput={value => this.setState(value)}
            />
          </CityPicker>
        </div>
      );
    } else if (control.type === 27) {
      const selectSingle =
        control.enumDefault === 0 && _.includes([FILTER_CONDITION_TYPE.ARREQ, FILTER_CONDITION_TYPE.ARRNE], type);
      return (
        <div
          className="filterSelectDepartment"
          onClick={e => {
            quickSelectDept(e.target, {
              unique: selectSingle,
              projectId,
              isIncludeRoot: false,
              immediate: false,
              showCurrentUserDept: !_.includes(['rule', 'portal'], from),
              selectFn: data => {
                if (!data.length) {
                  return;
                }
                this.addItem(
                  (selectSingle ? data.slice(0, 1) : data).map(item => ({
                    id: item.departmentId,
                    name: item.departmentName,
                  })),
                  { clearSelected: selectSingle },
                );
              },
            });
          }}
        >
          <TagCon data={selectedOptions} onRemove={this.removeItem} />
        </div>
      );
    } else if (control.type === 48) {
      const selectSingle =
        control.enumDefault === 0 && _.includes([FILTER_CONDITION_TYPE.ARREQ, FILTER_CONDITION_TYPE.ARRNE], type);
      return (
        <div
          className="filterSelectDepartment"
          onClick={e => {
            quickSelectRole(e.target, {
              projectId,
              unique: selectSingle,
              showCurrentOrgRole: !_.includes(['rule', 'portal'], from),
              showCompanyName: true,
              immediate: false,
              onSave: data => {
                if (!data.length) {
                  return;
                }
                this.addItem(
                  (selectSingle ? data.slice(0, 1) : data).map(item => ({
                    id: item.organizeId,
                    name: item.organizeName,
                  })),
                  { clearSelected: selectSingle },
                );
              },
            });
          }}
        >
          <TagCon data={selectedOptions} onRemove={this.removeItem} />
        </div>
      );
    } else {
      const controlIsSingle = _.includes([9, 11], control.type);
      const selectSingle =
        _.includes(
          [FILTER_CONDITION_TYPE.ARREQ, FILTER_CONDITION_TYPE.ARRNE, FILTER_CONDITION_TYPE.EQ_FOR_SINGLE],
          type,
        ) && controlIsSingle;
      let options = [];
      if (_.includes([9, 10, 11], control.type)) {
        options = control.options
          .filter(option => !option.isDeleted || _.find(selectedOptions, o => o.id === option.key))
          .sort((a, b) => a.index - b.index)
          .map(option => ({ id: option.key, name: option.value }));
      } else if (control.type === 28) {
        options = Array.from({ length: (control.advancedSetting || {}).max }).map((v, i) => ({
          id: i + 1 + '',
          name: SCORE_TEXT[i],
        }));
      }
      let shortOptions = options;
      if (folded && options.length > 5) {
        shortOptions = options.slice(0, 5);
      }
      return (
        <div className="optionCheckboxs">
          {shortOptions.map((option, i) => (
            <div
              className={cx('optionCheckbox ellipsis', {
                'ThemeBGColor3 ThemeBorderColor3 checked': _.find(selectedOptions, o => o.id === option.id),
                multiple: !selectSingle,
              })}
              key={i}
              onClick={() => {
                if (selectSingle) {
                  this.addItem(option, { clearSelected: true });
                  return;
                }

                const checked = _.find(selectedOptions, o => o.id === option.id);
                if (checked) {
                  this.removeItem(option);
                } else {
                  this.addItem(option);
                }
              }}
            >
              {!selectSingle && _.find(selectedOptions, o => o.id === option.id) && (
                <span className="icon-hr_ok selectedIcon"></span>
              )}
              {option.name}
            </div>
          ))}
          {options.length > 5 && (
            <span
              className="showMore ThemeColor3 Hand"
              onClick={() => {
                onChange({ folded: !folded });
              }}
            >
              {folded ? _l('更多') : _l('收起')}
            </span>
          )}
        </div>
      );
    }
  }
  render() {
    return (
      <div className="worksheetFilterOptionsCondition" ref={con => (this.con = con)}>
        {this.renderSelect()}
      </div>
    );
  }
}
