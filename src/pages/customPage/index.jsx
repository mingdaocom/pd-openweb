import React, { Component, createRef } from 'react';
import { string } from 'prop-types';
import { autobind } from 'core-decorators';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { LoadDiv } from 'ming-ui';
import customApi from 'statistics/api/custom.js';
import sheetApi from 'src/api/worksheet';
import update from 'immutability-helper';
import ConfigHeader from './ConfigHeader';
import WebLayout from './webLayout';
import * as actions from './redux/action';
import { updateSheetListAppItem } from 'src/pages/worksheet/redux/actions/sheetList';
import { enumWidgetType, reorderComponents, fillObjectId, formatNavfilters } from './util';
import { reportTypes } from 'statistics/Charts/common';
import MobileLayout from './mobileLayout';
import { formatControlsData } from 'src/pages/widgetConfig/util/data';
import { formatValuesOfCondition } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { formatFilterValuesToServer } from 'worksheet/common/Sheet/QuickFilter';
import { defaultConfig } from 'src/pages/customPage/components/ConfigSideWrap';
import './index.less';
import _ from 'lodash';

const TYPE_TO_COMP = {
  web: WebLayout,
  mobile: MobileLayout,
};

const CustomPageWrap = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
  background-color: #fff;
  .customPageContentWrap {
    box-sizing: border-box;
    display: flex;
    height: 100%;
    padding-top: 50px;
  }
  .react-grid-item > .react-resizable-handle::after {
    width: 8px;
    height: 8px;
  }
`;

const mapStateToProps = ({ customPage, sheet, appPkg }) => ({ ...customPage, ...sheet.base, appPkg });

const mapDispatchToProps = dispatch => bindActionCreators({ ...actions, updateSheetListAppItem }, dispatch);

@connect(mapStateToProps, mapDispatchToProps)
export default class CustomPage extends Component {
  static propTypes = {};
  static defaultProps = {};

  state = {
    displayType: 'web',
  };

  componentDidMount() {
    this.props.updatePageInfo({ loadFilterComponentCount: 0 });
    this.getPageData();
  }

  componentWillUnmount() {
    this.props.updatePageInfo({ loadFilterComponentCount: 0 });
  }

  getPageData = () => {
    const { ids, updatePageInfo, updateLoading } = this.props;
    const pageId = ids.worksheetId;
    updateLoading(true);
    customApi
      .getPage({ appId: pageId })
      .then(({ components, apk, version, adjustScreen, config }) => {
        components = fillObjectId(components);
        updatePageInfo({
          components,
          pageId,
          version,
          adjustScreen,
          config: config || defaultConfig,
          apk: apk || {},
          visible: true,
          filterComponents: components.filter(item => item.value && item.type === enumWidgetType.filter)
        });
        this.$originComponents = components;
        this.$originAdjustScreen = adjustScreen;
        this.$originConfig = config;
      })
      .always(() => updateLoading(false));
  };

  handleBack = () => {
    const { updateModified, updateEditPageVisible } = this.props;
    updateEditPageVisible(false);
    updateModified(false);
  };

  getCreateRecordBtns = components => {
    const btnComponent = components.filter(item => item.type === enumWidgetType.button);
    return _.flatten(
      btnComponent.map(item => {
        const btns = item.button.buttonList.filter(btn => {
          return (
            btn.action === 1 &&
            (!_.isEmpty(_.get(btn, ['config', 'temporaryWriteControls'])) ||
              _.get(btn, ['config', 'isEmptyWriteControls']))
          );
        });
        return btns;
      }),
    );
  };

  getFilterBtns = components => {
    const btnComponent = components.filter(item => item.type === enumWidgetType.button);
    return _.flatten(
      btnComponent.map(item => {
        const btns = item.button.buttonList.filter(btn => {
          return btn.action === 5 && !_.isEmpty(_.get(btn, ['config', 'filterConditions']));
        });
        return btns;
      }),
    );
  };

  getAlreadyDeleteBtn = components => {
    const getBtn = components => {
      const btnComponents = components.filter(c => c.type === enumWidgetType.button);
      const createRecordBtns = btnComponents.map(c => {
        const btns = c.button.buttonList.filter(btn => {
          return btn.action === 1 && btn.btnId;
        });
        return btns;
      });
      return _.flatten(createRecordBtns);
    };
    const originBtns = getBtn(this.$originComponents);
    const newBtns = getBtn(components);
    const deleteBtns = originBtns.filter(b => !_.find(newBtns, { btnId: b.btnId }));
    return deleteBtns;
  };

  // 找到已经删除的设置默认值的创建记录按钮，调用 optionWorksheetBtn 删除 btnId
  removeWorksheetBtn = () => {
    const { ids, components } = this.props;
    const btns = this.getAlreadyDeleteBtn(components);
    const removeBtnRequest = btns.map(item => {
      return sheetApi.optionWorksheetBtn({
        appId: ids.appId,
        optionType: 9,
        btnId: item.btnId,
        worksheetId: item.value,
        viewId: '',
      });
    });
    Promise.all(removeBtnRequest).then(data => {});
  };

  getAlreadyDeleteFilterBtn = components => {
    const getBtn = components => {
      const btnComponents = components.filter(c => c.type === enumWidgetType.button);
      const filterBtns = btnComponents.map(c => {
        const btns = c.button.buttonList.filter(btn => {
          return btn.action === 5 && btn.filterId;
        });
        return btns;
      });
      return _.flatten(filterBtns);
    };
    const originBtns = getBtn(this.$originComponents);
    const newBtns = getBtn(components);
    const deleteBtns = originBtns.filter(b => !_.find(newBtns, { filterId: b.filterId }));
    return deleteBtns;
  };

  // 找到已经删除的设置筛选条件的扫码按钮，调用 deleteWorksheetFilter 删除 filterId
  removeFilterId = () => {
    const { ids, components } = this.props;
    const btns = this.getAlreadyDeleteFilterBtn(components);
    const removeBtnRequest = btns.map(item => {
      return sheetApi.deleteWorksheetFilter({
        appId: ids.appId,
        filterId: item.filterId,
      });
    });
    Promise.all(removeBtnRequest).then(data => {});
  };

  // 找到设置默认值的创建记录按钮，调用 saveWorksheetBtn 接口并保存 btnId
  fillBtnData = components => {
    return new Promise((resolve, reject) => {
      const createRecordBtns = this.getCreateRecordBtns(components);
      if (createRecordBtns.length) {
        // 找到创建按钮
        const saveBtnRequest = createRecordBtns.map(item => {
          const { temporaryWriteControls, controls } = item.config;
          // 保存的时候对 writeControls 数据处理
          let writeControlsFormat = temporaryWriteControls.map(o => {
            let control = _.find(controls, item => item.controlId === o.controlId) || {};
            return {
              ...o,
              defsource: _.get(
                formatControlsData([
                  {
                    ...control,
                    advancedSetting: { defsource: o.defsource },
                  },
                ])[0],
                ['advancedSetting', 'defsource'],
              ),
            };
          });
          return sheetApi.saveWorksheetBtn({
            showType: 9,
            btnId: item.btnId || undefined,
            worksheetId: item.value,
            writeControls: writeControlsFormat,
          });
        });
        Promise.all(saveBtnRequest).then(data => {
          const btnIds = createRecordBtns.map((btn, index) => {
            return {
              id: btn.id,
              btnId: data[index],
            };
          });
          const newComponents = components.map(component => {
            if (component.type === enumWidgetType.button) {
              const { buttonList } = component.button;
              return {
                ...component,
                button: {
                  ...component.button,
                  buttonList: buttonList.map(btn => {
                    const { id, config } = btn;
                    const target = _.find(btnIds, { id });
                    if (target) {
                      const { btnId } = target;
                      return {
                        ...btn,
                        config: {
                          ...config,
                          temporaryWriteControls: undefined,
                          controls: undefined,
                          isEmptyWriteControls: undefined,
                        },
                        btnId,
                      };
                    } else {
                      return {
                        ...btn,
                        config: {
                          ...config,
                          temporaryWriteControls: undefined,
                          controls: undefined,
                          isEmptyWriteControls: undefined,
                        }
                      };
                    }
                  }),
                },
              };
            } else {
              return component;
            }
          });
          resolve(newComponents);
        });
      } else {
        resolve(components);
      }
    });
  };

  // 找到设置筛选条件的按钮，调用 saveWorksheetFilter 接口并保存 filterId
  fillFilterData = components => {
    const { ids } = this.props;
    return new Promise((resolve, reject) => {
      const filterBtns = this.getFilterBtns(components);
      if (filterBtns.length) {
        const filterBtnRequest = filterBtns.map(item => {
          const { value, filterId, config } = item;
          const { filterConditions } = config;
          return sheetApi.saveWorksheetFilter({
            appId: ids.appId,
            filterId: filterId || undefined,
            worksheetId: value,
            module: 2,
            items: filterConditions.map(formatValuesOfCondition),
            name: '',
            type: '',
          });
        });
        Promise.all(filterBtnRequest).then(data => {
          const btnIds = filterBtns.map((btn, index) => {
            return {
              id: btn.id,
              filterId: data[index].filterId,
            };
          });
          const newComponents = components.map(component => {
            if (component.type === enumWidgetType.button) {
              const { buttonList } = component.button;
              return {
                ...component,
                button: {
                  ...component.button,
                  buttonList: buttonList.map(btn => {
                    const { id, config } = btn;
                    const target = _.find(btnIds, { id });
                    if (target) {
                      const { filterId } = target;
                      return {
                        ...btn,
                        config: {
                          ...config,
                          filterConditions: undefined,
                        },
                        filterId,
                      };
                    } else {
                      return btn;
                    }
                  }),
                },
              };
            } else {
              return component;
            }
          });
          resolve(newComponents);
        });
      } else {
        resolve(components);
      }
    });
  };
  // 保存筛选组件
  fillFilterComponent = components => {
    return new Promise((resolve, reject) => {
      const { ids } = this.props;
      const filterComponent = components.filter(c => c.type === enumWidgetType.filter).filter(c => c.filter);
      if (filterComponent.length) {
        const saveFilterRequest = filterComponent.map(item => {
          const { filter = {} } = item;
          const { filters = [] } = filter;
          return sheetApi.saveFiltersGroup({
            ...filter,
            appId: ids.appId,
            pageId: ids.worksheetId,
            filters: filters.map(item => {
              const navfilters = formatNavfilters(item);
              return {
                ...item,
                advancedSetting: {
                  ...item.advancedSetting,
                  navfilters,
                  showNavfilters: undefined
                },
                values: formatFilterValuesToServer(item.dataType, item.values),
                control: undefined,
              };
            }),
          });
        });
        Promise.all(saveFilterRequest).then(data => {
          const filterIds = filterComponent.map((component, index) => {
            return {
              id: component.id || component.uuid,
              filtersGroupId: data[index].filtersGroupId,
            };
          });
          const newComponents = components.map(component => {
            if (component.type === enumWidgetType.filter && !component.value) {
              return {
                ...component,
                filter: undefined,
                value: _.find(filterIds, { id: component.id || component.uuid }).filtersGroupId,
              };
            } else {
              return component;
            }
          });
          resolve(newComponents);
        });
      } else {
        resolve(components);
      }
    });
  };

  // 删除筛选组件
  removeFiltersGroup = () => {
    const { ids, components } = this.props;
    const filters = this.$originComponents.filter(c => c.type === enumWidgetType.filter && c.value);
    const getFilter = components => {
      return components.filter(c => c.type === enumWidgetType.filter && c.value);
    };
    const originFilters = getFilter(this.$originComponents);
    const newFilters = getFilter(components);
    const deleteFilters = originFilters.filter(f => !_.find(newFilters, { value: f.value }));
    const removeFilterRequest = deleteFilters.map(item => {
      return sheetApi.deleteFiltersGroupByIds({
        appId: ids.appId,
        filtersGroupIds: [item.value],
      });
    });
    Promise.all(removeFilterRequest).then(data => {});
  };

  // 保存前处理数据，title处理掉空白字符，type转换为后端需要的数字
  dealComponents = components => {
    return components.map(item => {
      return update(item, {
        web: { title: { $apply: value => value.trim() } },
        mobile: { title: { $apply: value => value.trim() } },
        type: { $apply: value => (typeof value === 'number' ? value : enumWidgetType[value]) },
      });
    });
  };

  // 清除 component 里面的临时数据 & 填充或处理后端需要的数据
  dealComponentTemporaryData = components => {
    return components.map(item => {
      // 清除 uuid
      const component = _.omit(item, 'uuid');
      // 清空按钮的临时配置
      if (component.type === enumWidgetType.button) {
        const { buttonList } = component.button;
        return {
          ...component,
          button: {
            ...component.button,
            buttonList: buttonList.map(btn => {
              const { config } = btn;
              return {
                ...btn,
                config: {
                  ...config,
                  temporaryWriteControls: undefined,
                  controls: undefined,
                  isEmptyWriteControls: undefined,
                }
              };
            }),
          }
        };
      }
      // 找到透视表，保存管理员列宽的配置
      if (component.type === enumWidgetType.analysis && component.reportType === reportTypes.PivotTable) {
        const columnWidthConfig = sessionStorage.getItem(`pivotTableColumnWidthConfig-${component.value}`) || undefined;
        return {
          ...component,
          config: {
            ...component.config,
            columnWidthConfig
          }
        }
      }
      return component;
    });
  };

  @autobind
  async handleSave() {
    const { version, ids, adjustScreen, config, components, updatePageInfo, updateSaveLoading } = this.props;
    const pageId = ids.worksheetId;

    updateSaveLoading(true);

    let newComponents = this.dealComponents(components);

    newComponents = await this.fillBtnData(newComponents);
    newComponents = await this.fillFilterData(newComponents);
    newComponents = await this.fillFilterComponent(newComponents);
    newComponents = this.dealComponentTemporaryData(newComponents);

    customApi
      .savePage({
        appId: pageId,
        version: version,
        components: newComponents,
        adjustScreen,
        config
      })
      .then(({ appId: pageId, version, components }) => {
        if (_.isNumber(version)) {
          this.removeWorksheetBtn();
          this.removeFilterId();
          this.removeFiltersGroup();
          this.$originComponents = components;
          this.$originAdjustScreen = adjustScreen;
          this.$originConfig = config;
          updatePageInfo({ components, pageId, version, modified: false });
          alert(_l('保存成功'), 1);
        } else {
          alert(_l('保存失败'), 2);
        }
      })
      .fail(() => {
        alert(_l('保存失败'), 2);
      })
      .always(() => updateSaveLoading(false));
  }

  cancelModified = () => {
    const { updatePageInfo } = this.props;
    updatePageInfo({
      components: this.$originComponents,
      adjustScreen: this.$originAdjustScreen,
      config: this.$originConfig
    });
    this.handleBack();
  };

  switchType = type => {
    const { updateComponents, components } = this.props;
    this.setState({ displayType: type });
    this.props.updatePageInfo({ loadFilterComponentCount: 0 });
    const orderComponent = reorderComponents(components);
    if (orderComponent) {
      updateComponents(orderComponent);
    }
  };

  render() {
    const { loading, name, ...rest } = this.props;
    const { displayType } = this.state;
    const Comp = TYPE_TO_COMP[displayType];
    return (
      <CustomPageWrap className="customPageWrap">
        <ConfigHeader
          {...rest}
          pageName={name}
          displayType={displayType}
          cancelModified={this.cancelModified}
          switchType={this.switchType}
          onBack={this.handleBack}
          onSave={this.handleSave}
        />
        <div className="customPageContentWrap">
          {loading ? <LoadDiv style={{ marginTop: '60px' }} /> : <Comp {...rest} />}
        </div>
      </CustomPageWrap>
    );
  }
}
