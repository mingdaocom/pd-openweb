import React, { useState, useEffect, Fragment } from 'react';
import { Radio, RadioGroup, Checkbox, TagTextarea, Icon, Dialog } from 'ming-ui';
import cx from 'classnames';
import { Dropdown } from 'antd';
import { getRePosFromStr } from 'ming-ui/components/TagTextarea';
import styled from 'styled-components';
import appManagementApi from 'src/api/appManagement';
import { LINK_PARA_FIELDS } from 'src/pages/customPage/config';
import { DropdownContent } from 'src/pages/widgetConfig/styled';
import store from 'redux/configureStore';
import { updateSheetListAppItem } from 'worksheet/redux/actions/sheetList';
import { getAppSectionRef } from 'src/pages/PageHeader/AppPkgHeader/LeftAppGroup';
import { updatePageInfo } from 'src/pages/customPage/redux/action';

const ControlTag = styled.div`
  line-height: 24px;
  padding: 0 12px;
  border-radius: 16px;
  background: #d8eeff;
  color: #174c76;
  border: 1px solid #bbd6ea;
  &.invalid {
    color: #f44336;
    background: rgba(244, 67, 54, 0.06);
    border-color: #f44336;
  }
`;

const TagTextareaWrap = styled.div`
  .tagInputareaIuput {
    border-radius: 3px 0 3px 3px !important;
  }
  .CodeMirror-placeholder {
    color: #9e9e9e !important;
    padding-left: 10px !important;
  }
  .iconWrap {
    border: 1px solid #ccc;
    padding: 5px;
    border-radius: 0 3px 3px 0;
    width: 28px;
    height: 30px;
    border-left: none;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover .icon-workflow_other {
      color: #2196f3 !important;
    }
  }
`;

const RadioGroupWrap = styled(RadioGroup)`
  .ming.Radio {
    margin-right: 60px;
  }
`;

export const EditExternalLink = (props) => {
  const { appId, groupId, appItem, onCancel } = props;
  const [data, setData] = useState({ configuration: appItem.configuration });

  const handleSave = () => {
    const { currentPcNaviStyle } = store.getState().appPkg;
    const protocolReg = data.configuration.openType === '1' ? /^https:\/\/.+$/ : /^https?:\/\/.+$/;
    if (!protocolReg.test(data.urlTemplate)) {
      alert(_l('请输入正确的url'), 3);
      return;
    }
    appManagementApi.editWorkSheetInfoForApp({
      type: 1,
      appId,
      appSectionId: appItem.parentGroupId || groupId,
      workSheetId: appItem.workSheetId,
      ...data
    }).then(res => {
      if ([1, 3].includes(currentPcNaviStyle)) {
        const singleRef = getAppSectionRef(groupId);
        singleRef.dispatch(updateSheetListAppItem(appItem.workSheetId, data));
        store.dispatch(updatePageInfo({ flag: Date.now() }));
      } else {
        props.updateSheetListAppItem(appItem.workSheetId, data);
      }
    });
    onCancel();
  }

  return (
    <Dialog
      visible
      title={_l('编辑外部链接')}
      width={580}
      onOk={handleSave}
      onCancel={onCancel}
    >
      <ExternalLink
        urlTemplate={appItem.urlTemplate}
        configuration={appItem.configuration}
        onChange={(data) => {
          setData(data);
        }}
      />
    </Dialog>
  );
}

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
        customPageType, openType, hideHeaderBar
      },
      urlTemplate
    });
  }, [customPageType, openType, hideHeaderBar, urlTemplate]);

  const handleChange = (err, value, obj) => {
    if (err) {
      return;
    }
    setUrlTemplate(value);
  }

  const genControlTag = (id) => {
    const res = _.flatten(LINK_PARA_FIELDS.map(data => data.fields));
    const field = _.find(res, { value: id });
    return (
      <ControlTag className="flexRow valignWrapper">
        <span className="Font12">{field ? field.text : id}</span>
      </ControlTag>
    );
  }

  return (
    <Fragment>
      {!configuration.customPageType && (
        <Fragment>
          <div className="flexRow alignItemsCenter mTop24 mBottom6">
            <div style={{ width: 75 }}>{_l('类型')}</div>
            <RadioGroupWrap
              data={[
                { value: '1', text: _l('画布') },
                { value: '2', text: _l('外部链接') },
              ]}
              checkedValue={customPageType}
              onChange={value => setCustomPageType(value)}
            />
          </div>
          <div className="Gray_9e" style={{ marginLeft: 75 }}>
            {customPageType === '1' && _l('创建一个画布页面，在页面中添加统计报表、按钮、视图等组件')}
            {customPageType === '2' && _l('将一个已有外部链接作为页面')}
          </div>
        </Fragment>
      )}
      {customPageType === '2' && (
        <Fragment>
          <div className="flexRow mTop24">
            <div style={{ width: 75 }}>{_l('链接')}</div>
            <TagTextareaWrap className="flexRow flex">
              <TagTextarea
                className="flex"
                placeholder={_l('请输入完整链接，以 http:// 或 https:// 开头')}
                defaultValue={urlTemplate}
                height={120}
                maxHeight={240}
                getRef={tagtextarea => {
                  setRef(tagtextarea);
                }}
                renderTag={(id, options) => genControlTag(id)}
                onChange={handleChange}
              />
              <Dropdown
                trigger="click"
                placement="bottomRight"
                overlay={
                  <DropdownContent style={{ width: '180px' }}>
                    {LINK_PARA_FIELDS.map(({ type, title, fields }) => {
                      return (
                        <Fragment key={type}>
                          <div className="title">{title}</div>
                          {fields.map(({ text, value }) => (
                            <div
                              key={value}
                              className="item"
                              onClick={() => {
                                ref.insertColumnTag(value);
                              }}
                            >
                              {text}
                            </div>
                          ))}
                        </Fragment>
                      );
                    })}
                  </DropdownContent>
                }
              >
                <div className="iconWrap Font17 pointer tip-bottom-left" data-tip={_l('使用动态参数')}>
                  <Icon className="Gray_9e" icon="workflow_other" />
                </div>
              </Dropdown>
            </TagTextareaWrap>
          </div>
          <div className="flexRow alignItemsCenter mTop24 mBottom16">
            <div style={{ width: 75 }}>{_l('打开方式')}</div>
            <RadioGroupWrap
              data={[
                {
                  value: '1',
                  text: _l('嵌入页面'),
                  disableTitle: true,
                  children: (
                    <div className="pointer mLeft5" data-tip={_l('嵌入页面时只支持 https:// 开头的链接')} style={{ top: 2 }}>
                      <Icon className="Font18 Gray_9e" icon="info" />
                    </div>
                  )
                },
                { value: '2', text: _l('新窗口打开'), disableTitle: true },
              ]}
              checkedValue={openType}
              onChange={value => setOpenType(value)}
            />
          </div>
          <Checkbox
            style={{ marginLeft: 75 }}
            className={cx({ Visibility: openType === '2' })}
            text={<span>{_l('隐藏标题栏')}</span>}
            checked={hideHeaderBar === '1'}
            onClick={() => {
              setHideHeaderBar(hideHeaderBar === '0' ? '1' : '0');
            }}
          />
        </Fragment>
      )}
    </Fragment>
  );
}


export default ExternalLink;
