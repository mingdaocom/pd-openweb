import React, { Component } from 'react';
import { Icon, LoadDiv, SvgIcon } from 'ming-ui';
import SearchResultEmpty from '../components/SearchResultEmpty';
import SearchWrap from './SearchWrap';
import Back from '../components/Back';
import { RecordInfoModal } from 'mobile/Record';
import favoriteAjax from 'src/api/favorite';
import { addBehaviorLog, handlePushState, handleReplaceState } from 'src/util';
import styled from 'styled-components';

const Wrap = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  .recordList {
    overflow-y: auto;
    background: #fff;
    .recordItem {
      height: 48px;
      align-items: center;
      padding: 0 15px;
      &:last-child {
        .recordTitle {
          border: none !important;
        }
      }
    }
    .recordIconWrap {
      width: 28px;
      height: 28px;
      border-radius: 4px;
      text-align: center;
    }
    .recordTitle {
      min-width: 0;
      height: 100%;
      line-height: 48px;
      border-bottom: 1px solid #eaeaea;
    }
  }
`;

// 记录收藏
export default class RecordCollect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      collectRecords: [],
      searchRecords: [],
      collectRecord: {},
      apps: [],
    };
  }

  componentDidMount() {
    this.getData();
    window.addEventListener('popstate', this.onQueryChange);
  }

  componentWillUnmount() {
    window.removeEventListener('popstate', this.onQueryChange);
  }

  onQueryChange = () => {
    handleReplaceState('page', 'collectRecord', () => this.setState({ collectRecord: {} }));
  };

  getData = () => {
    const { projectId } = _.get(this.props, 'match.params') || {};
    if (!projectId) return;

    this.setState({ loading: true });

    favoriteAjax
      .getAllFavorites({ projectId, isRefresh: 1 })
      .then(res => {
        const apps = res.reduce((arr, item) => {
          if (!arr.some(v => v.appId === item.appId)) {
            arr.push(item);
          }
          return arr;
        }, []);
        this.setState({ collectRecords: res, loading: false, apps });
      })
      .catch(err => {
        this.setState({ collectRecords: [], loading: false });
      });
  };

  handleSearchList = ({ appId, searchValue }) => {
    const { collectRecords } = this.state;

    this.setState({ loading: true });

    let searchRecords = _.clone(collectRecords);
    const searchVal = (searchValue || '').trim();

    if (appId) {
      searchRecords = _.filter(collectRecords, item => item.appId === appId);
    }
    if (!!searchVal) {
      searchRecords = searchRecords.filter(item => new RegExp(searchVal.toUpperCase()).test(item.title));
    }
    this.setState({ selectAppId: appId, searchValue: searchVal, searchRecords, loading: false });
  };

  render() {
    const { projectId } = _.get(this.props, 'match.params') || {};
    const { collectRecords, loading, selectAppId, searchRecords, collectRecord, searchValue, apps } = this.state;
    let list = (selectAppId && selectAppId !== 'all') || searchValue ? searchRecords : collectRecords;

    return (
      <Wrap>
        <SearchWrap
          projectId={projectId}
          apps={apps}
          selectAppId={selectAppId}
          handleSearchList={this.handleSearchList}
        />
        <div className="recordList flex">
          {loading ? (
            <LoadDiv />
          ) : (selectAppId || searchValue) && _.isEmpty(list) ? (
            <SearchResultEmpty />
          ) : (
            list.map(item => {
              const { favoriteId, title, appIcon, appColor, appIconUrl, worksheetId, rowId, createTime } = item;
              return (
                <div
                  key={favoriteId}
                  className="recordItem flexRow pRight0"
                  onClick={() => {
                    handlePushState('page', 'collectRecord');
                    addBehaviorLog('worksheetRecord', worksheetId, { rowId });
                    this.setState({ collectRecord: item });
                  }}
                >
                  <div className="recordIconWrap mRight15" style={{ backgroundColor: appColor }}>
                    {appIconUrl ? (
                      <SvgIcon url={appIconUrl} fill="#fff" size={18} addClassName="mTop4" />
                    ) : (
                      <Icon icon={appIcon} className="Font18" />
                    )}
                  </div>
                  <div className="recordTitle flex pRight12 Font15 ellipsis">
                    {title}
                    {/* <div className="Font13 Gray_9e mLeft20">{createTimeSpan(createTime)}</div> */}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <RecordInfoModal
          className="full"
          visible={!!collectRecord.rowId}
          appId={collectRecord.appId}
          worksheetId={collectRecord.worksheetId}
          viewId={collectRecord.viewId}
          rowId={collectRecord.rowId}
          onClose={() => this.setState({ collectRecord: {} })}
          refreshCollectRecordList={this.getData}
        />

        <Back
          icon="home"
          onClick={() => {
            window.mobileNavigateTo('/mobile/dashboard');
          }}
        />
      </Wrap>
    );
  }
}
