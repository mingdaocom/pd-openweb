import _ from 'lodash';
import maxBy from 'lodash/maxBy';
import { v4 as uuidv4 } from 'uuid';
import { enumWidgetType, getDefaultLayout } from 'src/utils/domain/customPage/model';
import { getIndexById } from '../util';
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
  remark: '',
  adjustScreen: false,
  version: null,
  apk: {},
  components: [],
  imageUrl: '',
  previewUrl: '',
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
    return {
      ...state,
      components: state.components.map(item => {
        const index = _.findIndex(components, v => (v.id || v.uuid) === (item.id || item.uuid));

        if (index < 0) {
          return item;
        }

        const data = layouts[index];
        const maxH = 40;
        const layout = _.pick(data, ['x', 'y', 'w', 'h', 'minW', 'minH', 'maxH']);

        if (adjustScreen && layout.h >= maxH) {
          layout.h = maxH;
        }

        return {
          ...item,
          [layoutType]: {
            ...item[layoutType],
            layout,
          },
        };
      }),
    };
  }

  return state;
}

function getIndex(state, component) {
  return getIndexById({ component, components: state.components });
}

function updateWidgetVisible(state, payload) {
  const { widget, layoutType } = payload;
  const index = getIndex(state, widget);

  return {
    ...state,
    components: state.components.map((item, currentIndex) =>
      currentIndex === index
        ? {
            ...item,
            [layoutType]: {
              ...item[layoutType],
              visible: !item[layoutType].visible,
            },
          }
        : item,
    ),
  };
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

  return {
    ...state,
    modified: true,
    components: [
      ...state.components,
      {
        ...rest,
        uuid: uuidv4(),
        button: newButton,
        web: {
          ...web,
          layout: copyWebLayout(state.components, web.layout),
        },
      },
    ],
  };
}

export default function customPage(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case UPDATE_PAGE_INFO:
      return { ...state, ...payload };
    case UPDATE_LOADING:
      return { ...state, loading: payload };
    case UPDATE_SAVE_LOADING:
      return { ...state, saveLoading: payload };
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

      return { ...state, visible: payload };
    case UPDATE_MODIFIED:
      return { ...state, modified: payload };
    case ADD_WIDGET:
      const uuid = uuidv4();
      const component = {
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
      };
      const addData = {
        ...state,
        modified: true,
        components: [...state.components, component],
      };

      if (payload.type === 'filter') {
        const { loadFilterComponentCount } = state;
        const { filter } = payload;
        addData.loadFilterComponentCount = loadFilterComponentCount + 1;
        addData.filterComponents = [
          ...state.filterComponents,
          {
            value: uuid,
            advancedSetting: filter.advancedSetting || {},
            filters: _.flatten(filter.filters.map(item => item.objectControls)),
          },
        ];
      }

      return addData;
    case COPY_WIDGET:
      return copyWidget(state, payload);
    case UPDATE_WIDGET_VISIBLE:
      return updateWidgetVisible(state, payload);
    case DEL_WIDGET:
      const components = [...state.components];
      components.splice(getIndexById({ component: payload, components: state.components }), 1);
      const delData = {
        ...state,
        components,
        modified: true,
      };

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
      const componentIndex = getIndexById({ component: widget, components: state.components });
      const nextComponents = [...state.components];

      // 更新对应布局里的标题或者统一的value
      if (layoutType) {
        nextComponents[componentIndex] = {
          ...nextComponents[componentIndex],
          [layoutType]: {
            ...nextComponents[componentIndex][layoutType],
            ...rest,
          },
        };
      } else {
        nextComponents[componentIndex] = {
          ...nextComponents[componentIndex],
          ...rest,
        };
      }

      result = { ...state, components: nextComponents, modified: true };

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
      return { ...state, components: payload };
    case INSET_TITLE:
      const { visible } = payload;
      const titleComponentIndex = getIndexById({ component: payload.widget, components: state.components });
      const titleComponents = [...state.components];
      const titleComponent = titleComponents[titleComponentIndex];
      const titleLayout = titleComponent[payload.layoutType].layout;
      titleComponents[titleComponentIndex] = {
        ...titleComponent,
        [payload.layoutType]: {
          ...titleComponent[payload.layoutType],
          titleVisible: visible,
          layout: titleLayout ? { ...titleLayout, h: visible ? titleLayout.h + 1 : titleLayout.h - 1 } : titleLayout,
        },
      };
      return {
        ...state,
        modified: true,
        components: titleComponents,
      };
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
      const linkageFiltersGroup = { ...state.linkageFiltersGroup };
      delete linkageFiltersGroup[payload.value];
      return {
        ...state,
        linkageFiltersGroup,
      };
    default:
      return state;
  }
}
