import React from 'react';
import { string } from 'prop-types';
import OtherField from './OtherField';
import { OtherFieldList, UserInfo, RelateControl } from '../styled';
import { getDateType, getControlType } from '../util';
import { renderCellText } from 'src/pages/worksheet/components/CellControls';

const isOnlySelect = (dynamicValue, data) => {
  const type = getControlType(data);
  if (type === 'text') return false;
  if (type === 'user') {
    if (data.enumDefault === 1 && dynamicValue.length < 1) return true;
    return false;
  }
  return _.some(dynamicValue, item => !!item.cid);
};

const getValue = (item, type) => {
  if (type === 'date') return item.staticValue;
  if (type === 'relateSheet') {
    return item.relateSheetName || JSON.parse(item.staticValue);
  }
  return typeof item.staticValue === 'string' ? JSON.parse(item.staticValue) : item.staticValue;
};

const parseValue = value => {
  if (_.isArray(value)) return value;
  try {
    if (typeof value === 'string' && _.isArray(JSON.parse(value))) return JSON.parse(value);
  } catch (error) {
    return value;
  }
  return value;
};
export default ({ dynamicValue = [], onClick, data, removePerson, removeRelateSheet, titleControl, ...rest }) => (
  <OtherFieldList isHaveField={isOnlySelect(dynamicValue, data)} onClick={onClick}>
    {dynamicValue.map(item => {
      if (item.staticValue) {
        const type = getControlType(data);
        try {
          const value = getValue(item, type);
          if (type === 'user') {
            const { accountId, fullname, avatar, name } = value;
            return (
              <UserInfo key={accountId}>
                <img
                  className="avatar"
                  src={_.includes(avatar, 'UserAvatar') ? avatar : `https://pic.mingdao.com/UserAvatar/${avatar}`}
                />
                <div className="fullName">{fullname || name}</div>
                <div
                  className="removePerson"
                  onClick={e => {
                    e.stopPropagation();
                    removePerson(accountId);
                  }}
                >
                  <i className="icon-close" />
                </div>
              </UserInfo>
            );
          }
          if (type === 'date') {
            const types = getDateType(data);
            let text = '';
            if (_.includes(['2', '3'], value)) {
              text = (_.find(types, type => type.value === value) || {}).text;
            } else {
              text = data.type === 16 ? value : value.split(' ')[0];
            }
            return (
              <OtherField
                className="timeField"
                dynamicValue={dynamicValue}
                data={data}
                item={item}
                text={text}
                {...rest}
              />
            );
          }
          if (type === 'relateSheet') {
            const parsedValue = parseValue(value);
            if (_.isArray(parsedValue)) {
              return parsedValue.map(item => {
                let name;
                if (_.isObject(item)) {
                  name = item.fullname || item.name;
                } else {
                  const record = JSON.parse(item);
                  const titleControlItem = record[titleControl.controlId];
                  name = renderCellText({ ...titleControl, value: titleControlItem });
                  // 处理关联表默认记录的标题字段是人员字段情况
                  if (/\[\{['"]accountId["']:\s*['"].*['"].*\}\]/.test(titleControlItem)) {
                    const firstUser = _.head(JSON.parse(titleControlItem));
                    name = firstUser.fullname || firstUser.name;
                  }
                }

                return (
                  <RelateControl>
                    <i className="icon-link-worksheet" />
                    <span>{name}</span>
                    <i
                      className="icon-close"
                      onClick={e => {
                        e.stopPropagation();
                        removeRelateSheet();
                      }}
                    ></i>
                  </RelateControl>
                );
              });
            }
            return (
              <RelateControl>
                <i className="icon-link-worksheet" />
                <span>{value}</span>
                <i
                  className="icon-close"
                  onClick={e => {
                    e.stopPropagation();
                    removeRelateSheet();
                  }}
                ></i>
              </RelateControl>
            );
          }
          return <OtherField dynamicValue={dynamicValue} data={data} item={item} {...rest} />;
        } catch (error) {
          console.log(error);
          return null;
        }
      } else {
        return <OtherField dynamicValue={dynamicValue} data={data} item={item} {...rest} />;
      }
    })}
  </OtherFieldList>
);
