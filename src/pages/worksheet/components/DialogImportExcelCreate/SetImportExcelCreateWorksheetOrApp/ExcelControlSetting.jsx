import React, { Component, Fragment } from 'react';
import { Input } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Dropdown, Icon, LoadDiv, Tooltip } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import { DEFAULT_DATA } from 'src/pages/widgetConfig/config/widget.js';
import { SettingItem } from 'src/pages/widgetConfig/styled';
import { enumWidgetType, getIconByType } from 'src/pages/widgetConfig/util';
import Settings from 'src/pages/widgetConfig/widgetSetting/settings';
import { EXCEL_CONTROLS, getList, HAS_RADIO_CONTROL, NO_OTHER_CONFIG } from './config';

const ExcelControlSettingWrap = styled.div`
  background: #ffffff;
  box-shadow:
    0 4px 20px rgb(0 0 0 / 13%),
    0 2px 6px rgb(0 0 0 / 10%);
  border-radius: 3px 3px 3px 3px;
  width: 350px;
  padding: 20px;
  max-height: 400px;
  overflow-x: hidden;
  .name {
    display: flex;
    align-items: center;
  }
  .Item-content {
    .ming.Icon {
      font-size: 16px;
    }
    .itemText {
      padding-left: 15px;
      .Icon {
        position: unset !important;
      }
      &.disabeldRelate {
        .icon-arrow-right-border {
          display: none !important;
        }
      }
    }
  }
  .relateItem {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
`;

export default class ExcelControlSetting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step: _.get(this.props.data, 'dataSource') ? 2 : 1,
      visible: false,
      controls: [],
      loading: false,
    };
  }

  componentDidMount() {
    if (this.fieldName) {
      this.fieldName.focus();
    }
    const { data: { type, dataSource } = {} } = this.props;
    if (type === 29 && dataSource && _.isEmpty(this.state.controls)) {
      this.getControls(dataSource);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { data: { type, dataSource } = {} } = nextProps;
    if (type === 29 && dataSource && dataSource !== (this.props.data || {}).dataSource) {
      this.getControls(dataSource);
    }
  }

  getControls = worksheetId => {
    this.setState({ loading: true });
    worksheetAjax
      .getWorksheetInfo({ worksheetId, getTemplate: true, getViews: false })
      .then(res => {
        const { template } = res;
        this.setState({
          controls: (_.get(template, 'controls') || []).map(i => ({ value: i.controlId, text: i.controlName })),
        });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  handleChange = obj => {
    const newObj = !obj.type
      ? obj
      : _.includes([10, 11], obj.type)
        ? {
            ...obj,
            options: [],
            enumDefault: _.includes([15, 16], obj.type) ? 0 : obj.enumDefault,
            enumDefault2: _.includes([15, 16], obj.type) ? 0 : obj.enumDefault2,
          }
        : {
            ...obj,
            enumDefault: _.includes([15, 16], obj.type) ? 0 : obj.enumDefault,
            enumDefault2: _.includes([15, 16], obj.type) ? 0 : obj.enumDefault2,
          };
    let newData = { ...this.props.data, ...newObj };
    if (newData.type !== 29) {
      delete newData.sourceConfig;
    }
    this.props.onChange(newData);
  };

  getSelectControl() {
    const { data, worksheetList = [] } = this.props;
    const list = getList(1, worksheetList).concat(getList(2, worksheetList));
    const value = data.dataSource || data.type;
    return _.find(list, i => (i.total ? _.includes(i.total, value) : i.value === value));
  }

  render() {
    const { data = {}, worksheetList = [], createType, projectId } = this.props;
    const { step, visible, controls, loading } = this.state;
    const { type, controlName, dataSource, sourceConfig = {} } = data;
    const ENUM_TYPE = enumWidgetType[type];
    const allProps = { data, onChange: this.handleChange, globalSheetInfo: { projectId } };
    const SettingComponent = Settings[ENUM_TYPE];

    const SETTING_WIDGETS =
      createType === 'app'
        ? getList(step, worksheetList).filter(it => it.value !== 'next')
        : getList(step, worksheetList);
    return (
      <ExcelControlSettingWrap>
        {/**类型切换 */}
        <SettingItem className="mTop0">
          <div className="settingItemTitle">{_l('类型')}</div>
          <Dropdown
            border
            openSearch
            popupVisible={visible}
            value={dataSource || type}
            data={SETTING_WIDGETS.map(item => ({
              ...item,
              disabled:
                (item.value === 14 || item.value === 36 || item.value === 'next') && data.attribute === 1
                  ? true
                  : false,
            }))}
            renderTitle={() => {
              return (
                <div className="flex name">
                  <Icon className="icon Font17 mRight5 Gray_9d" icon={getIconByType(type)} />
                  <div className="ellipsis InlineBlock Font14">
                    {type === 29 ? _l('关联到') : _.get(this.getSelectControl(), 'text')}
                    {type === 29 && (
                      <span className="ThemeColor3 mLeft3">{_.get(this.getSelectControl(), 'text')}</span>
                    )}
                  </div>
                </div>
              );
            }}
            renderItem={item => {
              return (
                <div
                  className={cx('itemText flexRow', { disabeldRelate: data.attribute === 1 && item.value === 'next' })}
                >
                  <div className="flex">{item.text}</div>
                  <span>
                    {data.attribute === 1 && (item.value === 14 || item.value === 36 || item.value === 'next') && (
                      <Tooltip text={<span>{_l('标题字段不能设置为此类型')}</span>} action={['hover']}>
                        <Icon icon="info_outline" className="Gray_bd mLeft8 Hand Font15" />
                      </Tooltip>
                    )}
                  </span>
                </div>
              );
            }}
            onChange={value => {
              if (_.includes(['next', 'back'], value)) {
                this.setState({ step: value === 'next' ? 2 : 1, visible: true });
              } else {
                this.setState({ visible: false });
                if (_.includes(_.flatten(EXCEL_CONTROLS), value)) {
                  this.handleChange({ type: value, ..._.omit(DEFAULT_DATA[enumWidgetType[value]], ['controlName']) });
                } else {
                  this.handleChange({
                    type: 29,
                    dataSource: value,
                    ..._.omit(DEFAULT_DATA[enumWidgetType[29]], ['controlName']),
                  });
                }
              }
            }}
          />
        </SettingItem>

        {/**
         * 映射字段
         */}
        {type === 29 && dataSource && (
          <SettingItem>
            <div className="settingItemTitle">{_l('匹配字段')}</div>
            {loading ? (
              <LoadDiv />
            ) : (
              <Dropdown
                border
                openSearch
                value={sourceConfig.controlId}
                placeholder={_l('请选择映射的匹配字段')}
                data={controls}
                onChange={value => {
                  this.handleChange({ sourceConfig: { worksheetId: dataSource, controlId: value } });
                }}
              />
            )}
          </SettingItem>
        )}

        {/**字段名称 */}
        <SettingItem>
          <div className="settingItemTitle">{_l('字段名称')}</div>
          <Input
            ref={ele => (this.fieldName = ele)}
            type="text"
            value={controlName}
            onBlur={() => {
              if (!controlName && !_.includes([22, 10010], type)) {
                this.handleChange({ controlName: '字段名称' });
              }
            }}
            onChange={e => this.handleChange({ controlName: e.target.value })}
            maxLength="100"
          />
        </SettingItem>

        {/**可选配置 */}
        {!_.includes(NO_OTHER_CONFIG, type) && (
          <Fragment>{HAS_RADIO_CONTROL.includes(type) && <SettingComponent {...allProps} fromExcel={true} />}</Fragment>
        )}
      </ExcelControlSettingWrap>
    );
  }
}
