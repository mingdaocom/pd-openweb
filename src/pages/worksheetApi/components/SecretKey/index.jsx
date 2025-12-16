import React, { Fragment, useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Checkbox, Dialog, Icon, Input, LoadDiv, RadioGroup, SvgIcon, Switch, VerifyPasswordInput } from 'ming-ui';
import appManagementAjax from 'src/api/appManagement';
import verifyPassword from 'src/components/verifyPassword';
import { VIEW_DISPLAY_TYPE, VIEW_TYPE_ICON } from 'src/pages/worksheet/constants/enum';
import { getTranslateInfo } from 'src/utils/app';

const DialogWrap = styled(Dialog)`
  .tableHeader {
    display: flex;
    align-items: center;
    height: 40px;
    background: #f5f5f5;
    padding: 0 20px;
    font-weight: bold;
    .name {
      width: 160px;
    }
  }
  .dataList {
    max-height: 240px;
    overflow-y: auto;
    .dataItem {
      display: flex;
      align-items: center;
      height: 45px;
      border-bottom: 1px solid #eaeaea;
      padding-right: 20px;
      .name {
        display: flex;
        align-items: center;
        width: 180px;
        &:not(.isView) {
          cursor: pointer;
          &:hover {
            color: #1677ff;
          }
        }
      }
    }
  }
  .emptyContent {
    padding-left: 16px;
    height: 45px;
    line-height: 45px;
    border-bottom: 1px solid #eaeaea;
  }

  .verifyPasswordInput {
    .verifyPasswordTitle {
      font-size: 13px !important;
    }
  }
`;

const authTypes = [
  { text: _l('本应用全部接口'), value: 1 },
  { text: _l('本应用只读接口'), value: 2 },
  { text: _l('自定义'), value: 10 },
];

const AUTH = [
  { text: _l('查看'), key: 'canRead' },
  { text: _l('编辑'), key: 'canEdit' },
  { text: _l('删除'), key: 'canRemove' },
  { text: _l('新增'), key: 'canAdd' },
];

export default props => {
  const { appId = '', appKey, getAuthorizes = () => {}, onClose = () => {} } = props;
  const nameInputRef = useRef(null);
  const [status, setStatus] = useState(props.status || 1);
  const [name, setName] = useState(props.name || '');
  const [type, setType] = useState(props.type || 1);
  const [viewNull, setViewNull] = useState(props.viewNull);
  const [password, setPassword] = useState('');
  const [worksheets, setWorksheets] = useState();
  const [expandKeys, setExpandKeys] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    type === 10 && !worksheets && getWorksheets();
  }, [type]);

  useEffect(() => {
    if (!appKey && nameInputRef.current) {
      nameInputRef.current?.focus();
    }
  }, []);

  const getWorksheets = () => {
    appManagementAjax[appKey ? 'getAuthorizeSheet' : 'getAuthorizeSheetTemple']({ appId, appKey }).then(res => {
      if (res) {
        res.forEach(item => {
          item.sheetName = getTranslateInfo(appId, null, item.sheetId).name || item.sheetName;
          item.views.forEach(view => {
            view.viewName = getTranslateInfo(appId, item.sheetId, view.viewId).name || view.viewName;
          });
        });
        setWorksheets(res);
      }
    });
  };

  const onChangeAuth = ({ sheetId, viewId, type, checkedValue }) => {
    const newSheets = worksheets.map(sheet => {
      if (type === 'canRead') {
        const newViews = sheet.views.map(view =>
          (!sheetId && !viewId) || (sheetId && sheetId === sheet.sheetId) || (viewId && viewId === view.viewId)
            ? { ...view, [type]: checkedValue }
            : view,
        );
        return { ...sheet, canRead: newViews.filter(view => !!view.canRead).length ? 1 : 0, views: newViews };
      } else {
        return !sheetId || sheetId === sheet.sheetId ? { ...sheet, [type]: checkedValue } : sheet;
      }
    });
    setWorksheets(newSheets);
  };

  const onOk = () => {
    if (status === 1) {
      if (!name.trim()) {
        alert(_l('请输入名称'), 3);
        return;
      }

      if (!/^[\u4e00-\u9fa5\w]{1,50}$/.test(name)) {
        alert(_l('名称不符合规范'), 3);
        return;
      }
    }

    verifyPassword({
      password: password || '',
      success: () => {
        setSubmitting(true);
        appManagementAjax[appKey ? 'editAuthorizeStatus' : 'addAuthorize']({
          appId,
          appKey,
          status,
          name,
          type,
          viewNull,
          sheets: worksheets,
        })
          .then(res => {
            if (res) {
              onClose();
              getAuthorizes();
            }
            setSubmitting(false);
          })
          .catch(() => setSubmitting(false));
      },
    });
  };

  const renderDataList = () => {
    return (
      <div className="dataList">
        {worksheets.map(sheet => {
          const isExpand = expandKeys.includes(sheet.sheetId);

          return (
            <React.Fragment>
              <div className="dataItem" key={sheet.sheetId}>
                <div
                  className="name"
                  onClick={() => {
                    const newKeys = isExpand
                      ? expandKeys.filter(item => item !== sheet.sheetId)
                      : expandKeys.concat(sheet.sheetId);
                    setExpandKeys(newKeys);
                  }}
                >
                  <Icon icon={isExpand ? 'arrow-down' : 'arrow-right-tip'} className="Gray_75 mRight6" />
                  <span className="mRight6" m style={{ height: '18px' }}>
                    <SvgIcon url={sheet.iconUrl} fill="#757575" size={18} />
                  </span>
                  <span className="overflow_ellipsis" title={sheet.sheetName}>
                    {sheet.sheetName}
                  </span>
                </div>
                {AUTH.map(item => {
                  const isChecked =
                    item.key === 'canRead' ? !sheet.views.filter(view => !view[item.key]).length : sheet[item.key];
                  const isClearSelected = !isChecked && !!sheet.views.filter(view => view[item.key]).length;

                  return (
                    <div key={item.key} className="flex">
                      <Checkbox
                        checked={isChecked}
                        clearselected={isClearSelected}
                        onClick={() => {
                          onChangeAuth({ sheetId: sheet.sheetId, type: item.key, checkedValue: isChecked ? 0 : 1 });
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {isExpand &&
                !!_.get(sheet, 'views.length') &&
                sheet.views.map(view => (
                  <div key={view.viewId} className="dataItem">
                    <div className="name isView pLeft40">
                      <span className="mRight6">
                        <Icon
                          className="Gray_bd Font14"
                          icon={_.find(VIEW_TYPE_ICON, { id: VIEW_DISPLAY_TYPE[view.viewType] }).icon}
                        />
                      </span>
                      <span className="overflow_ellipsis" title={view.viewName}>
                        {view.viewName}
                      </span>
                    </div>
                    <div className="flex">
                      <Checkbox
                        checked={!!view.canRead}
                        onClick={() =>
                          onChangeAuth({ viewId: view.viewId, type: 'canRead', checkedValue: view.canRead ? 0 : 1 })
                        }
                      />
                    </div>
                  </div>
                ))}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <DialogWrap
      visible={true}
      overlayClosable={false}
      title={appKey ? _l('编辑授权密钥') : _l('新建授权密钥')}
      width={600}
      onOk={onOk}
      onCancel={onClose}
      okDisabled={submitting}
    >
      <div className="Gray_75">{_l('应用授权密钥是极为重要的凭证，修改时需要验证身份')}</div>

      {appKey && (
        <Fragment>
          <div className="mTop20 bold">{_l('授权状态')}</div>
          <Switch
            className="mTop10"
            checked={status === 1}
            text={status === 1 ? _l('开启') : _l('关闭')}
            onClick={() => setStatus(status === 1 ? 2 : 1)}
          />
        </Fragment>
      )}

      {status === 1 && (
        <Fragment>
          <div className="mTop20 bold">{_l('名称')}</div>
          <div className="mTop10">
            <Input
              manualRef={nameInputRef}
              className="w100"
              placeholder={_l('支持汉字、数字、字母、下划线，最大50个字')}
              value={name}
              onChange={value => setName(value)}
            />
          </div>

          <div className="mTop20 bold">{_l('接口权限')}</div>
          <div className="mTop10">
            <RadioGroup
              data={authTypes}
              checkedValue={type}
              onChange={value => {
                setType(value);
                value === 10 && setViewNull(true);
              }}
            />
          </div>
          {type === 10 &&
            (!worksheets ? (
              <div className="mTop20 TxtCenter">
                <LoadDiv size="small" />
              </div>
            ) : (
              <div className="mTop20">
                <div className="tableHeader">
                  <div className="name">{_l('工作表')}</div>
                  {AUTH.map(item => {
                    let isChecked;
                    let isClearSelected;

                    if (item.key === 'canRead') {
                      isChecked = !worksheets.filter(sheet => sheet.views.filter(v => !v[item.key]).length).length;
                      isClearSelected =
                        !isChecked && !!worksheets.filter(sheet => sheet.views.filter(o => o[item.key]).length).length;
                    } else {
                      isChecked = !worksheets.filter(sheet => !sheet[item.key]).length;
                      isClearSelected = !isChecked && !!worksheets.filter(sheet => sheet[item.key]).length;
                    }

                    return (
                      <div key={item.key} className="flex">
                        <Checkbox
                          text={item.text}
                          checked={isChecked}
                          clearselected={isClearSelected}
                          onClick={() => onChangeAuth({ type: item.key, checkedValue: isChecked ? 0 : 1 })}
                        />
                      </div>
                    );
                  })}
                </div>

                {worksheets.length ? renderDataList() : <div className="emptyContent">_l('还没有创建工作表')</div>}
              </div>
            ))}

          <div className="mTop20 bold">{_l('其他设置')}</div>
          <Checkbox
            className="mTop10"
            text={_l('调用获取工作表列表接口时，视图参数为空则不返回数据')}
            disabled={type === 10}
            checked={viewNull}
            onClick={() => setViewNull(!viewNull)}
          />
        </Fragment>
      )}

      <VerifyPasswordInput
        className="verifyPasswordInput mTop20"
        showSubTitle={true}
        onChange={({ password }) => setPassword(password)}
      />
    </DialogWrap>
  );
};
