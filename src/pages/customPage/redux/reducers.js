import update from 'immutability-helper';
import _ from 'lodash';
import maxBy from 'lodash/maxBy';
import { v4 as uuidv4 } from 'uuid';
import { enumWidgetType, getDefaultLayout, getIndexById } from '../util';
import {
  ADD_WIDGET,
  COPY_WIDGET,
  DEL_TABS_WIDGET,
  DEL_WIDGET,
  DEL_WIDGET_TAB,
  DELETE_LINKAGE_FILTERS_GROUP,
  INSET_TITLE,
  UPDATE_COMPONENTS,
  UPDATE_EDIT_PAGE_VISIBLE,
  UPDATE_FILTERS_GROUP,
  UPDATE_LAYOUT,
  UPDATE_LINKAGE_FILTERS_GROUP,
  UPDATE_LOADING,
  UPDATE_MODIFIED,
  UPDATE_PAGE_INFO,
  UPDATE_SAVE_LOADING,
  UPDATE_WIDGET,
  UPDATE_WIDGET_VISIBLE,
} from './actionType';

const initialState = {
  loading: true,
  modified: false,
  pageName: '',
  visible: false,
  pageId: '',
  desc: '',
  adjustScreen: false,
  version: null,
  apk: {},
  components: [],
  filtersGroup: {},
  linkageFiltersGroup: {},
  filterComponents: [],
  loadFilterComponentCount: 0,
};

function updateLayout(state, payload) {
  // 更新移动布局的layout时可能是部分更新，所以要将显示的component传过来
  const { layoutType, layouts, components, adjustScreen } = payload;
  if (!layouts) return state;
  if (_.includes(['web', 'mobile'], layoutType)) {
    return update(state, {
      components: {
        $apply: items => {
          return items.map(item => {
            const index = _.findIndex(components, v => (v.id || v.uuid) === (item.id || item.uuid));
            if (index >= 0) {
              const data = layouts[index];
              const maxH = 40;
              if (adjustScreen && data.h >= maxH) {
                data.h = maxH;
              }
              return update(item, {
                [layoutType]: { layout: { $set: _.pick(data, ['x', 'y', 'w', 'h', 'minW', 'minH', 'maxH']) } },
              });
            } else {
              return item;
            }
          });
        },
      },
    });
  }
  return state;
}

function getIndex(state, component) {
  return getIndexById({ component, components: state.components });
}
function updateWidgetVisible(state, payload) {
  const { widget, layoutType } = payload;
  return update(state, { components: { [getIndex(state, widget)]: { [layoutType]: { $toggle: ['visible'] } } } });
}

// 获取单行中x最大的组件
function getMaxXComponentInSingleLine(layouts, y) {
  return maxBy(
    _.filter(layouts, v => v.y === y),
    item => item.x,
  );
}
/**
 * 组件复制
 * 布局自适应，优先放在当前行，位置不够则放在最后一行
 * @param {*} components
 * @param {*} layout
 */
function copyWebLayout(components, layout) {
  const { y, w } = layout;
  const layouts = components.map(item => _.get(item, ['web', 'layout'])).filter(_ => _);
  const { x: maxX, w: maxW } = getMaxXComponentInSingleLine(layouts, y);
  // 如果当前行放不下则从最后一行开始放
  if (maxX + maxW + w > 12) {
    const { y: maxY } = maxBy(layouts, item => item.y);
    // 如果最后一行就是当前行 则直接放到下一行
    if (maxY === y) {
      return { ...layout, x: 0, y: Infinity };
    }
    const { x, w: lastLineComponentW } = getMaxXComponentInSingleLine(layouts, maxY);
    // 如果最后一行放不下
    if (x + lastLineComponentW + w > 12) {
      return { ...layout, x: 0, y: Infinity };
    }
    return { ...layout, x: x + lastLineComponentW, y: maxY };
  }

  return { ...layout, x: maxX + maxW };
}
function copyWidget(state, payload) {
  const { web, button, ...rest } = payload;
  let newButton = button;

  if (rest.type === enumWidgetType.button) {
    const { buttonList = [] } = button || {};
    newButton = {
      ...button,
      buttonList: buttonList.map(item => {
        const config = _.get(item, 'config') || {};
        const btn = {
          ...item,
          btnId: null,
          filterId: null,
          id: uuidv4(),
        };
        if (config.isFilter) {
          btn.config = { ...config, isFilter: undefined };
        }
        return btn;
      }),
    };
  }

  return update(state, {
    modified: { $set: true },
    components: {
      $push: [
        {
          ...rest,
          uuid: uuidv4(),
          button: newButton,
          web: update(web, {
            layout: {
              $apply: item => copyWebLayout(state.components, item),
            },
          }),
        },
      ],
    },
  });
}
export default function customPage(state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case UPDATE_PAGE_INFO:
      return update(state, { $apply: item => ({ ...item, ...payload }) });
    case UPDATE_LOADING:
      return update(state, { loading: { $set: payload } });
    case UPDATE_SAVE_LOADING:
      return update(state, { saveLoading: { $set: payload } });
    case UPDATE_EDIT_PAGE_VISIBLE:
      if (!state.pageId) {
        _.keys(sessionStorage)
          .filter(item => _.includes(item, 'customPageEditVisible-'))
          .forEach(key => sessionStorage.removeItem(key));
      } else {
        sessionStorage.setItem(`customPageEditVisible-${state.pageId}`, String(payload));
      }
      const chat = document.querySelector('#chat');
      if (chat) {
        payload ? chat.classList.add('hide') : chat.classList.remove('hide');
      }
      return update(state, { visible: { $set: payload } });
    case UPDATE_MODIFIED:
      return update(state, { modified: { $set: payload } });
    case ADD_WIDGET:
      const uuid = uuidv4();
      const addData = {
        modified: { $set: true },
        components: {
          $push: [
            {
              ...payload,
              uuid,
              web: {
                title: '',
                titleVisible: false,
                visible: true,
                layout: getDefaultLayout({
                  components: (() => {
                    if (payload.tabId) {
                      return state.components.filter(c => c.tabId === payload.tabId);
                    }
                    if (payload.sectionId) {
                      return state.components.filter(c => c.sectionId === payload.sectionId);
                    }
                    return state.components;
                  })(),
                  layoutType: 'web',
                  type: payload.type,
                  config: payload.config,
                }),
              },
              mobile: {
                title: '',
                titleVisible: false,
                visible: true,
                layout: null,
              },
            },
          ],
        },
      };
      if (payload.type === 'filter') {
        const { loadFilterComponentCount } = state;
        const { filter } = payload;
        addData.loadFilterComponentCount = {
          $set: loadFilterComponentCount + 1,
        };
        addData.filterComponents = {
          $push: [
            {
              value: uuid,
              advancedSetting: filter.advancedSetting || {},
              filters: _.flatten(filter.filters.map(item => item.objectControls)),
            },
          ],
        };
      }
      return update(state, addData);
    case COPY_WIDGET:
      return copyWidget(state, payload);
    case UPDATE_WIDGET_VISIBLE:
      return updateWidgetVisible(state, payload);
    case DEL_WIDGET:
      const delData = update(state, {
        components: { $splice: [[getIndexById({ component: payload, components: state.components }), 1]] },
        modified: { $set: true },
      });
      if (payload.type === enumWidgetType.filter || payload.type === 'filter') {
        const { loadFilterComponentCount } = state;
        delData.loadFilterComponentCount = loadFilterComponentCount - 1;
        delData.filterComponents = delData.filterComponents.filter(
          item => item.value !== (payload.value || payload.uuid),
        );
      }
      return delData;
    case DEL_TABS_WIDGET:
      const objectId = _.get(payload, 'config.objectId');
      return {
        ...state,
        components: state.components.filter(c => {
          if (_.get(c, 'config.objectId') === objectId) {
            return false;
          }
          if (c.sectionId === objectId) {
            return false;
          }
          return true;
        }),
      };
    case DEL_WIDGET_TAB:
      const { tabId } = payload;
      return {
        ...state,
        components: state.components.filter(c => {
          if (c.tabId === tabId) {
            return false;
          }
          return true;
        }),
      };
    case UPDATE_WIDGET:
      const { widget, layoutType, ...rest } = payload;
      let result = {};
      // 更新对应布局里的标题或者统一的value
      if (layoutType) {
        result = update(state, {
          components: {
            [getIndexById({ component: widget, components: state.components })]: {
              [payload.layoutType]: { $apply: item => ({ ...item, ...rest }) },
            },
          },
          modified: { $set: true },
        });
      } else {
        result = update(state, {
          components: {
            [getIndexById({ component: widget, components: state.components })]: {
              $apply: item => ({ ...item, ...rest }),
            },
          },
          modified: { $set: true },
        });
      }
      if (result.filterComponents.length) {
        result.filterComponents = result.filterComponents.map(item => {
          if (item.value === (widget.value || widget.uuid)) {
            const { advancedSetting } = payload.filter || {};
            return {
              ...item,
              advancedSetting,
            };
          } else {
            return item;
          }
        });
      }
      return result;
    case UPDATE_LAYOUT:
      return updateLayout(state, payload);
    case UPDATE_COMPONENTS:
      return update(state, { components: { $set: payload } });
    case INSET_TITLE:
      const { visible } = payload;
      return update(state, {
        modified: { $set: true },
        components: {
          [getIndexById({ component: payload.widget, components: state.components })]: {
            [payload.layoutType]: {
              titleVisible: { $set: visible },
              layout: { $apply: item => (item ? { ...item, h: visible ? item.h + 1 : item.h - 1 } : item) },
            },
          },
        },
      });
    case UPDATE_FILTERS_GROUP:
      return {
        ...state,
        filtersGroup: {
          ...state.filtersGroup,
          [payload.value]: payload.filters,
        },
      };
    case UPDATE_LINKAGE_FILTERS_GROUP:
      return {
        ...state,
        linkageFiltersGroup: {
          ...state.linkageFiltersGroup,
          [payload.value]: payload.filters,
        },
      };
    case DELETE_LINKAGE_FILTERS_GROUP:
      delete state.linkageFiltersGroup[payload.value];
      return {
        ...state,
        linkageFiltersGroup: {
          ...state.linkageFiltersGroup,
        },
      };
    default:
      return state;
  }
}
