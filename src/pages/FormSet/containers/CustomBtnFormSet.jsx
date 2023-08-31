import React, { useState, useEffect } from 'react';
import * as actions from '../redux/actions/action';
import { connect } from 'react-redux';
import { Icon, Dialog } from 'ming-ui';
import { bindActionCreators } from 'redux';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import { CreateCustomBtn } from 'worksheet/common';
import styled from 'styled-components';
import './print.less';
import sheetAjax from 'src/api/worksheet';
import MoreOption from '../components/MoreOption';
import { redefineComplexControl, formatValuesOfOriginConditions } from 'worksheet/common/WorkSheetFilter/util';
import cx from 'classnames';
import { RangeDrop } from 'src/pages/FormSet/components/RangeDrop';
import { refreshBtnData } from 'src/pages/FormSet/util';
import _ from 'lodash';
import { getFeatureStatus, buriedUpgradeVersionDialog } from 'src/util';
import { VersionProductType } from 'src/util/enum';
import TrashDialog from '../components/Trash';
const confirm = Dialog.confirm;

const Con = styled.div`
  width: 100%;
  height: 100%;
  background: #fff;
  position: relative !important;
  .createCustomBtnCon {
    z-index: 1;
  }
  .topBox {
    position: relative;
    background: none !important;
    .bg {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 3px 3px 0px 0px;
      border-top: 1px solid #000;
      border-left: 1px solid #000;
      border-right: 1px solid #000;
    }
    .moreActive {
      z-index: 1;
      color: #7d7d7d !important;
    }
    span {
      // z-index: 1;
      position: relative;
      color: #333 !important;
    }
    input {
      z-index: 1;
      position: relative;
    }
  }
  .trash {
    color: #757575;
    .trashIcon {
      color: #9e9e9e;
    }
    .freeIcon {
      color: #f1b73f;
    }
    &:hover {
      color: #2196f3;
      .trashIcon {
        color: #2196f3;
      }
    }
  }
`;
function CustomBtnFormSet(props) {
  const input = React.createRef();
  const { worksheetId, worksheetControls, worksheetInfo } = props;
  const [showCreateCustomBtn, setShowCreateCustomBtn] = useState(false);
  const [btnId, setBtnId] = useState();
  const [showTrash, setShowTrash] = useState(false);
  const [isRename, setIsRename] = useState(false);
  const [templateId, setTemplateId] = useState('');
  const [btnList, setBtnList] = useState([]);
  const [isEdit, setIsEdit] = useState();
  const [showMoreOption, setShowMoreOption] = useState();
  const [showDropOption, setShowDropOption] = useState();
  useEffect(() => {
    if (!worksheetId) return;
    getdata();
  }, [worksheetId]);
  let ajaxFn = null;
  const getdata = () => {
    if (ajaxFn) {
      ajaxFn.abort();
    }
    ajaxFn = sheetAjax.getWorksheetBtns({
      worksheetId,
    });
    ajaxFn.then(data => {
      setBtnList(data);
    });
  };

  const updateCustomButtons = (btns, isAdd) => {
    setBtnList(refreshBtnData(_.cloneDeep(btnList), btns, isAdd));
  };

  useEffect(() => {
    if (isRename) {
      input.current.focus();
    }
  }, [isRename]);
  const optionWorksheetBtn = ({ btnId, appId, viewId, optionType, callback }) => {
    sheetAjax
      .optionWorksheetBtn({
        appId,
        viewId,
        btnId,
        worksheetId,
        optionType: optionType, // * @param { integer } args.optionType 操作类型 1：视图添加按钮 2：视图删除按钮 9：删除按钮
      })
      .then(data => {
        if (data) {
          alert(_l('删除成功'));
          getdata();
        } else {
          alert(_l('删除失败'), 2);
        }
      });
  };

  const editBtn = obj => {
    sheetAjax
      .saveWorksheetBtn({
        btnId: btnId,
        worksheetId,
        ...obj,
      })
      .then(res => {
        console.log(res);
      });
  };

  const handleCopy = btnId => {
    sheetAjax
      .copyWorksheetBtn({
        appId: worksheetInfo.appId,
        viewId: '',
        btnId,
        worksheetId,
      })
      .then(data => {
        if (data) {
          getdata();
          alert(_l('复制成功'));
        } else {
          alert(_l('复制失败'), 2);
        }
      });
  };

  const isFree =
    _.get(
      _.find(md.global.Account.projects, item => item.projectId === worksheetInfo.projectId),
      'licenseType',
    ) === 0;
  const featureType = getFeatureStatus(worksheetInfo.projectId, VersionProductType.recycle);

  return (
    <React.Fragment>
      <Con className="printBox Relative">
        <div className="printBoxList">
          <div className="">
            <div className="topBoxText flexRow alignItemsCenter">
              <div className="textCon flex">
                <h5 className="formName Gray Font17 Bold">{_l('自定义动作')}</h5>
                <p className="desc mTop8">
                  <span className="Font13 Gray_9e">{_l('自定义在查看记录时可执行的操作')}</span>
                </p>
              </div>
              {featureType && (
                <div
                  className="trash mRight20 ThemeHoverColor3 flexRow"
                  onClick={() => {
                    if (isFree) {
                      buriedUpgradeVersionDialog(worksheetInfo.projectId, VersionProductType.recycle);
                      return;
                    }
                    setShowTrash(true);
                  }}
                >
                  <Icon icon="knowledge-recycle" className="trashIcon Hand Font18" />
                  <div className="recycle InlineBlock Hand mLeft5">{_l('回收站')}</div>
                  {isFree && <Icon icon="auto_awesome" className="freeIcon mLeft8" />}
                </div>
              )}
              <span
                className="add Relative bold"
                onClick={() => {
                  setBtnId('');
                  setShowCreateCustomBtn(true);
                  setIsEdit(false);
                }}
              >
                <Icon icon="plus" className="mRight8" />
                {_l('添加按钮')}
              </span>
            </div>
            {btnList.length <= 0 ? (
              <p className="noData">
                <Icon icon="custom_actions" className="icon" />
                <br />
                {_l('暂无自定义动作')}
              </p>
            ) : (
              <div className="printTemplatesList">
                {btnList.map(it => {
                  return (
                    <div className={cx('templates')} key={it.btnId}>
                      <div className={cx('topBox')}>
                        <div className="bg" style={{ background: it.color ? it.color : '#2196f3', opacity: 0.1 }} />
                        <Icon
                          icon={it.icon || 'custom_actions'}
                          style={{ color: it.color ? it.color : '#2196f3' }}
                          className="iconTitle Font16"
                        />
                        {isRename && templateId === it.btnId ? (
                          <input
                            type="text"
                            ref={input}
                            defaultValue={it.name}
                            onBlur={e => {
                              setTemplateId('');
                              setIsRename(false);
                              if (!_.trim(e.target.value)) {
                                alert(_l('请输入模板名称'), 3);
                                input.current.focus();
                                return;
                              }
                              let data = btnList.map(os => {
                                if (os.btnId === it.btnId) {
                                  return {
                                    ...os,
                                    name: _.trim(e.target.value),
                                  };
                                } else {
                                  return os;
                                }
                              });
                              setBtnList(data);
                              editBtn({
                                name: _.trim(e.target.value),
                                EditAttrs: ['name'],
                                btnId: it.btnId,
                              });
                            }}
                          />
                        ) : (
                          <span className="Bold"> {it.name}</span>
                        )}
                        <Icon
                          icon="task-point-more"
                          className="moreActive Hand Font18"
                          onClick={() => {
                            setShowMoreOption(true);
                            setTemplateId(it.btnId);
                          }}
                        />
                        {showMoreOption && templateId === it.btnId && (
                          <MoreOption
                            showCopy
                            onCopy={() => {
                              return confirm({
                                title: <span className="WordBreak Block">{_l('复制自定义动作“%0”', it.name)}</span>,
                                description: _l('将复制目标自定义动作的所有节点和配置'),
                                onOk: () => {
                                  handleCopy(it.btnId);
                                },
                              });
                            }}
                            delTxt={_l('删除动作')}
                            description={_l('动作将被删除，请确认执行此操作')}
                            showMoreOption={showMoreOption}
                            onClickAwayExceptions={[]}
                            onClickAway={() => {
                              setShowMoreOption(false);
                            }}
                            setFn={data => {
                              setIsRename(true);
                              setShowMoreOption(false);
                            }}
                            deleteFn={data => {
                              optionWorksheetBtn({
                                btnId: it.btnId,
                                appId: worksheetInfo.appId,
                                viewId: '', //* @param { string } args.viewId 视图ID
                                optionType: 9, // * @param { integer } args.optionType 操作类型 1：视图添加按钮 2：视图删除按钮 9：删除按钮
                                callback: () => {},
                              });
                              // getdata();
                            }}
                          />
                        )}
                      </div>
                      <div className="con">
                        <div className="view">
                          {it.isAllView === 1 ? (
                            <span className="viewText Gray_9e">{_l('所有记录')}</span>
                          ) : (
                            <span
                              className="viewText Gray_9e"
                              style={{ WebkitBoxOrient: 'vertical' }}
                              title={
                                it.displayViews.length > 0 && it.displayViews[0] !== ''
                                  ? it.displayViews
                                      .map((item, i) => {
                                        let view = (worksheetInfo.views || []).find(o => o.viewId === item) || {};
                                        return view.name || _l('该视图已删除');
                                      })
                                      .join(',')
                                  : _l('未分配视图')
                              }
                            >
                              {it.displayViews.length > 0 && it.displayViews[0] !== '' ? (
                                <React.Fragment>
                                  {_l('%0视图', it.displayViews.length)}：
                                  {it.displayViews
                                    .map((item, i) => {
                                      let view = (worksheetInfo.views || []).find(o => o.viewId === item) || {};
                                      return view.name || _l('该视图已删除');
                                    })
                                    .join(',')}
                                </React.Fragment>
                              ) : (
                                _l('未分配视图')
                              )}
                            </span>
                          )}
                        </div>
                        <div className="activeCon Relative">
                          <span
                            className="Hand"
                            onClick={() => {
                              setTemplateId(it.btnId);
                              setShowDropOption(true);
                            }}
                          >
                            {_l('使用范围')}
                          </span>
                          {showDropOption && templateId === it.btnId && (
                            <RangeDrop
                              printData={{
                                range: it.isAllView === 1 ? 1 : 3, //?? 是否应用到所有视图 1:所有视图 3:指定视图
                                views: it.displayViews
                                  .filter(o => !!o)
                                  .map(o => {
                                    let d = (worksheetInfo.views || []).find(it => it.viewId === o);
                                    if (!!d && !!o) {
                                      return {
                                        viewId: o,
                                        viewName: d.name,
                                      };
                                    }
                                  })
                                  .filter(o => !!o),
                              }}
                              views={worksheetInfo.views}
                              onClickAwayExceptions={[]}
                              onClickAway={() => {
                                setShowDropOption(false);
                              }}
                              onClose={() => {
                                setShowDropOption(false);
                              }}
                              setData={data => {
                                const { printData = {} } = data;
                                const isAllView = printData.range === 3 ? 0 : 1;
                                const views =
                                  isAllView === 1
                                    ? []
                                    : (printData.views || []).map(o => {
                                        return o.viewId || '';
                                      }) || [];
                                editBtn({
                                  displayViews: views,
                                  isAllView,
                                  EditAttrs: ['isAllView', 'displayViews'],
                                  btnId: it.btnId,
                                });
                                let list = btnList.map(os => {
                                  if (os.btnId === it.btnId) {
                                    return {
                                      ...os,
                                      displayViews: views,
                                      isAllView,
                                    };
                                  } else {
                                    return os;
                                  }
                                });
                                setBtnList(list);
                              }}
                            />
                          )}
                          <span
                            className="Hand mLeft24"
                            onClick={() => {
                              setBtnId(it.btnId);
                              setShowCreateCustomBtn(true);
                              setIsEdit(true);
                            }}
                          >
                            {_l('编辑')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <CSSTransitionGroup
          transitionName="ViewConfigCreateCustomBtn"
          transitionEnterTimeout={500}
          transitionLeaveTimeout={300}
        >
          {showCreateCustomBtn && (
            <CreateCustomBtn
              isClickAway={true}
              from="formset"
              onClickAwayExceptions={[
                '.ant-modal-root',
                '.ChooseWidgetDialogWrap',
                '.showBtnFilterDialog',
                '.doubleConfirmDialog',
                '.appointDialog',
                '.chooseWidgetDialog',
                '.rc-trigger-popup',
                '.fullScreenCurtain',
                '.errerDialogForAppoint',
                '.mobileDepartmentPickerDialog',
                '#dialogBoxSelectUser_container',
                '.selectUserFromAppDialog',
                '.selectUserBox',
                '.dropdownTrigger',
                '.worksheetFilterColumnOptionList',
                '.PositionContainer-wrapper',
                '.mui-dialog-container',
                '.mdAlertDialog',
                '.ant-cascader-menus',
                '.ant-tree-select-dropdown',
                '.ant-tooltip',
                '.CodeMirror-hints',
                '.ck',
                '.ant-picker-dropdown',
                '.Tooltip',
              ]}
              onClickAway={() => setShowCreateCustomBtn(false)}
              isEdit={isEdit}
              onClose={() => {
                setShowCreateCustomBtn(false);
              }}
              columns={worksheetControls
                .filter(item => {
                  return item.viewDisplay || !('viewDisplay' in item);
                })
                .map(control => redefineComplexControl(control))}
              btnId={btnId}
              btnList={btnList}
              btnDataInfo={btnId ? _.find(btnList, item => item.btnId === btnId) : []}
              projectId={worksheetInfo.projectId}
              worksheetControls={worksheetControls}
              currentSheetInfo={{ ...worksheetInfo, template: { controls: worksheetControls } }}
              viewId={''}
              appId={worksheetInfo.appId}
              worksheetId={worksheetId}
              sheetSwitchPermit={worksheetInfo.switches}
              workflowId={''}
              refreshFn={(worksheetId, appId, viewId, rowId) => {
                getdata();
              }}
              updateCustomButtons={updateCustomButtons}
            />
          )}
        </CSSTransitionGroup>
      </Con>
      {showTrash && (
        <TrashDialog
          appId={worksheetInfo.appId}
          worksheetId={worksheetId}
          views={worksheetInfo.views || []}
          onCancel={() => {
            setShowTrash(false);
          }}
          onChange={() => {
            getdata();
          }}
        />
      )}
    </React.Fragment>
  );
}
const mapStateToProps = state => state.formSet;
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(CustomBtnFormSet);
