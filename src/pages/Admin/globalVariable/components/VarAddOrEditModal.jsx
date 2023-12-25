import React, { useEffect, useState } from 'react';
import { useSetState } from 'react-use';
import { Drawer, Select, Tooltip } from 'antd';
import styled from 'styled-components';
import { Icon, Input, Checkbox, Textarea, Radio, Button, ScrollView } from 'ming-ui';
import { ALLOW_UPDATE_RADIOS, AUTH_SCOPE_RADIOS, REFRESH_TYPE } from '../constant';
import SvgIcon from 'src/components/SvgIcon';
import AddAppModal from './AddAppModal';
import moment from 'moment';
import variableApi from 'src/api/variable';
import { getIconByType } from 'src/pages/widgetConfig/util';
import _ from 'lodash';

const VarDrawer = styled(Drawer)`
  color: #333;
  .ant-drawer-mask {
    background-color: transparent;
  }
  .ant-drawer-content-wrapper {
    box-shadow: -7px 0px 6px 1px rgba(0, 0, 0, 0.08);
  }
  .ant-drawer-header {
    border-bottom: 0;
    .ant-drawer-header-title {
      flex-direction: row-reverse;
      .ant-drawer-title {
        font-size: 17px;
        font-weight: 600;
      }
      .ant-drawer-close {
        padding: 0;
        margin-top: -24px;
        margin-right: -12px;
      }
    }
  }
  .ant-drawer-body {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0;

    .formContent {
      flex: 1;
      padding: 8px 24px;
      overflow: auto;
    }
    .footer {
      min-height: 66px;
      justify-content: flex-end;
      padding: 10px 24px 20px;
      text-align: left;
    }
  }
`;

const FormItem = styled.div`
  margin-bottom: 20px;
  .labelText {
    font-family: FZLanTingHeiS-DemiBold, FZLanTingHeiS;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 10px;
    .requiredStar {
      color: #f44336;
      margin-left: 4px;
    }
  }
  input {
    width: 100%;
    &:disabled {
      background: #f5f5f5;
      border-color: #f5f5f5;
      &:hover {
        border-color: #f5f5f5;
      }
    }
  }
  .ming.Radio {
    width: 150px;
  }
  .ant-select {
    width: 100%;
    .ant-select-selector {
      min-height: 36px;
      padding: 2px 11px !important;
      border: 1px solid #ccc !important;
      border-radius: 3px !important;
      box-shadow: none !important;
    }
    &.ant-select-focused {
      .ant-select-selector {
        border-color: #1e88e5 !important;
      }
    }
    &.ant-select-disabled {
      .ant-select-selector {
        color: #333 !important;
        background: #f5f5f5 !important;
        border-color: #f5f5f5 !important;
      }
    }
  }
`;

const VarNumberContainer = styled.div`
  display: flex;
  input {
    flex: 1;
    border-radius: 3px 0px 0px 3px !important;
  }
  .numberOption {
    display: flex;
    flex-direction: column;
    width: 40px;
    height: 36px;
    border: 1px solid #ccc;
    border-left: none;
    border-radius: 0px 3px 3px 0px;
    .iconWrap {
      height: 18px;
      line-height: 17px;
      text-align: center;
      cursor: pointer;
      &:first-child {
        border-bottom: 1px solid #ccc;
      }
      i {
        color: #9e9e9e;
      }
      &:hover {
        i {
          color: #2196f3;
        }
      }
    }
  }
`;

const AppListContainer = styled.div`
  width: 100%;
  border-radius: 3px;
  border: 1px solid #ddd;

  .headTr {
    display: flex;
    height: 36px;
    line-height: 36px;
    font-size: 12px;
    color: #9e9e9e;
    padding: 0 12px;
  }
  .name {
    flex: 7;
    min-width: 0;
  }
  .createTime,
  .owner {
    flex: 3;
    min-width: 0;
  }
  .option {
    flex: 1;
  }

  .noDataContent {
    height: 100px;
    line-height: 100px;
    color: #bdbdbd;
    text-align: center;
  }
  .appList {
    height: 300px;

    .dataItem {
      display: flex;
      height: 48px;
      line-height: 48px;
      padding: 0 12px;
      .appIcon {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 24px;
        min-width: 24px;
        height: 24px;
        line-height: 16px;
        border-radius: 4px;
        margin-right: 8px;
      }
      .userIcon {
        width: 25px;
        height: 25px;
        border-radius: 50%;
        margin-right: 6px;
      }
      .removeItem {
        color: #bdbdbd;
        cursor: pointer;
        &:hover {
          color: #2196f3;
        }
      }
    }
  }
`;

const VAR_TYPE_OPTIONS = [
  {
    label: (
      <div className="flexRow alignItemsCenter">
        <Icon icon={getIconByType(2, false)} className="mRight10 Gray_9d" />
        <span>{_l('文本')}</span>
      </div>
    ),
    value: 2, //和工作表类型一致，2为文本类型
  },
  {
    label: (
      <div className="flexRow alignItemsCenter">
        <Icon icon={getIconByType(6, false)} className="mRight10 Gray_9d" />
        <span>{_l('数值')}</span>
      </div>
    ),
    value: 6, //和工作表类型一致，6为数值类型
  },
];

export default function VarAddOrEditModal(props) {
  const { visible, onClose, isEdit, projectId, appId, defaultFormValue = {}, onRefreshVarList } = props;
  const initFormData = { name: '', value: '', description: '', controlType: 2, allowEdit: 1, scope: 1, maskType: 0 };
  const [formData, setFormData] = useSetState(initFormData);
  const [authApps, setAuthApps] = useState([]);
  const [addAppVisible, setAddAppVisible] = useState(false);
  const [valueFocused, setValueFocused] = useState(false);

  useEffect(() => {
    if (!_.isEmpty(defaultFormValue)) {
      setFormData({ ...formData, ..._.omit(defaultFormValue, ['apps', 'projectId']) });
      !!(defaultFormValue.apps || []).length &&
        setAuthApps(defaultFormValue.apps.filter(item => _.includes(defaultFormValue.appIds, item.appId)));
    }
  }, [defaultFormValue]);

  const onCloseAndClearData = () => {
    onClose();
    setFormData(initFormData);
    setAuthApps([]);
  };

  const onSave = () => {
    if (!formData.name) {
      alert(_l('变量名称不能为空'), 3);
      return;
    }

    const nameReg = /^[a-zA-Z]([a-zA-Z0-9_.]+)?$/;
    if (!nameReg.test(formData.name)) {
      alert(_l('变量名称不符合规范, 请以字母开头，数字和下划线组合命名'), 3);
      return;
    }

    if (!formData.value && formData.value !== 0) {
      alert(_l('变量值不能为空'), 3);
      return;
    }
    const validName = formData.name
      .split('.')
      .filter(item => !!item)
      .join('.');
    const params = {
      ...formData,
      name: validName,
      sourceType: appId ? 1 : 0, //0：组织，1：应用
      sourceId: appId || projectId,
      appIds:
        formData.scope === 1
          ? []
          : authApps.map(app => {
              return app.appId;
            }),
    };

    (isEdit ? variableApi.edit({ ...params, id: defaultFormValue.id }) : variableApi.create(params)).then(res => {
      if (isEdit) {
        if (res) {
          onRefreshVarList(REFRESH_TYPE.UPDATE, { ...formData, id: defaultFormValue.id, name: validName });
          onCloseAndClearData();
          alert(_l('修改成功'));
        } else {
          alert(_l('修改失败'), 2);
        }
      } else {
        switch (res.resultCode) {
          case 1:
            onRefreshVarList(REFRESH_TYPE.ADD, { ...formData, id: res.id, name: validName });
            onCloseAndClearData();
            alert(_l('添加成功'));
            break;
          case 2:
            alert(_l('名称已被占用'), 2);
            break;
          case 7:
            alert(_l('无权限'), 2);
            break;
          default:
            alert(_l('添加失败'), 2);
            break;
        }
      }
    });
  };

  const renderAppList = () => {
    const columns = [
      {
        dataIndex: 'name',
        title: _l('应用名称'),
        render: item => {
          return (
            <div className="flexRow alignItemsCenter">
              <div className="appIcon" style={{ background: item.iconColor }}>
                <SvgIcon url={item.iconUrl} fill="#fff" size={16} />
              </div>
              <span className="overflow_ellipsis mRight10" title={item.appName}>
                {item.appName}
              </span>
            </div>
          );
        },
      },
      {
        dataIndex: 'createTime',
        title: _l('创建时间'),
        render: item => {
          return <div>{item.ctime ? moment(item.ctime).format('YYYY-MM-DD') : ''}</div>;
        },
      },
      {
        dataIndex: 'owner',
        title: _l('拥有者'),
        render: item => {
          const createAccount = item.createAccountInfo || {};
          return !_.isEmpty(createAccount) ? (
            <div className="flexRow alignItemsCenter">
              <img className="userIcon" src={createAccount.avatar} />
              <span className="overflow_ellipsis" title={createAccount.fullName}>
                {createAccount.fullName}
              </span>
            </div>
          ) : null;
        },
      },
      {
        dataIndex: 'option',
        title: '',
        render: item => (
          <div className="removeItem" onClick={() => setAuthApps(authApps.filter(app => app.appId !== item.appId))}>
            {_l('移除')}
          </div>
        ),
      },
    ];

    return (
      <AppListContainer>
        <div className="headTr">
          {columns.map((item, index) => {
            return (
              <div key={index} className={`${item.dataIndex}`}>
                {item.title}
              </div>
            );
          })}
        </div>
        {!authApps.length ? (
          <div className="noDataContent">{_l('没有授权应用')}</div>
        ) : (
          <ScrollView className="appList">
            {authApps.map((appItem, i) => {
              return (
                <div key={i} className="dataItem">
                  {columns.map((item, j) => {
                    return (
                      <div key={`${i}-${j}`} className={`${item.dataIndex}`}>
                        {item.render ? item.render(appItem) : appItem[item.dataIndex]}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </ScrollView>
        )}
      </AppListContainer>
    );
  };

  const drawerTitle = isEdit
    ? !!appId
      ? _l('编辑应用变量')
      : _l('编辑组织变量')
    : !!appId
    ? _l('添加应用变量')
    : _l('添加组织变量');

  return (
    <VarDrawer
      visible={visible}
      width={600}
      placement="right"
      mask={false}
      title={drawerTitle}
      closeIcon={<i className="icon-close Font18" />}
      onClose={onCloseAndClearData}
    >
      <div className="formContent">
        <FormItem>
          <div className="labelText">
            <span>{_l('变量名称')}</span>
            <span className="requiredStar">*</span>
            <Tooltip
              title={_l(
                '仅允许使用字母（不区分大小写）、数字和下划线组合，且必须以字母开头。支持以“变量分组.变量名称”规则创建，会将变量名称前的内容自动归组。变量名称创建后不允许修改。',
              )}
              placement="top"
            >
              <Icon icon="info_outline" className="Gray_bd mLeft8 pointer" />
            </Tooltip>
          </div>
          <Input disabled={isEdit} value={formData.name} onChange={name => setFormData({ name })} />
        </FormItem>
        <FormItem>
          <div className="labelText">
            <span>{_l('变量类型')}</span>
          </div>
          <Select
            disabled={isEdit}
            options={VAR_TYPE_OPTIONS}
            value={formData.controlType}
            onChange={controlType => setFormData({ controlType, value: '' })}
          />
        </FormItem>
        <FormItem>
          <div className="flexRow">
            <div className="labelText">
              <span>{_l('变量值')}</span>
              <span className="requiredStar">*</span>
            </div>
            <div className="flex" />
            {formData.controlType === 2 && (
              <div className="flexRow mBottom10 alignItemsCenter">
                <Checkbox
                  size="small"
                  text={_l('掩码显示')}
                  checked={!!formData.maskType}
                  onClick={() => setFormData({ maskType: !!formData.maskType ? 0 : 1 })}
                />
                <Tooltip title={_l('在使用和查看变量时显示为掩码，应用管理员可以点击后解码查看')} placement="topRight">
                  <Icon icon="info_outline" className="Gray_bd mLeft4 pointer" />
                </Tooltip>
              </div>
            )}
          </div>
          {formData.controlType === 2 ? (
            <Textarea
              minHeight={80}
              value={formData.maskType === 1 && !valueFocused ? '*'.repeat(formData.value.length) : formData.value}
              onChange={value => setFormData({ value })}
              onFocus={() => setValueFocused(true)}
              onBlur={() => setValueFocused(false)}
            />
          ) : (
            <VarNumberContainer>
              <Input
                value={formData.value}
                onChange={value => {
                  if (!value) {
                    setFormData({ value: '' });
                    return;
                  }
                  if (value.length > 16) {
                    return;
                  }
                  const parsedValue = parseInt(value);
                  setFormData({ value: isNaN(parsedValue) ? 0 : parsedValue });
                }}
              />
              <div className="numberOption">
                <div
                  className="iconWrap"
                  onClick={() =>
                    setFormData({ value: isNaN(parseInt(formData.value)) ? 0 : parseInt(formData.value) + 1 })
                  }
                >
                  <Icon icon="arrow-up-border" />
                </div>
                <div
                  className="iconWrap"
                  onClick={() =>
                    setFormData({
                      value: isNaN(parseInt(formData.value)) ? 0 : Math.max(0, parseInt(formData.value) - 1),
                    })
                  }
                >
                  <Icon icon="arrow-down-border" />
                </div>
              </div>
            </VarNumberContainer>
          )}
        </FormItem>
        <FormItem>
          <div className="labelText">
            <span>{_l('描述')}</span>
          </div>
          <Textarea
            minHeight={80}
            value={formData.description}
            onChange={description => setFormData({ description })}
          />
        </FormItem>
        <FormItem>
          <div className="labelText">
            <span>{_l('是否允许在工作流中更新')}</span>
          </div>
          <div className="flexRow mTop16">
            {ALLOW_UPDATE_RADIOS.map(item => {
              return (
                <Radio
                  text={item.text}
                  checked={item.value === formData.allowEdit}
                  onClick={() => setFormData({ allowEdit: item.value })}
                />
              );
            })}
          </div>
        </FormItem>
        {!appId && (
          <React.Fragment>
            <FormItem>
              <div className="labelText">
                <span>{_l('授权范围')}</span>
              </div>
              <div className="flexRow alignItemsCenter mTop16">
                {AUTH_SCOPE_RADIOS.map(item => {
                  return (
                    <Radio
                      text={item.text}
                      checked={item.value === formData.scope}
                      onClick={() => setFormData({ scope: item.value })}
                    />
                  );
                })}
                <div className="flex" />
                {formData.scope === 2 && (
                  <div className="ThemeColor Hand" onClick={() => setAddAppVisible(true)}>
                    <Icon icon="add" />
                    <span className="bold mLeft4">{_l('添加应用')}</span>
                  </div>
                )}
              </div>
            </FormItem>
            {formData.scope === 2 && renderAppList()}
            {addAppVisible && (
              <AddAppModal
                projectId={projectId}
                onClose={() => setAddAppVisible(false)}
                onOk={selectedApps => {
                  const newAuthApps = _.uniqBy(authApps.concat(selectedApps), 'appId');
                  setAuthApps(newAuthApps);
                  setAddAppVisible(false);
                }}
              />
            )}
          </React.Fragment>
        )}
      </div>

      <div className="footer flexRow">
        <div className="flex">
          <Button type="primary" onClick={onSave}>
            {isEdit ? _l('保存') : _l('添加')}
          </Button>
          <Button type="link" onClick={onCloseAndClearData}>
            {_l('取消')}
          </Button>
        </div>
      </div>
    </VarDrawer>
  );
}
