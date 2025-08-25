import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import { generate } from '@ant-design/colors';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Checkbox, Icon, Input, TagTextarea, Tooltip } from 'ming-ui';
import Dialog from 'ming-ui/components/Dialog';
import { SYSTEM_LIST, USER_LIST } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/config';
import { getThemeColors } from 'src/utils/project';
import { LINK_PARA_FIELDS, PUBLISH_CONFIG_OPTIONS } from '../constant';

const Wrapper = styled.div`
  margin-top: 8px;
  display: table;
  width: 100%;

  .formItem {
    display: table-row;
    &:last-child {
      .cell {
        padding-bottom: 0 !important;
      }
    }

    .cell {
      display: table-cell;
      padding-bottom: 24px;
    }
    .labelText {
      position: relative;
      line-height: 36px;
      padding-right: 16px;
      padding-left: 8px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      .requiredStar {
        position: absolute;
        left: 0;
        top: 2px;
        color: #f00;
        font-weight: bold;
      }
    }
    .ming.Input {
      font-size: 13px;
    }
  }
`;

const CustomTagTextarea = styled(TagTextarea)`
  &.tagInputarea {
    .tagInputareaIuput {
      border-radius: 3px 0 0 3px;
      height: 120px;
      .CodeMirror {
        .CodeMirror-lines {
          padding: 3px 0;
        }
        .CodeMirror-sizer {
          min-height: auto !important;
        }
        .CodeMirror-placeholder {
          color: #bdbdbd !important;
          margin-left: 8px !important;
          line-height: 27px !important;
        }
        .CodeMirror-code {
          line-height: 28px;
        }
        .CodeMirror-scroll {
          min-height: 118px;
        }
      }
    }
  }
`;

const LinkIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  border: 1px solid #ccc;
  border-left: none;
  border-radius: 0 3px 3px 0;
  cursor: pointer;
  i {
    font-size: 22px;
    color: #9e9e9e;
  }
  &:hover {
    i {
      color: #1677ff;
    }
  }
`;

const PopupWrapper = styled.div`
  width: 320px;
  padding: 6px 0;
  background: #fff;
  overflow: auto;
  border-radius: 3px;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.13),
    0 2px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #eee;
  font-size: 14px;
  div {
    line-height: 36px;
    padding: 0 16px;
  }
  .title {
    font-weight: bold;
  }
  .itemText {
    cursor: pointer;
    &:hover {
      color: #fff;
      background: #1677ff;
    }
  }
  .divider {
    border-top: 1px solid #ddd;
    margin: 6px 0;
  }
`;

const TagWrapper = styled.div`
  display: flex;
  align-items: center;
  border-radius: 16px;
  background: #d8eeff;
  color: #174c76;
  border: 1px solid #bbd6ea;
  padding: 0 12px;
  font-size: 12px;
  box-sizing: border-box;
  height: 24px;
  max-width: 100%;
`;

export default function ExternalLinkDialog(props) {
  const { isEdit, onCancel, projectId, createAppFromEmpty, record, onAppChange } = props;
  const [popupVisible, setPopupVisible] = useState(false);
  const [appInfo, setAppInfo] = useSetState(
    isEdit ? _.omit(record, ['id']) : { pcDisplay: false, webMobileDisplay: true, appDisplay: true },
  );
  const tagTextAreaRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    if (record && record.urlTemplate) {
      tagTextAreaRef.current.setValue(record.urlTemplate);
    }
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const onSave = () => {
    if (!appInfo.name) {
      alert(_l('页面名称不能为空'), 3);
      return;
    }
    if (!appInfo.urlTemplate) {
      alert(_l('链接不能为空'), 3);
      return;
    }
    if (isEdit) {
      onAppChange({ projectId, appId: record.id, ...appInfo }, true);
    } else {
      const COLORS = getThemeColors(projectId);
      const iconColor = COLORS[_.random(0, COLORS.length - 1)];
      const lightColor = generate(iconColor)[0];
      createAppFromEmpty({
        projectId,
        icon: '0_lego',
        iconColor,
        navColor: iconColor,
        lightColor,
        createType: 1, //外部链接类型
        ...appInfo,
      });
    }
    onCancel();
  };

  return (
    <Dialog
      visible
      title={isEdit ? _l('设置外部链接') : _l('添加外部链接')}
      okText={_l('保存')}
      width={640}
      onOk={onSave}
      onCancel={onCancel}
    >
      <Wrapper>
        <div className="formItem">
          <div className="labelText cell">
            <span className="requiredStar">*</span>
            <span>{_l('应用名称')}</span>
          </div>
          <div className="cell w100">
            <Input
              manualRef={inputRef}
              className="w100"
              placeholder={_l('请输入')}
              value={appInfo.name}
              onChange={name => setAppInfo({ name })}
            />
          </div>
        </div>
        <div className="formItem">
          <div className="labelText cell">
            <span className="requiredStar">*</span>
            <span>{_l('链接')}</span>
          </div>
          <div className="cell">
            <div className="flexRow">
              <CustomTagTextarea
                className="flex"
                placeholder={_l('输入完整链接，以http://或https://开头')}
                renderTag={tag => {
                  const tagName = _.get(
                    _.find(USER_LIST.concat(SYSTEM_LIST), i => i.id === tag),
                    'text',
                  );
                  return <TagWrapper className="overflow_ellipsis">{tagName}</TagWrapper>;
                }}
                ref={tagTextAreaRef}
                onChange={(err, value) => setAppInfo({ urlTemplate: value.trim() })}
              />
              <Trigger
                action={['click']}
                popupVisible={popupVisible}
                onPopupVisibleChange={visible => setPopupVisible(visible)}
                popupAlign={{
                  points: ['tr', 'br'],
                  offset: [0, 5],
                  overflow: { adjustX: true, adjustY: true },
                }}
                popup={
                  <PopupWrapper>
                    {LINK_PARA_FIELDS.map(({ type, title, fields }, index) => {
                      return (
                        <Fragment key={type}>
                          <div className="title">{title}</div>
                          {fields.map(({ text, value }) => (
                            <div
                              key={value}
                              className="itemText"
                              onClick={() => tagTextAreaRef && tagTextAreaRef.current.insertColumnTag(value)}
                            >
                              {text}
                            </div>
                          ))}
                          {index === 0 && <div className="divider" />}
                        </Fragment>
                      );
                    })}
                  </PopupWrapper>
                }
              >
                <Tooltip text={_l('使用动态参数')} popupPlacement="bottom">
                  <LinkIcon>
                    <Icon icon="workflow_other" />
                  </LinkIcon>
                </Tooltip>
              </Trigger>
            </div>
          </div>
        </div>
        <div className="formItem">
          <div className="labelText cell">{_l('发布到')}</div>
          <div className="cell">
            <div className="flexRow alignItemsCenter">
              {PUBLISH_CONFIG_OPTIONS.map((item, index) => (
                <Checkbox
                  key={index}
                  className="pRight24"
                  checked={!appInfo[item.key]}
                  onClick={() => setAppInfo({ [item.key]: !appInfo[item.key] })}
                  text={item.text}
                />
              ))}
            </div>
            <div className="Gray_9e  mTop8">{_l('设置用户在哪些设备环境下可见此应用，管理员在PC端始终可见')}</div>
          </div>
        </div>
      </Wrapper>
    </Dialog>
  );
}
