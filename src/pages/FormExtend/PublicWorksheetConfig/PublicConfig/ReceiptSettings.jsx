import React, { Fragment, useState } from 'react';
import copy from 'copy-to-clipboard';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, RichText } from 'ming-ui';
import { Input, Popover, Radio } from 'ming-ui/antd-components';
import DynamicFieldTextarea from 'src/pages/FormExtend/common/DynamicFieldTextarea';
import { getIconByType } from 'src/utils/domain/control/metadata';
import { SUBMIT_AFTER_OPTIONS } from '../../enum';
import SectionTitle from './SectionTitle';

const SelectControlWrap = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 0px 3px 3px 0px;
  border: 1px solid var(--color-border-secondary);
  border-left: none;
`;

const ContentWrap = styled.div`
  .receiptWrap {
    .richTextCon {
      width: calc(100% - 36px);
      .ck .ck-blurred,
      .ck .ck-sticky-panel .ck-toolbar {
        border-color: var(--color-border-secondary) !important;
      }
      .ck.ck-editor__top .ck-dropdown__panel.ck-dropdown__panel_sw {
        width: 521px;
      }
      .ck .ck-content {
        border-radius: 3px 0 3px 3px !important;
      }
    }
  }
`;

const PopupWrap = styled.div`
  overflow: hidden;
  padding: 6px 0;
  .searchCon {
    border-bottom: 1px solid var(--color-background-secondary);
  }
  ul {
    max-height: 200px;
    overflow-y: scroll;
    overflow-x: hidden;
    li {
      height: 36px;
      padding: 0 13px;
      color: var(--color-text-title);
      .Icon {
        color: var(--color-text-disabled);
      }
      &:hover {
        background: var(--color-primary);
        color: var(--color-white);
        .Icon {
          color: var(--color-white);
        }
      }
    }
  }
`;

const ReceiptFilterType = [36, 33, 42, 43, 47, 45, 34, 22, 52];

function ReceiptSettings(props) {
  const { titleFolded, data, controls, setState, handleUpdateExpandDatas } = props;
  const afterSubmit = safeParse(data);
  const [search, setSearch] = useState(undefined);
  const [visible, setVisible] = useState(false);

  const handleClick = control => {
    setVisible(false);
    copy(`#{${control.controlId}}`, { format: 'text/plain' });
    alert(_l('已复制'));
  };

  const handleUpdate = value => handleUpdateExpandDatas({ afterSubmit: JSON.stringify({ ...afterSubmit, ...value }) });

  const renderPopup = list => {
    return (
      <PopupWrap style={{ width: 506 }}>
        <Fragment>
          <div className="headerText mTop6 textSecondary Font12 pLeft12 mBottom4">
            {_l('点击复制字段代码，粘贴到需要的位置')}
          </div>
          <div className="searchCon flexRow alignItemsCenter">
            <Input
              autoFocus
              className="flex"
              variant="borderless"
              prefix={<Icon icon="search" className="textTertiary Font14" />}
              placeholder={_l('搜索')}
              value={search}
              onChange={event => {
                setSearch(event.target.value);
              }}
            />
          </div>
        </Fragment>
        <ul>
          {list
            .filter(l => _.toLower(l.controlName).includes(_.toLower(search || '')))
            .map(control => (
              <li
                key={`receipt-${control.controlId}`}
                className="valignWrapper Hand"
                onClick={() => handleClick(control)}
              >
                <Icon icon={getIconByType(control.type)} className="Font16 mRight9" />
                <span className="overflow_ellipsis flex">{control.controlName}</span>
              </li>
            ))}
        </ul>
      </PopupWrap>
    );
  };

  const renderSelectControlCode = () => {
    return (
      <Popover
        noPadding
        trigger="click"
        open={visible}
        onOpenChange={setVisible}
        placement="bottomRight"
        content={renderPopup(controls.filter(l => !ReceiptFilterType.includes(l.type)))}
      >
        <SelectControlWrap className="valignWrapper justifyContentCenter Hand textTertiary hoverColorPrimary">
          <Icon icon="workflow_other" className="Font20" />
        </SelectControlWrap>
      </Popover>
    );
  };

  const renderLink = () => {
    const content = safeParse(afterSubmit.content) || {};
    const value =
      content.isControl && _.get(content, 'value.controlId') ? `$${content.value.controlId}$` : content.value || '';

    return (
      <DynamicFieldTextarea
        value={value}
        controlList={controls.filter(l => l.type === 2)}
        onChange={value => handleUpdate({ content: JSON.stringify({ value }) })}
      />
    );
  };

  return (
    <Fragment>
      <SectionTitle
        className="mBottom16"
        title={_l('表单填写成功回执')}
        isFolded={titleFolded.receipt}
        onClick={() => {
          setState({
            titleFolded: Object.assign({}, titleFolded, { receipt: !titleFolded.receipt }),
          });
        }}
      />
      {!titleFolded.receipt && (
        <Fragment>
          <div className="mLeft25">
            {SUBMIT_AFTER_OPTIONS.map(l => (
              <Radio
                key={`receiptRadio-${l.value}`}
                value={l.value}
                checked={afterSubmit.action === l.value}
                onChange={() =>
                  handleUpdate({
                    action: l.value,
                    content: '',
                  })
                }
                title={l.label}
              >
                {l.label}
              </Radio>
            ))}
            <ContentWrap className="mTop16">
              {afterSubmit.action === 2 ? (
                renderLink()
              ) : (
                <div className="flexRow receiptWrap">
                  <div className="flex richTextCon">
                    <RichText
                      maxWidth={580}
                      maxHeight={600}
                      dropdownPanelPosition={{ left: '0px', right: 'initial' }}
                      data={afterSubmit.content || ''}
                      onSave={value => handleUpdate({ content: value })}
                    />
                  </div>
                  {renderSelectControlCode()}
                </div>
              )}
            </ContentWrap>
          </div>
        </Fragment>
      )}
    </Fragment>
  );
}

export default ReceiptSettings;
