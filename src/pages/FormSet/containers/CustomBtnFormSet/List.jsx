import React from 'react';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import BtnTd from '../../components/BtnTd';
import { ArrowDown, ArrowUp } from './style';

export default function List({
  btnList,
  getSheetBtns,
  list,
  onChange,
  searchKeywords,
  setSortDirection,
  sortDirection,
  worksheetId,
  worksheetInfo,
}) {
  if (list.length <= 0) {
    // 搜索无结果和真实空列表复用空态样式，但文案需要区分用户当前操作。
    return (
      <p className="noData pTop40">
        <Icon icon="custom_actions" className="icon" />
        <br />
        {searchKeywords ? _l('没有找到符合条件的结果') : _l('暂无自定义动作')}
      </p>
    );
  }

  let singleBtns = list.filter(o => !o.isBatch);
  let batchBtns = list.filter(o => o.isBatch);

  // 自定义动作按“详情动作/批量动作”分区展示，排序只影响各自分区内顺序。
  if (sortDirection !== '') {
    singleBtns = singleBtns.sort((a, b) => {
      return sortDirection === 'ASC'
        ? a.name.charCodeAt(0) - b.name.charCodeAt(0)
        : b.name.charCodeAt(0) - a.name.charCodeAt(0);
    });
    batchBtns = batchBtns.sort((a, b) => {
      return sortDirection === 'ASC'
        ? a.name.charCodeAt(0) - b.name.charCodeAt(0)
        : b.name.charCodeAt(0) - a.name.charCodeAt(0);
    });
  }

  const renderBtn = it => (
    <BtnTd
      appId={worksheetInfo.appId}
      views={worksheetInfo.views}
      getSheetBtns={getSheetBtns}
      key={it.btnId}
      it={it}
      worksheetId={worksheetId}
      btnList={btnList}
      onChange={onChange}
    />
  );

  return (
    <div className="printTemplatesList flex overflowHidden flexColumn">
      <div className="printTemplatesList-header">
        <div
          className="name flex mRight20 valignWrapper Hand sortFields"
          onClick={() => setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC')}
        >
          <div className="flex">{_l('名称')}</div>
          <div className="flexColumn">
            <ArrowUp className={cx({ active: sortDirection === 'ASC' })} />
            <ArrowDown className={cx({ active: sortDirection === 'DESC' })} />
          </div>
        </div>
        <div className="views flex mRight20">{_l('使用范围')}</div>
        <div className="action mRight8 w120px">{_l('操作')}</div>
        <div className="more w80px"></div>
      </div>
      <div className="printTemplatesList-box flex">
        {singleBtns.map(renderBtn)}
        {!!batchBtns.length && <p className="textTertiary Font15 mTop12 pLeft11">{_l('批量数据源')}</p>}
        {batchBtns.map(renderBtn)}
      </div>
    </div>
  );
}
