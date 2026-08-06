import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { Dialog, RadioGroup } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import { WORKSHEET_BTN_OPTION_TYPE } from './config';
import CustomBtnList from './CustomBtnList.jsx';
import CustomBtnGroupedLayout from './groupedLayout';
import './CustomBtn.less';

const deleteStr = isAllView => {
  const list = [
    {
      value: 2,
      text: _l('应用于所有记录中的按钮，无法从当前视图中删除'),
      disabled: true,
    },
    {
      value: 0,
      text: _l('仅从当前视图中移除'),
    },
    {
      value: 1,
      text: _l('删除按钮，与之对应触发的工作流也将被删除'),
    },
  ];
  return list.filter(o => o.value !== (!isAllView ? 2 : 0));
};

function CustomBtnCon(props) {
  const {
    worksheetId,
    appId,
    viewId,
    btnData: btnDataFromProps = [],
    btnList: btnListFromProps = [],
    btnGroupsJson,
    flatBtnOrderJson,
    projectId,
    isListOption,
    onSaveBtnLayout,
    onFresh,
    onShowCreateCustomBtn,
  } = props;
  const [btnData, setBtnData] = useState(btnDataFromProps);
  const [btnList, setBtnList] = useState(btnListFromProps);
  const [showBtn, setShowBtn] = useState(false);
  const [deleteState, setDeleteState] = useState({
    showDeleteDialog: false,
    value: 0,
    btnId: '',
    isAllView: false,
  });

  useEffect(() => {
    setBtnData(prev => (_.isEqual(btnDataFromProps, prev) ? prev : btnDataFromProps));
    setBtnList(prev => (_.isEqual(btnListFromProps, prev) ? prev : btnListFromProps));
  }, [btnDataFromProps, btnListFromProps]);

  const optionWorksheetBtn = (btnId, optionType, callback) => {
    sheetAjax
      .optionWorksheetBtn({
        appId,
        viewId,
        btnId,
        worksheetId,
        optionType,
      })
      .then(data => {
        callback(data);
      });
  };

  const onShowCustomBtn = (value, isEdit, btnId = '') => {
    onShowCreateCustomBtn(value, isEdit, btnId, isListOption);
  };

  const editBtn = btnId => {
    onShowCustomBtn(true, true, btnId);
  };

  const deleteBtn = (id, isAllView) => {
    setDeleteState({
      showDeleteDialog: true,
      btnId: id,
      isAllView,
      value: isAllView ? 1 : 0,
    });
  };

  const handleCopy = btnId => {
    sheetAjax
      .copyWorksheetBtn({
        appId,
        viewId,
        btnId,
        worksheetId,
      })
      .then(data => {
        if (data) {
          onFresh();
          alert(_l('复制成功'));
        } else {
          alert(_l('复制失败'), 2);
        }
      });
  };

  const handleToggleEnable = (btnId, status) => {
    const optionType = status === 0 ? WORKSHEET_BTN_OPTION_TYPE.disable : WORKSHEET_BTN_OPTION_TYPE.enable;

    optionWorksheetBtn(btnId, optionType, data => {
      if (data) {
        onFresh();
      } else {
        alert(status === 0 ? _l('停用失败') : _l('启用失败'), 2);
      }
    });
  };

  const renderDeleteDialog = () => {
    const { isAllView, btnId, value, showDeleteDialog } = deleteState;
    return (
      <Dialog
        title={_l('删除按钮')}
        okText={_l('删除')}
        cancelText={_l('取消')}
        confirm="danger"
        className="deleteCustomBtnDialog"
        headerClass="deleteCustomBtnDialogTitle"
        bodyClass="deleteCustomBtnDialogCon"
        onCancel={() => {
          setDeleteState(prev => ({ ...prev, showDeleteDialog: false }));
        }}
        onOk={() => {
          optionWorksheetBtn(btnId, value === 0 ? (isListOption ? 24 : 22) : 9, () => {
            setDeleteState(prev => ({ ...prev, showDeleteDialog: false }));
            onFresh();
          });
        }}
        visible={showDeleteDialog}
        updateTrigger="false"
      >
        <RadioGroup
          data={deleteStr(isAllView)}
          size="small"
          onChange={value => {
            setDeleteState(prev => ({ ...prev, value }));
          }}
          checkedValue={value}
        />
      </Dialog>
    );
  };

  const handleAddClick = () => {
    if (btnList.length <= btnData.length) {
      onShowCustomBtn(true, false);
      return;
    }

    const nextShowBtn = !showBtn;
    setShowBtn(nextShowBtn);

    if (nextShowBtn) {
      // 等下拉渲染进 DOM 后再滚动，否则首次展开时可能拿不到节点
      window.setTimeout(() => {
        const scrollDom = document.querySelector('.btnListBoxMain');

        if (scrollDom) {
          scrollDom.scrollIntoView(false);
        }
      }, 0);
    }
  };

  return (
    <React.Fragment>
      <div className="customBtnBox mTop13">
        <div>
          {btnData && (
            <CustomBtnGroupedLayout
              btnData={btnData}
              btnGroupsJson={btnGroupsJson}
              flatBtnOrderJson={flatBtnOrderJson}
              layoutId={isListOption ? 'list' : 'detail'}
              projectId={projectId}
              onSaveLayout={onSaveBtnLayout}
              editBtn={editBtn}
              deleteBtn={deleteBtn}
              handleCopy={handleCopy}
              toggleEnable={handleToggleEnable}
              isListOption={isListOption}
            />
          )}
        </div>
        <div className="addBtn Hand mTop10 Relative" onClick={handleAddClick}>
          <i className="icon icon-add Font18 mRight5 TxtMiddle InlineBlock"></i>
          <span className="Bold TxtMiddle InlineBlock">{_l('动作')}</span>
          {showBtn && (
            <CustomBtnList
              btnList={btnList}
              btnData={btnData}
              setList={item => {
                optionWorksheetBtn(item.btnId, isListOption ? 23 : 21, () => {
                  setShowBtn(false);
                  onFresh();
                });
              }}
              onClickAway={() => setShowBtn(false)}
              onShowCreateCustomBtn={onShowCustomBtn}
            />
          )}
        </div>
      </div>
      {deleteState.showDeleteDialog && renderDeleteDialog()}
    </React.Fragment>
  );
}

export default CustomBtnCon;
