import React, { Fragment, useEffect, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, TagTextarea } from 'ming-ui';
import { Checkbox, Dropdown, Modal, Radio, Tooltip } from 'ming-ui/antd-components';
import appManagementApi from 'src/api/appManagement';
import { updateSheetListAppItem } from 'worksheet/redux/actions/sheetList';
import { LINK_PARA_FIELDS } from 'src/pages/customPage/config';
import { updatePageInfo } from 'src/pages/customPage/redux/action';
import { getAppSectionRef } from 'src/pages/PageHeader/AppPkgHeader/LeftAppGroup';
import store from 'src/redux/configureStore';

const ControlTag = styled.div`
  line-height: 24px;
  padding: 0 12px;
  border-radius: 16px;
  background: #d8eeff;
  color: var(--color-link-hover);
  border: 1px solid var(--color-primary-transparent);
  &.invalid {
    color: var(--color-error);
    background: rgba(244, 67, 54, 0.06);
    border-color: var(--color-error);
  }
`;

const TagTextareaWrap = styled.div`
  .tagInputareaIuput {
    border-radius: 3px 0 3px 3px !important;
  }
  .CodeMirror-placeholder {
    color: var(--color-text-tertiary) !important;
    padding-left: 10px !important;
  }
  .hap-dropdown-trigger {
    height: fit-content;
  }
  .iconWrap {
    border: 1px solid var(--color-border-tertiary);
    padding: 5px;
    border-radius: 0 3px 3px 0;
    width: 28px;
    height: 30px;
    border-left: none;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover .icon-workflow_other {
      color: var(--color-primary) !important;
    }
  }
`;

const RadioGroupWrap = styled(Radio.Group)`
  .ant-radio-wrapper {
    margin-right: 60px;
  }
  .hap-radio-wrapper {
    align-items: center;
  }
  .hap-radio-inner {
    width: 16px;
    height: 16px;
  }
`;

const OptionCheckbox = styled(Checkbox)`
  align-items: center;
  .hap-checkbox-inner {
    width: 18px;
    height: 18px;
  }
`;

export const EditExternalLink = props => {
  const { appId, groupId, appItem, onCancel } = props;
  const [data, setData] = useState({ configuration: appItem.configuration });

  const handleSave = () => {
    const { currentPcNaviStyle } = store.getState().appPkg;
    const protocolReg = /^https?:\/\/.+$/;

    if (!protocolReg.test(data.urlTemplate)) {
      alert(_l('请输入正确的url'), 3);
      return;
    }

    appManagementApi
      .editWorkSheetInfoForApp({
        type: 1,
        appId,
        appSectionId: appItem.parentGroupId || groupId,
        workSheetId: appItem.workSheetId,
        ...data,
      })
      .then(() => {
        if ([1, 3].includes(currentPcNaviStyle)) {
          const singleRef = getAppSectionRef(groupId);
          singleRef.dispatch(updateSheetListAppItem(appItem.workSheetId, data));
          store.dispatch(updatePageInfo({ flag: Date.now() }));
        } else {
          props.updateSheetListAppItem(appItem.workSheetId, data);
        }
      });
    onCancel();
  };

  return (
    <Modal
      open
      title={_l('编辑外部链接')}
      width={580}
      mask={{ closable: true }}
      keyboard
      onOk={handleSave}
      onCancel={onCancel}
    >
      <ExternalLink urlTemplate={appItem.urlTemplate} configuration={appItem.configuration} onChange={setData} />
    </Modal>
  );
};

const genControlTag = id => {
  const res = _.flatten(LINK_PARA_FIELDS.map(data => data.fields));
  const field = _.find(res, { value: id });
  return (
    <ControlTag className="flexRow valignWrapper">
      <span className="Font12">{field ? field.text : id}</span>
    </ControlTag>
  );
};

const ExternalLink = props => {
  const { configuration = {}, onChange } = props;
  const [customPageType, setCustomPageType] = useState(configuration.customPageType || '1');
  const [openType, setOpenType] = useState(configuration.openType || '1');
  const [hideHeaderBar, setHideHeaderBar] = useState(configuration.hideHeaderBar || '0');
  const [urlTemplate, setUrlTemplate] = useState(props.urlTemplate || '');
  const [ref, setRef] = useState('');

  useEffect(() => {
    onChange({
      configuration: {
        customPageType,
        openType,
        hideHeaderBar,
      },
      urlTemplate,
    });
  }, [customPageType, openType, hideHeaderBar, urlTemplate, onChange]);

  const handleChange = (err, value) => {
    if (err) {
      return;
    }

    setUrlTemplate(value);
  };

  return (
    <Fragment>
      {!configuration.customPageType && (
        <Fragment>
          <div className="mTop24">
            <div className="mBottom10">{_l('类型')}</div>
            <RadioGroupWrap
              options={[
                { value: '1', label: _l('画布') },
                { value: '2', label: _l('外部链接') },
              ]}
              value={customPageType}
              onChange={event => setCustomPageType(event.target.value)}
            />
          </div>
          <div className="textTertiary mTop6">
            {customPageType === '1' && _l('创建一个画布页面，在页面中添加统计报表、按钮、视图等组件')}
            {customPageType === '2' && _l('将一个已有外部链接作为页面')}
          </div>
        </Fragment>
      )}
      {customPageType === '2' && (
        <Fragment>
          <div>
            <div className="mBottom10">{_l('链接')}</div>
            <TagTextareaWrap className="flexRow w100">
              <TagTextarea
                className="flex"
                placeholder={_l('请输入完整链接，以 http:// 或 https:// 开头')}
                defaultValue={urlTemplate}
                height={120}
                maxHeight={240}
                getRef={tagtextarea => {
                  setRef(tagtextarea);
                }}
                renderTag={id => genControlTag(id)}
                onChange={handleChange}
              />
              <Dropdown
                trigger="click"
                placement="bottomRight"
                menu={{
                  style: { minWidth: 180 },
                  items: LINK_PARA_FIELDS.map(({ type, title, fields }) => ({
                    type: 'group',
                    key: type,
                    label: title,
                    children: fields.map(({ text, value }) => ({
                      key: `${type}-${value}`,
                      label: text,
                      onClick: () => {
                        ref.insertColumnTag(value);
                      },
                    })),
                  })),
                }}
              >
                <div>
                  <Tooltip title={_l('使用动态参数')} placement="bottom">
                    <div className="iconWrap Font17 pointer">
                      <Icon className="textTertiary" icon="workflow_other" />
                    </div>
                  </Tooltip>
                </div>
              </Dropdown>
            </TagTextareaWrap>
          </div>
          <div className="mTop24 mBottom16">
            <div className="mBottom10">{_l('打开方式')}</div>
            <RadioGroupWrap
              options={[
                {
                  value: '1',
                  label: _l('嵌入页面'),
                },
                { value: '2', label: _l('新窗口打开') },
              ]}
              value={openType}
              onChange={event => setOpenType(event.target.value)}
            />
          </div>
          <OptionCheckbox
            className={cx({ Visibility: openType === '2' })}
            checked={hideHeaderBar === '1'}
            onChange={() => {
              setHideHeaderBar(hideHeaderBar === '0' ? '1' : '0');
            }}
          >
            {<span>{_l('隐藏标题栏')}</span>}
          </OptionCheckbox>
        </Fragment>
      )}
    </Fragment>
  );
};

export default ExternalLink;
