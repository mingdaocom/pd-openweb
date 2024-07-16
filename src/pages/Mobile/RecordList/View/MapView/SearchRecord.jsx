import React, { useState, Component, Fragment, useEffect } from 'react';
import { Dropdown, Input, AutoComplete } from 'antd';
import styled from 'styled-components';
import { Tooltip, Icon } from 'ming-ui';
import { htmlEncodeReg, htmlDecodeReg } from 'src/util';
import cx from 'classnames';
import { browserIsMobile } from 'src/util';
import _ from 'lodash';
import { DndProvider } from 'react-dnd-latest';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { HTML5Backend } from 'react-dnd-html5-backend-latest';
import * as baseAction from 'src/pages/worksheet/redux/actions';
import * as viewActions from 'src/pages/worksheet/redux/actions/mapView';
import { getSearchData } from 'worksheet/views/util';

const Wrapper = styled.div`
  border-radius: 4px;
  margin-right: -33px;
  width: 100%;
  position: absolute;
  z-index: 9;
  top: 6px;
  padding: 0 10px;
  .ant-select-auto-complete {
    z-index: 2;
    width: 100%;
    box-shadow: 0 3px 6px -4px rgb(0 0 0 / 12%), 0 6px 16px 0 rgb(0 0 0 / 8%), 0 9px 28px 8px rgb(0 0 0 / 5%);
  }
  .ant-select-open .ant-select-selection-search-input {
    border-radius: 4px 4px 0 0;
  }
  .ant-select-dropdown {
    z-index: 1;
    top: 43px !important;
  }
  .ant-select-item {
    font-weight: initial !important;
  }
  .highlig {
    color: #2196f3;
  }
  .tip-top {
    height: 18px;
  }
`;

const InputWrapper = styled.div`
  padding: 10px 15px;
  background-color: #fff;
  border-bottom: 1px solid #f2f2f2;
  border-radius: 4px;
  input {
    border: 0;
    padding: 0 0 0 5px;
    width: 100%;
    &::placeholder {
      color: #bdbdbd;
    }
  }
  .line {
    width: 1px;
    height: 15px;
    background: #bdbdbd;
  }
  .cursorInitial {
    cursor: initial;
  }
`;

const highlightMessageText = (keyword, content) => {
  const original = content;
  content = htmlDecodeReg(content);
  const reg = new RegExp(_.escapeRegExp(keyword), 'gi');
  const newKeyword = reg.exec(content)[0];
  content = htmlEncodeReg(content.replace(new RegExp(newKeyword, 'g'), '*#span1#*' + newKeyword + '*#span2#*'));
  content = content.replace(/\*#span1#\*/g, '<span class="highlig">').replace(/\*#span2#\*/g, '</span>');
  return content;
};

const searchResult = (query, queryKey, data) => {
  return data
    .filter(item => {
      const target = item[queryKey].toLowerCase();
      return target ? target.includes(query.toLowerCase()) : false;
    })
    .map((record, idx) => {
      return {
        value: `${idx}`,
        record,
        label: <div dangerouslySetInnerHTML={{ __html: highlightMessageText(query, record[queryKey]) }}></div>,
      };
    });
};

function SearchRecord(props) {
  const { mapView, searchData, view, updateSearchRecord } = props;
  const data = searchData.data;
  const queryKey = searchData.queryKey;
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [activeRecord, setSearchRecord] = useState();
  const [value, setValue] = useState('');
  const activeIndex = activeRecord ? _.findIndex(options, op => op.record.rowid === activeRecord.rowid) : 0;
  const isMobile = browserIsMobile();

  useEffect(() => {
    updateSearchRecord(view, activeRecord);
  }, [activeRecord])

  const handleSearch = value => {
    if (value) {
      setOptions(searchResult(value, queryKey, data));
    } else {
      setOptions([]);
      setSearchRecord(null);
    }
    setOpen(true);
  };

  const onSelect = (data, { record }) => {
    setSearchRecord(record);
    setOpen(false);
  };

  const disable = _.isEmpty(options);

  return (
    <Wrapper className="mapSearchRecordAutoComplete">
      <AutoComplete
        autoFocus
        getPopupContainer={() => document.querySelector('.mapSearchRecordAutoComplete')}
        value={activeRecord ? activeIndex.toString() : null}
        options={options}
        onSelect={onSelect}
        onSearch={handleSearch}
        open={open}
      >
        <InputWrapper className="flexRow valignWrapper">
          <Icon className="Gray_9e Font18" icon="search" />
          <div className="flex">
            <input
              value={value}
              onChange={event => {
                setValue(event.target.value);
              }}
              onClick={() => setOpen(true)}
              placeholder={_l('搜索记录')}
              onKeyDown={event => {
                if (event.which === 13 && options.length) {
                  const index = activeRecord ? (activeIndex === options.length - 1 ? 0 : activeIndex + 1) : 0;
                  const { record } = options[index];
                  setSearchRecord(record);
                  setOpen(false);
                }
              }}
            />
          </div>
          {!_.isEmpty(value) && (
            <span className="Gray_9e">
              {activeRecord ? activeIndex + 1 : activeIndex}/{options.length}
            </span>
          )}
          <span className="line mLeft15 mRight15"></span>
          <div className="tip-top" data-tip={disable || isMobile ? null : _l('上一条')}>
            <Icon
              className={cx('Gray_9e Font18', { Gray_bd: disable, cursorInitial: disable })}
              icon="expand_less"
              onClick={() => {
                if (disable) return;
                const index = activeIndex === 0 ? options.length - 1 : activeIndex - 1;
                const { record } = options[index];
                setSearchRecord(record);
              }}
            />
          </div>
          <div className="tip-top" data-tip={disable || isMobile ? null : _l('下一条')}>
            <Icon
              className={cx('Gray_9e Font18 mLeft8 mRight12', { Gray_bd: disable, cursorInitial: disable })}
              icon="expand_more"
              onClick={() => {
                if (disable) return;
                const index = activeRecord ? (activeIndex === options.length - 1 ? 0 : activeIndex + 1) : 0;
                const { record } = options[index];
                setSearchRecord(record);
              }}
            />
          </div>
        </InputWrapper>
      </AutoComplete>
    </Wrapper>
  );
}

const ConnectedSearchRecord = connect(
  state => ({
    ..._.pick(state.sheet, ['mapView', 'worksheetInfo', 'filters', 'controls', 'sheetSwitchPermit', 'sheetButtons']),
    searchData: getSearchData(state.sheet),
  }),
  dispatch => bindActionCreators({ ...viewActions, ...baseAction }, dispatch),
)(SearchRecord);

export default function SearchRecordCon(props) {
  return (
    <DndProvider context={window} backend={HTML5Backend}>
      <ConnectedSearchRecord {...props} />
    </DndProvider>
  );
}
