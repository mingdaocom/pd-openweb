import React, { useState } from 'react';
import { Button, Modal, Radio } from 'ming-ui/antd-components';
import sheetAjax from 'src/api/worksheet';
import { WORKSHEET_BTN_OPTION_TYPE } from './config';
import CustomBtnList from './CustomBtnList.jsx';
import CustomBtnGroupedLayout from './groupedLayout';
import './CustomBtn.less';

const ADD_BUTTON_STYLE = { '--hap-button-default-color': 'var(--color-primary)' };

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
    btnData = [],
    btnList = [],
    btnGroupsJson,
    flatBtnOrderJson,
    projectId,
    isListOption,
    onSaveBtnLayout,
    onFresh,
    onShowCreateCustomBtn,
  } = props;
  const [showBtn, setShowBtn] = useState(false);

  const optionWorksheetBtn = (btnId, optionType, callback) => {
    return sheetAjax
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
    let value = isAllView ? 1 : 0;

    Modal.confirm({
      className: 'deleteCustomBtnDialog',
      title: <span className="textError">{_l('删除按钮')}</span>,
      content: (
        <Radio.Group
          className="deleteCustomBtnDialogCon"
          options={deleteStr(isAllView).map(({ text, ...option }) => ({ ...option, label: text }))}
          size="small"
          defaultValue={value}
          onChange={event => {
            value = event.target.value;
          }}
        />
      ),
      okText: _l('删除'),
      cancelText: _l('取消'),
      okButtonProps: {
        danger: true,
      },
      onOk: () => optionWorksheetBtn(id, value === 0 ? (isListOption ? 24 : 22) : 9, onFresh),
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
        <div className="addBtnWrapper mTop10 Relative">
          <Button
            block
            className="Bold Font13"
            color="default"
            variant="filled"
            size="large"
            style={ADD_BUTTON_STYLE}
            icon={<i className="icon icon-add Font18" />}
            onClick={handleAddClick}
          >
            {_l('动作')}
          </Button>
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
    </React.Fragment>
  );
}

export default CustomBtnCon;
