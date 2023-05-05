import React, { useState } from 'react';
import styled from 'styled-components';
import { Support, Icon } from 'ming-ui';
import _ from 'lodash';
import { AddOrEditSource, SourceList } from './components';
import SourceSelectModal from '../components/SourceSelectModal';

const DataSourceWrapper = styled.div`
  background: #fff;
  min-height: 100%;
  padding: 32px;

  .headerWrapper {
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .addSourceButton {
      padding: 8px 24px;
      background: #2196f3;
      border-radius: 18px;
      color: #fff;
      display: inline-block;
      cursor: pointer;

      &:hover {
        background: #1764c0;
      }
    }
  }
`;

export default function DataSource(props) {
  const [flag, refreshComponents] = useState(+new Date());
  const [selectModalVisible, setSelectModalVisible] = useState(false);
  const [addSourceVisible, setAddSourceVisible] = useState(false);
  const [dataSource, setDataSource] = useState();

  return (
    <DataSourceWrapper className="flexColumn h100">
      <div className="headerWrapper">
        <div>
          <h3 className="Bold Font24">{_l('数据源')}</h3>
          <p className="Font15 mBottom0 flexRow alignItemsCenter">
            {_l('管理外部数据源和目的地')}
            <Support type={3} href="https://help.mingdao.com/zh/integration2.html" text={_l('使用帮助')} />
          </p>
        </div>
        <div className="addSourceButton" onClick={() => setSelectModalVisible(true)}>
          <Icon icon="add" className="Font13" />
          <span className="mLeft5 bold">{_l('数据源')}</span>
        </div>
      </div>

      <SourceList {...props} flag={flag} />

      {selectModalVisible && (
        <SourceSelectModal
          projectId={props.currentProjectId}
          isCreateConnector={false}
          onChange={data => {
            setDataSource(data);
            setAddSourceVisible(true);
            setSelectModalVisible(false);
          }}
          onClose={() => setSelectModalVisible(false)}
        />
      )}

      {addSourceVisible && (
        <AddOrEditSource
          {...props}
          source={dataSource}
          onClose={() => setAddSourceVisible(false)}
          onRefresh={refreshComponents}
        />
      )}
    </DataSourceWrapper>
  );
}
