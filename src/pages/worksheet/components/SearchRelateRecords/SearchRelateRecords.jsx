import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { func, string } from 'prop-types';
import styled from 'styled-components';
import { Modal, Icon, Input } from 'ming-ui';
import Skeleton from 'src/router/Application/Skeleton';
import sheetAjax from 'src/api/worksheet';
import RecordCoverCardList from './RecordCoverCardList';
import _, { debounce } from 'lodash';

const Title = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-left: 24px;
`;

const SearchCon = styled.div`
  display: flex;
  margin: 16px 24px 0px;
  align-items: center;
  border-radius: 3px;
  border: 1px solid #dddddd;
  padding: 0 10px;
  .ming.Input {
    padding: 0 6px;
    border: none;
  }
  input::placeholder {
    color: #bdbdbd;
  }
  &.focus {
    border-color: #2196f3;
  }
`;

const RecordsCon = styled.div`
  padding: 10px 24px;
  flex: 1;
  overflow: auto;
`;

const Empty = styled.div`
  font-size: 14px;
  color: #9e9e9e;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  img {
    width: 130px;
    margin-bottom: 14px;
  }
`;

const LoadingButton = styled.div`
  display: inline-block;
  cursor: pointer;
  height: 29px;
  line-height: 29px;
  padding: 0 12px;
  color: #2196f3;
  border-radius: 3px;
  font-size: 13px;
  .loading {
    margin-right: 6px;
    .icon {
      display: inline-block;
      animation: rotate 1.2s linear infinite;
    }
  }
  &:hover {
    background: #f8f8f8;
  }
`;

const NewRecordButton = styled.div`
  margin-top: 20px;
  height: 38px;
  border-radius: 38px;
  background-color: #2196f3;
  padding: 0 24px;
  color: #fff;
  display: flex;
  align-items: center;
  cursor: pointer;
  &:hover {
    background: #0c88eb;
  }
`;

function Search(props) {
  const { enableClear = true, onChange = () => {} } = props;
  const [value, setValue] = useState('');
  const [focus, setFocus] = useState(false);
  const inputRef = useRef();
  useEffect(() => {
    inputRef.current.focus();
  }, []);
  return (
    <SearchCon className={focus ? 'focus' : ''}>
      <Icon icon="search" className="Gray_9d Font18" />
      <Input
        value={value}
        manualRef={ref => {
          inputRef.current = ref;
        }}
        placeholder={_l('搜索')}
        className="flex"
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        onChange={v => {
          setValue(v);
          onChange(v);
        }}
      />
      {enableClear && value && (
        <Icon
          icon="cancel"
          className="Hand Gray_9d Font16"
          onClick={() => {
            inputRef.current.value = '';
            onChange('');
            setValue('');
          }}
        />
      )}
    </SearchCon>
  );
}

export default function SearchRelateRecords(props) {
  const {
    from,
    allowAdd,
    title,
    worksheetId,
    recordId,
    controlId,
    control,
    controls = [],
    hiddenRecordIds = [],
    sourceEntityName,
    getCoverUrl,
    onlySearchLoad = true,
    onCancel,
    onDelete,
    onCardClick,
    onNewRecord = () => {},
    ...rest
  } = props;
  const conRef = useRef();
  const [keyWords, setKeyWords] = useState('');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(!onlySearchLoad);
  const [abnormal, setAbnormal] = useState(false);
  const [total, setTotal] = useState(0);
  const [queryArgs, setQueryArgs] = useState({
    pageIndex: 1,
    worksheetId,
    rowId: recordId,
    controlId,
    pageSize: 20,
  });
  const load = useCallback(
    debounce((args, cb = () => {}) => {
      setLoading(true);
      if (from === 21) {
        args.getType = 21;
      }
      if (_.get(window, 'shareState.shareId')) {
        args.shareId = _.get(window, 'shareState.shareId');
      }
      sheetAjax.getRowRelationRows(args).then(res => {
        setLoading(false);
        if (res.resultCode !== 1) {
          setAbnormal(true);
          return;
        }
        setTotal(res.count);
        setList(old => _.uniqBy([...old, ...(res.data || [])], 'rowid'));
        cb(res.data || []);
      });
    }, 200),
    [],
  );
  function initLoad() {
    load({ ...queryArgs, pageIndex: 1 }, data => {
      if (data.length < 20) {
        return;
      }
      setQueryArgs(old => ({
        ...old,
        pageIndex: 2,
      }));
      load({ ...queryArgs, pageIndex: 2 });
    });
  }
  useEffect(() => {
    if (!onlySearchLoad) {
      initLoad();
    }
  }, []);
  return (
    <Modal
      visible
      className="searchRelateRecordsModal"
      type="fixed"
      footer={null}
      onCancel={onCancel}
      width={1095}
      bodyStyle={{ padding: '14px 0px', display: 'flex', flexDirection: 'column' }}
    >
      <Title>{title}</Title>
      {!abnormal && (
        <Search
          className="flex"
          onChange={value => {
            setKeyWords(value);
            setList([]);
            if (!(value || '').trim()) {
              if (onlySearchLoad) {
                return;
              } else {
                initLoad();
                return;
              }
            }
            setLoading(true);
            load({
              ...queryArgs,
              keyWords: value,
              pageIndex: 1,
            });
          }}
        />
      )}
      <RecordsCon
        ref={conRef}
        onScroll={() => {
          if (
            conRef.current.scrollHeight - conRef.current.scrollTop - conRef.current.clientHeight < 100 &&
            !loading &&
            list.length < total
          ) {
            setQueryArgs(old => ({
              ...old,
              pageIndex: old.pageIndex + 1,
            }));
            setLoading(true);
            load({
              keyWords,
              ...queryArgs,
              pageIndex: queryArgs.pageIndex + 1,
            });
          }
        }}
      >
        {loading && !list.length && (
          <div style={{ padding: 10 }}>
            <Skeleton
              style={{ flex: 1 }}
              direction="column"
              widths={['30%', '40%', '90%', '60%']}
              active
              itemStyle={{ marginBottom: '10px' }}
            />
          </div>
        )}
        {!loading &&
          !keyWords &&
          !list.length &&
          (abnormal ? (
            <Empty>{_l('无权限')}</Empty>
          ) : (
            <Empty>
              <img src={require('./empty.png')} alt="" />
              {_l('请输入关键词进行搜索')}
            </Empty>
          ))}
        {!loading && !!keyWords && !list.length && (
          <Empty>
            <img src={require('./empty.png')} alt="" />
            <div className="Font16 Gray_9e">{_l('没有搜索结果')}</div>
            {allowAdd && (
              <NewRecordButton
                onClick={e => {
                  onNewRecord();
                  onCancel();
                }}
              >
                <i className="Icon icon icon-plus Font13 mRight5 White" />
                {_l('新建%0', sourceEntityName)}
              </NewRecordButton>
            )}
          </Empty>
        )}
        {!!list.length && (
          <Fragment>
            <RecordCoverCardList
              control={control}
              controls={controls}
              records={list.filter(r => !_.includes(hiddenRecordIds, r.rowid))}
              getCoverUrl={getCoverUrl}
              onCardClick={onCardClick}
              onDelete={deletedRecord => {
                onDelete(deletedRecord);
                setList(old => old.filter(r => r.rowid !== deletedRecord.rowid));
              }}
              {...rest}
            />
          </Fragment>
        )}
      </RecordsCon>
    </Modal>
  );
}

SearchRelateRecords.propTypes = {
  title: string,
  worksheetId: string,
  controlId: string,
  recordId: string,
  getCoverUrl: func,
  onCancel: func,
};
