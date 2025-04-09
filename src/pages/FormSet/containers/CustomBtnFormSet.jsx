import React, { useEffect } from 'react';
import cx from 'classnames';
import { Icon, UpgradeIcon } from 'ming-ui';
import { Drawer } from 'antd';
import { CreateCustomBtn } from 'worksheet/common';
import styled from 'styled-components';
import './print.less';
import sheetAjax from 'src/api/worksheet';
import { redefineComplexControl } from 'worksheet/common/WorkSheetFilter/util';
import { refreshBtnData } from 'src/pages/FormSet/util';
import _ from 'lodash';
import { getFeatureStatus } from 'src/util';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { VersionProductType } from 'src/util/enum';
import TrashDialog from '../components/Trash';
import { useSetState } from 'react-use';
import BtnTd from '../components/BtnTd';

const Con = styled.div`
  width: 100%;
  height: 100%;
  background: #fff;
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
      position: relative;
      color: #151515 !important;
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

const ArrowUp = styled.span`
  border-width: 5px;
  border-style: solid;
  border-color: transparent transparent #9e9e9e transparent;
  cursor: pointer;
  &:hover,
  &.active {
    border-color: transparent transparent #2196f3 transparent;
  }
`;

const ArrowDown = styled.span`
  border-width: 5px;
  border-style: solid;
  border-color: #9e9e9e transparent transparent transparent;
  cursor: pointer;
  margin-top: 2px;
  &:hover,
  &.active {
    border-color: #2196f3 transparent transparent transparent;
  }
`;

function CustomBtnFormSet(props) {
  const { worksheetId, worksheetControls, worksheetInfo } = props;
  const [{ showCreateCustomBtn, btnId, showTrash, isEdit, btnList, sortDirection }, setState] = useSetState({
    showCreateCustomBtn: false,
    btnId: '',
    showTrash: false,
    isEdit: false,
    btnList: [],
    sortDirection: '',
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
    let singleBtns = list.filter(o => !o.isBatch);
    let batchBtns = list.filter(o => o.isBatch);

    if (sortDirection !== '') {
      singleBtns = singleBtns.sort((a, b) => {
        return sortDirection === 'ASC'
          ? a.name.charCodeAt(0) - b.name.charCodeAt(0)
          : b.name.charCodeAt(0) - a.name.charCodeAt(0);
      });
      batchBtns = batchBtns.sort((a, b) => {
        return sortDirection === 'ASC'
          ? a.name.charCodeAt(0) - b.name.charCodeAt(0)
          : b.name.charCodeAt(0) - a.name.charCodeAt(0);
      });
    }

    return (
      <div className="printTemplatesList flex overflowHidden flexColumn">
        <div className="printTemplatesList-header">
          <div className="name flex mRight20 valignWrapper">
            <div className="flex">{_l('名称')}</div>
            <div className="flexColumn">
              <ArrowUp
                className={cx({ active: sortDirection === 'ASC' })}
                onClick={() => setState({ sortDirection: 'ASC' })}
              />
              <ArrowDown
                className={cx({ active: sortDirection === 'DESC' })}
                onClick={() => setState({ sortDirection: 'DESC' })}
              />
            </div>
          </div>
          <div className="views flex mRight20">{_l('使用范围')}</div>
          <div className="action mRight8 w120px">{_l('操作')}</div>
          <div className="more w80px"></div>
        </div>
        <div className="printTemplatesList-box flex">
          {singleBtns.map(it => {
            return (
              <BtnTd
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
          {!!batchBtns.length && <p className="Gray_9e Font15 mTop12 pLeft11">{_l('批量数据源')}</p>}
          {batchBtns.map(it => {
            return (
              <BtnTd
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
      </div>
    );
  };

  return (
    <React.Fragment>
      <Con className="printBox Relative flexColumn">
        <div className="printBoxList flex">
          <div className="flexColumn h100">
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
                  {isFree && <UpgradeIcon />}
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
            {renderBtns(btnList)}
          </div>
        </div>
        {showCreateCustomBtn && (
          <CreateCustomBtn
            isClickAway={true}
            zIndex={9}
            from="formset"
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
      </Con>
      {showTrash && (
        <TrashDialog
          projectId={worksheetInfo.projectId}
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
export default CustomBtnFormSet;
