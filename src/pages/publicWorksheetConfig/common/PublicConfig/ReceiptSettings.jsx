import React, { Fragment, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import Trigger from 'rc-trigger';
import copy from 'copy-to-clipboard';
import { RichText, Radio, Icon, Input } from 'ming-ui';
import SectionTitle from './SectionTitle';
import { SUBMIT_AFTER_OPTIONS } from '../../enum';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { getVisibleControls } from 'src/pages/Print/util';

const SelectControlWrap = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 0px 3px 3px 0px;
  border: 1px solid #e0e0e0;
  border-left: none;
`;

const ContentWrap = styled.div`
  .receiptWrap {
    .richTextCon {
      width: calc(100% - 36px);
      .ck .ck-blurred,
      .ck .ck-sticky-panel .ck-toolbar {
        border-color: #e0e0e0 !important;
      }
      .ck.ck-editor__top .ck-dropdown__panel.ck-dropdown__panel_sw {
        width: 521px;
      }
      .ck .ck-content {
        border-radius: 3px 0 3px 3px !important;
      }
    }
  }
  .submitLinkWrap {
    .inputCon {
      height: 36px;
      border-radius: 3px 0px 0px 3px;
      border: 1px solid #dddddd;
      input {
        height: 100% !important;
      }
      .selectCon {
        justify-content: space-between;
        height: 100%;
        padding: 0 10px;
        .tag {
          height: 24px;
          line-height: 24px;
          border-radius: 24px;
          background: #d8eeff;
          color: #174c76;
          border: 1px solid #bbd6ea;
          padding: 0px 12px;
          font-size: 12px;
          box-sizing: border-box;
        }
      }
    }
  }
`;

const PopupWrap = styled.div`
  background: #fff;
  border-radius: 3px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.26);
  overflow: hidden;
  padding: 6px 0;
  .searchCon {
    border-bottom: 1px solid #f5f5f5;
  }
  ul {
    max-height: 200px;
    overflow-y: scroll;
    overflow-x: hidden;
    li {
      height: 36px;
      padding: 0 13px;
      color: #151515;
      .Icon {
        color: #bdbdbd;
      }
      &:hover {
        background: #2196f3;
        color: #fff;
        .Icon {
          color: #fff;
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
  const visibleControls = getVisibleControls(controls);

  const handleClick = (control, type = 1) => {
    setVisible(false);

    if (type) {
      copy(`#{${control.controlId}}`, { format: 'text/plain' });
      alert(_l('已复制'));
    } else {
      handleUpdate({
        content: JSON.stringify({ isControl: true, value: _.pick(control, ['controlId', 'controlName']) }),
      });
    }
  };

  const handleUpdate = value => handleUpdateExpandDatas({ afterSubmit: JSON.stringify({ ...afterSubmit, ...value }) });

  const renderPopup = (list, type = 1) => {
    return (
      <PopupWrap style={{ width: type ? 506 : 230 }}>
        {!!type && (
          <Fragment>
            <div className="headerText mTop6 Gray_75 Font12 pLeft12 mBottom4">
              {_l('点击复制字段代码，粘贴到需要的位置')}
            </div>
            <div className="searchCon flexRow alignItemsCenter">
              <Icon icon="search" className="mLeft8 Gray_9d Font14" />
              <Input
                autoFocus
                className="flex Border0 placeholderColor Gray Font12"
                placeholder={_l('搜索')}
                value={search}
                onChange={value => {
                  setSearch(value);
                }}
              />
            </div>
          </Fragment>
        )}
        <ul>
          {list
            .filter(l => _.toLower(l.controlName).includes(_.toLower(search || '')))
            .map(control => (
              <li
                key={`receipt-${control.controlId}`}
                className="valignWrapper Hand"
                onClick={() => handleClick(control, type)}
              >
                <Icon icon={getIconByType(control.type)} className="Font16 mRight9" />
                <span className="overflow_ellipsis flex">{control.controlName}</span>
              </li>
            ))}
        </ul>
      </PopupWrap>
    );
  };

  const renderSelectControlCode = (type = 0) => {
    return (
      <Trigger
        action={['click']}
        popupVisible={visible}
        onPopupVisibleChange={visible => setVisible(visible)}
        popupAlign={{
          points: ['tr', 'br'],
          offset: [0, 5],
          overflow: { adjustX: true, adjustY: true },
        }}
        popup={renderPopup(
          type
            ? visibleControls.filter(l => !ReceiptFilterType.includes(l.type))
            : visibleControls.filter(l => l.type === 2),
          type,
        )}
      >
        <SelectControlWrap className="valignWrapper justifyContentCenter Hand Gray_9e Hover_21">
          <Icon icon="workflow_other" className="Font20" />
        </SelectControlWrap>
      </Trigger>
    );
  };

  const renderLink = () => {
    const content = safeParse(afterSubmit.content);

    return (
      <div className="valignWrapper submitLinkWrap">
        {
          <div className="inputCon flex">
            {!_.isEmpty(content) && content.isControl && !!content.value ? (
              <div className="valignWrapper selectCon">
                <span className="tag">{content.value.controlName}</span>
                <Icon
                  icon="delete"
                  className="Hover_21 Hand Font16 Gray_75"
                  onClick={() => handleUpdate({ content: JSON.stringify({ isControl: false, value: '' }) })}
                />
              </div>
            ) : (
              <Input
                autoFocus
                className="w100 Border0 placeholderColor Gray"
                value={content.value}
                onChange={value => {
                  handleUpdate({ content: JSON.stringify({ isControl: false, value: value }) });
                }}
              />
            )}
          </div>
        }
        {renderSelectControlCode(0)}
      </div>
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
                text={l.label}
                value={l.value}
                checked={afterSubmit.action === l.value}
                onClick={() => handleUpdate({ action: l.value, content: '' })}
              />
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
                  {renderSelectControlCode(1)}
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
