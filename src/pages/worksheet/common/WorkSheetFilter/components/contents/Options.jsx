import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { CityPicker, Icon } from 'ming-ui';
import { Button, Select } from 'ming-ui/antd-components';
import { DeptSelectPopover } from 'ming-ui/functions/quickSelectDept';
import { RoleSelectPopover } from 'ming-ui/functions/quickSelectRole';
import { FILTER_CONDITION_TYPE } from 'src/utils/domain/worksheet/filterConstants';

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
const OPTION_BUTTON_STYLE = {
  maxWidth: 200,
  '--hap-control-height-sm': '26px',
  '--hap-button-padding-inline-sm': '10px',
};
const SELECTED_MULTIPLE_OPTION_BUTTON_STYLE = {
  ...OPTION_BUTTON_STYLE,
  borderColor: 'var(--hap-color-primary-border)',
};

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

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (!_.isEqual(this.props.fullValues, prevProps.fullValues)) {
        this.setState({
          selectedOptions: this.getDefaultSelectedOptions(this.props.fullValues, this.props.control),
        });
      }
    }
  }

  componentWillUnmount() {
    this.onFetchData.cancel();
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
  getAreaLevel(enumDefault2, filterType) {
    const isAreaContain = _.includes([FILTER_CONDITION_TYPE.LIKE, FILTER_CONDITION_TYPE.NCONTAIN], filterType);

    if (isAreaContain) {
      return 3;
    }

    return enumDefault2;
  }

  onFetchData = _.debounce(value => {
    this.setState({ keywords: value });
  }, 500);

  addItem = (item, { clearSelected } = {}) => {
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
  };

  updateItem = (id, item) => {
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
  };

  clearTemp = () => {
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
  };

  removeItem = item => {
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
  };

  renderSelect = () => {
    const { type, disabled, folded, control, projectId, onChange, from } = this.props;
    const { selectedOptions, search, keywords } = this.state;
    const selectedOptionItems = selectedOptions.map(item => ({ label: item.name, value: item.id }));
    const selectedOptionValues = selectedOptions.map(item => item.id);

    if (disabled) {
      return (
        <Select
          className="w100"
          mode="multiple"
          open={false}
          showSearch={false}
          disabled
          options={selectedOptionItems}
          value={selectedOptionValues}
        />
      );
    }

    if (_.includes([19, 23, 24], control.type)) {
      const areaLevel = this.getAreaLevel(control.enumDefault2, type);
      const { chooserange = 'CN', commcountries } = control.advancedSetting || {};

      return (
        <div className="worksheetFilterOptionsCondition" ref={con => (this.con = con)}>
          <CityPicker
            search={keywords}
            destroyPopupOnHide
            defaultValue={undefined}
            chooserange={chooserange}
            commcountries={commcountries}
            projectId={projectId}
            level={areaLevel}
            callback={area => {
              const last = _.last(area);
              search && this.setState({ keywords: undefined, search: '' });
              if (last) {
                this.tempArea = {
                  name: last.path,
                  id: last.id,
                };
              }
            }}
            handleClose={() => {
              if (this.tempArea) {
                this.addItem({
                  temp: true,
                  id: this.tempArea.id,
                  name: this.tempArea.name,
                });
              }

              setTimeout(this.clearTemp, 10);
              search && this.setState({ keywords: undefined, search: '' });
            }}
          >
            <Select
              className="w100"
              mode="multiple"
              open={false}
              showSearch
              autoClearSearchValue={false}
              filterOption={false}
              options={selectedOptionItems}
              value={selectedOptionValues}
              searchValue={search || ''}
              onSearch={value => {
                this.setState({ search: value });
                this.onFetchData(value);
              }}
              onDeselect={id => this.removeItem({ id })}
            />
          </CityPicker>
        </div>
      );
    } else if (control.type === 27) {
      const selectSingle =
        control.enumDefault === 0 && _.includes([FILTER_CONDITION_TYPE.ARREQ, FILTER_CONDITION_TYPE.ARRNE], type);
      return (
        <DeptSelectPopover
          unique={selectSingle}
          projectId={projectId}
          isIncludeRoot={false}
          immediate={false}
          showCurrentUserDept={!_.includes(['rule', 'portal'], from)}
          onOpenChange={visible => {
            if (!visible) return;

            if (!_.find(md.global.Account.projects, item => item.projectId === projectId)) {
              alert(_l('您不是该组织成员，无法获取其部门列表，请联系组织管理员'), 3);
              return false;
            }
          }}
          selectFn={data => {
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
          }}
        >
          <Select
            className="w100"
            mode="multiple"
            open={false}
            showSearch={false}
            options={selectedOptionItems}
            value={selectedOptionValues}
            onDeselect={id => this.removeItem({ id })}
          />
        </DeptSelectPopover>
      );
    } else if (control.type === 48) {
      const selectSingle =
        control.enumDefault === 0 && _.includes([FILTER_CONDITION_TYPE.ARREQ, FILTER_CONDITION_TYPE.ARRNE], type);
      return (
        <RoleSelectPopover
          projectId={projectId}
          unique={selectSingle}
          showCurrentOrgRole={!_.includes(['rule', 'portal'], from)}
          showCompanyName
          immediate={false}
          onOpenChange={visible => {
            if (visible && !_.find(md.global.Account.projects, item => item.projectId === projectId)) {
              alert(_l('您不是该组织成员，无法获取其部门列表，请联系组织管理员'), 3);
              return false;
            }
          }}
          onSave={data => {
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
          }}
        >
          <Select
            className="w100"
            mode="multiple"
            open={false}
            showSearch={false}
            options={selectedOptionItems}
            value={selectedOptionValues}
            onDeselect={id => this.removeItem({ id })}
          />
        </RoleSelectPopover>
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
        <div className="optionButtons">
          {shortOptions.map(option => {
            const checked = !!_.find(selectedOptions, o => o.id === option.id);

            return (
              <Button
                className="mTop6 mRight6 Normal"
                color={checked ? 'primary' : 'default'}
                variant={checked ? (selectSingle ? 'solid' : 'filled') : 'outlined'}
                shape="round"
                size="small"
                ellipsis
                style={checked && !selectSingle ? SELECTED_MULTIPLE_OPTION_BUTTON_STYLE : OPTION_BUTTON_STYLE}
                title={option.name}
                key={option.id}
                aria-pressed={checked}
                icon={!selectSingle && checked ? <Icon icon="hr_ok" className="Font13" /> : undefined}
                onClick={() => {
                  if (selectSingle) {
                    this.addItem(option, { clearSelected: true });
                  } else if (checked) {
                    this.removeItem(option);
                  } else {
                    this.addItem(option);
                  }
                }}
              >
                {option.name}
              </Button>
            );
          })}
          {options.length > 5 && (
            <Button
              className="mTop6"
              color="primary"
              variant="link"
              size="small"
              onClick={() => {
                onChange({ folded: !folded });
              }}
            >
              {folded ? _l('更多') : _l('收起')}
            </Button>
          )}
        </div>
      );
    }
  };
  render() {
    return (
      <div className="worksheetFilterOptionsCondition" ref={con => (this.con = con)}>
        {this.renderSelect()}
      </div>
    );
  }
}
