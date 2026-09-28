import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import sheetAjax from 'src/api/worksheet';
import { AREA } from 'src/pages/worksheet/common/Sheet/GroupFilter/constants.js';
import { defaultNavOpenW } from 'src/pages/worksheet/common/ViewConfig/config.js';
import { replaceControlsTranslateInfo } from 'src/utils/services/translation/app';
import NavGroupAdvancedSettings from './NavGroupAdvancedSettings';
import NavGroupFieldSelector from './NavGroupFieldSelector';
import NavGroupOptions from './NavGroupOptions';
import { Wrap } from './styles';
import { getSetDefault } from './util';

export default function NavGroup(params) {
  const ajaxInfoFnRef = useRef(null);
  const {
    worksheetControls = [],
    view = {},
    updateCurrentView,
    worksheetId,
    columns,
    currentSheetInfo = {},
    appId,
  } = params;
  let [navGroup, setData] = useState({});
  let [filterData, setDatas] = useState();
  let [usenav, setUsenav] = useState(); //空或者0：不使用筛选条件作为默认值 1：使用筛选条件作为默认值 ，老数据后端回兼容，新配置需要前端把这个值设为1
  let [showAddCondition, setShowAddCondition] = useState();
  const [relateSheetInfo, setRelateSheetInfo] = useState([]);
  const [relateControls, setRelateControls] = useState([]);
  const [{ navshow, navfilters, navwidth, appnavtype }, setState] = useSetState({
    navshow: 0,
    navfilters: '[]',
    navwidth: defaultNavOpenW,
    appnavtype: '2',
  });
  const viewNavGroup = view.navGroup;
  const viewAppNavType = _.get(view, 'advancedSetting.appnavtype');
  const getRelate = useCallback(
    worksheetId => {
      ajaxInfoFnRef.current && ajaxInfoFnRef.current.abort();
      const request = sheetAjax.getWorksheetInfo({
        worksheetId,
        getViews: true,
        getTemplate: true,
        relationWorksheetId: worksheetId,
      });
      ajaxInfoFnRef.current = request;
      request.then(
        data => {
          if (ajaxInfoFnRef.current !== request) return;
          ajaxInfoFnRef.current = null;
          const fieldList = data.views
            .filter(item => item.viewType === 2 && String(item.childType) !== '2') //非多表关联层级视图
            .map(o => {
              return { value: o.viewId, text: o.name };
            });
          setRelateSheetInfo(fieldList);
          setRelateControls(replaceControlsTranslateInfo(appId, worksheetId, _.get(data, ['template', 'controls'])));
        },
        () => {
          if (ajaxInfoFnRef.current === request) {
            ajaxInfoFnRef.current = null;
          }
        },
      );
    },
    [appId],
  );
  useEffect(
    () => () => {
      ajaxInfoFnRef.current?.abort();
      ajaxInfoFnRef.current = null;
    },
    [],
  );
  useEffect(() => {
    const { advancedSetting = {} } = view;
    setUsenav(!advancedSetting.usenav || advancedSetting.usenav === '0' ? '0' : '1');
    setState({
      navshow: advancedSetting.navshow,
      navfilters: advancedSetting.navfilters || '[]',
      navwidth: advancedSetting.navwidth || defaultNavOpenW,
      appnavtype: advancedSetting.appnavtype || '2',
    });
  }, [view, setState]);
  useEffect(() => {
    const groupData = viewNavGroup || [];
    const currentNavGroup = groupData.length > 0 ? groupData[0] : {};
    setData(currentNavGroup);
    const { controlId } = currentNavGroup;
    const d = worksheetControls.find(item => item.controlId === controlId) || {};
    setDatas({
      ...currentNavGroup,
      isErr: !d.controlId,
      controlName: d.controlName,
      type: d.type === 30 ? d.sourceControlType : d.type,
    });
    d.type === 29 && d.dataSource && getRelate(d.dataSource);
    if (_.includes([29, 35], d.type) && viewAppNavType === '3') {
      setState({ appnavtype: '2' });
    }
  }, [viewNavGroup, worksheetControls, viewAppNavType, getRelate, setState]);
  const onDelete = () => {
    updateView(undefined);
  };

  const updateView = (navGroup, advancedSetting) => {
    setData(navGroup);
    let editAttrs = ['navGroup'];
    let param = { navGroup: navGroup ? [navGroup] : [] };

    if (advancedSetting) {
      editAttrs.push('advancedSetting');
      param = {
        ...param,
        advancedSetting: advancedSetting,
        editAdKeys: Object.keys(advancedSetting),
      };
    }

    updateCurrentView(
      Object.assign(view, {
        ...param,
        editAttrs: editAttrs,
      }),
    );
  };

  const addNavGroups = data => {
    data = { ...data, type: data.type === 30 ? data.sourceControlType : data.type };
    const d = getSetDefault(data);
    let info = {
      shownullitem: '1', //默认新增显示空
      navsorts: '',
      customnavs: '',
      navlayer: [27].includes(data.type) ? '999' : '',
      navshow: [26, 27, 48].includes(data.type) ? '1' : !['0', '1'].includes(navshow + '') ? '0' : navshow, //新配置需要前端把这个值设为1
      navfilters: JSON.stringify([]),
      usenav: '0', //新配置 默认不勾选
      navsearchtype: _.get(data, 'advancedSetting.searchtype') ? _.get(data, 'advancedSetting.searchtype') : '0', //0或者空 模糊匹配 1：精确搜索
      navsearchcontrol: _.get(data, 'advancedSetting.searchcontrol')
        ? _.get(data, 'advancedSetting.searchcontrol')
        : undefined,
    };

    if ([35].includes(data.type)) {
      info.showallitem = '';
    }

    //兼容处理地区/级联/关联字段 不支持分栏显示
    if ([...AREA, 29, 35].includes(data.type) && !['1', '2'].includes(appnavtype)) {
      info.appnavtype = '2';
    }

    updateView(d, info);
    setShowAddCondition(false);
    data.type === 29 && data.dataSource && getRelate(data.dataSource);
  };

  const updateAdvancedSetting = data => {
    updateCurrentView(
      Object.assign(view, {
        advancedSetting: data,
        editAdKeys: Object.keys(data),
        editAttrs: ['advancedSetting'],
      }),
    );
  };

  return (
    <Wrap>
      {navGroup?.controlId ? (
        <div className="hasData">
          <div className="viewSetTitle">{_l('筛选列表')}</div>
          <div className="textSecondary mTop8 mBottom4">
            {_l('将所选字段选项以列表的形式显示在视图左侧，帮助用户快速查看记录。')}
          </div>
          <div className="con">
            <NavGroupFieldSelector
              filterData={filterData}
              hasSelection
              worksheetControls={worksheetControls}
              worksheetId={worksheetId}
              currentSheetInfo={currentSheetInfo}
              showAddCondition={showAddCondition}
              onAdd={addNavGroups}
              onClear={onDelete}
            />
            {filterData && !filterData.isErr && (
              <NavGroupOptions
                data={filterData}
                navGroup={navGroup}
                view={view}
                relateSheetInfo={relateSheetInfo}
                relateControls={relateControls}
                worksheetControls={worksheetControls}
                currentSheetInfo={currentSheetInfo}
                columns={columns}
                navshow={navshow}
                navfilters={navfilters}
                updateView={updateView}
                updateCurrentView={updateCurrentView}
              />
            )}
          </div>
          <NavGroupAdvancedSettings
            filterData={filterData}
            navGroup={navGroup}
            view={view}
            worksheetControls={worksheetControls}
            navwidth={navwidth}
            usenav={usenav}
            appnavtype={appnavtype}
            setNavWidth={navwidth => setState({ navwidth })}
            updateAdvancedSetting={updateAdvancedSetting}
            updateCurrentView={updateCurrentView}
          />
        </div>
      ) : (
        <NavGroupFieldSelector
          hasSelection={false}
          worksheetControls={worksheetControls}
          worksheetId={worksheetId}
          currentSheetInfo={currentSheetInfo}
          showAddCondition={showAddCondition}
          onAdd={addNavGroups}
        />
      )}
    </Wrap>
  );
}
