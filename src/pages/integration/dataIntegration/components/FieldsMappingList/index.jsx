import React, { useRef } from 'react';
import { useState } from 'react';
import { Select } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Checkbox, Icon, Input, Support } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { ALL_OPERATION_TYPE_DATA } from 'src/pages/integration/dataIntegration/TaskCon/TaskCanvas/config';
import { canSetAsTitle, getIconByType } from 'src/pages/widgetConfig/util';
import { DATABASE_TYPE, isValidName, namePattern, SYSTEM_FIELD_IDS } from '../../constant';
import { isNotSupportField } from '../../utils';
import SelectType from './SelectType';
import SetComment from './SetComment';

const Wrapper = styled.div`
  .headTr,
  .dataItem {
    display: flex;
    align-items: center;
    margin: 0;
    padding: 8px 0px 8px 8px;
    border-bottom: 1px solid #e0e0e0;

    .checkColumn {
      width: 36px;
    }
    .name,
    .dataType {
      width: 0;
      padding-right: 8px;
    }
    .name_dest {
      padding-right: 20px;
    }
    .name_dest,
    .dataType_dest {
      width: 0;
      position: relative;
    }
    .arrowIcon {
      width: 20px;
      height: 20px;
      transform: rotate(-90deg);
      color: #1677ff;
    }
    .numberTips {
      width: 20px;
    }
    .title_dest {
      padding-left: 16px;
    }
  }
  .dataItem {
    .isOperateCommonIcon {
      display: none;
      width: fit-content;
      color: #bdbdbd;
      cursor: pointer;
      &.isActive {
        display: block;
        color: #9e9e9e;
      }
    }
    &:hover {
      background: #fafafa;

      .isOperateCommonIcon {
        display: block;
        i {
          &:hover {
            color: #1677ff;
          }
        }
      }
    }

    .customDisabled {
      .Checkbox-box {
        background: #90caf9 !important;
        border-color: #90caf9 !important;
      }
    }
  }
  .itemWrapper {
    position: relative;
    margin-left: -16px;
    padding-left: 16px;

    .deleteIcon {
      position: absolute;
      left: 0px;
      top: 16px;
      display: none;
      font-size: 16px;
      color: #bdbdbd;
      cursor: pointer;
      &:hover {
        color: #f00;
      }
    }
    &:hover {
      .deleteIcon {
        display: block;
      }
    }
  }
  .ant-select:not(.ant-select-customize-input) .ant-select-selector {
    border-radius: 3px;
    /* border: 1px solid #ccc !important; */
  }
  .systemFieldsHeader {
    display: flex;
    align-items: center;
    padding: 24px 8px 8px 8px;
    border-bottom: 1px solid #e0e0e0;

    .Checkbox {
      width: 36px;
    }
    .content {
      width: fit-content;
      display: flex;
      align-items: center;
      cursor: pointer;
      i {
        color: #ccc;
        font-size: 15px;
        margin-left: 8px;
      }
      &:hover {
        color: #1677ff;
        i {
          color: #1677ff;
        }
      }
    }
  }
`;

const SelectWrapper = styled.div`
  display: flex;
  align-items: center;
  .isNoMatchOption {
    .ant-select-selector .ant-select-selection-item {
      color: #f00;
    }
  }
`;

export default function FieldMappingList(props) {
  const { sourceData = {}, destData = {}, isCreate, fieldsMapping, setFieldsMapping, matchedTypes } = props;
  const selectedFieldIds = fieldsMapping.map(item => _.get(item, 'destField.id')).filter(o => o);
  const selectNameRef = useRef([]);
  const isExistJoinPk = !!(sourceData.sourceFields || []).filter(item => item.isUniquePk).length;
  const systemFieldsExceptRowId = SYSTEM_FIELD_IDS.filter(id => id !== 'rowid');
  let leftColumns = [];
  let rightColumns = [];

  const [systemFieldsExpand, setSystemFieldsExpand] = useState(false);

  const canCheckField = field => {
    return (isValidName(field.name) || !sourceData.isDbType) && matchedTypes && !isNotSupportField(field, matchedTypes);
  };

  const isSystemField = sourceField => {
    return systemFieldsExceptRowId.includes((sourceField.fid || '').split('_')[0]);
  };

  const isCheckAll = isSystemFields => {
    return (
      fieldsMapping.filter(
        item =>
          !_.get(item, 'destField.isCheck') &&
          canCheckField(item.sourceField) &&
          (isSystemFields ? isSystemField(item.sourceField) : !isSystemField(item.sourceField)),
      ).length === 0
    );
  };

  const onCheckAll = (checked, isSystemFields) => {
    const newFieldsMapping = fieldsMapping.map(item => {
      const { sourceField = {}, destField = {} } = item;
      return (isSystemFields ? isSystemField(item.sourceField) : !isSystemField(item.sourceField))
        ? {
            sourceField: {
              ...sourceField,
              isCheck: canCheckField(sourceField) ? (sourceField.isPk ? true : !checked) : false,
            },
            destField: {
              ...destField,
              isCheck: canCheckField(sourceField) ? (destField && destField.isPk ? true : !checked) : false,
            },
          }
        : item;
    });
    setFieldsMapping(newFieldsMapping);
  };

  //更新FieldsMapping
  const updateFieldsMapping = (data, isOnChange) => {
    const newFieldsMapping = (fieldsMapping || []).map(o => {
      if (
        _.get(o, ['sourceField', 'id']) === _.get(data, ['sourceField', 'id']) &&
        _.get(o, ['sourceField', 'alias']) === _.get(data, ['sourceField', 'alias'])
      ) {
        return data;
      } else {
        return o;
      }
    });
    setFieldsMapping && setFieldsMapping(newFieldsMapping, isOnChange);
  };

  const renderInputName = data => {
    const sourceField = data.sourceField || {};
    const destField = data.destField || {};
    const isDisabled =
      !sourceData.isDbType && !destData.isDbType
        ? isExistJoinPk
          ? sourceField.isUniquePk
          : (sourceField.oid || '').split('_')[1] === 'rowid'
        : destData.dsType === DATABASE_TYPE.MONGO_DB && sourceField.isPk;

    return (
      <div className="flexRow alignItemsCenter">
        <Input
          className="flex"
          value={destField.name || ''}
          disabled={isDisabled}
          onBlur={event => {
            const hasRepeatName =
              fieldsMapping.filter(item => _.get(item, 'destField.name') === event.target.value).length > 1;
            if (hasRepeatName) {
              const newName = destField.name + Math.floor(Math.random() * 10000);
              updateFieldsMapping({
                ...data,
                destField: {
                  ...destField,
                  name: newName,
                },
              });
            } else {
              const needReplace = sourceData.isDbType || destData.isDbType;
              updateFieldsMapping({
                ...data,
                destField: {
                  ...destField,
                  name: needReplace ? event.target.value.replace(namePattern, '') : event.target.value,
                },
              });
            }
          }}
          onChange={value =>
            updateFieldsMapping(
              {
                ...data,
                destField: {
                  ...destField,
                  name: value,
                },
              },
              true,
            )
          }
        />
        <div className="numberTips">
          {!sourceData.isDbType && !destData.isDbType && destField.mdType === 6 && (
            <Tooltip title={_l('数值最大支持16位数字')} placement="top">
              <Icon icon="info" className="Gray_bd mLeft5" />
            </Tooltip>
          )}
        </div>
      </div>
    );
  };
  const renderSelectType = data => {
    const { sourceField } = data;
    if (!matchedTypes) return;
    const options = (matchedTypes[sourceField.id] || []).map((o, i) => {
      return {
        ...o,
        key: `${sourceField.id}-${i}`,
        label: (
          <div className="flexRow alignItemsCenter">
            {!destData.isDbType && (
              <Icon icon={getIconByType(o.mdType, false)} className={cx('Font18 Gray_bd customIcon')} />
            )}
            <span title={o.typeName.toLowerCase()} className="Gray mLeft8 w100 overflow_ellipsis">
              {o.typeName.toLowerCase()}
            </span>
          </div>
        ),
        value: destData.isDbType ? o.typeName.toLowerCase() : o.mdType,
      };
    });

    return (
      <SelectType
        isExistJoinPk={isExistJoinPk}
        options={options}
        itemData={data}
        updateFieldsMapping={updateFieldsMapping}
        isDestDbType={destData.isDbType}
      />
    );
  };
  const renderCheckbox = (data, key) => {
    const destField = data.destField || {};
    const sourceField = data.sourceField || {};
    if (!matchedTypes) return;
    const isNotSupport = isNotSupportField(sourceField, matchedTypes);

    return (
      <Checkbox
        size="small"
        //是主键，并且勾选状态样式
        className={cx({ customDisabled: sourceField.isPk && !!destField[key] })}
        checked={!!destField[key]}
        disabled={sourceField.isPk || (key !== 'isNotNull' && (sourceField.disabled || isNotSupport))}
        onClick={() => {
          updateFieldsMapping({
            sourceField: key === 'isCheck' ? { ...sourceField, isCheck: !sourceField.isCheck } : sourceField,
            destField: { ...destField, [key]: !destField[key] },
          });
        }}
      />
    );
  };
  const renderSelectName = data => {
    const destField = data.destField || {};
    const sourceField = data.sourceField || {};
    const isValidField = isValidName(sourceField.name) || !sourceData.isDbType;
    if (!matchedTypes) return;
    const matchedTypeIds = _.uniq((matchedTypes[sourceField.id] || []).map(type => type.dataType));
    const matchedMdTypeIds = _.uniq((matchedTypes[sourceField.id] || []).map(type => type.mdType));
    const isNotSupport = isNotSupportField(sourceField, matchedTypes);

    const filterOptions = destData.isDbType
      ? (destData.destFields || []).filter(o => _.includes(matchedTypeIds, o.jdbcTypeId))
      : (destData.destFields || []).filter(o => _.includes(matchedMdTypeIds, o.mdType));

    const options = filterOptions
      .filter(
        item =>
          !_.includes(
            selectedFieldIds.filter(id => id !== destField.id),
            item.id,
          ),
      ) // 过滤掉已选择的字段
      .map(item => {
        return {
          ...item,
          label: (
            <div className="flexRow alignItemsCenter">
              {destData.isDbType ? (
                <span className="Gray_bd">[{`${item.dataType}`}]</span>
              ) : (
                <Icon icon={getIconByType(item.mdType, false)} className="Gray_9e Font18" />
              )}
              <span title={item.name} className="mLeft8 overflow_ellipsis Gray">
                {item.name}
              </span>
              {destData.isDbType && item.isPk && <Icon icon="key1" className="Gray_bd Font14 mLeft8" />}
            </div>
          ),
          value: item.id,
        };
      });

    const isNoMatchOption =
      destField.id &&
      options.filter(o =>
        destData.isOurCreateTable ? o.value.toLowerCase() === destField.id.toLowerCase() : o.value === destField.id,
      ).length === 0;

    const getValue = () => {
      if (isNoMatchOption) {
        return _l('映射关系失效');
      }
      //如果目的地表是通过我们同步任务创建的表时，id忽略大小写匹配
      if (destData.isOurCreateTable && options.length && destField.id) {
        return (options.filter(o => o.value.toLowerCase() === destField.id.toLowerCase())[0] || {}).value;
      }
      return destField.id;
    };

    return (
      <SelectWrapper ref={select => (selectNameRef.current[sourceField.id] = select)}>
        <Select
          disabled={!isValidField || isNotSupport}
          className={cx('selectItem flex', { isNoMatchOption })}
          placeholder={_l('无')}
          notFoundContent={_l('暂无数据')}
          getPopupContainer={() => selectNameRef.current[sourceField.id]}
          allowClear={true}
          status={isNoMatchOption && 'error'}
          value={getValue()}
          options={options}
          onChange={(value, option = {}) => {
            const updatedMapping = value
              ? {
                  sourceField: { ...sourceField, isCheck: true },
                  destField: {
                    ...destField,
                    id: value,
                    isPk: option.isPk,
                    name: option.name,
                    alias: option.alias,
                    dataType: option.dataType,
                    jdbcTypeId: option.jdbcTypeId,
                    precision: option.precision,
                    scale: option.scale,
                    isCheck: true,
                    isNotNull: option.isNotNull,
                    mdType: option.mdType,
                    controlSetting: option.controlSetting,
                    oid: option.oid,
                  },
                }
              : {
                  sourceField: { ...sourceField, isCheck: sourceField.isPk },
                  destField: {
                    ...destField,
                    id: null,
                    name: null,
                    alias: null,
                    dataType: null,
                    jdbcTypeId: null,
                    precision: null,
                    scale: null,
                    isCheck: false,
                    isNotNull: false,
                    mdType: null,
                    controlSetting: null,
                    oid: null,
                  },
                };
            updateFieldsMapping(updatedMapping);
          }}
        />
        <div className="numberTips">
          {!destData.isDbType && destField.mdType === 6 && (
            <Tooltip title={_l('数值最大支持16位数字')} placement="top" autoAdjustOverflow={true}>
              <Icon icon="info" className="Gray_bd mLeft5" />
            </Tooltip>
          )}
        </div>
      </SelectWrapper>
    );
  };

  const getColumns = () => {
    if (sourceData.isDbType) {
      leftColumns = [
        {
          dataIndex: 'name',
          title: _l('字段(源)'),
          flex: 3,
          render: data => {
            const sourceField = data.sourceField;
            if (!matchedTypes) return;
            const isNotSupport = isNotSupportField(sourceField, matchedTypes);

            return (
              <div className="flexRow">
                <span title={sourceField.name} className={`overflow_ellipsis ${sourceField.isDelete ? 'Red' : ''}`}>
                  {sourceField.name}
                </span>
                {sourceField.aggFuncType && (
                  <span className={`flexShrink0 ${sourceField.isDelete ? 'Red' : 'Gray_9e'}`}>
                    ({ALL_OPERATION_TYPE_DATA.find(o => o.value === sourceField.aggFuncType).text})
                  </span>
                )}
                {sourceField.isPk && (
                  <Tooltip title={_l('主键')}>
                    <div>
                      <Icon icon="key1" className="Gray_bd mLeft5" />
                    </div>
                  </Tooltip>
                )}
                {sourceField.disabled && (
                  <Support
                    type={1}
                    title={_l('名称包含特殊字符，无法同步')}
                    className="Gray_bd mLeft5"
                    href="https://help.mingdao.com/integration/data-integration"
                  />
                )}
                {sourceField.isDelete && (
                  <Tooltip title={_l('字段已删除')}>
                    <div>
                      <Icon icon="info" className="Red mLeft5" />
                    </div>
                  </Tooltip>
                )}
                {isNotSupport && (
                  <Tooltip title={_l('暂不支持同步')}>
                    <div>
                      <Icon icon="info" className="Gray_bd mLeft5" />
                    </div>
                  </Tooltip>
                )}
              </div>
            );
          },
        },
        {
          dataIndex: 'dataType',
          title: _l('类型'),
          flex: 3,
          render: data => {
            const sourceField = data.sourceField;
            let dataType = sourceField.mdType && !sourceField.isUniquePk ? '' : sourceField.dataType; //表字段(有mdType) 不显示datatype
            return (
              <div title={dataType} className="overflow_ellipsis">
                <span>{dataType}</span>
              </div>
            );
          },
        },
        {
          dataIndex: 'isNotNull',
          title: _l('不允许NULL'),
          flex: 3,
          render: data => {
            const item = data.sourceField;
            return item.isNotNull ? <span className="Gray_9e">{_l('是')}</span> : '';
          },
        },
      ];
    } else {
      leftColumns = [
        {
          dataIndex: 'name',
          title: _l('字段(源)'),
          flex: 9,
          render: data => {
            const sourceField = data.sourceField;
            if (!matchedTypes) return;
            const isNotSupport = isNotSupportField(sourceField, matchedTypes);

            return (
              <div className="flexRow alignItemsCenter">
                <Icon icon={getIconByType(sourceField.mdType, false)} className={cx('Font18 Gray_9e')} />
                <span
                  title={sourceField.name}
                  className={`mLeft8 overflow_ellipsis ${sourceField.isDelete ? 'Red' : ''}`}
                >
                  {sourceField.name}
                </span>
                {sourceField.aggFuncType && (
                  <span className={`flexShrink0 ${sourceField.isDelete ? 'Red' : 'Gray_9e'}`}>
                    ({ALL_OPERATION_TYPE_DATA.find(o => o.value === sourceField.aggFuncType).text})
                  </span>
                )}
                {sourceField.isPk && (
                  <Tooltip title={_l('主键')}>
                    <div>
                      <Icon icon="key1" className="Gray_bd mLeft5" />
                    </div>
                  </Tooltip>
                )}
                {sourceField.disabled && (
                  <Support
                    type={1}
                    title={_l('名称包含特殊字符，无法同步')}
                    className="Gray_bd mLeft5"
                    href="https://help.mingdao.com/integration/data-integration"
                  />
                )}
                {sourceField.isDelete && (
                  <Tooltip title={_l('字段已删除')}>
                    <div>
                      <Icon icon="info" className="Red mLeft5" />
                    </div>
                  </Tooltip>
                )}
                {isNotSupport && (
                  <Support
                    type={1}
                    title={_l('暂不支持同步')}
                    className="Gray_bd mLeft5"
                    href="https://help.mingdao.com/integration/data-integration#field-sync-rule"
                  />
                )}
              </div>
            );
          },
        },
      ];
    }

    switch (true) {
      case isCreate && destData.isDbType:
        rightColumns = [
          {
            dataIndex: 'name_dest',
            title: _l('字段名称(目标)'),
            flex: 6,
            render: item => renderInputName(item),
          },
          {
            dataIndex: 'dataType_dest',
            title: _l('类型'),
            flex: 4,
            render: item => renderSelectType(item),
          },
          {
            dataIndex: 'isNotNull_dest',
            title: _l('不允许NULL'),
            flex: 2,
            render: item => renderCheckbox(item, 'isNotNull'),
          },
          {
            dataIndex: 'isPk_dest',
            title: _l('主键'),
            flex: 1,
            render: data => {
              const destField = data.destField || {};
              const sourceField = data.sourceField || {};
              //存在多表连接主键，joinPk显示主键，原主键字段不显示主键标识
              return (isExistJoinPk ? sourceField.isUniquePk : destField.isPk) ? (
                <Tooltip title={_l('主键')}>
                  <div>
                    <Icon icon="key1" className="Font16 Gray_bd" />
                  </div>
                </Tooltip>
              ) : (
                ''
              );
            },
          },
          {
            dataIndex: 'comment_dest',
            title: '',
            flex: 1,
            render: data => {
              const item = data.destField || {};
              return (
                <div className={cx('isOperateCommonIcon', { isActive: !!item.comment })}>
                  <Tooltip title={item.comment ? item.comment : _l('设置字段注释')} placement="left">
                    <div>
                      <SetComment itemData={data} updateFieldsMapping={updateFieldsMapping} />
                    </div>
                  </Tooltip>
                </div>
              );
            },
          },
        ];
        break;
      case isCreate && !destData.isDbType && sourceData.isDbType:
        rightColumns = [
          {
            dataIndex: 'name_dest',
            title: _l('字段名称(目标)'),
            flex: 6,
            render: item => renderInputName(item),
          },
          {
            dataIndex: 'dataType_dest',
            title: _l('类型'),
            flex: 6,
            render: item => renderSelectType(item),
          },
          {
            dataIndex: 'title_dest',
            title: _l('标题字段'),
            flex: 2,
            render: data => {
              const destField = data.destField || {};
              const sourceField = data.sourceField || {};
              const canSetTitle = canSetAsTitle({ type: destField.mdType });
              return canSetTitle ? (
                <Tooltip title={destField.isTitle ? _l('取消设为标题') : _l('设为标题')}>
                  <div className={cx('isOperateCommonIcon', { isActive: destField.isTitle })}>
                    <Icon
                      icon="ic_title"
                      className="Font16"
                      onClick={() => {
                        const newFieldsMapping = fieldsMapping.map(item => {
                          return {
                            sourceField: item.sourceField,
                            destField: {
                              ...item.destField,
                              isTitle: item.sourceField.id === sourceField.id ? !destField.isTitle : false,
                            },
                          };
                        });
                        setFieldsMapping && setFieldsMapping(newFieldsMapping);
                      }}
                    />
                  </div>
                </Tooltip>
              ) : null;
            },
          },
        ];
        break;
      case isCreate && !destData.isDbType && !sourceData.isDbType:
        rightColumns = [
          {
            dataIndex: 'name_dest',
            title: _l('字段名称(目标)'),
            flex: 9,
            render: item => renderInputName(item),
          },
          {
            dataIndex: 'title_dest',
            title: _l('标题字段'),
            flex: 5,
            render: data => {
              const destField = data.destField || {};
              const sourceField = data.sourceField || {};
              const canSetTitle =
                canSetAsTitle({ type: destField.mdType }) &&
                //如果存在joinPk，joinPk字段不允许设为标题，否则rowid不允许设为标题
                (isExistJoinPk ? !sourceField.isUniquePk : (sourceField.oid || '').split('_')[1] !== 'rowid');
              return canSetTitle ? (
                <Tooltip title={destField.isTitle ? _l('取消设为标题') : _l('设为标题')}>
                  <div className={cx('isOperateCommonIcon', { isActive: destField.isTitle })}>
                    <Icon
                      icon="ic_title"
                      className="Font16"
                      onClick={() => {
                        const newFieldsMapping = fieldsMapping.map(item => {
                          return {
                            sourceField: item.sourceField,
                            destField: {
                              ...item.destField,
                              isTitle: item.sourceField.id === sourceField.id ? !destField.isTitle : false,
                            },
                          };
                        });
                        setFieldsMapping && setFieldsMapping(newFieldsMapping);
                      }}
                    />
                  </div>
                </Tooltip>
              ) : null;
            },
          },
        ];
        break;
      case !isCreate && destData.isDbType:
        rightColumns = [
          {
            dataIndex: 'name_dest',
            title: _l('字段名称(目标)'),
            flex: 6,
            render: item => renderSelectName(item),
          },
          {
            dataIndex: 'isNotNull_dest',
            title: _l('不允许NULL'),
            flex: 3,
            render: item => {
              return _.get(item, 'destField.isNotNull') ? <span className="Gray_9e">{_l('是')}</span> : '';
            },
          },
        ];
        break;
      case !isCreate && !destData.isDbType:
        rightColumns = [
          {
            dataIndex: 'name_dest',
            title: _l('字段名称(目标)'),
            flex: 9,
            render: item => renderSelectName(item),
          },
        ];
        break;
      default:
        rightColumns = [];
        break;
    }

    const columns = [
      {
        dataIndex: 'checkColumn',
        renderTitle: () => <Checkbox size="small" checked={isCheckAll()} onClick={checked => onCheckAll(checked)} />,
        render: data => renderCheckbox(data, 'isCheck'),
      },
      ...leftColumns.filter(item => sourceData.dsType !== DATABASE_TYPE.KAFKA || item.dataIndex !== 'isNotNull'),
      {
        dataIndex: 'arrowColumn',
        title: '',
        flex: 3,
        render: data => {
          const sourceField = data.sourceField || {};
          const destField = data.destField || {};
          return (
            <div className={sourceField.isDelete ? 'Red' : cx('arrowIcon', { Gray_c: !destField.isCheck })}>
              <Icon icon={sourceField.isDelete ? 'close' : 'arrow_down'} className="Font20" />
            </div>
          );
        },
      },
      ...rightColumns,
    ];
    if (!isCreate) {
      columns.shift();
    }

    return columns;
  };

  const renderMappingList = isSystemFields => {
    const data = (fieldsMapping || []).filter(field => {
      const originId = (field.sourceField.fid || '').split('_')[0];
      return isSystemFields
        ? _.includes(systemFieldsExceptRowId, originId)
        : !(!sourceData.isDbType && destData.isDbType && _.includes(systemFieldsExceptRowId, originId));
    });

    if (!data.length) {
      return null;
    }

    return (
      <React.Fragment>
        {isSystemFields && !sourceData.isDbType && destData.isDbType && (
          <div className="systemFieldsHeader">
            {isCreate && (
              <Checkbox size="small" checked={isCheckAll(true)} onClick={checked => onCheckAll(checked, true)} />
            )}
            <div className="content" onClick={() => setSystemFieldsExpand(!systemFieldsExpand)}>
              <span>{_l('系统字段')}</span>
              <Icon icon={systemFieldsExpand ? 'arrow-down-border' : 'arrow-right-border'} />
            </div>
          </div>
        )}
        {(!isSystemFields || systemFieldsExpand) &&
          data.map((field, i) => {
            const sourceField = field.sourceField || {};
            return (
              <div className="itemWrapper">
                <div key={i} className="dataItem">
                  {getColumns().map((column, j) => {
                    return (
                      <div key={`${i}-${j}`} style={{ flex: column.flex }} className={`${column.dataIndex}`}>
                        {column.render ? column.render(field, column) : field[column.dataIndex]}
                      </div>
                    );
                  })}
                </div>
                {sourceField.isDelete && (
                  <Icon
                    className="deleteIcon"
                    icon="trash"
                    onClick={() => {
                      const newFieldsMapping = fieldsMapping.filter(item => item.sourceField.id !== sourceField.id);
                      setFieldsMapping(newFieldsMapping);
                    }}
                  />
                )}
              </div>
            );
          })}
      </React.Fragment>
    );
  };

  return (
    <Wrapper>
      <div className="headTr">
        {getColumns().map((item, index) => {
          return (
            <div key={index} style={{ flex: item.flex }} className={`${item.dataIndex}`}>
              {item.renderTitle ? item.renderTitle() : item.title}
            </div>
          );
        })}
      </div>

      {renderMappingList(false)}
      {renderMappingList(true)}
    </Wrapper>
  );
}
