import React, { Fragment, useState, useEffect } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { Icon, ScrollView } from 'ming-ui';
import { Flex, ActivityIndicator } from 'antd-mobile';
import { getFilterRows } from 'src/api/worksheet';
import { getTitleTextFromControls } from 'src/components/newCustomFields/tools/utils';
import { arrayOf, bool, func, shape } from 'prop-types';

const Con = styled.div`
  .loadingWrapper {
    height: 200px;
  }
  .am-list {
    width: 100%;
  }
  .am-list-body {
    background-color: transparent;
    border: none !important;
    &:before, &:after {
      content: none !important;
    }
  }
`;

const Item = styled.div`
  padding: 8px 0;
  .icon-done {
    color: #2196f3;
  }
`;

export default function RelateRecordList(props) {
  const { selected, control, multiple, onChange } = props;
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMore, setIsMore] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = 20;
  async function load(pageIndex) {
    const args = {
      worksheetId: control.dataSource,
      viewId: control.viewId,
      searchType: 1,
      pageSize,
      pageIndex,
      status: 1,
      isGetWorksheet: true,
      getType: 7,
    };
    setLoading(true);
    setPageIndex(pageIndex);
    const res = await getFilterRows(args);
    setRecords(records.length ? records.concat(res.data) : res.data);
    setIsMore(res.data.length === pageSize);
    setLoading(false);
  }
  useEffect(() => {
    load(pageIndex);
  }, []);
  const handleEndReached = () => {
    if (!loading && isMore) {
      load(pageIndex + 1);
    }
  }
  return (
    <Con className="h100">
      {loading && pageIndex === 1 ? (
        <Flex className="loadingWrapper" justify="center" align="center">
          <ActivityIndicator size="large" />
        </Flex>
      ) : (
        <ScrollView onScrollEnd={handleEndReached}>
          {records.map(record => {
            const title = getTitleTextFromControls(control.relationControls, record);
            return (
              <Item className="flexRow valignWrapper pLeft15 pRight15" key={record.rowid}>
                <div
                  className={cx('flex ellipsis Font13')}
                  onClick={() => {
                    if (_.find(selected, { rowid: record.rowid })) {
                      onChange(selected.filter(r => r.rowid !== record.rowid));
                    } else {
                      onChange(multiple ? _.uniq(selected.concat(record)) : [record]);
                    }
                  }}
                >
                  {title}
                </div>
                {_.find(selected, { rowid: record.rowid }) && <Icon className="Font20" icon="done"/>}
              </Item>
            )
          })}
          {isMore ? <Flex justify="center">{loading ? <ActivityIndicator animating /> : null}</Flex> : <Fragment />}
        </ScrollView>
      )}
    </Con>
  );
}

RelateRecordList.propTypes = {
  multiple: bool,
  control: shape({}),
  selected: arrayOf(shape({})),
  onChange: func,
};
