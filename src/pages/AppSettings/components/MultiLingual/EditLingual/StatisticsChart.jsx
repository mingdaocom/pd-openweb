import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Input } from 'antd';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon, LoadDiv, ScrollView } from 'ming-ui';
import report from 'statistics/api/report';
import { getTranslateInfo } from 'src/utils/app';
import { LANG_DATA_TYPE } from '../config';
import EditInput from './EditInput';

const Wrap = styled.div`
  .reportNav {
    width: 180px;
    .report {
      height: 36px;
      border-radius: 4px;
      padding: 0 10px;
      margin-right: 12px;
      &:hover {
        background-color: #f5f5f5;
      }
    }
  }
  .reportContent {
    flex: 1;
  }
  .reportWrap {
    .reportName {
      padding: 3px;
    }
    .nodeItem {
      padding: 0 3px;
    }
  }
`;

export default function StatisticsChart(props) {
  const { app, selectNode, translateData, comparisonLangId, comparisonLangData, onEditAppLang } = props;
  const [loading, setLoading] = useState(true);
  const [reportList, setReportList] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const scrollViewRef = useRef();

  useEffect(() => {
    setLoading(true);
    report
      .list({
        appId: selectNode.workSheetId,
        isOwner: false,
        pageIndex: -1,
      })
      .then(data => {
        setLoading(false);
        setReportList(data.reports);
      });
  }, [selectNode.key]);

  if (loading) {
    return (
      <div className="flexRow alignItemsCenter justifyContentCenter h100">
        <LoadDiv />
      </div>
    );
  }

  if (!reportList.length) {
    return (
      <div className="flexRow alignItemsCenter justifyContentCenter h100 Gray_9e Font14">{_l('没有统计图表')}</div>
    );
  }

  const handlePositionReport = item => {
    const el = document.querySelector(`.report-${item.id}`);
    const className = 'highlight';
    const highlightEl = el.querySelector('.reportName');
    $(highlightEl)
      .addClass(className)
      .on('webkitAnimationEnd oAnimationEnd MSAnimationEnd animationend', function () {
        $(this).removeClass(className);
      });
    $(scrollViewRef.current.nanoScroller).nanoScroller({ scrollTop: el.offsetTop });
  };

  const renderReportNav = item => {
    const data = _.find(translateData, { correlationId: item.id }) || {};
    const translateInfo = data.data || {};
    return (
      <div className="report flexRow alignItemsCenter pointer" key={item.id} onClick={() => handlePositionReport(item)}>
        <span className="mLeft5 Font13 ellipsis">{translateInfo.name || item.name}</span>
      </div>
    );
  };

  const renderReportContent = item => {
    const data = _.find(translateData, { correlationId: item.id }) || {};
    const translateInfo = data.data || {};
    const comparisonLangInfo = getTranslateInfo(app.id, null, item.id, comparisonLangData);

    const handleSave = info => {
      onEditAppLang({
        id: data.id,
        parentId: selectNode.workSheetId,
        correlationId: item.id,
        type: LANG_DATA_TYPE.wrokSheetStatistics,
        data: {
          ...translateInfo,
          ...info,
        },
      });
    };

    return (
      <div className={cx('flexColumn mBottom30 reportWrap', `report-${item.id}`)} key={item.id}>
        <div className="flexRow alignItemsCenter mBottom15 reportName">
          <span className="flex Font14 bold ellipsis">{translateInfo.name || item.name}</span>
        </div>
        <div className="flexRow alignItemsCenter nodeItem">
          <div className="Font13 mRight20 label">{_l('图表名称')}</div>
          <Input
            className="flex mRight20"
            value={comparisonLangId ? comparisonLangInfo.name : item.name}
            disabled={true}
          />
          <EditInput className="flex" value={translateInfo.name} onChange={value => handleSave({ name: value })} />
        </div>
        <div className="flexRow alignItemsCenter nodeItem">
          <div className="Font13 mRight20 label">{_l('图表说明')}</div>
          <Input
            className="flex mRight20"
            value={comparisonLangId ? comparisonLangInfo.description : item.desc}
            disabled={true}
          />
          <EditInput
            className="flex"
            disabled={!item.desc}
            value={translateInfo.description}
            onChange={value => handleSave({ description: value })}
          />
        </div>
      </div>
    );
  };

  return (
    <Wrap className="flexRow pAll10 h100">
      <div className="reportNav flexColumn">
        <div className="searchWrap flexRow alignItemsCenter mBottom10">
          <Icon className="Gray_9e Font20 mRight5" icon="search" />
          <input
            placeholder={_l('统计')}
            className="flex"
            value={searchValue}
            onChange={e => {
              setSearchValue(e.target.value);
            }}
          />
          {searchValue && (
            <Icon className="Gray_9e pointer Font15" icon="closeelement-bg-circle" onClick={() => setSearchValue('')} />
          )}
        </div>
        <ScrollView className="flex">
          {reportList.filter(report => report.name.includes(searchValue)).map(report => renderReportNav(report))}
        </ScrollView>
      </div>
      <ScrollView className="reportContent" ref={scrollViewRef}>
        <div className="pLeft20 pRight20">{reportList.map(report => renderReportContent(report))}</div>
      </ScrollView>
    </Wrap>
  );
}
