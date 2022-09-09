import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import cx from 'classnames';
import CityPicker from 'ming-ui/components/CityPicker';
import DialogSelectGroups from 'src/components/dialogSelectDept';
import selectOrgRole from 'src/components/DialogSelectOrgRole/selectOrgRole';
import TagCon from './TagCon';
import { FILTER_CONDITION_TYPE } from '../../enum';

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
    originValues: PropTypes.arrayOf(PropTypes.string), // 未格式化的数据
    values: PropTypes.arrayOf(PropTypes.string),
  };
  static defaultProps = {
    folded: true,
  };
  constructor(props) {
    super(props);
    this.state = {
      seletedOptions: this.getDefaultSelectedOptions(props.originValues, props.control),
    };
  }
  getDefaultSelectedOptions(values, control) {
    values = values || [];
    if (_.includes([19, 23, 24], control.type)) {
      return values.map(value => JSON.parse(value));
    } else if (control.type === 27 || control.type === 48) {
      return values.map(value => JSON.parse(value));
    } else if (control.type === 28) {
      return values
        .filter(v => v)
        .map(value => ({
          id: value,
          name: SCORE_TEXT[parseInt(value, 10) - 1],
        }));
    } else {
      return values.length
        ? _.compact(values.map(value => _.find(control.options, option => option.key === value))).map(option => ({
            id: option.key,
            name: option.value,
          }))
        : [];
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
  @autobind
  addItem(item) {
    this.setState(
      {
        seletedOptions: _.uniqBy(this.state.seletedOptions.concat(item), 'id'),
      },
      () => {
        this.props.onChange({
          values: this.state.seletedOptions.map(option => option.id),
          fullValues: this.state.seletedOptions.map(v => JSON.stringify(v)),
        });
      },
    );
  }
  @autobind
  updateItem(id, item) {
    const newOptions = this.state.seletedOptions.map(option =>
      option.id === id ? _.assign({}, option, item) : option,
    );
    this.setState(
      {
        seletedOptions: newOptions,
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
    const newOptions = this.state.seletedOptions.map(option => _.omit(option, ['temp']));
    this.setState(
      {
        seletedOptions: newOptions,
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
        seletedOptions: this.state.seletedOptions.filter(seletedOption => item.id !== seletedOption.id),
      },
      () => {
        this.props.onChange({ values: this.state.seletedOptions.map(option => option.id) });
      },
    );
  }
  @autobind
  rendertSelect(TagComp) {
    const { type, disabled, folded, control, projectId, onChange, from } = this.props;
    const { seletedOptions } = this.state;
    if (disabled) {
      return <TagCon disabled={disabled} data={seletedOptions} onRemove={this.removeItem} />;
    }
    if (_.includes([19, 23, 24], control.type)) {
      const areaLevel = this.getAreaLevel(control.type, type);
      return (
        <div className="worksheetFilterOptionsCondition" ref={con => (this.con = con)}>
          <CityPicker
            destroyPopupOnHide
            defaultValue={undefined}
            level={areaLevel}
            callback={area => {
              const code = _.last(area).id;
              const tempItem = _.find(seletedOptions, o => o.temp);
              if (!tempItem) {
                this.addItem({
                  temp: true,
                  id: code,
                  name: area.map(a => a.name).join('/'),
                });
              } else {
                this.updateItem(tempItem.id, {
                  id: code,
                  name: area.map(a => a.name).join('/'),
                });
              }
            }}
            handleClose={() => {
              setTimeout(this.clearTemp, 10);
            }}
          >
            <TagCon data={seletedOptions} onRemove={this.removeItem} />
          </CityPicker>
        </div>
      );
    } else if (control.type === 27) {
      return (
        <div
          className="filterSelectDepartment"
          onClick={() => {
            const D = new DialogSelectGroups({
              projectId,
              isIncludeRoot: false,
              showCurrentUserDept: from !== 'rule',
              selectFn: data => {
                if (!data.length) {
                  return;
                }
                if (_.find(seletedOptions, option => option.id === data[0].departmentId)) {
                  alert(_l('该部门已存在'), 3);
                  return;
                }
                this.addItem({
                  id: (data[0] || {}).departmentId,
                  name: (data[0] || {}).departmentName,
                });
              },
            });
          }}
        >
          <TagCon data={seletedOptions} onRemove={this.removeItem} />
        </div>
      );
    } else if (control.type === 48) {
      return (
        <div
          className="filterSelectDepartment"
          onClick={() => {
            selectOrgRole({
              projectId,
              unique: false,
              onSave: data => {
                if (!data.length) {
                  return;
                }
                this.addItem(
                  data.map(item => ({
                    id: item.organizeId,
                    name: item.organizeName,
                  })),
                );
              },
            });
          }}
        >
          <TagCon data={seletedOptions} onRemove={this.removeItem} />
        </div>
      );
    } else {
      let options = [];
      if (_.includes([9, 10, 11], control.type)) {
        options = control.options
          .filter(option => !option.isDeleted)
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
                'ThemeBGColor3 ThemeBorderColor3 checked': _.find(seletedOptions, o => o.id === option.id),
              })}
              key={i}
              onClick={() => {
                const checked = _.find(seletedOptions, o => o.id === option.id);
                if (checked) {
                  this.removeItem(option);
                } else {
                  this.addItem(option);
                }
              }}
            >
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
        {this.rendertSelect()}
      </div>
    );
  }
}
