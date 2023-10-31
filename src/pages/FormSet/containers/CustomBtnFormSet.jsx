import React, { useState, useEffect } from 'react';
import * as actions from '../redux/actions/action';
import { connect } from 'react-redux';
import { Icon } from 'ming-ui';
import { bindActionCreators } from 'redux';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import { CreateCustomBtn } from 'worksheet/common';
import styled from 'styled-components';
import './print.less';
import sheetAjax from 'src/api/worksheet';
import { redefineComplexControl } from 'worksheet/common/WorkSheetFilter/util';

import { refreshBtnData } from 'src/pages/FormSet/util';
import _ from 'lodash';
import { getFeatureStatus, buriedUpgradeVersionDialog } from 'src/util';
import { VersionProductType } from 'src/util/enum';
import TrashDialog from '../components/Trash';
import { useSetState } from 'react-use';
import BtnCard from '../components/BtnCard';

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
  .line {
    border-top: 1px solid #e0e0e0;
    width: 100%;
    margin-top: 8px;
  }
`;
function CustomBtnFormSet(props) {
  const { worksheetId, worksheetControls, worksheetInfo } = props;
  const [{ showCreateCustomBtn, btnId, showTrash, isEdit, btnList }, setState] = useSetState({
    showCreateCustomBtn: false,
    btnId: '',
    showTrash: false,
    isEdit: false,
    btnList: [],
  });
  useEffect(() => {
    if (!worksheetId) return;
    getSheetBtns();
  }, [worksheetId]);
  let ajaxFn = null;
  const getSheetBtns = () => {
    if (ajaxFn) {
      ajaxFn.abort();
    }
    ajaxFn = sheetAjax.getWorksheetBtns({
      worksheetId,
    });
    ajaxFn.then(btnList => {
      setState({ btnList });
    });
  };

  const updateCustomButtons = (btns, isAdd) => {
    setState({ btnList: refreshBtnData(_.cloneDeep(btnList), btns, isAdd) });
  };

  const isFree =
    _.get(
      _.find(md.global.Account.projects, item => item.projectId === worksheetInfo.projectId),
      'licenseType',
    ) === 0;
  const featureType = getFeatureStatus(worksheetInfo.projectId, VersionProductType.recycle);

  const renderBtns = list => {
    if (list.length <= 0) {
      return (
        <p className="noData pTop40">
          <Icon icon="custom_actions" className="icon" />
          <br />
          {_l('暂无自定义动作')}
        </p>
      );
    }
    return (
      <div className="printTemplatesList">
        {list.map(it => {
          return (
            <BtnCard
              appId={worksheetInfo.appId}
              views={worksheetInfo.views}
              getSheetBtns={getSheetBtns}
              key={it.btnId}
              it={it}
              worksheetId={worksheetId}
              btnList={btnList}
              onChange={state => {
                setState({ ...state });
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <React.Fragment>
      <Con className="printBox Relative">
        <div className="printBoxList">
          <div className="">
            <div className="topBoxText flexRow alignItemsCenter">
              <div className="textCon flex">
                <h5 className="formName Gray Font17 Bold">{_l('自定义动作')}</h5>
                <p className="desc mTop8">
                  <span className="Font13 Gray_9e">{_l('自定义在查看记录详情时或批量选择记录时可执行的操作')}</span>
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
                    setState({
                      showTrash: true,
                    });
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
                  setState({
                    btnId: '',
                    showCreateCustomBtn: true,
                    isEdit: false,
                  });
                }}
              >
                <Icon icon="plus" className="mRight8" />
                {_l('添加按钮')}
              </span>
            </div>
            {renderBtns(btnList.filter(o => !o.isBatch))}
            {btnList.filter(o => o.isBatch).length > 0 && (
              <React.Fragment>
                <p className="desc mTop8">
                  <div className="Font13 Gray_75 Bold mTop25">{_l('批量数据源')}</div>
                  <div className="line"></div>
                </p>
                {renderBtns(btnList.filter(o => o.isBatch))}
              </React.Fragment>
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
              onClickAway={() =>
                setState({
                  showCreateCustomBtn: false,
                })
              }
              isEdit={isEdit}
              onClose={() => {
                setState({
                  showCreateCustomBtn: false,
                });
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
                getSheetBtns();
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
            setState({
              showTrash: false,
            });
          }}
          onChange={() => {
            getSheetBtns();
          }}
        />
      )}
    </React.Fragment>
  );
}
const mapStateToProps = state => state.formSet;
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(CustomBtnFormSet);
