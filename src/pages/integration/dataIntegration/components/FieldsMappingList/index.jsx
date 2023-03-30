import React, { useRef } from 'react';
import styled from 'styled-components';
import { Icon, Checkbox, Input } from 'ming-ui';
import { Select } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import { getIconByType, canSetAsTitle } from 'src/pages/widgetConfig/util';
import SelectType from './SelectType';
import SetComment from './SetComment';
import { namePattern } from '../../constant';

const Wrapper = styled.div`
  .headTr,
  .dataItem {
    display: flex;
    align-items: center;
    margin: 0;
    padding: 8px 0px 8px 8px;
    border-bottom: 1px solid #e0e0e0;

    .name {
      div {
        width: 120px;
        padding-right: 8px;
      }
      .pkTip {
        width: fit-content;
      }
    }
    .name_dest,
    .dataType_dest {
      padding-right: 20px;
      position: relative;
    }

    .arrowIcon {
      width: 20px;
      height: 20px;
      transform: rotate(-90deg);
      color: #2196f3;
    }
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
            color: #2196f3;
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
  .ant-select:not(.ant-select-customize-input) .ant-select-selector {
    border-radius: 3px;
    /* border: 1px solid #ccc !important; */
  }
`;

export default function FieldMappingList(props) {
  const { sourceData = {}, destData = {}, isCreate, fieldsMapping, setFieldsMapping, matchedTypes } = props;
  const checkAll = fieldsMapping.filter(item => !item.destField.isCheck).length === 0;
  const selectedFieldIds = fieldsMapping.map(item => item.destField.id).filter(o => o);
  const selectNameRef = useRef();

  let leftColumns = [];
  let rightColumns = [];

  //更新FieldsMapping
  const updateFieldsMapping = data => {
    const newFieldsMapping = (fieldsMapping || []).map(o => {
      if (_.get(o, ['sourceField', 'id']) === _.get(data, ['sourceField', 'id'])) {
        return data;
      } else {
        return o;
      }
    });
    setFieldsMapping && setFieldsMapping(newFieldsMapping);
  };

  const renderInputName = data => {
    const destField = data.destField || {};

    return (
      <Input
        className="w100"
        value={destField.name || ''}
        onBlur={event => {
          const hasRepeatName = fieldsMapping.filter(item => item.destField.name === event.target.value).length > 1;
          if (hasRepeatName) {
            const newName = destField.name + Math.floor(Math.random() * 10000);
            updateFieldsMapping({
              ...data,
              destField: {
                ...destField,
                name: newName,
                alias: newName,
              },
            });
          } else {
            updateFieldsMapping({
              ...data,
              destField: {
                ...destField,
                name: event.target.value.replace(namePattern, ''),
                alias: event.target.value.replace(namePattern, ''),
              },
            });
          }
        }}
        onChange={value =>
          updateFieldsMapping({
            ...data,
            destField: {
              ...destField,
              name: value,
              alias: value,
            },
          })
        }
      />
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
            <span className="Gray mLeft8">{o.typeName.toLowerCase()}</span>
          </div>
        ),
        value: destData.isDbType ? o.typeName.toLowerCase() : o.mdType,
      };
    });

    return (
      <SelectType
        options={options}
        itemData={data}
        updateFieldsMapping={updateFieldsMapping}
        isDestDbType={destData.isDbType}
      />
    );
  };
  const renderCheckAll = () => {
    return (
      <Checkbox
        size="small"
        checked={checkAll}
        onClick={checked => {
          const newFieldsMapping = fieldsMapping.map(item => {
            return {
              sourceField: { ...item.sourceField, isCheck: item.sourceField.isPk ? true : !checked },
              destField: {
                ...item.destField,
                isCheck: item.destField.isPk ? true : !checked,
              },
            };
          });
          setFieldsMapping(newFieldsMapping);
        }}
      />
    );
  };
  const renderCheckbox = (data, key) => {
    const destField = data.destField || {};
    const sourceField = data.sourceField || {};

    return (
      <Checkbox
        size="small"
        className={cx({ customDisabled: sourceField.isPk })}
        checked={!!destField[key]}
        disabled={sourceField.isPk}
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
    if (!matchedTypes) return;
    const matchedTypeIds = _.uniq((matchedTypes[sourceField.id] || []).map(type => type.dataType));
    const matchedmdTypeIds = _.uniq((matchedTypes[sourceField.id] || []).map(type => type.mdType));

    const filterOptions = destData.isDbType
      ? (destData.destFields || []).filter(o => o.isPk === sourceField.isPk && _.includes(matchedTypeIds, o.jdbcTypeId))
      : (destData.destFields || []).filter(
          o => (!sourceData.isDbType ? o.isPk === sourceField.isPk : true) && _.includes(matchedmdTypeIds, o.mdType),
        );

    const options = filterOptions.map(item => {
      const isExist = _.includes(selectedFieldIds, item.id);

      return {
        ...item,
        disabled: isExist,
        label: (
          <div className="flexRow alignItemsCenter">
            {destData.isDbType ? (
              <span className={isExist && item.id !== destField.id ? 'Gray_c' : 'Gray_bd'}>[{`${item.dataType}`}]</span>
            ) : (
              <Icon
                icon={getIconByType(item.mdType, false)}
                className={isExist && item.id !== destField.id ? 'Gray_c Font18' : 'Gray_9e Font18'}
              />
            )}
            <span className={isExist && item.id !== destField.id ? 'Gray_c mLeft8' : 'Gray mLeft8'}>{item.name}</span>
          </div>
        ),
        value: item.id,
      };
    });

    return (
      <div ref={selectNameRef}>
        <Select
          className="selectItem w100"
          placeholder={_l('无')}
          notFoundContent={_l('暂无数据')}
          getPopupContainer={() => selectNameRef.current}
          allowClear={true}
          value={destField.id}
          options={options}
          onClear={() => {
            updateFieldsMapping({
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
                isCheck: destField.isPk,
                isNotNull: destField.isPk,
                mdType: null,
                controlSetting: null,
              },
            });
          }}
          onChange={(value, option) => {
            updateFieldsMapping({
              sourceField: { ...sourceField, isCheck: true },
              destField: {
                ...destField,
                id: value,
                name: option.name,
                alias: option.name,
                dataType: option.dataType,
                jdbcTypeId: option.jdbcTypeId,
                precision: option.precision,
                scale: option.scale,
                isCheck: true,
                mdType: option.mdType,
                controlSetting: option.controlSetting,
              },
            });
          }}
        />
      </div>
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
            const item = data.sourceField;
            return (
              <div className="flexRow">
                <span title={item.name} className="overflow_ellipsis">
                  {item.name}
                </span>
                {item.isPk && (
                  <div data-tip={_l('主键')} className="tip-top pkTip">
                    <Icon icon="key1" className="Gray_bd mLeft5" />
                  </div>
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
            const item = data.sourceField;
            return (
              <div>
                <span>{item.dataType}</span>
              </div>
            );
          },
        },
        {
          dataIndex: 'isNotNull',
          title: _l('不允许null'),
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
            const item = data.sourceField;
            return (
              <div className="flexRow alignItemsCenter">
                <Icon icon={getIconByType(item.mdType, false)} className={cx('Font18 Gray_9e')} />
                <span title={item.name} className="mLeft8 overflow_ellipsis">
                  {item.name}
                </span>
                {item.isPk && (
                  <div data-tip={_l('主键')} className="tip-top pkTip">
                    <Icon icon="key1" className="Gray_bd mLeft5" />
                  </div>
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
            title: _l('不允许null'),
            flex: 2,
            render: item => renderCheckbox(item, 'isNotNull'),
          },
          {
            dataIndex: 'isPk_dest',
            title: _l('主键'),
            flex: 1,
            render: data => {
              const item = data.destField || {};
              return item.isPk ? (
                <div data-tip={_l('主键')} className="tip-top">
                  <Icon icon="key1" className="Font16 Gray_bd" />
                </div>
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
                  <div className="tip-left" data-tip={!!item.comment ? item.comment : _l('设置字段注释')}>
                    <SetComment itemData={data} updateFieldsMapping={updateFieldsMapping} />
                  </div>
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
            render: (item, column) => renderInputName(item, column),
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
              return canSetAsTitle({ type: destField.mdType }) ? (
                <div
                  className={cx('isOperateCommonIcon', { isActive: destField.isTitle })}
                  data-tip={destField.isTitle ? _l('取消设为标题') : _l('设为标题')}
                >
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
              return canSetAsTitle({ type: destField.mdType }) ? (
                <div
                  className={cx('isOperateCommonIcon', { isActive: destField.isTitle })}
                  data-tip={destField.isTitle ? _l('取消设为标题') : _l('设为标题')}
                >
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
            title: _l('不允许null'),
            flex: 3,
            render: item => {
              return item.destField.isNotNull ? <span className="Gray_9e">{_l('是')}</span> : '';
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
        flex: 1,
        renderTitle: renderCheckAll,
        render: data => renderCheckbox(data, 'isCheck'),
      },
      ...leftColumns,
      {
        dataIndex: 'arrowColumn',
        title: '',
        flex: 3,
        render: data => {
          const item = data.destField || {};
          return (
            <div className={cx('arrowIcon', { Gray_c: !item.isCheck })}>
              <Icon icon="arrow_down" className="Font20" />
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
      {fieldsMapping &&
        fieldsMapping.map((field, i) => {
          return (
            <div key={i} className="dataItem">
              {getColumns().map((column, j) => {
                return (
                  <div key={`${i}-${j}`} style={{ flex: column.flex }} className={`${column.dataIndex}`}>
                    {column.render ? column.render(field, column) : field[column.dataIndex]}
                  </div>
                );
              })}
            </div>
          );
        })}
    </Wrapper>
  );
}
