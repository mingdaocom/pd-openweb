import React, { useEffect, useRef } from 'react';
import { SortableList } from 'ming-ui';
import styled from 'styled-components';
import renderCellText from 'src/pages/worksheet/components/CellControls/renderText';
import './index.less';
import { isArray } from 'lodash';
import { isSameType } from 'src/pages/worksheet/common/ViewConfig/util.js';
import Item from './Item';
const Wrap = styled.div``;

export default function (props) {
  const { setting, onChange, projectId, maxCount } = props;

  const onUpdateSetting = (data, index) => {
    if (!data) {
      onChange(setting.filter(o => o !== 'add'));
    } else if (isArray(data)) {
      const key = isSameType([26], props.controlInfo)
        ? 'accountId'
        : isSameType([27], props.controlInfo)
          ? 'departmentId'
          : 'organizeId';
      const ids = setting.map(oo => oo[key]);
      setting.splice(index + 1, 0, ...data.filter(ii => !ids.includes(ii[key])));
      onChange(maxCount ? setting.slice(0, maxCount) : setting);
    } else {
      let index = null;
      let list = setting.map((o, i) => {
        if (o === 'add') {
          index = i + 1;
          if (isSameType([29], props.controlInfo)) {
            const control = ((props.controlInfo || {}).relationControls || []).find(it => it.attribute === 1);
            return {
              rowid: data.rowid,
              name: renderCellText({ ...control, value: data[control.controlId] }) || _l('未命名'),
            };
          }
          if (isSameType([9, 10, 11], props.controlInfo)) {
            return (props.controlInfo.options.find(ii => ii.key === data.key) || {}).key;
          }
          return data;
        } else {
          return o;
        }
      });
      const dataList = maxCount ? list.slice(0, maxCount) : list;
      index && dataList.splice(index, 0, 'add');
      onChange(dataList);
    }
  };

  const onAdd = index => {
    setting.splice(index + 1, 0, 'add');
    onChange(setting);
  };

  const renderList = () => {
    const items = setting.map((o, i) => {
      return { info: o.info ? o.info : o, num: i };
    });
    return (
      <React.Fragment>
        {items.map((o, i) => {
          return (
            <Item
              setting={setting}
              key={`ListCom_${o.info === 'add' ? 'add' : i}`}
              {...props}
              item={o}
              onUpdate={onUpdateSetting}
              onAdd={index => onAdd(index)}
              DragHandle={({ children }) => <span>{children}</span>}
            />
          );
        })}
      </React.Fragment>
    );
  };

  return (
    <Wrap>
      <div className="sortCustom mTop6">
        {!!setting.find(o => o === 'add') ? (
          renderList()
        ) : (
          <SortableList
            {...props}
            items={setting.map((o, i) => {
              return { info: o.info ? o.info : o, num: i };
            })}
            useDragHandle
            itemKey="num"
            onSortEnd={setting => onChange(setting.map(o => o.info))}
            helperClass={'sortCustomFile'}
            renderItem={options => (
              <Item
                {...props}
                {...options}
                setting={setting}
                onAdd={index => onAdd(index)}
                onUpdate={(data, index) => onUpdateSetting(data, index)}
                onDelete={data =>
                  onChange(
                    setting.filter(o =>
                      isSameType([9, 10, 11, 28], props.controlInfo)
                        ? o !== data
                        : isSameType([27], props.controlInfo)
                          ? o.departmentId !== data.departmentId
                          : isSameType([26], props.controlInfo)
                            ? o.accountId !== data.accountId
                            : o.rowid !== data.rowid,
                    ),
                  )
                }
              />
            )}
          />
        )}
      </div>
    </Wrap>
  );
}
