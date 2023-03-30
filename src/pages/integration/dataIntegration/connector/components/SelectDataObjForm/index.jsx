import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { Select } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import datasourceApi from '../../../../api/datasource';

const Wrapper = styled.div`
  .selectItem {
    width: 100% !important;
    font-size: 13px;
    .ant-select-selector {
      min-height: 36px;
      padding: 2px 11px !important;
      border-radius: 3px !important;
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
  const [selectOpen, setSelectOpen] = useState(false);
  const tableRef = useRef(null);

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
        //获取指定数据库下数据表列表
        datasourceApi
          .getTables({ projectId: props.currentProjectId, datasourceId: source.id, dbName: db })
          .then(res => {
            if (res) {
              const tableOptionList = res.map(item => {
                return { label: item, value: item, disabled: getAddedTables().indexOf(item) !== -1 };
              });
              setDataObj({ db, tables: [], tableOptionList });
            }
          });
      }
    }
  };

  const onChangeSchema = schema => {
    setSelectedTables([]);
    datasourceApi
      .getTables({ projectId: props.currentProjectId, datasourceId: source.id, schema, dbName: dataObj.db })
      .then(res => {
        if (res) {
          const tableOptionList = res.map(item => {
            return { label: item, value: item, disabled: getAddedTables().indexOf(item) !== -1 };
          });
          setDataObj({ schema, tables: [], tableOptionList });
        }
      });
  };

  const onChangeTable = data => {
    if (data.length > selectedTables.length) {
      const addTable = _.differenceBy(data, selectedTables, 'value')[0];
      const params = {
        projectId: props.currentProjectId,
        datasourceId: source.id,
        dbName: dataObj.db,
        schema: dataObj.schema,
        tableName: addTable.value,
      };
      datasourceApi
        .getTableFields(params)
        .then(res => {
          if (res) {
            const arr = res.filter(item => item.isPk);
            if (arr.length === 1) {
              setSelectedTables([...selectedTables, addTable]);
              setDataObj({ tables: [...selectedTables, addTable] });
            } else if (arr.length > 1) {
              alert(_l('该表有多个主键，暂时不支持同步'), 2);
              tableRef.current.blur();
            } else {
              alert(_l('该表没有主键，无法同步'), 2);
              tableRef.current.blur();
            }
          }
        })
        .fail(() => tableRef.current.blur());
    } else {
      setSelectedTables(data);
      setDataObj({ tables: data });
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
          <p className="mTop24 mBottom8">{_l('Schema')}</p>
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
      <Select
        ref={tableRef}
        className={cx('selectItem', { disabled: hasSchema ? !dataObj.db || !dataObj.schema : !dataObj.db })}
        mode="multiple"
        allowClear={true}
        labelInValue={true}
        placeholder={_l('请选择')}
        notFoundContent={_l('暂无数据')}
        open={selectOpen}
        options={dataObj.tableOptionList}
        disabled={hasSchema ? !dataObj.db || !dataObj.schema : !dataObj.db}
        value={dataObj.tables}
        onFocus={() => setSelectOpen(true)}
        onBlur={() => setSelectOpen(false)}
        onChange={onChangeTable}
        onClear={() => onChangeTable([])}
      />
    </Wrapper>
  );
}
