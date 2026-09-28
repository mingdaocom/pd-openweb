import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon, LoadDiv, ScrollView, SortableList, SvgIcon } from 'ming-ui';
import { Checkbox, Input, Tooltip } from 'ming-ui/antd-components';
import appManagementAjax from 'src/api/appManagement';

const PAGE_SIZE = 30;
const EMPTY_APPS = [];
const EMPTY_REQUEST_PARAMS = {};
const APP_CHECKBOX_STYLES = { label: { minWidth: 0, flex: 1 } };

const noop = () => {};

const renderDefaultAppName = app => app.appName;
const isAppEnabledByDefault = () => false;
const renderNoAppExtra = () => null;

export const APP_TRANSFER_SIDE = {
  AVAILABLE: 'available',
  SELECTED: 'selected',
};

const requestDefaultApps = ({ projectId, pageIndex, keyword, extraRequestParams }) =>
  appManagementAjax.getAppsForProject({
    projectId,
    status: '',
    order: 3,
    pageIndex,
    pageSize: PAGE_SIZE,
    keyword: keyword.trim(),
    sourceType: 2,
    filterType: 0,
    ...extraRequestParams,
  });

const Transfer = styled.div`
  display: flex;

  .errorCount {
    color: var(--color-error);
  }
`;

const TransferColumn = styled.div`
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
`;

const ColumnHeader = styled.div`
  display: flex;
  align-items: center;
  min-height: 20px;
  font-size: 15px;
`;

const SelectCount = styled.span`
  margin-left: auto;
`;

const InfoIcon = styled(Icon)`
  margin-left: 8px;
  color: var(--color-text-disabled);
  font-size: 14px;
`;

const TransferBox = styled.div`
  display: flex;
  height: 454px;
  margin-top: 6px;
  overflow: hidden;
  border: 1px solid var(--color-border-secondary);
  border-radius: 3px;
  flex-direction: column;
`;

const Search = styled.div`
  display: flex;
  align-items: center;
  height: 45px;
  padding: 0 11px;
  border-bottom: 1px solid var(--color-border-secondary);
  color: var(--color-text-tertiary);
`;

const SearchInput = styled(Input)`
  min-width: 0;
  flex: 1;
`;

const AppCheckboxWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px 10px 10px 0;
`;

const AppCheckbox = styled(Checkbox)`
  align-items: center;
  width: 100%;
  padding: 6px 12px;
  border-radius: 2px;

  &:hover {
    background-color: var(--color-background-secondary);
  }
`;

const AppLabel = styled.span`
  display: inline-flex;
  align-items: center;
  min-width: 0;
  max-width: 100%;
  vertical-align: middle;
`;

const AppIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin: 0 10px;
  border-radius: 5px;
  flex-shrink: 0;

  div {
    height: 14px;
  }
`;

const AppName = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
`;

const TransferArrow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  color: var(--color-border-primary);
  flex-shrink: 0;
`;

const EmptySelected = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-disabled);
  text-align: center;
  flex-direction: column;
`;

const SelectedList = styled.div`
  padding: 12px 6px;
  overflow-x: hidden;
`;

const SelectedApp = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 6px 12px 6px 6px;
  border-radius: 2px;
  cursor: pointer;

  &:hover {
    background-color: var(--color-background-secondary);

    .dragIcon {
      opacity: 1;
    }
  }

  .dragIcon {
    color: var(--color-text-tertiary);
    opacity: 0;
  }
`;

const SelectedExtra = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
  color: var(--color-text-tertiary);
  flex-shrink: 0;
`;

const RemoveIcon = styled(Icon)`
  margin-left: 32px;
  color: var(--color-text-tertiary);
  font-size: 16px;
  cursor: pointer;

  &:hover {
    color: var(--color-primary);
  }
`;

const EmptySearch = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 45px;
  height: 100%;
  color: var(--color-text-disabled);
  text-align-last: left;
`;

function AppTransferContent({
  projectId,
  value = EMPTY_APPS,
  onChange = noop,
  maxCount = 20,
  className = '',
  renderAppName = renderDefaultAppName,
  isAppDisabled = isAppEnabledByDefault,
  renderAppExtra = renderNoAppExtra,
  showSelectedAppCount = true,
  extraRequestParams = EMPTY_REQUEST_PARAMS,
  requestApps = requestDefaultApps,
}) {
  const [apps, setApps] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(Boolean(projectId));
  const requestRef = useRef(null);
  const searchTimerRef = useRef(null);
  const selectedAppIds = useMemo(() => new Set(value.map(app => app.appId)), [value]);

  const handleRequestSuccess = useCallback((request, nextPage, result) => {
    if (requestRef.current !== request) return;

    const nextApps = Array.isArray(result) ? result : result?.apps || [];
    const availableApps = nextApps.filter(app => app.createType !== 1);

    setApps(currentApps => (nextPage === 1 ? availableApps : currentApps.concat(availableApps)));
    setPageIndex(nextPage + 1);
    setHasMore(Array.isArray(result) ? false : nextApps.length === PAGE_SIZE);
    setLoading(false);
    requestRef.current = null;
  }, []);

  const handleRequestError = useCallback(request => {
    if (requestRef.current !== request) return;

    setLoading(false);
    requestRef.current = null;
  }, []);

  const loadApps = useCallback(
    ({ nextPage = 1, nextKeyword = '' } = {}) => {
      if (!projectId) return;

      requestRef.current?.abort?.();
      setLoading(true);

      const request = requestApps({ projectId, pageIndex: nextPage, keyword: nextKeyword, extraRequestParams });
      requestRef.current = request;

      request.then(result => handleRequestSuccess(request, nextPage, result)).catch(() => handleRequestError(request));
    },
    [extraRequestParams, handleRequestError, handleRequestSuccess, projectId, requestApps],
  );

  useEffect(() => {
    if (!projectId) return;

    const request = requestApps({ projectId, pageIndex: 1, keyword: '', extraRequestParams });
    requestRef.current = request;

    request.then(result => handleRequestSuccess(request, 1, result)).catch(() => handleRequestError(request));

    return () => requestRef.current?.abort?.();
  }, [extraRequestParams, handleRequestError, handleRequestSuccess, projectId, requestApps]);

  useEffect(
    () => () => {
      clearTimeout(searchTimerRef.current);
    },
    [],
  );

  const handleSearch = event => {
    const nextKeyword = event.target.value;

    setSearchValue(nextKeyword);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setKeyword(nextKeyword);
      setPageIndex(1);
      setHasMore(true);
      loadApps({ nextPage: 1, nextKeyword });
    }, 500);
  };

  const clearSearch = () => {
    clearTimeout(searchTimerRef.current);
    setSearchValue('');
    setKeyword('');
    setPageIndex(1);
    setHasMore(true);
    loadApps();
  };

  const handleScrollEnd = () => {
    if (hasMore && !loading) {
      loadApps({ nextPage: pageIndex, nextKeyword: keyword });
    }
  };

  const toggleApp = app => {
    onChange(selectedAppIds.has(app.appId) ? value.filter(item => item.appId !== app.appId) : value.concat(app));
  };

  const renderSelectedApp = ({ item }) => (
    <SelectedApp>
      <Icon className="dragIcon" icon="drag" />
      <AppIcon style={{ backgroundColor: item.iconColor }}>
        <SvgIcon url={item.iconUrl} fill="var(--color-white)" size={14} />
      </AppIcon>
      <AppName>{renderAppName(item, { side: APP_TRANSFER_SIDE.SELECTED })}</AppName>
      <SelectedExtra>
        {showSelectedAppCount && <span>{item.sheetCount}</span>}
        <RemoveIcon icon="clear" onClick={() => toggleApp(item)} />
      </SelectedExtra>
    </SelectedApp>
  );

  return (
    <Transfer className={className}>
      <TransferColumn>
        <ColumnHeader>{_l('选择')}</ColumnHeader>
        <TransferBox>
          <Search>
            <SearchInput
              value={searchValue}
              variant="borderless"
              prefix={<Icon icon="search" />}
              suffix={searchValue ? <Icon icon="close" className="Font12 Hand" onClick={clearSearch} /> : null}
              placeholder={_l('搜索应用名称')}
              onChange={handleSearch}
            />
          </Search>
          <ScrollView className="flex" onScrollEnd={handleScrollEnd}>
            {!loading && keyword && !apps.length && (
              <EmptySearch>{_l('未找到 "%0" 相关应用，请更换关键词试试', keyword)}</EmptySearch>
            )}
            <AppCheckboxWrapper>
              {apps.map((app, index) => {
                const context = { side: APP_TRANSFER_SIDE.AVAILABLE, index };
                const disabled = isAppDisabled(app, context);

                return (
                  <AppCheckbox
                    key={app.appId}
                    checked={selectedAppIds.has(app.appId)}
                    disabled={disabled}
                    styles={APP_CHECKBOX_STYLES}
                    onChange={() => toggleApp(app)}
                  >
                    <AppLabel>
                      <AppIcon style={{ backgroundColor: app.iconColor }}>
                        <SvgIcon url={app.iconUrl} fill="var(--color-white)" size={14} />
                      </AppIcon>
                      <AppName>{renderAppName(app, context)}</AppName>
                      {renderAppExtra(app, context)}
                    </AppLabel>
                  </AppCheckbox>
                );
              })}
              {loading && <LoadDiv className="mTop15" size="small" />}
            </AppCheckboxWrapper>
          </ScrollView>
        </TransferBox>
      </TransferColumn>

      <TransferArrow>
        <Icon icon="navigate_next" className="Font28" />
      </TransferArrow>

      <TransferColumn>
        <ColumnHeader>
          <span>{_l('已选')}</span>
          <SelectCount className={cx({ errorCount: value.length > maxCount })}>
            <span>{value.length}</span>
            <span className="textDisabled">/{maxCount}</span>
          </SelectCount>
          <Tooltip placement="top" title={_l('选择的应用总数上限%0个', maxCount)}>
            <InfoIcon icon="info" />
          </Tooltip>
        </ColumnHeader>
        <TransferBox>
          {value.length ? (
            <ScrollView className="flex">
              <SelectedList>
                <SortableList
                  renderBody
                  items={value}
                  itemKey="appId"
                  renderItem={renderSelectedApp}
                  onSortEnd={onChange}
                />
              </SelectedList>
            </ScrollView>
          ) : (
            <EmptySelected>
              <div>{_l('请从左侧列表选择应用,')}</div>
              <div>
                {_l('选择的应用总数不能超过')}
                <span className="textPrimary">{maxCount}</span>
                {_l('个')}
              </div>
            </EmptySelected>
          )}
        </TransferBox>
      </TransferColumn>
    </Transfer>
  );
}

export default function AppTransfer({ projectId, ...restProps }) {
  return <AppTransferContent key={projectId} projectId={projectId} {...restProps} />;
}

AppTransfer.propTypes = {
  projectId: PropTypes.string.isRequired,
  value: PropTypes.arrayOf(
    PropTypes.shape({
      appId: PropTypes.string.isRequired,
      appName: PropTypes.string.isRequired,
      iconColor: PropTypes.string,
      iconUrl: PropTypes.string,
      sheetCount: PropTypes.number,
    }),
  ),
  onChange: PropTypes.func,
  maxCount: PropTypes.number,
  className: PropTypes.string,
  renderAppName: PropTypes.func,
  isAppDisabled: PropTypes.func,
  renderAppExtra: PropTypes.func,
  extraRequestParams: PropTypes.object,
  requestApps: PropTypes.func,
  showSelectedAppCount: PropTypes.bool,
};
