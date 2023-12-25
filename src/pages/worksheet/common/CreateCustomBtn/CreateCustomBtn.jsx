import React from 'react';
import './CreateCustomBtn.less';
import withClickAway from 'ming-ui/decorators/withClickAway';
import cx from 'classnames';
import { Icon, Checkbox, Tooltip, RadioGroup } from 'ming-ui';
import AppointDialog from './components/AppointDialog';
import ShowBtnFilterDialog from './components/ShowBtnFilterDialog';
import sheetAjax from 'src/api/worksheet';
import process from 'src/pages/workflow/api/process';
import { FilterItemTexts } from 'src/pages/widgetConfig/widgetSetting/components/FilterData';
import WorkflowDialog from 'src/pages/workflow/components/WorkflowDialog';
import DoubleConfirmDialog from './components/DoubleConfirmDialog';
import { filterData } from 'src/pages/FormSet/components/columnRules/config.js';
import { formatValuesOfCondition } from '../../common/WorkSheetFilter/util';
import { COLORS, ICONS } from './config';
import { SYS } from 'src/pages/widgetConfig/config/widget';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import { formatControlsData } from 'src/pages/widgetConfig/util/data';
import _ from 'lodash';
import Trigger from 'rc-trigger';

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
      enableConfirm: false, //启用二次确认
      verifyPwd: false, //校验密码
      advancedSetting: {}, //高级配置
      cloneInfo: {}, //缓存上次保存的数据，用来显示
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
    const { btnDataInfo = {}, viewId, isListOption, isEdit } = props;
    let {
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
      enableConfirm,
      verifyPwd,
      advancedSetting = {},
      isBatch,
    } = btnDataInfo;
    //    视图 创建按钮
    if (!isEdit && viewId && props.from !== 'formset') {
      let d = JSON.stringify([viewId]);
      advancedSetting = isListOption ? { listviews: d } : { detailviews: d };
    }
    advancedSetting = {
      ...advancedSetting,
      remarkrequired: isEdit ? advancedSetting.remarkrequired : '1',
      remarkname: advancedSetting.remarkname || _l('操作原因'),
    };
    let doubleConfirm = {
      confirmMsg: btnDataInfo.confirmMsg || _l('你确认执行此操作吗？'),
      cancelName: btnDataInfo.cancelName || _l('取消'),
      sureName: btnDataInfo.sureName || _l('确认'),
    };

    this.setState(
      {
        name,
        showType,
        clickType,
        workflowType,
        filters,
        enableConfirm,
        verifyPwd,
        advancedSetting,
        doubleConfirm,
        writeObject,
        relationControl,
        writeType,
        addRelationControlId: addRelationControl, //get 获取=>addRelationControl
        writeControls,
        widgetList: (props.worksheetControls || []).filter(item => !SYS.includes(item.controlId)), //排除系统字段
        isEdit: props.isEdit,
        btnId: props.btnId,
        color: isEdit ? btnDataInfo.color || COLORS[1] : COLORS[0], //老数据未设置颜色还是走2196f3 新创建的，默认透明色
        icon: btnDataInfo.icon || ICONS[0],
        desc,
        isAllView: isAllView ? isAllView : !props.btnId && props.from === 'formset' ? 1 : 0,
        cloneInfo: {
          advancedSetting,
          doubleConfirm,
        },
        isBatch,
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

  getProcessByTriggerId = (callback, getProcess) => {
    const { worksheetId } = this.props;
    const { btnId, clickType, workflowType } = this.state;
    if (btnId && worksheetId && (clickType === 1 || workflowType === 1 || getProcess)) {
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
    const { filters } = this.state;
    const { columns } = this.props;
    this.setState({
      filterItemTexts: filterData(columns, filters),
    });
  };
  renderFlowText = () => {
    const { workflowType, isBatch, isEdit } = this.state;
    const { isListOption } = this.props;
    if (workflowType === 2) {
      return '';
    }
    if (isEdit && !!this.state.flowName) {
      return (
        <div className="filterTextCon alignItemsCenter">
          <div className="txtFilter">
            <div className="Bold">
              {this.state.flowName}
              {!this.state.flowEnabled && <span className="Font13 mLeft5 redCon">{_l('未启用')}</span>}
            </div>
            <div className="flexRow Font13 mTop6 Bold">
              <span className="Gray_75">{_l('数据源')}:</span>
              <span className="mLeft3">{isBatch ? _l('多条记录') : _l('单条记录')}</span>
            </div>
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
      );
    }
    return (
      <div
        className={`filterTextCon createCon ${
          !_.isUndefined(isListOption) && !isListOption && !isEdit ? 'pTop10 pBottom10' : 'pTop16 pBottom20'
        }`}
      >
        <div className="txtFilter Gray Bold Font13">{_l('添加按钮后自动创建流程')}</div>
        {!(!_.isUndefined(isListOption) && !isListOption && !isEdit) && ( //记录详情进入，且是创建，则不显示数据源类型，默认单条记录
          <React.Fragment>
            <div className="mTop14">{_l('数据源')}</div>
            <RadioGroup
              data={[
                {
                  value: 0,
                  text: _l('单条记录'),
                },
                {
                  value: 1,
                  text: _l('多条记录'),
                },
              ]}
              size="small"
              onChange={value => {
                this.setState({
                  isBatch: value === 1,
                });
              }}
              checkedValue={isBatch ? 1 : 0}
            />
          </React.Fragment>
        )}
      </div>
    );
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
      filters = [],
      enableConfirm,
      verifyPwd,
      workflowId,
      btnId,
    } = this.state;
    const dataControls = relationControl !== '' ? relationControls : widgetList;
    const isFillOutNull = writeObject !== 1 && !relationControl && writeType !== 1 && !addRelationControlId;

    return (
      <div className="createBtnBox mTop25">
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
        <div className="flexRow">
          <div className="flex"> {this.renderIcons()}</div>
          <div className="mLeft12"> {this.renderColors()}</div>
        </div>
        {this.renderDesc()}
        <div className="line"></div>
        <h5 className="Gray">{_l('动作')}</h5>
        <RadioGroup
          data={[
            {
              value: 1,
              text: _l('执行工作流'),
            },
            {
              value: 3,
              text: _l('填写表单字段'),
            },
          ]}
          size="small"
          onChange={value => {
            // 'clickType', //1：立即执行  3：填写 'workflowType', // 1:执行 2：不执行
            if (value === 1) {
              if (!workflowId && btnId) {
                this.getProcessByTriggerId(() => {
                  this.setState({
                    workflowType: 1,
                    clickType: 1,
                  });
                }, true);
              } else {
                this.setState({
                  workflowType: 1,
                  clickType: 1,
                });
              }
            } else {
              this.setState(
                {
                  clickType: 3,
                },
                () => {
                  if (writeObject === '' || writeType === '' || isFillOutNull) {
                    this.setState({
                      showAppointDialog: true,
                    });
                  }
                },
              );
            }
          }}
          checkedValue={clickType}
        />
        {clickType === 1 && this.renderFlowText()}
        {clickType === 3 && writeObject !== '' && writeType !== '' && !isFillOutNull && (
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
                          {controlName || (writeControlsData.type === 22 ? _l('分割线') : _l('备注'))}
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
        <h5 className="Gray mTop32">{clickType === 1 ? _l('点击按钮时') : _l('提交时')}</h5>
        <Checkbox
          className="checkBox InlineBlock"
          text={_l('需要二次确认 / 填写备注')}
          checked={enableConfirm || clickType === 2}
          onClick={() => {
            this.setState({
              enableConfirm: !(enableConfirm || clickType === 2),
              showDoubleConfirmDialog: !(enableConfirm || clickType === 2),
            });
          }}
        />
        <br />
        {(enableConfirm || clickType === 2) && (
          <div className="filterTextCon">
            <div className="txtFilter">
              <p>
                <span className="titleTxt Gray">{_l('提示文字')}</span>
                <span className="txt Gray breakAll">{_.get(this.state, 'doubleConfirm.confirmMsg')}</span>
              </p>
              {!!(_.get(this.state.advancedSetting, 'confirmcontent') || '').trim() && (
                <p className="mTop5">
                  <span className="titleTxt Gray">{_l('详细内容')}</span>
                  <span className="txt Gray breakAll">{this.state.advancedSetting.confirmcontent}</span>
                </p>
              )}
              {_.get(this.state.advancedSetting, 'enableremark') === '1' && (
                <p className="mTop5">
                  <span className="titleTxt Gray">{_l('填写备注')}</span>
                  <span className="txt Gray breakAll">
                    {_.get(this.state.advancedSetting, 'remarkrequired') === '1' ? _l('必填') : _l('启用')}
                  </span>
                </p>
              )}
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
        <Checkbox
          className="checkBox InlineBlock"
          text={
            <span>
              {_l('登录密码验证')}
              <Tooltip
                popupPlacement="bottom"
                text={<span>{_l('启用后，用户需要输入登录密码通过校验后才可执行自定义按钮')}</span>}
              >
                <Icon icon="help_center" className="Gray_9e mLeft5 Font16 TxtMiddle" />
              </Tooltip>
            </span>
          }
          checked={verifyPwd}
          onClick={() => {
            this.setState({
              verifyPwd: !verifyPwd,
            });
          }}
        />
        {clickType === 3 && (
          <React.Fragment>
            <h5 className="Gray mTop32">{_l('提交后')}</h5>
            <Checkbox
              className="checkBox InlineBlock"
              text={_l('继续执行工作流')}
              checked={workflowType === 1}
              onClick={() => {
                if (!workflowId && workflowType !== 1 && btnId) {
                  this.getProcessByTriggerId(() => {
                    this.setState({
                      workflowType: workflowType === 1 ? 2 : 1,
                    });
                  }, true);
                } else {
                  this.setState({
                    workflowType: workflowType === 1 ? 2 : 1,
                  });
                }
              }}
            />
            {this.renderFlowText()}
          </React.Fragment>
        )}
        <div className="line"></div>
        <h5 className="Gray">{_l('启用按钮')}</h5>
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
      </div>
    );
  };

  renderColors = () => {
    const { color = 'transparent' } = this.state;
    return (
      <div className="mTop32 customBtnColorBox">
        <h5 className="Gray Bold">{_l('颜色')}</h5>
        <Trigger
          action={['click']}
          popupAlign={{
            points: ['tr', 'br'],
          }}
          popup={
            <ul className="buttonTrigger">
              {COLORS.map(item => {
                return (
                  <li
                    className={cx('buttonSetLi colorLi Hand', { current: color === item })}
                    style={{ backgroundColor: item, borderColor: item === 'transparent' ? '#E0E0E0' : item }}
                    onClick={() => {
                      this.setState({
                        color: item,
                      });
                    }}
                  >
                    {color === item && <Icon icon="ok" className={cx('check', { Gray: color === 'transparent' })} />}
                  </li>
                );
              })}
            </ul>
          }
        >
          <div className="conBox flexRow alignItemsCenter Hand mTop10">
            <div
              className={cx('colorCon flex TxtCenter TxtMiddle Font18', { Gray: color === 'transparent' })}
              style={{ backgroundColor: color }}
            >
              A
            </div>
            <div className="op">
              <Icon type="expand_more" className="Gray_9d Font18 mLeft8 " />
            </div>
          </div>
        </Trigger>
      </div>
    );
  };

  renderIcons = () => {
    const { icon, color = 'transparent' } = this.state;
    return (
      <div className="mTop32 customBtnIconBox">
        <h5 className="Gray Bold">{_l('图标')}</h5>
        <Trigger
          action={['click']}
          popupAlign={{
            points: ['tl', 'bl'],
          }}
          popup={
            <ul className="buttonTrigger">
              {ICONS.map(item => {
                return (
                  <li
                    className={cx('buttonSetLi iconLi Hand', {
                      current: item === icon && !!item,
                      Font20: !item,
                    })}
                    onClick={() => {
                      this.setState({
                        icon: item,
                      });
                    }}
                  >
                    {!item ? _l('无') : <Icon icon={item} />}
                  </li>
                );
              })}
            </ul>
          }
        >
          <div className="conBox flexRow alignItemsCenter Hand mTop10">
            <div className="flex flexRow alignItemsCenter mLeft5">
              <Icon
                type={icon ? icon : 'block'}
                className={cx('Font18', { Gray_d: !icon, Gray_9d: !!icon, Font20: !icon })}
              />
            </div>
            <div className="op">
              <Icon type="expand_more" className="Gray_9d Font18 mLeft8" />
            </div>
          </div>
        </Trigger>
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
            onChange={event => {
              this.setState({
                desc: event.target.value,
              });
            }}
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
              alert(_l('按钮名称重名，请重新修改'), 3);
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
              confirmMsg: _.get(this.state, 'doubleConfirm.confirmMsg'), //确认信息
              sureName: _.get(this.state, 'doubleConfirm.sureName'), //确认按钮
              cancelName: _.get(this.state, 'doubleConfirm.cancelName'), //取消按钮
              workflowId: this.state.workflowId || '', //工作流ID
              desc: this.state.desc.trim(),
              appId,
              ..._.pick(this.state, [
                'isAllView',
                'color',
                'icon',
                'writeControls', //填写控件 type - 1：只读 2：填写 3：必填
                'addRelationControlId', //新建关联记录ID
                'relationControl', //关联记录ID
                'writeType', //类型 1：填写字段 2：新建关联记录
                'writeObject', //1：本记录 2：关联记录
                'clickType', //1：立即执行 2：二次确认 3：填写
                'showType', //1: 一直 2：满足筛选条件
                'advancedSetting', //高级配置
                'enableConfirm', //启用二次确认
                'verifyPwd', //校验密码
                'workflowType', // 1:执行 2：不执行
                'isBatch', //是否多条数据源
              ]),
            };
            sheetAjax.saveWorksheetBtn({ ...params, writeControls: writeControlsFormat }).then(data => {
              this.setState({
                saveLoading: false,
                cloneInfo: { advancedSetting: this.state.advancedSetting, doubleConfirm: this.state.doubleConfirm },
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
                if (
                  (this.state.workflowType === 1 || this.state.clickType === 1) &&
                  this.state.isEdit &&
                  !this.state.flowName //编辑 且 需要创建工作流
                ) {
                  this.getProcessByTriggerId(workflowId => {
                    params = { ...params, workflowId };
                    this.props.updateCustomButtons(params, !btnId);
                    this.setState({
                      showWorkflowDialog: true,
                    });
                  });
                } else {
                  this.props.updateCustomButtons(params, !btnId);
                  this.props.onClose();
                }
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
    const { appId, worksheetId, rowId, projectId, columns, sheetSwitchPermit, isListOption } = this.props;
    const {
      btnId,
      relationWorksheetInfo,
      doubleConfirm = {},
      showDoubleConfirmDialog,
      advancedSetting,
      cloneInfo,
      isEdit,
    } = this.state;
    return (
      <React.Fragment>
        <div
          className="flex"
          style={{
            overflow: 'auto',
            backgroundColor: '#fff',
          }}
        >
          {this.renderCon()}
        </div>
        {this.renderActionFooter()}
        {this.state.isShowBtnFilterDialog && (
          <ShowBtnFilterDialog
            sheetSwitchPermit={sheetSwitchPermit}
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
        {showDoubleConfirmDialog && (
          <DoubleConfirmDialog
            visible={showDoubleConfirmDialog}
            cloneInfo={cloneInfo}
            info={{ advancedSetting, doubleConfirm }}
            onChange={data => {
              this.setState({
                showDoubleConfirmDialog: false,
                ...data,
              });
            }}
            onCancel={() => {
              this.setState({
                showDoubleConfirmDialog: false,
              });
            }}
          />
        )}
        {this.state.showAppointDialog && (
          <AppointDialog
            cannotRelate={isListOption && !isEdit} //从视图配置批量创建，不能选择关联
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
        <div className="flexColumn h100">
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
      </div>
    );
  }
}

export default CreateCustomBtn;
