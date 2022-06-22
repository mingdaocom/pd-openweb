/* eslint-disable no-redeclare */
/* eslint-disable no-case-declarations */
import update from 'immutability-helper';
import { v4 as uuidv4 } from 'uuid';
import {
  ADD_WIDGET,
  DEL_WIDGET,
  UPDATE_WIDGET,
  UPDATE_LAYOUT,
  UPDATE_PAGE_INFO,
  UPDATE_LOADING,
  UPDATE_SAVE_LOADING,
  INSET_TITLE,
  UPDATE_MODIFIED,
  COPY_WIDGET,
  UPDATE_WIDGET_VISIBLE,
  UPDATE_EDIT_PAGE_VISIBLE,
  UPDATE_COMPONENTS,
} from './actionType';
import { getDefaultLayout, getIndexById, enumWidgetType } from '../util';
import maxBy from 'lodash/maxBy';

const initialState = {
  loading: true,
  modified: false,
  pageName: '',
  visible: false,
  pageId: '',
  desc: '',
  adjustScreen: false,
  version: null,
  pageName: '',
  apk: {},
  components: [],
};

function updateLayout(state, payload) {
  // 更新移动布局的layout时可能是部分更新，所以要将显示的component传过来
  const { layoutType, layouts, components } = payload;
  if (!layouts) return state;
  if (_.includes(['web', 'mobile'], layoutType)) {
    return update(state, {
      components: {
        $apply: items => {
          return items.map(item => {
            const index = _.findIndex(components, v => (v.id || v.uuid) === (item.id || item.uuid));
            if (index >= 0) {
              return update(item, {
                [layoutType]: { layout: { $set: _.pick(layouts[index], ['x', 'y', 'w', 'h', 'minW', 'minH']) } },
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
  const layouts = components.map(item => _.get(item, ['web', 'layout']));
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
        const { config = {} } = item;
        const btn = {
          ...item,
          btnId: null,
          filterId: null,
          id: uuidv4()
        }
        if (config.isFilter) {
          btn.config = { ...config, isFilter: undefined }
        }
        return btn;
      })
    }
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
      return update(state, { visible: { $set: payload } });
    case UPDATE_MODIFIED:
      return update(state, { modified: { $set: payload } });
    case ADD_WIDGET:
      return update(state, {
        modified: { $set: true },
        components: {
          $push: [
            {
              ...payload,
              uuid: uuidv4(),
              web: {
                title: _l(''),
                titleVisible: false,
                visible: true,
                layout: getDefaultLayout({ components: state.components, layoutType: 'web', type: payload.type }),
              },
              mobile: {
                title: _l(''),
                titleVisible: false,
                visible: true,
                layout: null,
              },
            },
          ],
        },
      });
    case COPY_WIDGET:
      return copyWidget(state, payload);
    case UPDATE_WIDGET_VISIBLE:
      return updateWidgetVisible(state, payload);
    case DEL_WIDGET:
      return update(state, {
        components: { $splice: [[getIndexById({ component: payload, components: state.components }), 1]] },
        modified: { $set: true },
      });
    case UPDATE_WIDGET:
      const { widget, layoutType, ...rest } = payload;
      // 更新对应布局里的标题或者统一的value
      if (layoutType) {
        return update(state, {
          components: {
            [getIndexById({ component: widget, components: state.components })]: {
              [payload.layoutType]: { $apply: item => ({ ...item, ...rest }) },
            },
          },
          modified: { $set: true },
        });
      } else {
        return update(state, {
          components: {
            [getIndexById({ component: widget, components: state.components })]: {
              $apply: item => ({ ...item, ...rest }),
            },
          },
          modified: { $set: true },
        });
      }
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

    default:
      return state;
  }
}
