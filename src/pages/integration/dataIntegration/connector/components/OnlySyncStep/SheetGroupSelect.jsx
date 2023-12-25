import React, { useRef, useState, useEffect } from 'react';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Select } from 'antd';
import { Icon, ScrollView } from 'ming-ui';
import SearchInput from 'src/pages/AppHomepage/AppCenter/components/SearchInput';
import homeApp from 'src/api/homeApp';

const PopupWrapper = styled.div`
  width: 400px;
  background: #fff;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
  border-radius: 2px;
  padding: 10px;

  .searchInput {
    width: 100%;
    border-radius: 0;
    background: #fff;
    border-bottom: 1px solid #eaeaea;
    margin-bottom: 8px;
  }
  .contentWrapper {
    height: 200px;
  }
  .groupItem {
    height: 32px;
    padding: 0 10px;
    &.active {
      color: #2196f3;
      background-color: #e5f3fe;
      .ellipsis {
        font-weight: 600;
      }
    }
  }
`;

export default function SheetGroupSelect(props) {
  const { appId, value, onChange, hideTitle, suffixIcon } = props;
  const [groupPopupVisible, setGroupPopupVisible] = useState(false);
  const [searchKeyWords, setSearchKeyWords] = useState('');
  const [groups, setGroups] = useState([]);
  const groupRef = useRef();

  useEffect(() => {
    !!appId &&
      homeApp.getApp({ appId, getSection: true }).then(result => {
        setGroups(
          result.sections.map(item => {
            item.subVisible = true;
            return item;
          }),
        );
      });
  }, [appId]);

  const getGroupOptions = () => {
    let options = [];
    groups.forEach(group => {
      options.push({ label: group.name || _l('未命名分组'), value: group.appSectionId });
      if (group.childSections.length) {
        const subOptions = group.childSections.map(item => {
          return { label: item.name || _l('未命名分组'), value: item.appSectionId };
        });
        options = options.concat(subOptions);
      }
    });
    return options;
  };

  const renderGroupItem = itemData => {
    const { appSectionId, name, subVisible, parentId, workSheetInfo } = itemData;
    const isChild = !!parentId;

    if (searchKeyWords && !name.toLocaleLowerCase().includes(searchKeyWords.toLocaleLowerCase())) {
      return null;
    }

    return (
      <div
        key={appSectionId}
        className={cx('groupItem flexRow alignItemsCenter pointer', {
          active: value === appSectionId,
          pLeft30: isChild,
        })}
        onClick={() => onChange(appSectionId)}
      >
        {!isChild && (
          <Icon
            icon={subVisible === false ? 'arrow-right-tip' : 'arrow-down'}
            className="Gray_9e"
            onClick={e => {
              e.stopPropagation();
              const newGroups = groups.map(item => {
                if (item.appSectionId === appSectionId) {
                  item.subVisible = !subVisible;
                }
                return item;
              });
              setGroups(newGroups);
            }}
          />
        )}
        <div className="flex mLeft5">
          <span className="ellipsis">{name || _l('未命名分组')}</span>
        </div>
        {value === appSectionId && <Icon icon="done" className="Font18 ThemeColor" />}
      </div>
    );
  };

  return (
    <Trigger
      action={['click']}
      getPopupContainer={() => groupRef.current}
      popupVisible={groupPopupVisible}
      onPopupVisibleChange={visible => setGroupPopupVisible(visible)}
      popupAlign={{
        points: ['tr', 'br'],
        offset: [0, -15],
        overflow: { adjustX: true, adjustY: true },
      }}
      popup={
        <PopupWrapper>
          <SearchInput
            placeholder="搜索"
            className="searchInput"
            value={searchKeyWords}
            onChange={value => setSearchKeyWords(value)}
          />
          {groups.length ? (
            <div className="contentWrapper">
              <ScrollView>
                {groups.map(group => (
                  <React.Fragment>
                    {renderGroupItem(group)}
                    {group.subVisible && group.childSections.map(subGroup => renderGroupItem(subGroup))}
                  </React.Fragment>
                ))}
              </ScrollView>
            </div>
          ) : (
            <div className="groupItem flexRow alignItemsCenter Gray_9e">{_l('暂无数据')}</div>
          )}
        </PopupWrapper>
      }
    >
      <div ref={groupRef} className={cx('Width250 mRight10', props.className)}>
        {!hideTitle && <p className="mBottom8 bold">{_l('分组')}</p>}
        <Select
          className="selectItem mBottom20"
          open={false}
          placeholder={_l('请选择分组')}
          allowClear={true}
          onClick={() => setGroupPopupVisible(true)}
          value={value}
          options={getGroupOptions()}
          onClear={() => {
            onChange(null);
            setGroupPopupVisible(false);
          }}
          suffixIcon={suffixIcon}
        />
      </div>
    </Trigger>
  );
}
