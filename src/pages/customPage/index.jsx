import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import update from 'immutability-helper';
import _ from 'lodash';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import sheetApi from 'src/api/worksheet';
import customApi from 'statistics/api/custom.js';
import reportConfigApi from 'statistics/api/reportConfig';
import { reportTypes } from 'statistics/Charts/common';
import { formatFilterValuesToServer } from 'worksheet/common/Sheet/QuickFilter/utils';
import { defaultConfig } from 'src/pages/customPage/components/ConfigSideWrap';
import { formatControlsData } from 'src/pages/widgetConfig/util/data';
import { formatValuesOfCondition } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { updateSheetListAppItem } from 'src/pages/worksheet/redux/actions/sheetList';
import ConfigHeader from './ConfigHeader';
import MobileLayout from './mobileLayout';
import * as actions from './redux/action';
import { enumWidgetType, fillObjectId, formatNavfilters, reorderComponents, updateLayout } from './util';
import WebLayout from './webLayout';
import './index.less';

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
    opacity: 0.6;
    border-color: var(--title-color);
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
        components = updateLayout(fillObjectId(components), config);
        updatePageInfo({
          components,
          pageId,
          version,
          adjustScreen,
          config: config ? { ...config, webNewCols: 48, orightWebCols: config.webNewCols } : defaultConfig,
          apk: apk || {},
          visible: true,
          filterComponents: components.filter(item => item.value && item.type === enumWidgetType.filter),
        });
        this.$originComponents = components;
        this.$originAdjustScreen = adjustScreen;
        this.$originConfig = config;
      })
      .finally(() => updateLoading(false));
  };

  handleBack = () => {
    const { updateModified, updateEditPageVisible } = this.props;
    updateEditPageVisible(false);
    updateModified(false);
  };

  // 找到编辑过名称和描述的图表保存数据
  fillChartData = components => {
    return new Promise(resolve => {
      const chartComponent = components
        .filter(item => item.type === enumWidgetType.analysis)
        .filter(item => _.get(item, 'config.isEdit') === true);
      if (chartComponent.length) {
        const saveChartRequest = chartComponent.map(item => {
          return reportConfigApi.updateReportName({
            reportId: item.value,
            name: _.get(item, 'config.name'),
            desc: _.get(item, 'config.desc'),
            showTitle: _.get(item, 'config.showTitle'),
          });
        });
        Promise.all(saveChartRequest).then(() => {
          const newComponents = components.map(component => {
            if (component.type === enumWidgetType.analysis) {
              return {
                ...component,
                config: {
                  ...component.config,
                  isEdit: undefined,
                  showTitle: undefined,
                  name: undefined,
                  desc: undefined,
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
    Promise.all(removeBtnRequest).then(() => {});
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
    Promise.all(removeBtnRequest).then(() => {});
  };

  // 找到设置默认值的创建记录按钮，调用 saveWorksheetBtn 接口并保存 btnId
  fillBtnData = components => {
    return new Promise(resolve => {
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
            name: item.name,
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
                        },
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
    return new Promise(resolve => {
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
    return new Promise(resolve => {
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
                  showNavfilters: undefined,
                  showDefsource: undefined,
                },
                values: _.isEmpty(item.dynamicSource)
                  ? formatFilterValuesToServer(item.dataType, item.values)
                  : undefined,
                value: _.isEmpty(item.dynamicSource) ? item.value : undefined,
                control: undefined,
                objectControls: item.objectControls.map(object => {
                  return {
                    ...object,
                    control: undefined,
                  };
                }),
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
    Promise.all(removeFilterRequest).then(() => {});
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
                },
              };
            }),
          },
        };
      }
      // 找到透视表，保存管理员列宽的配置
      if (component.type === enumWidgetType.analysis && component.reportType === reportTypes.PivotTable) {
        const columnWidthConfig = sessionStorage.getItem(`pivotTableColumnWidthConfig-${component.value}`) || undefined;
        return {
          ...component,
          config: {
            ...component.config,
            columnWidthConfig,
          },
        };
      }
      return component;
    });
  };

  handleSave = async () => {
    const {
      version,
      ids,
      adjustScreen,
      urlParams = [],
      config,
      components,
      updatePageInfo,
      updateSaveLoading,
    } = this.props;
    const pageId = ids.worksheetId;

    updateSaveLoading(true);

    let newComponents = this.dealComponents(components);

    newComponents = await this.fillChartData(newComponents);
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
        urlParams,
        config,
      })
      .then(({ appId: pageId, version, components, apk, config = {} }) => {
        if (_.isNumber(version)) {
          this.removeWorksheetBtn();
          this.removeFilterId();
          this.removeFiltersGroup();
          this.$originComponents = components;
          this.$originAdjustScreen = adjustScreen;
          this.$originConfig = {
            ...config,
            orightWebCols: config.webNewCols,
          };
          updatePageInfo({
            components,
            pageId,
            version,
            modified: false,
            filterComponents: components.filter(item => item.value && item.type === enumWidgetType.filter),
            apk,
            config: this.$originConfig,
            activeContainerInfo: {},
          });
          alert(_l('保存成功'), 1);
        } else {
          alert(_l('保存失败'), 2);
        }
      })
      .catch(() => {
        alert(_l('保存失败'), 2);
      })
      .finally(() => updateSaveLoading(false));
  };

  cancelModified = () => {
    const { updatePageInfo } = this.props;
    updatePageInfo({
      components: this.$originComponents,
      adjustScreen: this.$originAdjustScreen,
      config: this.$originConfig,
      activeContainerInfo: {},
    });
    this.handleBack();
  };

  switchType = type => {
    const { updateComponents, components } = this.props;
    this.setState({ displayType: type });
    this.props.updatePageInfo({
      loadFilterComponentCount: 0,
      activeContainerInfo: {},
    });
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
          onBack={this.cancelModified}
          onSave={this.handleSave}
        />
        <div className="customPageContentWrap">
          {loading ? <LoadDiv style={{ marginTop: '60px' }} /> : <Comp {...rest} />}
        </div>
      </CustomPageWrap>
    );
  }
}
