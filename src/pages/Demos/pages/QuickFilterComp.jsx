import React, { useState } from 'react';
import Filters from 'src/pages/worksheet/common/Sheet/QuickFilter/Filters';

const FILTERS = JSON.parse(
  '[{"controlId":"629dd5236c2604a91390fb41","dataType":11,"spliceType":0,"filterType":0,"dateRange":0,"dateRangeType":0,"value":"","values":[],"minValue":"","maxValue":"","isAsc":false,"dynamicSource":[],"advancedSetting":{"direction":"1","allowitem":"2"},"control":{"controlId":"629dd5236c2604a91390fb41","controlName":"单选","type":11,"attribute":0,"row":2,"col":0,"hint":"","default":"[\\"6a1cc04f-420b-4f22-9439-9ffa2a662508\\"]","dot":0,"unit":"","enumDefault":0,"enumDefault2":1,"defaultMen":[],"dataSource":"","sourceControlId":"","sourceControlType":0,"showControls":[],"noticeItem":0,"userPermission":0,"options":[{"key":"6a1cc04f-420b-4f22-9439-9ffa2a662508","value":"选项1","index":1,"isDeleted":false,"color":"#2196F3","score":0},{"key":"c3812d84-6339-402c-a76e-5b9c450d9095","value":"选项2","index":2,"isDeleted":false,"color":"#08C9C9","score":0},{"key":"9969a768-d1b9-4d20-8f71-8884df6c68d3","value":"选项3","index":3,"isDeleted":false,"color":"#00C345","score":0},{"key":"cdc7e2d8-75c3-44a1-a35b-e6d5bf678a83","value":"选项4","index":4,"isDeleted":false,"color":"#FAD714","score":0},{"key":"37a95c89-82d1-49bb-9c95-329cef42d5c0","value":"选项5","index":5,"isDeleted":false,"color":"#FF9300","score":0},{"key":"83fadb06-539b-42b0-ba72-dfb24e56963d","value":"选项6","index":6,"isDeleted":false,"color":"#F52222","score":0},{"key":"1bfb2aa3-b74c-4ddf-823a-d8b5702c9f17","value":"选项7","index":7,"isDeleted":false,"color":"#EB2F96","score":0},{"key":"395c7cb5-e976-4ca1-b53f-5618efdffbb5","value":"选项8","index":8,"isDeleted":false,"color":"#7500EA","score":0},{"key":"395c7cb5-e976-4ca1-b53f-5618efdffbb5","value":"选项8","index":8,"isDeleted":false,"color":"#7500EA","score":0},{"key":"395c7cb5-e976-4ca1-b53f-5618efdffbb5","value":"选项8","index":8,"isDeleted":false,"color":"#7500EA","score":0},{"key":"395c7cb5-e976-4ca1-b53f-5618efdffbb5","value":"选项8","index":8,"isDeleted":false,"color":"#7500EA","score":0},{"key":"395c7cb5-e976-4ca1-b53f-5618efdffbb5","value":"选项8","index":8,"isDeleted":false,"color":"#7500EA","score":0},{"key":"395c7cb5-e976-4ca1-b53f-5618efdffbb5","value":"选项8","index":8,"isDeleted":false,"color":"#7500EA","score":0},{"key":"395c7cb5-e976-4ca1-b53f-5618efdffbb5","value":"选项选项选项选项选项选项选项选项8","index":8,"isDeleted":false,"color":"#7500EA","score":0},{"key":"395c7cb5-e976-4ca1-b53f-5618efdffbb5","value":"选项8","index":8,"isDeleted":false,"color":"#7500EA","score":0},{"key":"44773a80-ec79-49c6-8c8b-b5be5c2dd2ec","value":"选项9","index":9,"isDeleted":false,"color":"#2D46C4","score":0},{"key":"c8a81ef5-cbe2-421a-8224-feb58031dec5","value":"选项10","index":10,"isDeleted":false,"color":"#484848","score":0}],"required":false,"half":false,"value":"[\\"6a1cc04f-420b-4f22-9439-9ffa2a662508\\"]","relationControls":[],"viewId":"","controlPermissions":"111","unique":false,"coverCid":"","strDefault":"","desc":"","fieldPermission":"","advancedSetting":{"showtype":"0"},"alias":"","size":6,"editAttrs":[],"deleteAccountId":"","deleteTime":"0001-01-01 08:05:00","lastEditTime":"0001-01-01 00:00:00","disabled":false,"checked":false}},{"controlId":"1","type":2,"fid":"1","control":{"controlId":"1","type":2}},{"controlId":"2","type":2,"fid":"2","control":{"controlId":"2","type":2}},{"controlId":"3","type":15,"fid":"3","control":{"controlId":"3","type":15}},{"controlId":"4","type":6,"fid":"4","control":{"controlId":"4","type":6}}]',
);

export default function D(props) {
  const [filters, setFilters] = useState(FILTERS);
  const [showBtn, setShowBtn] = useState();
  const [activeFilterId, setActiveFilterId] = useState();
  return (
    <div style={{ width: '80%', margin: '100px auto' }}>
      <h3>filters</h3>
      <textarea
        style={{
          width: '100%',
          height: 100,
        }}
        value={JSON.stringify(filters)}
        onChange={e => setFilters(JSON.parse(e.target.value))}
      ></textarea>
      <div>
        <label htmlFor="showBtn">
          显示按钮：
          <input type="checkbox" id="showBtn" value={showBtn} onClick={() => setShowBtn(!showBtn)} />
        </label>
      </div>
      <br />
      {/* 配置 */}
      <Filters
        mode="config"
        enableBtn={showBtn}
        filters={filters}
        activeFilterId={activeFilterId}
        onFilterClick={(id, item) => {
          console.log('new selected filter is', item);
          setActiveFilterId(id);
        }}
      />
      <br />
      {/* 查询 */}
      <Filters
        enableBtn={showBtn}
        filters={filters}
        updateQuickFilter={queryFilters => {
          console.log('updateQuickFilter', queryFilters);
        }}
        resetQuickFilter={() => {
          console.log('resetQuickFilter');
        }}
      />
    </div>
  );
}
