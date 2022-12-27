import React, { Fragment } from 'react';
import { string } from 'prop-types';
import OtherField from './OtherField';
import { OtherFieldList, FieldInfo, RelateControl } from '../styled';
import { getDateType, getControlType, showClear, getTypeList } from '../util';
import renderCellText from 'src/pages/worksheet/components/CellControls/renderText';
import _ from 'lodash';
import moment from 'moment';

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
  if (type === 'date' || type === 'time') return item.staticValue;
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

const getPlaceHolder = data => {
  const text = {
    14: _l('请选择'),
    16: _l('请输入日期'),
    26: _l('请输入人员'),
    27: _l('请输入部门'),
    10000008: _l('选择子表或关联记录'),
  };
  return text[data.type];
};

export default ({ dynamicValue = [], onClick, data, removeItem, removeRelateSheet, titleControl, ...rest }) => (
  <OtherFieldList
    isHaveField={isOnlySelect(dynamicValue, data)}
    onClick={onClick}
    isHaveClear={showClear(data, dynamicValue)}
  >
    <Fragment>
      {_.isEmpty(dynamicValue) ? (
        <span className="Gray_c LineHeight20 mTop5">{getPlaceHolder(data)}</span>
      ) : (
        <Fragment>
          {dynamicValue.map(item => {
            if (item.staticValue) {
              const type = getControlType(data);
              try {
                const value = getValue(item, type);
                if (type === 'user') {
                  const { accountId, fullname, avatar, name } = value;

                  if (accountId === 'user-self') {
                    return (
                      <OtherField
                        className="timeField"
                        dynamicValue={dynamicValue}
                        data={data}
                        item={item}
                        text={_l('当前用户')}
                        {...rest}
                      />
                    );
                  }

                  return (
                    <FieldInfo key={accountId}>
                      <img
                        className="avatar"
                        src={
                          _.includes(avatar, 'UserAvatar')
                            ? avatar
                            : `${md.global.FileStoreConfig.pictureHost}UserAvatar/${avatar}`
                        }
                      />
                      <div className="name">{fullname || name}</div>
                      <div
                        className="remove"
                        onClick={e => {
                          e.stopPropagation();
                          removeItem(accountId);
                        }}
                      >
                        <i className="icon-close" />
                      </div>
                    </FieldInfo>
                  );
                }
                if (type === 'role') {
                  const { organizeId, organizeName } = value;

                  return (
                    <FieldInfo key={organizeId}>
                      <div className="departWrap">
                        <i className="icon-group"></i>
                      </div>
                      <div className="name">{organizeName}</div>
                      <div
                        className="remove"
                        onClick={e => {
                          e.stopPropagation();
                          removeItem(organizeId);
                        }}
                      >
                        <i className="icon-close" />
                      </div>
                    </FieldInfo>
                  );
                }
                if (type === 'department') {
                  const { departmentName, departmentId } = value;
                  return (
                    <FieldInfo key={departmentId}>
                      <div className="departWrap">
                        <i className="icon-department1"></i>
                      </div>
                      <div className="name">{departmentName}</div>
                      <div
                        className="remove"
                        onClick={e => {
                          e.stopPropagation();
                          removeItem(departmentId);
                        }}
                      >
                        <i className="icon-close" />
                      </div>
                    </FieldInfo>
                  );
                }
                if (type === 'date' || type === 'time') {
                  const types = getDateType(data);
                  let text = '';
                  if (_.includes(['2', '3'], value)) {
                    text = (_.find(types, type => type.value === value) || {}).text;
                  } else {
                    text = moment(value).format(rest.formatMode);
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
                if (type === 'switch') {
                  const text = _.get(_.find(getTypeList(data), ct => ct.id === item.staticValue) || {}, 'text');
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
                  const removeValue = item.staticValue;
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
                          <span className="overflow_ellipsis">{name}</span>
                          <i
                            className="icon-close"
                            onClick={e => {
                              e.stopPropagation();
                              removeRelateSheet(removeValue);
                            }}
                          ></i>
                        </RelateControl>
                      );
                    });
                  }
                  return (
                    <RelateControl>
                      <i className="icon-link-worksheet" />
                      <span className="overflow_ellipsis">{value}</span>
                      <i
                        className="icon-close"
                        onClick={e => {
                          e.stopPropagation();
                          removeRelateSheet(removeValue);
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
        </Fragment>
      )}
    </Fragment>
    {showClear(data, dynamicValue) && (
      <div
        className="clearOp"
        onClick={e => {
          e.stopPropagation();
          rest.onDynamicValueChange([]);
        }}
      >
        <span className="icon icon-closeelement-bg-circle Font15"></span>
      </div>
    )}
  </OtherFieldList>
);
