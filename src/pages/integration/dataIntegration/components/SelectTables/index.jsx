import React, { useEffect, useState } from 'react';
import { useSetState } from 'react-use';
import { Select } from 'antd';
import styled from 'styled-components';
import { Icon, Tooltip, LoadDiv } from 'ming-ui';
import datasourceApi from '../../../api/datasource';
import homeAppApi from 'src/api/homeApp';
import { isValidName } from '../../constant';
import _ from 'lodash';

const NewItem = styled.div`
  padding: 5px 12px;
  color: #2196f3;
  cursor: pointer;
`;

export default function SelectTables(props) {
  const {
    className,
    value,
    options,
    onChangeOptions,
    onChangeTable,
    projectId,
    datasourceId,
    dbName,
    schema,
    isSameDbObj, //同源同数据库（有schema情况--同源同数据库同schema）
    isMultiple, //是否是多选
    sourceTables,
    disabled,
    addedTableIds, //多选模式-已选择的表ids'
    allowCreate,
    createText,
    onAdd,
    isAppType,
  } = props;
  const [fetchState, setFetchState] = useSetState({
    pageNo: 0,
    loading: false,
    noMore: false,
    searchPageNo: 0,
    searchNoMore: false,
    tableName: '',
  });
  const [searchOptions, setSearchOptions] = useState([]);

  useEffect(() => {
    if (isAppType) {
      homeAppApi.getWorksheetsByAppId({ appId: datasourceId }).then(res => {
        if (res) {
          const sheetOptionList = res
            .filter(o => o.type === 0) //只能是工作表
            .map(item => {
              const isSameTable = isSameDbObj && sourceTables.includes(item.workSheetId);
              const isValidTable = isValidName(item.workSheetName);
              return {
                label:
                  isSameTable || !isValidTable ? (
                    <div className="flexRow alignItemsCenter">
                      <span className="Gray_9e">{item.workSheetName}</span>
                      <Tooltip text={isSameTable ? _l('不可选与数据源相同的表') : _l('名称包含特殊字符，无法同步')}>
                        <Icon icon="info1" className="Gray_bd mLeft24 pointer" />
                      </Tooltip>
                    </div>
                  ) : (
                    item.workSheetName
                  ),
                value: item.workSheetId,
                disabled: isSameTable || !isValidTable,
                workSheetName: item.workSheetName,
              };
            });
          onChangeOptions(sheetOptionList);
        }
      });
    }
  }, [datasourceId]);

  useEffect(() => {
    fetchTables(0);
  }, [dbName, schema]);

  useEffect(() => {
    fetchState.tableName && fetchTables(0);
  }, [fetchState.tableName]);

  const fetchTables = pageNo => {
    if (!dbName || isAppType) {
      return;
    }
    setFetchState(fetchState.tableName ? { loading: true, searchPageNo: pageNo } : { loading: true, pageNo });
    datasourceApi
      .getTablePages({
        projectId,
        datasourceId,
        dbName,
        schema,
        pageSize: 50,
        pageNo,
        tableName: fetchState.tableName,
      })
      .then(res => {
        if (res.content) {
          const tableOptionList = res.content.map(item => {
            const isValidTable = isValidName(item);
            const isSameTable = isSameDbObj && sourceTables.includes(item);
            return {
              label:
                isSameTable || !isValidTable ? (
                  <div className="flexRow alignItemsCenter">
                    <span className="Gray_9e">{item}</span>
                    <Tooltip text={isSameTable ? _l('不可选与数据源相同的表') : _l('名称包含特殊字符，无法同步')}>
                      <Icon icon="info1" className="Gray_bd mLeft24 pointer" />
                    </Tooltip>
                  </div>
                ) : (
                  item
                ),
              value: item,
              disabled: !isValidTable || (isMultiple ? addedTableIds.indexOf(item) !== -1 : isSameTable),
            };
          });
          if (fetchState.tableName) {
            setFetchState({ loading: false, searchNoMore: res.content.length < 50 });
            setSearchOptions(pageNo > 0 ? searchOptions.concat(tableOptionList) : tableOptionList);
          } else {
            setFetchState({ loading: false, noMore: res.content.length < 50 });
            setSearchOptions([]);
            onChangeOptions(pageNo > 0 ? options.concat(tableOptionList) : tableOptionList);
          }
        }
      });
  };

  return (
    <Select
      listHeight={240}
      allowClear={true}
      showSearch={true}
      labelInValue={true}
      placeholder={_l('请选择')}
      notFoundContent={fetchState.loading ? <div></div> : _l('暂无数据')}
      className={className}
      mode={isMultiple && 'multiple'}
      options={fetchState.tableName ? searchOptions : options}
      disabled={disabled}
      value={value}
      onChange={onChangeTable}
      onSearch={
        !isAppType
          ? _.debounce(value => {
              setFetchState({ tableName: value });
            }, 500)
          : _.noop
      }
      onBlur={() => {
        setFetchState({ tableName: '' });
        setSearchOptions([]);
      }}
      filterOption={(inputValue, option) => {
        return (
          (searchOptions.find(item => item.value === option.value) || {})[isAppType ? 'workSheetName' : 'value'] || ''
        )
          .toLowerCase()
          .includes(inputValue.toLowerCase());
      }}
      dropdownRender={menu => (
        <React.Fragment>
          {allowCreate && (
            <NewItem onClick={onAdd}>
              <Icon icon="add1" className="mRight6" />
              <span className="">{createText || _l('新建')}</span>
            </NewItem>
          )}
          {menu}
          {fetchState.loading && <LoadDiv size="small" />}
        </React.Fragment>
      )}
      onPopupScroll={e => {
        if (e.target && e.target.scrollTop + e.target.offsetHeight === e.target.scrollHeight) {
          // 滚动到底部实现分页加载逻辑
          if (!fetchState.loading && (fetchState.tableName ? !fetchState.searchNoMore : !fetchState.noMore)) {
            fetchTables((fetchState.tableName ? fetchState.searchPageNo : fetchState.pageNo) + 1);
          }
        }
      }}
    />
  );
}
