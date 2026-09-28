import React, { Fragment, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { SortableList } from 'ming-ui';
import { Checkbox, Input, Modal, Radio, Tooltip } from 'ming-ui/antd-components';

const OPINION_TEXTAREA_AUTO_SIZE = { minRows: 1, maxRows: 5 };

const SortableItemBox = styled.div`
  padding: 1px 0;
  .ant-radio-label {
    display: none;
  }
  .ant-radio-inner {
    margin-right: 0 !important;
  }
  .icon-trash {
    &:hover {
      color: var(--color-error) !important;
    }
  }
`;

const Btn = styled.div`
  display: inline-block;
  height: 32px;
  line-height: 32px;
  border: 1px solid var(--color-border-primary);
  border-radius: 4px;
  padding: 0 20px;
  background: var(--color-background-secondary);
  cursor: pointer;
  color: var(--color-text-secondary);
  &:hover {
    border-color: var(--color-primary);
  }
`;

export default ({ title, description, keys, opinionTemplate, onSave, onClose }) => {
  const [inputType, setType] = useState(opinionTemplate.inputType);
  const [data, setData] = useState(opinionTemplate.opinions);

  const checkOKDisabled = () => {
    let hasTemplate = false;

    keys.forEach(({ key }) => {
      if (data[key] && !!data[key].filter(item => !!item.value.trim()).length) {
        hasTemplate = true;
      }
    });

    return inputType !== 1 && !hasTemplate;
  };

  const renderItem = ({ items, item, index, DragHandle, dragging, sourceKey }) => {
    return (
      <SortableItemBox className="flexRow mTop10 alignItemsCenter">
        <DragHandle>
          <Tooltip title={dragging ? '' : _l('拖拽调整排序')}>
            <i className="icon-drag Font16 textSecondary hoverColorPrimary" style={{ cursor: 'move' }} />
          </Tooltip>
        </DragHandle>
        <Input.TextArea
          autoSize={OPINION_TEXTAREA_AUTO_SIZE}
          className="flex mLeft10"
          defaultValue={item.value}
          onChange={event =>
            setData(
              Object.assign({}, data, {
                [sourceKey]: items.map((o, i) => {
                  if (i === index) {
                    o.value = event.target.value;
                  }

                  return o;
                }),
              }),
            )
          }
        />

        <Tooltip title={_l('设为默认值')}>
          <div className="mLeft15">
            <Radio
              className="mRight0"
              checked={item.selected}
              onChange={() =>
                setData(
                  Object.assign({}, data, {
                    [sourceKey]: items.map((o, i) => {
                      o.selected = i === index ? !item.selected : false;
                      return o;
                    }),
                  }),
                )
              }
            />
          </div>
        </Tooltip>

        <Tooltip title={_l('删除')}>
          <i
            className="icon-trash Font16 textSecondary pointer mLeft10"
            onClick={() => {
              const newSource = _.cloneDeep(items);
              _.remove(newSource, (o, i) => i === index);
              setData(Object.assign({}, data, { [sourceKey]: newSource }));
            }}
          />
        </Tooltip>
      </SortableItemBox>
    );
  };

  return (
    <Modal
      open
      width={640}
      className="workflowDialogBox workflowSettings"
      mask={{ closable: false }}
      title={
        <Fragment>
          <div>{title}</div>
          {description && <div className="Font13 Normal textSecondary mTop8">{description}</div>}
        </Fragment>
      }
      okDisabled={checkOKDisabled()}
      onOk={() => {
        const newOpinions = {};

        keys.forEach(({ key }) => {
          newOpinions[key] = (data[key] || [])
            .map(item => {
              item.value = item.value.trim();
              delete item.uniqId;
              return item;
            })
            .filter(item => !!item.value);
        });

        onSave({ inputType, opinions: newOpinions });
        onClose();
      }}
      onCancel={onClose}
    >
      <div className="Bold">{_l('输入方式')}</div>
      <div className="mTop10 flexRow">
        <Checkbox
          className="InlineFlex"
          checked={inputType === 1}
          onChange={event => setType(event.target.checked ? 1 : 2)}
        >
          {_l('用户自由输入')}
        </Checkbox>
      </div>

      {keys.map((item, index) => {
        return (
          <Fragment key={index}>
            <div className="mTop25 bold">{item.text}</div>
            {data[item.key] && !!data[item.key].length && (
              <SortableList
                renderBody
                useDragHandle
                items={data[item.key].map(o => ({ ...o, uniqId: o.uniqId || uuidv4() }))}
                itemKey="uniqId"
                renderItem={options => renderItem({ ...options, sourceKey: item.key })}
                onSortEnd={newItems => {
                  setData(Object.assign({}, data, { [item.key]: newItems }));
                }}
              />
            )}
            <div className="mTop15">
              <Btn
                onClick={() =>
                  setData(
                    Object.assign({}, data, {
                      [item.key]: (data[item.key] || []).concat({ selected: false, value: '' }),
                    }),
                  )
                }
              >
                + {_l('模板')}
              </Btn>
            </div>
          </Fragment>
        );
      })}
    </Modal>
  );
};
