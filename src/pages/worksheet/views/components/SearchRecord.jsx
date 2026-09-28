import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { AutoComplete, Dropdown, Tooltip } from 'ming-ui/antd-components';
import { htmlDecodeReg, htmlEncodeReg } from 'src/utils/core/string';
import { browserIsMobile } from 'src/utils/platform/browser/device';

const Wrapper = styled.div`
  background-color: var(--color-background-primary);
  box-shadow:
    0 3px 6px -4px rgb(0 0 0 / 12%),
    0 6px 16px 0 rgb(0 0 0 / 8%),
    0 9px 28px 8px rgb(0 0 0 / 5%);
  border-radius: 4px;
  margin-right: -33px;
  .hap-select-auto-complete {
    z-index: 2;
  }
  .hap-select-open .hap-select-selection-search-input {
    border-radius: 4px 4px 0 0;
  }
  .hap-select-dropdown {
    z-index: 1;
    top: 43px !important;
  }
  .hap-select-item {
    font-weight: initial !important;
  }
  .highlig {
    color: var(--color-primary);
  }
`;

const InputWrapper = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: 10px 15px;
  background-color: var(--color-background-primary);
  border-bottom: 1px solid var(--color-background-disabled);
  border-radius: 4px;
  input {
    border: 0;
    padding: 0 0 0 5px;
    width: 100%;
    &::placeholder {
      color: var(--color-text-disabled);
    }
  }
  .line {
    width: 1px;
    height: 15px;
    background: var(--color-text-disabled);
  }
  .cursorInitial {
    cursor: initial;
  }
`;

const highlightMessageText = (keyword, content) => {
  content = htmlDecodeReg(content);
  const reg = new RegExp(_.escapeRegExp(keyword), 'gi');
  const newKeyword = reg.exec(content)[0];
  content = htmlEncodeReg(content.replace(new RegExp(newKeyword, 'g'), '*#span1#*' + newKeyword + '*#span2#*'));
  content = content.replace(/\*#span1#\*/g, '<span class="highlig">').replace(/\*#span2#\*/g, '</span>');
  return content;
};

const searchResult = (query, queryKey, data) => {
  const list = data[0] && data[0].rowid ? _.uniqBy(data, 'rowid') : data;

  return list
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

const SearchRecord = props => {
  const { queryKey, data, popupClassName, viewId = '', onSearch, onClose } = props;
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [activeRecord, setSearchRecord] = useState();
  const [value, setValue] = useState('');
  const activeIndex = activeRecord ? _.findIndex(options, op => op.record.rowid === activeRecord.rowid) : 0;
  const isMobile = browserIsMobile();

  useEffect(() => {
    onClose();
    setValue('');
    setOptions([]);
    setSearchRecord(null);
  }, [viewId]);

  const handleSearch = value => {
    if (value) {
      setOptions(searchResult(value, queryKey, data));
    } else {
      setOptions([]);
      onClose();
      setSearchRecord(null);
    }

    setOpen(true);
  };

  const onSelect = (data, { record }) => {
    onSearch(record);
    setSearchRecord(record);
    setOpen(false);
  };

  const disable = _.isEmpty(options);

  const renderOverlay = () => {
    return (
      <Wrapper className="searchRecordAutoComplete">
        <AutoComplete
          autoFocus
          style={{ width: isMobile ? '100%' : 360 }}
          getPopupContainer={() => document.querySelector('.searchRecordAutoComplete')}
          value={activeRecord ? activeIndex.toString() : null}
          options={options}
          onSelect={onSelect}
          onSearch={handleSearch}
          open={open}
        >
          <InputWrapper className="flexRow valignWrapper">
            <Icon className="textTertiary Font18" icon="search" />
            <div className="flex">
              <input
                autoFocus
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
                    onSearch(record);
                    setSearchRecord(record);
                    setOpen(false);
                  }
                }}
              />
            </div>
            {!_.isEmpty(value) && (
              <span className="textTertiary">
                {activeRecord ? activeIndex + 1 : activeIndex}/{options.length}
              </span>
            )}
            <span className="line mLeft15 mRight15"></span>
            <Tooltip title={disable || isMobile ? null : _l('上一条')} placement="top">
              <div>
                <Icon
                  className={cx('textTertiary Font18', { textDisabled: disable, cursorInitial: disable })}
                  icon="expand_less"
                  onClick={() => {
                    if (disable) return;
                    const index = activeIndex === 0 ? options.length - 1 : activeIndex - 1;
                    const { record } = options[index];
                    onSearch(record);
                    setSearchRecord(record);
                  }}
                />
              </div>
            </Tooltip>
            <Tooltip title={disable || isMobile ? null : _l('下一条')} placement="top">
              <div>
                <Icon
                  className={cx('textTertiary Font18 mLeft8 mRight12', {
                    textDisabled: disable,
                    cursorInitial: disable,
                  })}
                  icon="expand_more"
                  onClick={() => {
                    if (disable) return;
                    const index = activeRecord ? (activeIndex === options.length - 1 ? 0 : activeIndex + 1) : 0;
                    const { record } = options[index];
                    onSearch(record);
                    setSearchRecord(record);
                  }}
                />
              </div>
            </Tooltip>
            <Icon
              className="textSecondary Font18 pointer"
              icon="close"
              onClick={() => {
                setVisible(false);
                setOptions([]);
                setSearchRecord(null);
                setValue('');
                onClose();
              }}
            />
          </InputWrapper>
        </AutoComplete>
      </Wrapper>
    );
  };

  return (
    <Dropdown
      classNames={{ root: popupClassName }}
      trigger={['click']}
      open={visible}
      placement="bottomRight"
      onOpenChange={visible => {
        setVisible(visible);
        if (visible) {
          setTimeout(() => {
            const input = document.querySelector('.searchRecordAutoComplete input');
            input && input.focus();
          }, 200);
        }
      }}
      menu={{ items: [] }}
      popupRender={() => renderOverlay()}
    >
      <span className="InlineBlock">{props.children}</span>
    </Dropdown>
  );
};

export default SearchRecord;
