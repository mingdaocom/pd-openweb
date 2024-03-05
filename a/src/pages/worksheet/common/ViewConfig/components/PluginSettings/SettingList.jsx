import React, { createRef, useState, useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import { Icon, Input } from 'ming-ui';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { PARAM_TYPES } from './config';
import './index.less';
import errorBoundary from 'ming-ui/decorators/errorBoundary';

const WrapLi = styled.div`
  height: 36px;
  margin-left: -26px;
  margin-top: 10px;
`;

const SortHandle = SortableHandle(() => <Icon className="mRight10 Font16 Hand Gray_9e" icon="drag" />);

const Item = SortableElement(data => {
  const { type, onEdit, openEdit, onDelete, num, list, key } = data;
  const [{ controlName }, setState] = useSetState({
    controlName: data.controlName,
  });
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
    if (data.controlName) {
      $ref.current.value = data.controlName;
    } else {
      $ref.current.value = '';
    }
    if (data.fieldId && $refFieldId.current) {
      $refFieldId.current.value = data.fieldId;
    }
  }, [data]);
  return (
    <WrapLi className="flexRow alignItemsCenter mBottom10 itemSortLi" key={key}>
      <SortHandle />
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
          defaultValue={data.fieldId}
          manualRef={ref => {
            $refFieldId.current = ref;
          }}
          onBlur={e => {
            let newFieldId = e.target.value.trim();
            if (!!list.find((o, n) => o.fieldId === newFieldId && n !== num)) {
              $refFieldId.current.value = data.fieldId;
              alert(_l('变量id重复'), 3);
              return;
            }
            if (!newFieldId) {
              $refFieldId.current.value = data.fieldId;
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
});
const SortableList = SortableContainer(info => {
  const { items } = info;
  return (
    <div className="">
      {_.map(items, (item, index) => {
        return <Item {...info} {...item} key={'item_' + index} index={index} list={items} num={index} />;
      })}
    </div>
  );
});

function SettingList(props) {
  return <SortableList {...props} />;
}
export default errorBoundary(SettingList);
