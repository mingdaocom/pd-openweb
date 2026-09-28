import React, { useEffect, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Button, Checkbox, Drawer, Input, Radio, Select, Tooltip } from 'ming-ui/antd-components';
import variableApi from 'src/api/variable';
import { useSelectAppDialog } from 'src/ming-ui/functions/dialogSelectApp';
import AuthAppList from 'src/pages/Admin/components/AuthAppList';
import { getIconByType } from 'src/utils/domain/control/metadata';
import { ALLOW_UPDATE_RADIOS, AUTH_SCOPE_RADIOS, REFRESH_TYPE } from '../constant';

const VARIABLE_TEXTAREA_AUTO_SIZE = { minRows: 3 };

const VarDrawer = styled(({ className, rootClassName, width, height, size, ...props }) => (
  <Drawer
    rootClassName={[className, rootClassName].filter(Boolean).join(' ') || undefined}
    size={size ?? width ?? height}
    {...props}
  />
))`
  color: var(--color-text-title);
  .hap-drawer-mask {
    background-color: transparent;
  }
  .hap-drawer-content-wrapper {
    box-shadow: -7px 0px 6px 1px rgba(0, 0, 0, 0.08);
  }
  .hap-drawer-body {
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
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 10px;
    .requiredStar {
      color: var(--color-error);
      margin-left: 4px;
    }
  }
  input {
    width: 100%;
    &:disabled {
      background: var(--color-background-secondary);
    }
  }
  .ant-radio-wrapper {
    width: 150px;
  }
  .hap-select {
    width: 100%;
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
    border: 1px solid var(--color-border-tertiary);
    border-left: none;
    border-radius: 0px 3px 3px 0px;
    .iconWrap {
      height: 18px;
      line-height: 17px;
      text-align: center;
      cursor: pointer;
      &:first-child {
        border-bottom: 1px solid var(--color-border-tertiary);
      }
      i {
        color: var(--color-text-tertiary);
      }
      &:hover {
        i {
          color: var(--color-primary);
        }
      }
    }
  }
`;

const VAR_TYPE_OPTIONS = [
  {
    label: (
      <div className="flexRow alignItemsCenter">
        <Icon icon={getIconByType(2, false)} className="mRight10 textTertiary" />
        <span>{_l('文本')}</span>
      </div>
    ),
    value: 2, //和工作表类型一致，2为文本类型
  },
  {
    label: (
      <div className="flexRow alignItemsCenter">
        <Icon icon={getIconByType(6, false)} className="mRight10 textTertiary" />
        <span>{_l('数值')}</span>
      </div>
    ),
    value: 6, //和工作表类型一致，6为数值类型
  },
];

const initFormData = { name: '', value: '', description: '', controlType: 2, allowEdit: 0, scope: 1, maskType: 0 };

const getInitialFormData = defaultFormValue =>
  _.isEmpty(defaultFormValue) ? initFormData : { ...initFormData, ..._.omit(defaultFormValue, ['apps', 'projectId']) };

const getInitialAuthApps = defaultFormValue =>
  (defaultFormValue?.apps || []).filter(item => _.includes(defaultFormValue.appIds, item.appId));

export default function VarAddOrEditModal(props) {
  const { visible, onClose, isEdit, projectId, appId, defaultFormValue = {}, onRefreshVarList } = props;
  const [formData, setFormData] = useSetState(getInitialFormData(defaultFormValue));
  const [authApps, setAuthApps] = useState(() => getInitialAuthApps(defaultFormValue));
  const [valueFocused, setValueFocused] = useState(false);
  const inputRef = useRef(null);
  const requestPending = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const { open: openSelectApp, holder: selectAppHolder } = useSelectAppDialog();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const onCloseAndClearData = () => {
    onClose();
    setFormData(initFormData);
    setAuthApps([]);
  };

  const onSave = () => {
    if (requestPending.current) return;

    if (!formData.name) {
      alert(_l('变量名称不能为空'), 3);
      return;
    }

    const nameReg = /^[a-zA-Z]([a-zA-Z0-9_.]+)?$/;

    if (!nameReg.test(formData.name)) {
      alert(_l('变量名称不符合规范, 请以字母开头，数字和下划线组合命名'), 3);
      return;
    }

    if (formData.controlType === 6 && !formData.value && formData.value !== 0) {
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

    requestPending.current = true;
    setSubmitting(true);

    return (isEdit ? variableApi.edit({ ...params, id: defaultFormValue.id }) : variableApi.create(params))
      .then(res => {
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
      })
      .finally(() => {
        requestPending.current = false;
        setSubmitting(false);
      });
  };

  const drawerTitle = isEdit
    ? appId
      ? _l('编辑应用变量')
      : _l('编辑组织变量')
    : appId
      ? _l('添加应用变量')
      : _l('添加组织变量');

  return (
    <VarDrawer
      autoFocus={false}
      open={visible}
      width={600}
      placement="right"
      mask={false}
      title={drawerTitle}
      closeIcon={<i className="icon-close Font18" />}
      onClose={onCloseAndClearData}
    >
      {selectAppHolder}
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
              <Icon icon="info_outline" className="textDisabled mLeft8 pointer" />
            </Tooltip>
          </div>
          <Input
            disabled={isEdit}
            ref={inputRef}
            value={formData.name}
            onChange={e => setFormData({ name: e.target.value })}
          />
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
              {formData.controlType === 6 && <span className="requiredStar">*</span>}
            </div>
            <div className="flex" />
            {formData.controlType === 2 && (
              <div className="flexRow mBottom10 alignItemsCenter">
                <Checkbox
                  checked={!!formData.maskType}
                  onChange={() =>
                    setFormData({
                      maskType: formData.maskType ? 0 : 1,
                    })
                  }
                  size="small"
                >
                  {_l('掩码显示')}
                </Checkbox>
                <Tooltip title={_l('在使用和查看变量时显示为掩码，应用管理员可以点击后解码查看')} placement="topRight">
                  <Icon icon="info_outline" className="textDisabled mLeft4 pointer" />
                </Tooltip>
              </div>
            )}
          </div>
          {formData.controlType === 2 ? (
            <Input.TextArea
              autoSize={VARIABLE_TEXTAREA_AUTO_SIZE}
              value={formData.maskType === 1 && !valueFocused ? '*'.repeat(formData.value.length) : formData.value}
              onChange={event => setFormData({ value: event.target.value })}
              onFocus={() => setValueFocused(true)}
              onBlur={() => setValueFocused(false)}
            />
          ) : (
            <VarNumberContainer>
              <Input
                value={formData.value}
                onChange={e => {
                  const value = e.target.value;

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
          <Input.TextArea
            autoSize={VARIABLE_TEXTAREA_AUTO_SIZE}
            value={formData.description}
            onChange={event => setFormData({ description: event.target.value })}
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
                  checked={item.value === formData.allowEdit}
                  onChange={() =>
                    setFormData({
                      allowEdit: item.value,
                    })
                  }
                  title={item.text}
                >
                  {item.text}
                </Radio>
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
                      checked={item.value === formData.scope}
                      onChange={() =>
                        setFormData({
                          scope: item.value,
                        })
                      }
                      title={item.text}
                    >
                      {item.text}
                    </Radio>
                  );
                })}
                <div className="flex" />
                {formData.scope === 2 && (
                  <div
                    className="colorPrimary Hand"
                    onClick={() => {
                      openSelectApp({
                        projectId,
                        title: _l('添加应用'),
                        onOk: selectedApps => {
                          const newAuthApps = _.uniqBy(authApps.concat(selectedApps), 'appId');
                          setAuthApps(newAuthApps);
                        },
                      });
                    }}
                  >
                    <Icon icon="add" />
                    <span className="bold mLeft4">{_l('添加应用')}</span>
                  </div>
                )}
              </div>
            </FormItem>
            {formData.scope === 2 && (
              <AuthAppList authApps={authApps} onRemove={id => setAuthApps(authApps.filter(app => app.appId !== id))} />
            )}
          </React.Fragment>
        )}
      </div>

      <div className="footer flexRow">
        <div className="flex">
          <Button type="primary" loading={submitting} onClick={onSave}>
            {isEdit ? _l('保存') : _l('添加')}
          </Button>
          <Button color="primary" variant="link" onClick={onCloseAndClearData}>
            {_l('取消')}
          </Button>
        </div>
      </div>
    </VarDrawer>
  );
}
