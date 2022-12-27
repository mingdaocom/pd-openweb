import React from 'react';
import './CreateCustomBtn.less';
import withClickAway from 'ming-ui/decorators/withClickAway';
import cx from 'classnames';
import { Icon, ScrollView, RadioGroup } from 'ming-ui';
import AppointDialog from './components/AppointDialog';
import ShowBtnFilterDialog from './components/ShowBtnFilterDialog';
import sheetAjax from 'src/api/worksheet';
import process from 'src/pages/workflow/api/process';
import { FilterItemTexts } from 'src/pages/widgetConfig/widgetSetting/components/FilterData';
import WorkflowDialog from 'src/pages/workflow/components/WorkflowDialog';
import DoubleConfirmDialog from './components/DoubleConfirmDialog';
import { filterData } from 'src/pages/FormSet/components/columnRules/config.js';
import { formatValuesOfCondition } from '../../common/WorkSheetFilter/util';
import color from 'color';
import { COLORS, ICONS } from './config';
import { SYS } from 'src/pages/widgetConfig/config/widget';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import { formatControlsData } from 'src/pages/widgetConfig/util/data';
import _ from 'lodash';

@errorBoundary
class CreateCustomBtnCon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      saveLoading: false,
      isErrer: false,
      isShowBtnFilterDialog: false,
      workflowId: '',
      showDoubleConfirmDialog: false,
      showAppointDialog: false,
      relationControls: [],
      showWorkflowDialog: false,
      filterItemTexts: [],
      flowName: '',
      flowEnabled: false,
      relationWorksheetInfo: {},
    };
  }
  ajaxRequest = null;
  componentDidMount() {
    this.initState(this.props);
    $('.Radio').attr('title', '');
  }

  componentWillReceiveProps(nextProps) {
    const btnDataInfoPre = this.props.btnDataInfo || {};
    const btnDataInfoNext = nextProps.btnDataInfo || {};
    if (!_.isEqual(btnDataInfoPre, btnDataInfoNext)) {
      this.initState(nextProps);
    }
  }

  initState = props => {
    const { btnDataInfo = {}, viewId } = props;
    let {
      displayViews = [],
      isAllView,
      name = '',
      showType = 1,
      clickType = 1,
      workflowType = 1,
      filters = [],
      writeObject = '',
      relationControl = '',
      writeType = '',
      addRelationControl = '',
      writeControls = [],
      desc = '',
    } = btnDataInfo;
    //isAllView===1 所有记录
    if (displayViews.length <= 0 && isAllView !== 1 && props.from !== 'formset' && viewId) {
      //视图配置=>编辑按钮 displayViews为空时 默认为当前视图
      displayViews = [viewId];
    }
    this.setState(
      {
        name,
        showType,
        clickType,
        workflowType,
        filters,
        doubleConfirm: {
          confirmMsg: btnDataInfo.confirmMsg || '你确认对记录执行此操作吗？',
          cancelName: btnDataInfo.cancelName || '取消',
          sureName: btnDataInfo.sureName || '确认',
        },
        writeObject,
        relationControl,
        writeType,
        addRelationControlId: addRelationControl, //get 获取=>addRelationControl
        writeControls,
        widgetList: (props.worksheetControls || []).filter(item => !SYS.includes(item.controlId)), //排除系统字段
        isEdit: props.isEdit,
        btnId: props.btnId,
        color: btnDataInfo.color || COLORS[0],
        icon: btnDataInfo.icon || ICONS[0],
        desc,
        isAllView: isAllView ? isAllView : !props.btnId && props.from === 'formset' ? 1 : 0,
        displayViews,
      },
      () => {
        if (!props.btnId) {
          $('.nameInput').focus();
        }
        this.getRelationControl(relationControl);
        this.formatFilterData();
        this.getProcessByTriggerId();
      },
    );
  };

  getProcessByTriggerId = callback => {
    const { worksheetId } = this.props;
    const { btnId } = this.state;
    if (btnId && worksheetId) {
      if (this.ajaxRequest) {
        this.ajaxRequest.abort();
      }
      this.ajaxRequest = process.getProcessByTriggerId({
        appId: worksheetId,
        triggerId: btnId,
      });

      this.ajaxRequest.then(res => {
        const data = res[0] || {};
        this.setState(
          {
            workflowId: data.id,
            flowName: data.name,
            flowEnabled: data.enabled,
          },
          () => {
            if (callback) {
              callback(data.id);
            }
          },
        );
      });
    }
  };

  getRelationControl = id => {
    const { dataSource = '' } =
      _.find(this.props.currentSheetInfo.template.controls, item => item.controlId === id) || {};
    if (id && dataSource) {
      sheetAjax
        .getWorksheetInfo({
          worksheetId: dataSource,
          getTemplate: true,
          getViews: true,
        })
        .then(data => {
          this.setState({
            relationControls: data.template.controls,
            relationWorksheetInfo: data,
          });
        });
    } else {
      this.setState({
        relationControls: [],
        relationWorksheetInfo: {},
      });
    }
  };

  isEditFn = () => {
    const { btnList } = this.props;
    let btnListClone = false;
    _.map(btnList, item => {
      if (item.name === this.state.name && this.state.btnId !== item.btnId) {
        btnListClone = true;
      }
    });
    this.setState({
      isErrer: !btnList || btnList.length <= 0 ? false : btnListClone,
    });
  };

  formatFilterData = () => {
    const { filters, widgetList } = this.state;
    const { columns } = this.props;
    this.setState({
      filterItemTexts: filterData(columns, filters),
    });
  };

  renderCon = () => {
    const {
      name,
      widgetList,
      relationControls = [],
      writeControls,
      relationControl,
      addRelationControlId,
      writeObject,
      showType,
      clickType,
      writeType,
      filterItemTexts,
      workflowType,
      btnId,
      filters = [],
    } = this.state;
    const dataControls = relationControl !== '' ? relationControls : widgetList;
    return (
      <div className="createBtnBox">
        <h5 className="Gray">{_l('按钮名称')}</h5>
        <input
          value={name}
          placeholder={_l('例如：添加线索、关闭机会')}
          ref={inputEl => {
            this.inputEl = inputEl;
          }}
          onChange={event => {
            this.setState(
              {
                name: event.target.value,
              },
              () => {
                this.isEditFn();
              },
            );
          }}
          maxLength="50"
          className={cx('nameInput Font14', { errer: this.state.isErrer })}
        />
        {this.state.isErrer && <p className="errorMessage mTop6 Font12">{_l('按钮名称重名，请重新修改')}</p>}
        <h5 className="Gray mTop6">{_l('启用按钮')}</h5>
        <RadioGroup
          data={[
            {
              value: 1,
              text: _l('一直'),
            },
            {
              value: 2,
              text: _l('满足筛选条件'),
            },
          ]}
          size="small"
          onChange={value => {
            this.setState(
              {
                showType: value,
              },
              () => {
                if (value === 2 && filters.length <= 0) {
                  this.setState({
                    isShowBtnFilterDialog: true,
                  });
                }
              },
            );
          }}
          checkedValue={showType}
        />
        {filters.length > 0 && showType === 2 && (
          <FilterItemTexts
            filterItemTexts={filterItemTexts}
            loading={false}
            editFn={() =>
              this.setState({
                isShowBtnFilterDialog: true,
              })
            }
          />
        )}
        <h5 className="Gray mTop6">{_l('点击后')}</h5>
        <RadioGroup
          data={[
            {
              value: 1,
              text: _l('立即执行'),
            },
            {
              value: 2,
              text: _l('需要二次确认'),
            },
            {
              value: 3,
              text: _l('填写指定内容'),
            },
          ]}
          size="small"
          onChange={value => {
            this.setState({
              clickType: value,
            });
            if (value === 3 && (writeObject === '' || !writeType === '')) {
              this.setState({
                showAppointDialog: true,
              });
            }
            if (value === 3 && !btnId) {
              this.setState({
                workflowType: 2,
              });
            }
          }}
          checkedValue={clickType}
        />
        {clickType === 2 && (
          <div className="filterTextCon">
            <div className="txtFilter">
              <p>
                <span className="titleTxt Gray">{_l('提示文字')}</span>
                <span className="txt Gray breakAll">{this.state.doubleConfirm.confirmMsg}</span>
              </p>
              <p className="mTop5">
                <span className="titleTxt Gray">{_l('确认按钮文字')}</span>
                <span className="txt Gray breakAll">{this.state.doubleConfirm.sureName}</span>
              </p>
              <p className="mTop5">
                <span className="titleTxt Gray">{_l('取消按钮文字')}</span>
                <span className="txt Gray breakAll">{this.state.doubleConfirm.cancelName}</span>
              </p>
            </div>
            <Icon
              icon="hr_edit"
              className="Gray_9d Font18 editFilter Hand"
              onClick={() => {
                this.setState({
                  showDoubleConfirmDialog: true,
                });
              }}
            />
          </div>
        )}
        {/* 填写指定内容 */}
        {clickType === 3 && writeObject !== '' && writeType !== '' && (
          <div className="filterTextCon">
            <div className="txtFilter">
              <span>
                {writeObject === 1 ? (
                  <span className="mRight10">{_l('在当前记录中')}</span>
                ) : (
                  <React.Fragment>
                    <span className="mRight10">{_l('在关联记录')}</span>
                    <span className="Bold mRight10">
                      “
                      {widgetList.filter(item => relationControl === item.controlId).length > 0 ? (
                        widgetList.filter(item => relationControl === item.controlId)[0].controlName
                      ) : (
                        <span className="Gray_9e">{_l('关联记录已删除')}</span>
                      )}
                      ”
                    </span>
                    <span className="">{_l('中')}</span>
                  </React.Fragment>
                )}
              </span>
              <span>
                {writeType === 1 ? (
                  <React.Fragment>
                    {' '}
                    <br />
                    <span className="mRight10">{_l('填写')}</span>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <span className="mRight10">{_l('新建')}</span>
                    {dataControls.length > 0 && addRelationControlId !== '' && (
                      <span className="Bold">
                        {_.find(dataControls, item => item.controlId === addRelationControlId)
                          ? _.find(dataControls, item => item.controlId === addRelationControlId).controlName
                          : ''}
                      </span>
                    )}
                  </React.Fragment>
                )}
              </span>
              {writeType === 1 &&
                dataControls.length > 0 &&
                writeControls.map((item, i) => {
                  const writeControlsData = _.find(dataControls, items => items.controlId === item.controlId);
                  if (!writeControlsData) {
                    return '';
                  } else {
                    const controlName = writeControlsData && writeControlsData.controlName;
                    return (
                      <React.Fragment>
                        <span className="Bold">
                          {controlName || (writeControlsData.type === 22 ? _l('分段') : _l('备注'))}
                        </span>
                        {writeControls.length > i + 1 ? '、' : ''}
                      </React.Fragment>
                    );
                  }
                })}
            </div>
            <Icon
              icon="hr_edit"
              className="Gray_9d Font18 editFilter Hand"
              onClick={() => {
                this.setState({
                  showAppointDialog: true,
                });
              }}
            />
          </div>
        )}
        <h5 className="Gray mTop6">{_l('执行工作流')}</h5>
        {clickType === 3 && (
          <RadioGroup
            data={[
              {
                value: 2,
                text: _l('不执行'),
              },
              {
                value: 1,
                text: _l('执行工作流'),
              },
            ]}
            size="small"
            onChange={value => {
              this.setState({
                workflowType: value,
              });
            }}
            checkedValue={workflowType}
          />
        )}
        {workflowType === 2 && clickType === 3 ? (
          ''
        ) : this.state.isEdit && !!this.state.flowName ? (
          <div className="filterTextCon">
            <div className="txtFilter">
              {this.state.flowName}
              {!this.state.flowEnabled && <span className="Font13 mLeft5 redCon">{_l('未启用')}</span>}
            </div>
            <div
              className="editWorkflow Hand"
              onClick={() => {
                this.setState({
                  showWorkflowDialog: true,
                });
              }}
            >
              {_l('编辑工作流')}
            </div>
          </div>
        ) : (
          <div className="filterTextCon">
            <div className="txtFilter Gray_75">{_l('添加按钮后自动创建流程')}</div>
          </div>
        )}
        {this.renderColors()}
        {this.renderIcons()}
        {this.renderDesc()}
      </div>
    );
  };

  renderColors = () => {
    return (
      <div className="mTop32 customBtnColorBox">
        <h5 className="Gray mTop6">{_l('按钮颜色')}</h5>
        <ul className="mTop16">
          {COLORS.map(item => {
            return (
              <li
                className={cx('colorLi', { current: this.state.color === item })}
                style={{ backgroundColor: color(item) }}
                onClick={() => {
                  this.setState({
                    color: item,
                  });
                }}
              >
                {this.state.color === item && <Icon icon="ok" className="check" />}
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  renderIcons = () => {
    return (
      <div className="customBtnIconBox">
        <h5 className="Gray mTop6">{_l('按钮图标')}</h5>
        <ul className="mTop16">
          {ICONS.map(item => {
            return (
              <li
                className={cx('iconLi', { current: item === this.state.icon && !!item })}
                onClick={() => {
                  this.setState({
                    icon: item,
                  });
                }}
                style={{
                  backgroundColor: item === this.state.icon && !!item ? color(this.state.color) : '',
                }}
              >
                {!item ? _l('无') : <Icon icon={item} className="" />}
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  renderDesc = () => {
    return (
      <div className="customBtnIconBox">
        <h5 className="Gray pTop16">{_l('按钮说明')}</h5>
        <div className="mTop10">
          <input
            value={this.state.desc}
            placeholder={_l('请输入按钮说明')}
            // ref={inputEl => {
            //   this.inputEl = inputEl;
            // }}
            onChange={event => {
              this.setState({
                desc: event.target.value,
              });
            }}
            // maxLength="50"
            className={cx('descInput Font14')}
          />
        </div>
      </div>
    );
  };

  renderActionFooter = () => {
    const { worksheetId, appId, currentSheetInfo } = this.props;
    const { btnId, writeControls = [], relationControl = '', relationWorksheetInfo = {} } = this.state;
    return (
      <div className="createActionCon">
        <span
          className={cx('addBtn', { disable: this.state.name === '' })}
          onClick={() => {
            if (this.state.saveLoading) {
              return;
            }
            if (this.state.name === '') {
              // alert(_l('请填写按钮名称'));
              return;
            }
            if (this.state.isErrer) {
              alert(_l('按钮名称重名，请重新修改'));
              return;
            }
            this.setState({
              saveLoading: true,
            });
            const sheetInfo = !relationControl ? currentSheetInfo : relationWorksheetInfo;
            let writeControlsFormat = writeControls.map(o => {
              let control = _.find(sheetInfo.template.controls, item => item.controlId === o.controlId) || {};
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
            let params = {
              btnId: btnId || '',
              name: this.state.name.replace(/(^\s*)|(\s*$)/g, ''),
              worksheetId,
              filters: this.state.filters.map(formatValuesOfCondition), //筛选条件
              confirmMsg: this.state.doubleConfirm.confirmMsg, //确认信息
              sureName: this.state.doubleConfirm.sureName, //确认按钮
              cancelName: this.state.doubleConfirm.cancelName, //取消按钮
              workflowType: this.state.clickType !== 3 ? 1 : this.state.workflowType, // 1:执行 2：不执行
              workflowId: this.state.workflowId || '', //工作流ID
              desc: this.state.desc.trim(),
              appId,
              ..._.pick(this.state, [
                'isAllView',
                'displayViews',
                'color',
                'icon',
                'writeControls', //填写控件 type - 1：只读 2：填写 3：必填
                'addRelationControlId', //新建关联记录ID
                'relationControl', //关联记录ID
                'writeType', //类型 1：填写字段 2：新建关联记录
                'writeObject', //1：本记录 2：关联记录
                'clickType', //1：立即执行 2：二次确认 3：填写
                'showType', //1: 一直 2：满足筛选条件
              ]),
            };
            sheetAjax.saveWorksheetBtn({ ...params, writeControls: writeControlsFormat }).then(data => {
              this.setState({
                saveLoading: false,
              });
              params = {
                ...params,
                filters: this.state.filters,
                btnId: data,
                addRelationControl: this.state.addRelationControlId,
              };
              // 创建按钮(创建时，除“填写指定内容+不执行”外，直接进入编辑流）
              if (!btnId && !(this.state.workflowType === 2 && this.state.clickType === 3)) {
                this.setState(
                  {
                    btnId: data,
                    isEdit: true,
                  },
                  () => {
                    this.props.onChangeEditStatus(true);
                    this.getProcessByTriggerId(workflowId => {
                      params = { ...params, workflowId };
                      this.props.updateCustomButtons(params, !btnId);
                      this.setState({
                        showWorkflowDialog: true,
                      });
                    });
                  },
                );
              } else {
                if (!btnId) {
                  params = { ...params, btnId: data };
                }
                this.props.onClose();
                this.props.updateCustomButtons(params, !btnId);
              }
            });
          }}
        >
          {this.state.saveLoading
            ? !this.state.isEdit
              ? _l('添加按钮...')
              : _l('保存...')
            : !this.state.isEdit
            ? _l('添加按钮')
            : _l('保存')}
        </span>
        <span
          className="cacleBtn"
          onClick={() => {
            this.props.onClose();
          }}
        >
          {_l('取消')}
        </span>
      </div>
    );
  };

  render() {
    const { appId, worksheetId, rowId, projectId, columns, isClickAway } = this.props;
    const { btnId, relationWorksheetInfo } = this.state;
    return (
      <React.Fragment>
        <div style={{ height: document.documentElement.clientHeight - 166, backgroundColor: '#fff' }}>
          <ScrollView className="flex">{this.renderCon()}</ScrollView>
        </div>
        {this.renderActionFooter()}
        {this.state.isShowBtnFilterDialog && (
          <ShowBtnFilterDialog
            projectId={projectId}
            appId={appId}
            columns={columns}
            filters={this.state.filters}
            isShowBtnFilterDialog={this.state.isShowBtnFilterDialog}
            showType={this.state.showType}
            setValue={value => {
              this.setState(
                {
                  filters: value.filters,
                  isShowBtnFilterDialog: value.isShowBtnFilterDialog,
                  showType: value.showType,
                },
                () => {
                  this.formatFilterData();
                },
              );
            }}
          />
        )}
        {this.state.showDoubleConfirmDialog && (
          <DoubleConfirmDialog
            doubleConfirm={this.state.doubleConfirm}
            setValue={value => {
              this.setState({
                doubleConfirm: value.doubleConfirm,
                showDoubleConfirmDialog: value.showDoubleConfirmDialog,
              });
            }}
            showDoubleConfirmDialog={this.state.showDoubleConfirmDialog}
          />
        )}
        {this.state.showAppointDialog && (
          <AppointDialog
            relationWorksheetInfo={relationWorksheetInfo}
            btnId={btnId}
            projectId={projectId}
            showAppointDialog={this.state.showAppointDialog}
            writeObject={this.state.writeObject}
            relationControl={this.state.relationControl}
            updateRelationControl={relationControl => {
              this.setState(
                {
                  relationControl,
                },
                () => {
                  this.getRelationControl(relationControl);
                },
              );
            }}
            writeType={this.state.writeType}
            addRelationControlId={this.state.addRelationControlId}
            writeControls={this.state.writeControls}
            widgetList={this.state.widgetList}
            appId={appId}
            worksheetId={worksheetId}
            rowId={rowId}
            relationControls={this.state.relationControls}
            setValue={value => {
              this.setState({
                showAppointDialog: value.showAppointDialog,
                writeObject: value.writeObject,
                writeType: value.writeType,
                addRelationControlId: value.addRelationControlId,
                writeControls: value.writeControls,
                clickType: value.clickType,
                workflowType: value.workflowType,
              });
            }}
            workflowType={this.state.workflowType}
            clickType={this.state.clickType}
            currentSheetInfo={this.props.currentSheetInfo}
          />
        )}
        {this.state.showWorkflowDialog && (
          <WorkflowDialog
            flowId={this.state.workflowId}
            onBack={value => {
              this.setState({
                showWorkflowDialog: false,
                flowEnabled: value,
              });
            }}
          />
        )}
      </React.Fragment>
    );
  }
}
@withClickAway
class CreateCustomBtn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isEdit: props.isEdit,
    };
  }
  renderTitle = () => {
    return (
      <div className="title Gray">
        <span>{!this.state.isEdit ? _l('添加按钮') : _l('编辑按钮')}</span>
        <Icon icon="close" className="Gray_9d Font20 pointer" onClick={this.props.onClose} />
      </div>
    );
  };
  render() {
    return (
      <div className="createCustomBtnCon">
        {!this.props.isClickAway && <div className="bgCustomBtnCon"></div>}
        {this.renderTitle()}
        <CreateCustomBtnCon
          {...this.props}
          onChangeEditStatus={isEdit => {
            this.setState({
              isEdit,
            });
          }}
        />
      </div>
    );
  }
}

export default CreateCustomBtn;
