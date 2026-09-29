import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv } from 'ming-ui';
import { Input, Select, Tooltip } from 'ming-ui/antd-components';
import worksheetAjax from 'src/api/worksheet';
import { SettingItem } from 'src/pages/widgetConfig/styled';
import Settings from 'src/pages/widgetConfig/widgetSetting/settings';
import { getIconByType } from 'src/utils/domain/control/metadata';
import { DEFAULT_DATA } from 'src/utils/domain/control/widget';
import { enumWidgetType } from 'src/utils/domain/control/widgetTypes';
import { EXCEL_CONTROLS, getList, HAS_RADIO_CONTROL, NO_OTHER_CONFIG } from './config';

const ExcelControlSettingWrap = styled.div`
  width: 350px;
  padding: 5px;
  max-height: 400px;
  overflow-x: hidden;
  .name {
    display: flex;
    align-items: center;
  }
  .itemText {
    .Icon {
      position: unset !important;
    }
    &.disabeldRelate {
      .icon-arrow-right-border {
        display: none !important;
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

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      const { data: { type, dataSource } = {} } = this.props;

      if (type === 29 && dataSource && dataSource !== (prevProps.data || {}).dataSource) {
        this.getControls(dataSource);
      }
    }
  }

  componentWillUnmount() {
    clearTimeout(this.reopenTimer);
  }

  getControls = worksheetId => {
    this.setState({ loading: true });
    worksheetAjax
      .getWorksheetInfo({ worksheetId, getTemplate: true, getViews: false })
      .then(res => {
        const { template } = res;
        this.setState({
          controls: (_.get(template, 'controls') || []).map(i => ({ value: i.controlId, label: i.controlName })),
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
    const { data = {}, worksheetList = [], createType, projectId, appId } = this.props;
    const { step, visible, controls, loading } = this.state;
    const { type, controlName, dataSource, sourceConfig = {} } = data;
    const ENUM_TYPE = enumWidgetType[type];
    const allProps = { data, onChange: this.handleChange, globalSheetInfo: { projectId, appId } };
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
          <Select
            showPopupSearch
            className="w100"
            optionFilterProp="label"
            open={visible}
            onOpenChange={visible => this.setState({ visible })}
            value={dataSource || type}
            options={SETTING_WIDGETS.map(item => ({
              ...item,
              disabled:
                (item.value === 14 || item.value === 36 || item.value === 'next') && data.attribute === 1
                  ? true
                  : false,
            }))}
            labelRender={() => {
              return (
                <div className="flex name">
                  <Icon className="icon Font17 mRight5 textTertiary" icon={getIconByType(type)} />
                  <div className="ellipsis InlineBlock Font14">
                    {type === 29 ? _l('关联到') : _.get(this.getSelectControl(), 'label')}
                    {type === 29 && (
                      <span className="colorPrimary mLeft3">{_.get(this.getSelectControl(), 'label')}</span>
                    )}
                  </div>
                </div>
              );
            }}
            optionRender={option => {
              const item = option.data;
              return (
                <div
                  className={cx('itemText flexRow', { disabeldRelate: data.attribute === 1 && item.value === 'next' })}
                >
                  <Icon icon={item.iconName} className="Font16 textTertiary mRight12" />
                  <div className="flex">{item.label}</div>
                  <span>
                    {data.attribute === 1 && (item.value === 14 || item.value === 36 || item.value === 'next') && (
                      <Tooltip title={_l('标题字段不能设置为此类型')}>
                        <Icon icon="info_outline" className="textDisabled mLeft8 Hand Font15" />
                      </Tooltip>
                    )}
                  </span>
                </div>
              );
            }}
            onChange={value => {
              if (_.includes(['next', 'back'], value)) {
                this.setState({ step: value === 'next' ? 2 : 1, visible: false });
                clearTimeout(this.reopenTimer);
                this.reopenTimer = setTimeout(() => this.setState({ visible: true }), 0);
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
              <Select
                showPopupSearch
                className="w100"
                optionFilterProp="label"
                value={sourceConfig.controlId}
                placeholder={_l('请选择映射的匹配字段')}
                options={controls}
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
                this.handleChange({ controlName: _l('字段名称') });
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
