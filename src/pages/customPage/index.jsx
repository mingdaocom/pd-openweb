import React, { Component, createRef } from 'react';
import { string } from 'prop-types';
import { autobind } from 'core-decorators';
import styled from 'styled-components';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { LoadDiv } from 'ming-ui';
import customApi from 'src/pages/worksheet/common/Statistics/api/custom.js';
import sheetApi from 'src/api/worksheet';
import update from 'immutability-helper';
import ConfigHeader from './ConfigHeader';
import WebLayout from './webLayout';
import * as actions from './redux/action';
import { updateSheetList } from 'src/pages/worksheet/redux/actions/sheetList';
import { enumWidgetType, reorderComponents } from './util';
import MobileLayout from './mobileLayout';
import { formatControlsData } from 'src/pages/widgetConfig/util/data';
import { formatValuesOfOriginConditions } from 'src/pages/worksheet/common/WorkSheetFilter/util';
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
  .contentWrap {
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

const mapStateToProps = ({ customPage, sheet }) => ({ ...customPage, ...sheet.base });

const mapDispatchToProps = dispatch => bindActionCreators({ ...actions, updateSheetList }, dispatch);

@connect(mapStateToProps, mapDispatchToProps)
export default class CustomPage extends Component {
  static propTypes = {};
  static defaultProps = {};

  state = {
    displayType: 'web',
  };

  componentDidMount() {
    this.getPageData();
  }

  getPageData = () => {
    const { pageId, updatePageInfo, updateLoading } = this.props;
    updateLoading(true);
    customApi
      .getPage({ appId: pageId })
      .then(({ components, apk, version }) => {
        updatePageInfo({
          components,
          pageId,
          version,
          apk: apk || {},
          visible: true
        });
        this.$originComponents = components;
      })
      .always(() => updateLoading(false));
  }

  handleBack = () => {
    const { updateModified, updateEditPageVisible } = this.props;
    updateEditPageVisible(false);
    updateModified(false);
  }

  getCreateRecordBtns = components => {
    const btnComponent = components.filter(item => item.type === enumWidgetType.button);
    return _.flatten(btnComponent.map(item => {
      const btns = item.button.buttonList.filter(btn => {
        return btn.action === 1 && (!_.isEmpty(_.get(btn, ['config', 'temporaryWriteControls'])) || _.get(btn, ['config', 'isEmptyWriteControls']))
      });
      return btns;
    }));
  }

  getFilterBtns = components => {
    const btnComponent = components.filter(item => item.type === enumWidgetType.button);
    return _.flatten(btnComponent.map(item => {
      const btns = item.button.buttonList.filter(btn => {
        return btn.action === 5 && !_.isEmpty(_.get(btn, ['config', 'filterConditions']))
      });
      return btns;
    }));
  }

  getAlreadyDeleteBtn = components => {
    const getBtn = (components) => {
      const btnComponents = components.filter(c => c.type === enumWidgetType.button);
      const createRecordBtns = btnComponents.map(c => {
        const btns = c.button.buttonList.filter(btn => {
          return btn.action === 1 && btn.btnId;
        });
        return btns;
      });
      return _.flatten(createRecordBtns);
    }
    const originBtns = getBtn(this.$originComponents);
    const newBtns = getBtn(components);
    const deleteBtns = originBtns.filter(b => !_.find(newBtns, { btnId: b.btnId }) );
    return deleteBtns;
  }

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
  }

  getAlreadyDeleteFilterBtn = components => {
    const getBtn = (components) => {
      const btnComponents = components.filter(c => c.type === enumWidgetType.button);
      const filterBtns = btnComponents.map(c => {
        const btns = c.button.buttonList.filter(btn => {
          return btn.action === 5 && btn.filterId;
        });
        return btns;
      });
      return _.flatten(filterBtns);
    }
    const originBtns = getBtn(this.$originComponents);
    const newBtns = getBtn(components);
    const deleteBtns = originBtns.filter(b => !_.find(newBtns, { filterId: b.filterId }) );
    return deleteBtns;
  }

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
  }

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
            writeControls: writeControlsFormat
          });
        });
        Promise.all(saveBtnRequest).then(data => {
          const btnIds = createRecordBtns.map((btn, index) => {
            return {
              id: btn.id,
              btnId: data[index]
            }
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
                          isEmptyWriteControls: undefined
                        },
                        btnId
                      }
                    } else {
                      return btn;
                    }
                  })
                }
              }
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
  }

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
            items: formatValuesOfOriginConditions(filterConditions),
            name: '',
            type: ''
          });
        });
        Promise.all(filterBtnRequest).then(data => {
          const btnIds = filterBtns.map((btn, index) => {
            return {
              id: btn.id,
              filterId: data[index].filterId
            }
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
                        filterId
                      }
                    } else {
                      return btn;
                    }
                  })
                }
              }
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
  }

  // 保存前处理数据,title处理掉空白字符，type转换为后端需要的数字
  dealComponents = components =>
    components.map(item =>
      _.omit(
        update(item, {
          web: { title: { $apply: value => value.trim() } },
          mobile: { title: { $apply: value => value.trim() } },
          type: { $apply: value => (typeof value === 'number' ? value : enumWidgetType[value]) },
        }),
        'uuid',
      ),
    )

  @autobind
  async handleSave() {
    const { version, pageId, components, updatePageInfo, updateSaveLoading } = this.props;
    
    updateSaveLoading(true);

    let newComponents = this.dealComponents(components);

    newComponents = await this.fillBtnData(newComponents);
    newComponents = await this.fillFilterData(newComponents);

    customApi
      .savePage({
        appId: pageId,
        version: version,
        components: newComponents,
      })
      .then(({ appId: pageId, version, components }) => {
        if (_.isNumber(version)) {
          this.removeWorksheetBtn();
          this.removeFilterId();
          this.$originComponents = components;
          updatePageInfo({ components, pageId, version, modified: false });
          alert(_l('保存成功'));
        } else {
          alert(_l('保存失败'));
        }
      })
      .fail(() => {
        alert(_l('保存失败'));
      })
      .always(() => updateSaveLoading(false));
  }

  cancelModified = () => {
    const { updatePageInfo } = this.props;
    updatePageInfo({ components: this.$originComponents });
    this.handleBack();
  }

  switchType = type => {
    const { updateComponents, components } = this.props;
    this.setState({ displayType: type });
    const orderComponent = reorderComponents(components);
    if (orderComponent) {
      updateComponents(orderComponent);
    }
  }

  render() {
    const { loading, ...rest } = this.props;
    const { displayType } = this.state;
    const Comp = TYPE_TO_COMP[displayType];
    return (
      <CustomPageWrap className="customPageWrap">
        <ConfigHeader
          {...rest}
          displayType={displayType}
          cancelModified={this.cancelModified}
          switchType={this.switchType}
          onBack={this.handleBack}
          onSave={this.handleSave}
        />
        <div className="contentWrap">{loading ? <LoadDiv style={{ marginTop: '60px' }} /> : <Comp {...rest} />}</div>
      </CustomPageWrap>
    );
  }
}
