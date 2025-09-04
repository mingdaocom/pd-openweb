import React, { useEffect, useRef, useState } from 'react';
import { Export } from '@antv/x6-plugin-export';
import { Scroller } from '@antv/x6-plugin-scroller';
import { register } from '@antv/x6-react-shape';
import _ from 'lodash';
import moment from 'moment';
import { Button, Icon, LoadDiv, Tooltip } from 'ming-ui';
import { EditingBar } from 'ming-ui';
import appManagementApi from 'src/api/appManagement';
import sheetAjax from 'src/api/worksheet';
import CreateNew from 'worksheet/common/WorkSheetLeft/CreateNew';
import { getVisibleControls } from 'src/pages/Print/util';
import { getTranslateInfo } from 'src/utils/app';
import AppSettingHeader from '../AppSettingHeader';
import CustomErNode from './component/CustomErNode';
import Search from './component/Search';
import { stylesheet_er } from './config';
import { createLabelOption, HIDE_FIELDS, isBothWayRelate, LINE_HEIGHT, NODE_WIDTH } from './utils';
import './index.less';

const loadGraph = () => import('@antv/x6');
const loadLayout = () => import('@antv/layout');

register({
  shape: 'custom-er-node',
  width: NODE_WIDTH,
  effect: ['data'],
  component: CustomErNode,
  ports: {
    groups: {
      port1: {
        markup: [
          {
            tagName: 'rect',
            selector: 'portBody',
          },
        ],
        attrs: {
          strict: true,
          portBody: {
            width: NODE_WIDTH,
            height: 2,
            strokeWidth: 1,
            stroke: 'rgba(0,0,0,0)',
            fill: 'rgba(0,0,0,0)',
            magnet: false,
          },
        },
      },
    },
  },
});

function EntityRelationship(props) {
  const { appId } = props;

  const [worksheetList, setWorksheetList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createNewVisible, setCreateNewVisible] = useState(false);
  const [openList, setOpenList] = useState(false);
  const [percent, setPercent] = useState(1);
  const [current, setCurrent] = useState(undefined);
  const [filterWorksheet, setFilterWorksheet] = useState(undefined);
  const graphRef = useRef(null);
  const edgeRef = useRef(null);
  const allData = useRef(null);
  const layoutModuleRef = useRef(null);

  useEffect(() => {
    async function loadComp() {
      const GraphModule = await loadGraph();
      layoutModuleRef.current = await loadLayout();
      graphRef.current = new GraphModule.Graph({
        container: document.getElementById('relationshipWrap'),
        connecting: {
          highlight: true,
          router: {
            name: 'er',
            args: {
              offset: 25,
              direction: 'H',
            },
          },
          createEdge() {
            return new GraphModule.Shape.Edge({
              attrs: {
                line: {
                  stroke: '#A2B1C3',
                  strokeWidth: 2,
                },
              },
            });
          },
        },
        async: true,
        frozen: true,
        autoResize: true,
        panning: false,
        translating: { restrict: true },
        mousewheel: {
          enabled: true,
          factor: 1.1,
          modifiers: ['ctrl', 'meta'],
        },
        scaling: {
          min: 0.01,
          max: 5,
        },
        interacting: () => {
          return {
            nodeMovable: true,
            magnetConnectable: false,
            edgeMovable: false,
            edgeLabelMovable: false,
            arrowheadMovable: false,
            vertexMovable: false,
            vertexAddable: false,
            vertexDeletable: false,
          };
        },
      });
      graphRef.current.use(new Export());
      graphRef.current.use(new Scroller({ enabled: true, pannable: true, padding: 80 }));
      document.addEventListener('keydown', handleKeyDown);
      getData();
      graphRef.current.on('edge:click', ({ edge }) => {
        if (edgeRef.current) {
          cancelEdgeLight();
        }
        if (_.endsWith(edge.id, '-null')) {
          return;
        }
        edgeRef.current = edge.id;
        edge.updateAttrs({
          line: {
            stroke: '#5f95ff',
            strokeWidth: 2,
          },
        });
        $('.searchCurrent') && $('.searchCurrent').removeClass('searchCurrent');
      });
      graphRef.current.on('blank:click', () => {
        $('.searchCurrent') && $('.searchCurrent').removeClass('searchCurrent');
        cancelEdgeLight();
      });
      graphRef.current.on('scale', ({ sx }) => {
        setPercent(sx.toFixed(2));
      });
    }
    loadComp();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const cancelEdgeLight = () => {
    if (!edgeRef.current) return;
    const edge = graphRef.current.getCellById(edgeRef.current);
    edge &&
      edge.updateAttrs({
        line: {
          stroke: '#bdbdbd',
          strokeWidth: 1,
        },
      });
  };

  const updateSource = ({ worksheetId, list, allControls }) => {
    const index = _.findIndex(list, l => l.worksheetId === worksheetId);
    list[index].controls = allControls;

    allData.current = allData.current.map(l => ({
      ...l,
      controls: l.worksheetId === worksheetId ? allControls : l.controls,
    }));
    setWorksheetList(allData.current);
    onLayout(allData.current);
  };

  const handleKeyDown = event => {
    const keyCode = event.keyCode || event.which || event.charCode;
    const ctrlKey = event.ctrlKey || event.metaKey;

    if (ctrlKey && keyCode == 96) {
      event.preventDefault();
      onFitRect();
    }
    return false;
  };

  const getData = () => {
    if (!graphRef.current || !appId) return;
    setLoading(true);
    appManagementApi
      .getAppStructureForER({
        appId: appId,
      })
      .then(res => {
        setLoading(false);
        setWorksheetList(res);
        allData.current = res;
        if (!res.length) return;
        onLayout(res);
        onFitRect();
      });
  };

  const onFilter = ({ worksheetId }) => {
    const selected = allData.current.find(l => l.worksheetId === worksheetId);
    const filterList = allData.current.filter(
      l =>
        l.worksheetId === worksheetId ||
        selected.controls.find(m => m.dataSource === l.worksheetId) ||
        l.controls.find(m => m.dataSource === worksheetId),
    );
    setFilterWorksheet(selected);
    onLayout(filterList, { light: worksheetId });
    onCenterCell(worksheetId);
  };

  const onCloseFilter = () => {
    onLayout(allData.current);
    onCenterCell(filterWorksheet.worksheetId);
    setFilterWorksheet(undefined);
  };

  const onLayout = (list, options = {}) => {
    const { light = undefined } = options;

    const data = list.map(l => ({
      ...l,
      start: 0,
      end: 0,
      index: 0,
    }));
    const nodes = [];
    const edges = [];
    data.forEach((item, dataIndex) => {
      item.controls
        .filter(l => [29, 34].includes(l.type) && l.dataSource !== item.worksheetId)
        .forEach(l => {
          let sourceIndex = _.findIndex(data, m => m.worksheetId === l.dataSource);
          if (sourceIndex < 0 || (isBothWayRelate(l, data[sourceIndex]) && dataIndex > sourceIndex)) return;

          data[dataIndex].start++;
          if (data[sourceIndex]) data[sourceIndex].end++;
        });
    });

    const sortData = data.sort((a, b) => !!(b.start + b.end) - !!(a.start + a.end));

    sortData.forEach((item, dataIndex) => {
      const controls = item.controls.filter(l => !HIDE_FIELDS.includes(l.type));

      let items = _.fill(Array(item.start + item.end), 0).map((l, index) => ({
        id: `${item.worksheetId}-${index}`,
        group: 'port1',
      }));

      const nodeHeight = (controls.slice(0, 10).length + 1) * LINE_HEIGHT + 59;

      nodes.push({
        id: item.worksheetId,
        shape: 'custom-er-node',
        width: NODE_WIDTH,
        height: nodeHeight,
        data: {
          controls: controls.slice(0, 10),
          height: LINE_HEIGHT,
          item: item,
          list,
          appId,
          filter: light,
          count: item.controls.length,
          allControls: item.controls,
          updateSource,
          onFilter,
        },
        ports: {
          groups: {
            port1: {
              position: {
                name: 'line',
                args: {
                  start: { x: 0, y: 0 },
                  end: { x: 0, y: nodeHeight },
                },
              },
            },
          },
          items: items,
        },
      });

      controls
        .filter(l => [29, 34].includes(l.type) && l.dataSource !== item.worksheetId)
        .forEach(l => {
          const targetWorksheetIndex = _.findIndex(sortData, m => m.worksheetId === l.dataSource);
          const isBothRelate = targetWorksheetIndex < 0 ? false : isBothWayRelate(l, sortData[targetWorksheetIndex]);

          if (targetWorksheetIndex < 0 || (isBothRelate && dataIndex > targetWorksheetIndex)) return;

          edges.push({
            id: `${l.controlId}-${l.dataSource}`,
            shape: 'edge',
            labels: createLabelOption(l, sortData[targetWorksheetIndex]),
            source: {
              cell: item.worksheetId,
              port: `${item.worksheetId}-${sortData[dataIndex].index}`,
            },
            target: {
              cell: l.dataSource,
              port: `${l.dataSource}-${sortData[targetWorksheetIndex].index}`,
            },
            attrs: {
              line: {
                stroke: '#bdbdbd',
                strokeWidth: 1,
                sourceMarker: isBothRelate ? 'block' : null,
                targetMarker: 'block',
              },
            },
            zIndex: 0,
            router: {
              name: 'er',
              args: {
                offset: 'center',
                direction: 'H',
                min: 25,
              },
            },
            connector: {
              name: 'rounded',
              args: {},
            },
          });
          sortData[dataIndex].index++;
          sortData[targetWorksheetIndex].index++;
        });
    });
    const normalData = sortData.filter(l => !l.start && !l.end);
    normalData.forEach((l, i) => {
      if ((i + 1) % 10 === 0 || !normalData[i + 1]) return;
      edges.push({
        id: `${l.worksheetId}-${normalData[i + 1].worksheetId}-null`,
        shape: 'edge',
        source: {
          cell: l.worksheetId,
        },
        target: {
          cell: normalData[i + 1].worksheetId,
        },
        attrs: {
          line: {
            stroke: 'rgba(0,0,0,0)',
            strokeWidth: 1,
            sourceMarker: null,
            targetMarker: null,
          },
        },
        zIndex: 0,
        router: {
          name: 'er',
          args: {
            offset: 'center',
            direction: 'H',
            min: 25,
          },
        },
        connector: {
          name: 'rounded',
          args: {},
        },
      });
    });

    const dagreLayout = new layoutModuleRef.current.DagreLayout({
      type: 'dagre',
      rankdir: 'LR',
      align: 'UL',
      ranksep: 65,
    });

    const model = dagreLayout.layout({ nodes, edges });
    const positionX = {};
    const newNodes = model.nodes.map(l => {
      const y = positionX[l.x] !== undefined ? positionX[l.x] + 20 : 0;

      positionX[l.x] = positionX[l.x] !== undefined ? positionX[l.x] + l.height + 20 : l.height;

      return {
        ...l,
        y,
      };
    });

    graphRef.current.fromJSON({ nodes: newNodes, edges: model.edges });
  };

  const onCreate = async (type, param) => {
    const { name } = param;
    const res = await appManagementApi.addWorkSheet({
      appId,
      appSectionId: props.data.sections[0].appSectionId,
      name,
      icon: 'table',
      type: 0,
    });
    const newWorksheetInfo = await sheetAjax.getWorksheetInfo({
      getRules: true,
      getTemplate: true,
      worksheetId: res.workSheetId,
    });

    const controls = getVisibleControls(_.get(newWorksheetInfo, 'template.controls')).filter(
      l => l.controlId.length === 24,
    );
    let info = {
      worksheetName: newWorksheetInfo.name,
      worksheetId: res.workSheetId,
      controls: controls,
    };
    let list = allData.current.concat(info);
    setWorksheetList(list);
    allData.current = list;
    onLayout(list);
    setCreateNewVisible(false);
    onCenterCell(res.workSheetId);
  };

  const setGraphZoom = type => {
    //type false sub   true add
    const lastZoom = graphRef.current.zoom();

    graphRef.current.zoomTo(type ? lastZoom + 0.1 : lastZoom - 0.1, {
      minScale: 0.1,
      scaleGrid: 0.05,
      maxScale: 5,
    });
  };

  const onFitRect = () => {
    const rectWidth = $('#relationshipWrap').width();
    const rectHeight = $('#relationshipWrap').height();
    graphRef.current.zoomToFit({
      rect: {
        x: 0,
        y: 0,
        width: rectWidth,
        height: rectHeight,
      },
      padding: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 160,
      },
    });
  };

  const onRestore = () => {
    graphRef.current.zoomTo(1);
    graphRef.current.centerContent();
  };

  const onExport = () => {
    const { name } = props.data;
    const erFileName = `${name}-${_l('关系图')}-${moment().format('YYYY-MM-DD-HH_mm_ss')}.png`;

    if (!graphRef.current) return;

    const rawZoom = graphRef.current.zoom ? graphRef.current.zoom() : 1;
    // 保留两位小数并做下限保护（防止除 0）
    const currentZoom = Math.max(0.01, Number(rawZoom.toFixed(2)));
    const bbox = graphRef.current.getContentBBox();
    // 计算原始尺寸
    const unzoomedWidth = bbox.width / (currentZoom || 1);
    const unzoomedHeight = bbox.height / (currentZoom || 1);

    const scale = 1.5;
    const exportWidth = Math.round(unzoomedWidth * scale);
    const exportHeight = Math.round(unzoomedHeight * scale);

    graphRef.current.exportPNG(erFileName, {
      width: exportWidth,
      height: exportHeight,
      padding: 40,
      backgroundColor: '#f0f0f0',
      stylesheet: stylesheet_er,
    });
  };

  const onCenterCell = worksheetId => {
    const cell = graphRef.current.getCellById(worksheetId);

    if (cell) {
      graphRef.current.centerCell(cell);
    }
  };

  const onClickSearch = id => {
    if (current) {
      $('.searchCurrent').removeClass('searchCurrent');
    }
    setCurrent(id);
    $(`#customErNode-${id}`).addClass('searchCurrent');
    graphRef.current.zoomTo(1);
    onCenterCell(id);
  };

  const renderEmpty = () => {
    return (
      <div className="emptyWrap">
        <span className="mBottom20 iconBox ThemeBG">
          <Icon icon="circle_three" className="Gray_bd" />
        </span>
        <div className="mBottom24 Gray_9e Font17">{_l('暂未添加工作表')}</div>
        <Button onClick={() => setCreateNewVisible(true)}>{_l('新建工作表')}</Button>
      </div>
    );
  };

  return (
    <div className="w100 h100 relative">
      {loading && (
        <div className="LoadBox">
          <LoadDiv />
        </div>
      )}
      <div id="relationshipWrap" className="relationshipWrap">
        {!loading && !worksheetList.length && renderEmpty()}
      </div>
      {!filterWorksheet && (
        <AppSettingHeader
          warpClassName="topButtons"
          addBtnName={_l('工作表')}
          extraElement={
            <Search
              warpClassName="topButtons"
              openList={openList}
              appId={appId}
              list={worksheetList}
              onClick={onClickSearch}
              onClickAway={() => setOpenList(false)}
              setOpenList={setOpenList}
            />
          }
          handleAdd={() => setCreateNewVisible(true)}
        />
      )}

      <div className="quickActions-relationship">
        <span className="Font13 Gray percent">{`${Math.round(percent * 100)}%`}</span>
        <Icon icon="minus" className="Gray_75 Font19 Hand Hover_21 mRight20" onClick={() => setGraphZoom(false)} />
        <Icon icon="add1" className="Gray_75 Font19 Hand mRight20 Hover_21 " onClick={() => setGraphZoom(true)} />
        <Tooltip text={_l('适合画布(cmd+0)')}>
          <Icon icon="full_screen" className="Gray_75 Font20 Hand mRight20 Hover_21" onClick={onFitRect} />
        </Tooltip>
        <Tooltip text={_l('等比显示')}>
          <Icon icon="enlarge" className="Gray_75 restore Hand Font20 Hover_21" onClick={onRestore} />
        </Tooltip>
        <span className="splintLint"></span>
        <Tooltip text={_l('导出为图片')}>
          <Icon icon="download" className="Gray_75 Font16 Hand Hover_21" onClick={onExport} />
        </Tooltip>
      </div>

      {createNewVisible && (
        <CreateNew type={'worksheet'} onCreate={onCreate} onCancel={() => setCreateNewVisible(false)} />
      )}

      {!!filterWorksheet && (
        <EditingBar
          isBlack
          visible={!!filterWorksheet}
          title={
            <div className="valignWrapper">
              {_l(
                '当前焦点：%0',
                getTranslateInfo(appId, null, filterWorksheet.worksheetId).name || filterWorksheet.worksheetName,
              )}
              <Tooltip
                themeColor="white"
                autoCloseDelay={0}
                text={_l(
                  '仅显示%0的关联关系，退出后可显示所有工作表',
                  getTranslateInfo(appId, null, filterWorksheet.worksheetId).name || filterWorksheet.worksheetName,
                )}
              >
                <Icon icon="info_outline" className="White Font16 mLeft6" />
              </Tooltip>
            </div>
          }
          cancelText={null}
          defaultTop={-72}
          visibleTop={20}
          updateText={_l('退出')}
          onUpdate={onCloseFilter}
        />
      )}
    </div>
  );
}

export default EntityRelationship;
