import React, { Fragment, useState } from 'react';
import { Radio, Dialog, Textarea, Checkbox, SortableList } from 'ming-ui';
import { Tooltip } from 'antd';
import styled from 'styled-components';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';

const SortableItemBox = styled.div`
  padding: 1px 0;
  .Radio-text {
    display: none;
  }
  .Radio-box {
    margin-right: 0 !important;
  }
  .icon-delete2 {
    &:hover {
      color: #f44336 !important;
    }
  }
`;

const Btn = styled.div`
  display: inline-block;
  height: 32px;
  line-height: 32px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0 20px;
  background: #f5f5f5;
  cursor: pointer;
  color: #757575;
  &:hover {
    border-color: #2196f3;
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
            <i className="icon-drag Font16 Gray_75 ThemeHoverColor3" style={{ cursor: 'move' }} />
          </Tooltip>
        </DragHandle>
        <Textarea
          className="flex mLeft10 Font13"
          style={{ paddingTop: 7, paddingBottom: 7 }}
          minHeight={0}
          maxHeight={120}
          defaultValue={item.value}
          onChange={value =>
            setData(
              Object.assign({}, data, {
                [sourceKey]: items.map((o, i) => {
                  if (i === index) {
                    o.value = value;
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
              onClick={() =>
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
            className="icon-delete2 Font16 Gray_75 pointer mLeft10"
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
    <Dialog
      visible
      width={640}
      className="workflowDialogBox workflowSettings"
      style={{ overflow: 'initial' }}
      overlayClosable={false}
      type="scroll"
      title={title}
      description={description}
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
          text={_l('用户自由输入')}
          onClick={checked => setType(!checked ? 1 : 2)}
        />
      </div>

      {keys.map((item, index) => {
        return (
          <Fragment key={index}>
            <div className="mTop25 bold">{item.text}</div>
            {data[item.key] && !!data[item.key].length && (
              <SortableList
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
    </Dialog>
  );
};
