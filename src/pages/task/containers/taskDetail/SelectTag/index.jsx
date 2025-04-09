import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Select } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import tagAjax from 'src/api/tag';
import ajaxRequest from 'src/api/taskCenter';

const DropWrap = styled.ul`
  li {
    display: flex;
    align-items: center;
    height: 28px;
    padding: 8px;
    &:hover {
      background: #f5fafd;
    }
    .point {
      width: 10px;
      height: 10px;
      border-radius: 50px;
      display: inline-block;
      margin-right: 6px;
    }
  }
`;

const EmptyDrop = styled.div`
  padding: 6px 12px;
`;

const Tag = styled.div`
  font-size: 12px;
  background-color: #f2f2f2;
  padding: 0 10px;
  border-radius: 12px;
  max-width: 360px;
  height: 22px;
  display: flex;
  align-items: center;
  .removeIcon {
    margin-left: 8px;
  }
  .point {
    width: 10px;
    height: 10px;
    margin-right: 6px;
    border-radius: 50%;
  }
`;

const SelectWrap = styled(Select)`
  .ant-select-selection-overflow {
    gap: 6px;
  }
`;

function SelectTag(props) {
  const {
    taskID,
    batchTask = false,
    focus = false,
    defaultValue = [],
    addTaskTag = () => {},
    dispatch = () => {},
    removeTasksTag = () => {},
    closeAddTags = () => {},
    ...base
  } = props;

  const selectRef = useRef(null);
  const [searchValue, setSearchValue] = useState(undefined);
  const [tagList, setTagList] = useState([]);
  const [value, setValue] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setValue(defaultValue.map(l => l.tagID));

    return () => {
      debounceSearch.cancel();
    };
  }, [defaultValue]);

  useEffect(() => {
    if (focus && selectRef.current) {
      selectRef.current.focus();
      closeAddTags();
    }
  }, [focus]);

  const getTags = useCallback(
    keywords => {
      setLoading(true);
      ajaxRequest
        .getTagsByTaskID({ taskID: batchTask ? '' : taskID, keywords: keywords || searchValue })
        .then(({ data }) => {
          setTagList(data);
          setLoading(false);
        });
    },
    [taskID],
  );

  const debounceSearch = useMemo(() => _.debounce(keywords => getTags(keywords), 500), [getTags]);

  const onSearch = value => {
    const trimmedValue = value.trim();

    setSearchValue(trimmedValue);
    debounceSearch(trimmedValue);
  };

  const addCallback = item => {
    (item.tagID || batchTask) && getTags();
    !item.tagID && setSearchValue(undefined);
  };

  const handleChange = (item = {}, type = 'add') => {
    const isAdd = type === 'add';

    if (isAdd) {
      batchTask
        ? tagAjax
            .addTaskTag2({
              taskIds: taskID,
              tagName: item.tagID ? item.tagName : searchValue.trim(),
              tagID: item.tagID,
            })
            .then(res => {
              addCallback(item);
              setValue(value.concat(res.id));
            })
        : dispatch(
            addTaskTag(taskID, item.tagID || 'createNewTagsID', item.tagID ? item.tagName : searchValue.trim(), () =>
              addCallback(item),
            ),
          );
    } else {
      batchTask
        ? tagAjax.removeTasksTag({ sourceIds: taskID, tagId: item.tagID }).then(() => {
            getTags();
            setValue(value.filter(l => l !== item.tagID));
          })
        : dispatch(removeTasksTag(taskID, item.tagID, () => getTags()));
    }
  };

  const dropdownRender = () => {
    if (!tagList.length && !searchValue) return null;

    return (
      <DropWrap className="taskTagList">
        {searchValue && (
          <EmptyDrop className="ThemeColor Font13 Hand" onClick={() => handleChange()}>
            {_l('创建标签')}“{searchValue}”
          </EmptyDrop>
        )}
        {tagList
          .filter(l => _.includes(_.toLower(l.tagName), _.toLower(searchValue)) && !_.includes(value, l.tagID))
          .map(item => (
            <li key={`taskTagList-${item.tagID}`} onClick={() => handleChange(item, 'add')}>
              {item.color && <span className="point" style={{ background: item.color }}></span>}
              <span className="text overflow_ellipsis">{item.tagName}</span>
            </li>
          ))}
      </DropWrap>
    );
  };

  const tagRender = tag => {
    const item = _.find(defaultValue.concat(tagList), l => l.tagID === tag.value);

    if (!item) return null;

    return (
      <Tag>
        {item.color && <span className="point" style={{ background: item.color }}></span>}
        <span className="ellipsis">{item.tagName}</span>
        <Icon
          icon="clear"
          className="removeIcon Gray_9e Hand"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            handleChange(item, 'remove');
          }}
        />
      </Tag>
    );
  };

  return (
    <SelectWrap
      {...base}
      ref={selectRef}
      mode="tags"
      className=""
      dropdownClassName={cx({ hide: !searchValue && !tagList.length })}
      loading={loading}
      bordered={false}
      labelInValue
      placeholder={_l('+添加标签')}
      disabled={false}
      value={value}
      searchValue={searchValue}
      style={{ width: '100%' }}
      fieldNames={{ label: 'tagName', value: 'tagID' }}
      onSearch={onSearch}
      tokenSeparators={[',']}
      options={[]}
      tagRender={tagRender}
      dropdownRender={() => dropdownRender()}
      onFocus={() => getTags()}
    />
  );
}

export default SelectTag;
