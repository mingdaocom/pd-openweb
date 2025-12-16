import React, { useEffect, useState } from 'react';
import { useSetState } from 'react-use';
import { Select } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, Modal } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import homeAppApi from 'src/api/homeApp';
import { DATABASE_TYPE, isValidName } from '../../../../constant';
import SelectDataObjForm from '../../SelectDataObjForm';

const LeftListWrapper = styled.div`
  width: 200px;
  min-width: 200px;
  height: 100%;

  .titleItem {
    width: 200px !important;
  }
  ul {
    li {
      display: inline-block;
      height: 36px;
      width: 100%;
      border-radius: 3px;
      font-size: 14px;
      cursor: pointer;
      .listItem {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 20px;
        margin: 8px 0;
        border-left: 3px solid transparent;
        span {
          margin-left: 12px;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 150px;
          white-space: nowrap;
        }
        .repeatIcon {
          color: #f44336;
          margin-right: 8px;
        }
        .deleteIcon {
          display: none;
          margin-right: 10px;
          color: #bdbdbd;
          &:hover {
            color: #1677ff;
          }
          &.isActive {
            display: block;
          }
        }
      }

      &:hover {
        background: #f5f5f5;
        .deleteIcon {
          display: block;
        }
      }

      &.isCur {
        background: #edf7fe;
        .listItem {
          border-left: 3px solid #1677ff;
          span {
            color: #1677ff;
            font-weight: 600;
          }
        }
      }
    }
  }
`;

const AddDataObjButton = styled.div`
  display: flex;
  align-items: center;
  width: fit-content;
  margin-top: 20px;
  padding-left: 12px;
  border: 0;
  border-radius: 4px;
  color: #1677ff;
  cursor: pointer;
`;

const Wrapper = styled.div`
  .selectItem {
    width: 100% !important;
    font-size: 13px;
    .ant-select-selector {
      min-height: 36px;
      padding: 2px 11px !important;
      border-radius: 3px !important;
    }
    .ant-select-selection-search {
      margin-inline-start: 0px !important;
      -webkit-margin-start: 0px !important;
    }
    &.disabled {
      .ant-select-selector {
        border: 0;
      }
    }
  }
`;

export default function LeftTableList(props) {
  const { source, setNextOrSaveDisabled, currentTab, setCurrentTab, onDelete, submitData = [], dest } = props;
  const [tableList, setTableList] = useState([]);
  const [visible, setVisible] = useState(false);
  const [dataObj, setDataObj] = useSetState({});
  const isSourceAppType = source.type === DATABASE_TYPE.APPLICATION_WORKSHEET;
  const isDestAppType = dest.type === DATABASE_TYPE.APPLICATION_WORKSHEET;

  useEffect(() => {
    if (source.type === DATABASE_TYPE.KAFKA) {
      const db = (_.get(source, 'formData.hosts') || [])[0];
      const topic = _.get(source, 'formData.extraParams.topic');
      setTableList([{ db, tableList: [{ id: topic, name: topic }] }]);
      setCurrentTab({ db, table: topic, tableName: topic });
      setNextOrSaveDisabled(false);
    }
  }, []);

  useEffect(() => {
    if (isSourceAppType && visible && !dataObj.tableOptionList) {
      homeAppApi.getWorksheetsByAppId({ appId: source.id }).then(res => {
        if (res) {
          const tableOptionList = res
            .filter(o => o.type == 0)
            .map(item => {
              const isValidTable = isValidName(item.workSheetName);
              return {
                label: !isValidTable ? (
                  <React.Fragment>
                    {item.workSheetName}
                    <Tooltip title={_l('名称包含特殊字符，无法同步')}>
                      <Icon icon="info" className="Gray_bd mLeft5 pointer" />
                    </Tooltip>
                  </React.Fragment>
                ) : (
                  item.workSheetName
                ),
                value: item.workSheetId,
                workSheetName: item.workSheetName,
              };
            });
          setDataObj({ tableOptionList });
        }
      });
    }
  }, [visible]);

  const onDeleteDataObj = (db, table) => {
    onDelete(db, isSourceAppType ? table.id : table.name);
    const newList = _.without(
      tableList.map(item => {
        if (item.db === db) {
          _.remove(item.tableList, t => t.id === table.id);
          return item.tableList.length === 0 ? null : item;
        } else {
          return item;
        }
      }),
      null,
    );

    // 删除的是当前选中的
    if (table.id === currentTab.table || (db === currentTab.db && table.name === currentTab.tableName)) {
      setCurrentTab({});
    }

    setTableList(newList);
    !newList.length && setNextOrSaveDisabled(true);
  };

  const getList = () => {
    const addedTables = [];

    (tableList || []).forEach(item => {
      item.tableList.forEach(table => {
        addedTables.push(table.id);
      });
    });

    if (dataObj.tableOptionList) {
      return dataObj.tableOptionList.map(item => {
        const isValidTable = isValidName(item.workSheetName);
        return { ...item, disabled: addedTables.indexOf(item.value) !== -1 || !isValidTable };
      });
    }

    return dataObj.tableOptionList;
  };

  const onAdd = () => {
    const tableObj = {
      db: isSourceAppType ? '' : dataObj.db,
      schema: dataObj.schema,
      tableList: dataObj.tables.map(t => {
        return { id: t.value, name: t.label };
      }),
    };
    const addedDbs = tableList.map(item => item.db);
    let newList = [];

    if (addedDbs.indexOf(tableObj.db) === -1) {
      newList = [...tableList, tableObj];
    } else {
      newList = tableList.map(item => {
        return item.db === tableObj.db
          ? { db: item.db, schema: item.schema, tableList: [...item.tableList, ...tableObj.tableList] }
          : item;
      });
    }

    setDataObj({ db: null, schema: null, tables: [] });
    setVisible(false);
    setTableList(newList);
    setCurrentTab({
      db: tableObj.db,
      schema: tableObj.schema,
      table: tableObj.db ? tableObj.tableList[0].name : tableObj.tableList[0].id,
      tableName: tableObj.tableList[0].name,
    });
    setNextOrSaveDisabled(false);
  };

  const getRepeatTableNameInfo = () => {
    const repeatInfo = [];
    const countObj = {};
    submitData
      .filter(item => !!_.get(item, ['destNode', 'config', 'createTable']) && !isDestAppType)
      .forEach(item => {
        const sourceNodeConfig = item.sourceNode.config;
        const destTableName = item.destNode.config.tableName;
        if (!countObj[destTableName]) {
          countObj[destTableName] = 1;
        } else {
          repeatInfo.push({
            db: sourceNodeConfig.dbName,
            tableName: sourceNodeConfig.tableName,
            workSheetId: sourceNodeConfig.workSheetId,
          });
        }
      });
    return repeatInfo;
  };

  return (
    <LeftListWrapper>
      <div className="titleItem mTop16">
        <div className="iconWrapper">
          <svg className="icon svg-icon" aria-hidden="true">
            <use xlinkHref={`#icon${_.get(source, 'className')}`} />
          </svg>
        </div>
        <span title={source.sourceName}>{source.sourceName}</span>
      </div>
      <ul>
        {tableList.map(item => {
          const repeatInfoArr = getRepeatTableNameInfo();
          return (
            <div key={item.db}>
              <div className="Gray_9e mTop16 mBottom10 mLeft15">{item.db}</div>
              {item.tableList &&
                item.tableList.map(table => {
                  const isRepeatDestName = !!repeatInfoArr.filter(r =>
                    isSourceAppType ? r.workSheetId === table.id : r.db === item.db && r.tableName === table.name,
                  ).length;
                  return (
                    <li
                      key={table.id}
                      className={cx({
                        isCur: isSourceAppType
                          ? table.id === currentTab.table
                          : item.db === currentTab.db && table.name === currentTab.tableName,
                      })}
                      onClick={() =>
                        setCurrentTab({
                          db: item.db,
                          schema: item.schema,
                          table: isSourceAppType ? table.id : table.name,
                          tableName: table.name,
                        })
                      }
                    >
                      <div className="listItem">
                        <span title={table.name}>{table.name}</span>
                        <div className="flexRow">
                          {isRepeatDestName && (
                            <Tooltip title={_l('目的地表名重复')}>
                              <Icon icon="info" className="repeatIcon" />
                            </Tooltip>
                          )}
                          {source.type !== DATABASE_TYPE.KAFKA && (
                            <Icon
                              icon="trash"
                              className={cx('deleteIcon', {
                                isActive: isSourceAppType
                                  ? table.id === currentTab.table
                                  : item.db === currentTab.db && table.name === currentTab.tableName,
                              })}
                              onClick={e => {
                                e.stopPropagation();
                                onDeleteDataObj(item.db, table);
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
            </div>
          );
        })}
      </ul>

      {source.type !== DATABASE_TYPE.KAFKA && (
        <AddDataObjButton onClick={() => setVisible(true)}>
          <Icon icon="add" />
          <span>{_l('数据对象')}</span>
        </AddDataObjButton>
      )}

      {visible && (
        <Modal
          visible
          width={640}
          onOk={onAdd}
          okDisabled={!_.get(dataObj, ['tables', 'length'])}
          onCancel={() => {
            setVisible(false);
            !isSourceAppType && setDataObj({ db: null, schema: null, tables: [] });
          }}
        >
          <h5 className="Font14 bold mBottom24">{_l('选择数据对象')}</h5>
          {isSourceAppType ? (
            <Wrapper>
              <p className="mBottom8">{_l('工作表')}</p>
              <Select
                className="selectItem"
                mode="multiple"
                allowClear={true}
                showSearch={true}
                labelInValue={true}
                placeholder={_l('请选择')}
                notFoundContent={_l('暂无数据')}
                options={getList()}
                value={dataObj.tables}
                filterOption={(inputValue, option) => {
                  return option.workSheetName.toLowerCase().includes(inputValue.toLowerCase());
                }}
                onChange={tables => setDataObj({ tables })}
              />
            </Wrapper>
          ) : (
            <SelectDataObjForm {...props} tableList={tableList} dataObj={dataObj} setDataObj={setDataObj} />
          )}
        </Modal>
      )}
    </LeftListWrapper>
  );
}
