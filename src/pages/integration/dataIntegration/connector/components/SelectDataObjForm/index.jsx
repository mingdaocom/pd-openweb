import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Select } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import datasourceApi from '../../../../api/datasource';
import SelectTables from '../../../components/SelectTables';
import { DATABASE_TYPE } from '../../../constant';

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

export default function SelectDataObjForm(props) {
  const { source, tableList, dataObj, setDataObj } = props;
  const { hasSchema } = source;
  const [selectedTables, setSelectedTables] = useState([]);

  useEffect(() => {
    // 获取数据源下数据库列表
    datasourceApi.getDatabases({ projectId: props.currentProjectId, datasourceId: source.id }).then(res => {
      if (res) {
        const dbOptionList = res.map(item => {
          return { label: item, value: item };
        });
        setDataObj({ dbOptionList });
      }
    });
  }, []);

  const getAddedTables = () => {
    const addedTables = [];

    tableList.forEach(item => {
      item.tableList.forEach(table => {
        addedTables.push(table.id);
      });
    });

    return addedTables;
  };

  const onChangeDb = db => {
    setSelectedTables([]);
    if (!db) {
      setDataObj({ db: null, schema: null, tables: [] });
    } else {
      if (hasSchema) {
        //获取指定数据库下schema列表
        datasourceApi
          .getSchemas({ projectId: props.currentProjectId, datasourceId: source.id, dbName: db })
          .then(res => {
            if (res) {
              const schemaOptionList = res.map(item => {
                return { label: item, value: item };
              });
              setDataObj({ db, schema: null, tables: [], schemaOptionList });
            }
          });
      } else {
        setDataObj({ db, tables: [] });
      }
    }
  };

  const onChangeSchema = schema => {
    setSelectedTables([]);

    if (!schema) {
      setDataObj({ schema: null, tables: [], tableOptionList: [] });
    } else {
      setDataObj({ schema, tables: [] });
    }
  };

  const onChangeTable = data => {
    const supportTypes = [DATABASE_TYPE.MYSQL, DATABASE_TYPE.ALIYUN_MYSQL, DATABASE_TYPE.TENCENT_MYSQL];
    const sqlServerTypes = [DATABASE_TYPE.SQL_SERVER, DATABASE_TYPE.ALIYUN_SQLSERVER, DATABASE_TYPE.TENCENT_SQLSERVER];

    if (_.includes(supportTypes, source.type) || data.length <= selectedTables.length) {
      setSelectedTables(data);
      setDataObj({ tables: data });
    } else {
      const addTable = _.differenceBy(data, selectedTables, 'value')[0];
      const params = {
        projectId: props.currentProjectId,
        datasourceId: source.id,
        dbName: dataObj.db,
        schema: dataObj.schema,
        tableName: addTable.value,
      };
      datasourceApi.getTableFields(params).then(res => {
        if (res && _.isArray(res)) {
          const arr = res.filter(item => item.isPk);
          switch (true) {
            case arr.length === 1 || (_.includes(sqlServerTypes, source.type) && arr.length > 1):
              setSelectedTables([...selectedTables, addTable]);
              setDataObj({ tables: [...selectedTables, addTable] });
              break;
            case arr.length > 1:
              alert(_l('该表有多个主键，暂时不支持同步'), 2);
              break;
            default:
              alert(_l('该表没有主键，无法同步'), 2);
              break;
          }
        }
      });
    }
  };

  return (
    <Wrapper>
      <p className="mBottom8">{_l('数据库')}</p>
      <Select
        className="selectItem"
        allowClear={true}
        showSearch={true}
        placeholder={_l('请选择')}
        notFoundContent={_l('暂无数据')}
        options={dataObj.dbOptionList}
        value={dataObj.db}
        onChange={onChangeDb}
      />
      {hasSchema && (
        <React.Fragment>
          <p className="mTop24 mBottom8">schema</p>
          <Select
            className={cx('selectItem', { disabled: !dataObj.db })}
            disabled={!dataObj.db}
            allowClear={true}
            showSearch={true}
            placeholder={_l('请选择')}
            notFoundContent={_l('暂无数据')}
            options={dataObj.schemaOptionList}
            value={dataObj.schema}
            onChange={onChangeSchema}
          />
        </React.Fragment>
      )}
      <p className="mTop24 mBottom8">{_l('数据对象')}</p>
      <SelectTables
        className={cx('selectItem', { disabled: hasSchema ? !dataObj.db || !dataObj.schema : !dataObj.db })}
        value={dataObj.tables}
        options={dataObj.tableOptionList}
        onChangeOptions={tableOptionList => setDataObj({ tableOptionList })}
        onChangeTable={onChangeTable}
        projectId={props.currentProjectId}
        datasourceId={source.id}
        dbName={dataObj.db}
        schema={dataObj.schema}
        isMultiple={true}
        disabled={hasSchema ? !dataObj.db || !dataObj.schema : !dataObj.db}
        addedTableIds={getAddedTables()}
        needCheckPgSql={[
          DATABASE_TYPE.POSTGRESQL,
          DATABASE_TYPE.ALIYUN_POSTGRES,
          DATABASE_TYPE.TENCENT_POSTGRES,
        ].includes(source.type)}
      />
    </Wrapper>
  );
}
