import React, { createRef, useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Icon, Input, SortableList } from 'ming-ui';
import { PARAM_TYPES } from './config';
import './index.less';
import errorBoundary from 'ming-ui/decorators/errorBoundary';

const WrapLi = styled.div`
  height: 36px;
  margin-left: -26px;
  margin-top: 10px;
`;

const Item = data => {
  const { item, onEdit, openEdit, onDelete, list, key, DragHandle } = data;
  const { type, controlName, fieldId, num } = item;

  const $ref = useRef(null);
  const $refFieldId = useRef(null);
  useEffect(() => {
    setTimeout(() => {
      const $dom = $ref.current;
      if (!$dom) return;
      $dom.focus();
    }, 200);
  }, []);
  useEffect(() => {
    if (controlName) {
      $ref.current.value = controlName;
    } else {
      $ref.current.value = '';
    }
    if (fieldId && $refFieldId.current) {
      $refFieldId.current.value = fieldId;
    }
  }, [data]);
  return (
    <WrapLi className="flexRow alignItemsCenter mBottom10 itemSortLi" key={key}>
      <DragHandle className="alignItemsCenter flexRow">
        <Icon className="mRight10 Font16 Hand Gray_9e" icon="drag" />
      </DragHandle>
      <div
        className="typeTxt WordBreak overflow_ellipsis"
        title={(PARAM_TYPES.find(o => o.type === type) || {}).paramName}
      >
        {(PARAM_TYPES.find(o => o.type === type) || {}).paramName}
      </div>
      <Input
        className="flex mLeft12 placeholderColor"
        defaultValue={controlName}
        placeholder={_l('请输入')}
        onBlur={e => {
          let value = e.target.value.trim();
          if (controlName !== value) {
            onEdit({ controlName: value }, num);
          }
          e.stopPropagation();
        }}
        manualRef={ref => {
          $ref.current = ref;
        }}
      />
      {[22, 201].includes(type) ? (
        <div className="flex mLeft12" style={{ minWidth: 130 }}></div>
      ) : (
        <Input
          className="flex mLeft12 placeholderColor"
          defaultValue={fieldId}
          manualRef={ref => {
            $refFieldId.current = ref;
          }}
          onBlur={e => {
            let newFieldId = e.target.value.trim();
            if (!!list.find((o, n) => o.fieldId === newFieldId && n !== num)) {
              $refFieldId.current.value = fieldId;
              alert(_l('变量id重复'), 3);
              return;
            }
            if (!newFieldId) {
              $refFieldId.current.value = fieldId;
              // alert(_l('变量id必填'), 3);
            } else {
              onEdit({ fieldId: newFieldId }, num);
            }
            e.stopPropagation();
          }}
        />
      )}
      <div className="actionCon">
        <Icon
          className="Font16 Hand editIcon mLeft15"
          icon="new_mail"
          onClick={() => {
            setTimeout(() => {
              openEdit(num);
            }, 500);
          }}
        />
        <Icon
          className="Font16 Hand mLeft15 del"
          icon="delete2"
          onClick={() => {
            onDelete(num);
          }}
        />
      </div>
    </WrapLi>
  );
};

function SettingList(props) {
  return (
    <SortableList
      useDragHandle
      canDrag
      items={props.items.map((o, i) => {
        return { ...o, num: i };
      })}
      itemKey="num"
      onSortEnd={(newItems = [], newIndex) => {
        props.onSortEnd(newItems, false);
      }}
      itemClassName="boderRadAll_4"
      renderItem={options => <Item {...props} {...options} key={'item_' + options.num} list={props.items} />}
    />
  );
}
export default errorBoundary(SettingList);
