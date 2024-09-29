import * as ACTIONS from './actions';
import _ from 'lodash';

const updateSingleEntity = (user, action) => {
  const { type, payload } = action;
  let subordinates;

  switch (type) {
    case ACTIONS.SUBORDINATES_REQUEST:
      return { ...user };
    case ACTIONS.UPDATE_ENTITY_CHILDS:
      const { source, id, moreLoading, pageIndex, totalCount } = payload;
      const result = source.map(({ accountId }) => accountId);

      return {
        ...user,
        subordinates: _.uniqBy((user.subordinates || []).concat(result)),
        moreLoading: moreLoading || false,
        pageIndex: pageIndex ? pageIndex : user.pageIndex,
        subTotalCount: totalCount || user.subTotalCount || 0,
      };
      break;
    case ACTIONS.OPEN_COLLAPSE:
    case ACTIONS.CLOSE_COLLAPSE:
      return {
        ...user,
        collapsed: type === ACTIONS.CLOSE_COLLAPSE,
      };
    case ACTIONS.REMOVE_PARENT_CHILDREN:
      const { removeId } = payload;
      subordinates = user.subordinates;
      return {
        ...user,
        subordinates: _.filter(subordinates, id => id !== removeId),
        subTotalCount: user.subTotalCount - 1,
      };
    case ACTIONS.ADD_PARENT_CHILDREN:
      const { addId } = payload;
      subordinates = user.subordinates;
      return {
        ...user,
        subordinates: subordinates.concat(addId),
        subTotalCount: !_.isUndefined(user.subTotalCount) ? user.subTotalCount + 1 : 0,
      };
  }
};

const updateEntities = payload => {
  const { source = [] } = payload;

  return _.keyBy(
    source.map(l => ({ ...l, collapsed: l.collapsed === undefined || l.collapsed })),
    v => v.accountId,
  );
};

const initialState = {
  entities: {
    users: {},
  },
  highLightId: null,
  isLoading: false,
  highLightRootId: null,
};

export default (state = initialState, action) => {
  const { type, payload } = action;
  if (ACTIONS[type] === undefined) return state;
  const users = state.entities.users;
  const highLightId = state.highLightId;
  const highLightRootId = state.highLightRootId;
  let id, user;

  switch (type) {
    case ACTIONS.ADD_STRUCTURES:
      return {
        ...state,
        entities: {
          users: {
            ...state.entities.users,
            ...updateEntities(payload),
          },
        },
        highLightId,
      };
    case ACTIONS.REMOVE_STRUCTURE:
      id = payload.id;
      const _users = { ...users };
      delete _users[id];
      return {
        ...state,
        entities: {
          users: _users,
        },
      };
    case ACTIONS.SUBORDINATES_REQUEST:
    case ACTIONS.UPDATE_ENTITY_CHILDS:
    case ACTIONS.ADD_PARENT_CHILDREN:
    case ACTIONS.REMOVE_PARENT_CHILDREN:
    case ACTIONS.OPEN_COLLAPSE:
    case ACTIONS.CLOSE_COLLAPSE:
      id = payload.id;
      user = users[id];
      return {
        ...state,
        entities: {
          ...state.entities,
          users: user
            ? {
                ...users,
                [id]: updateSingleEntity(user, action),
              }
            : users,
        },
      };
    case ACTIONS.UPDATE_CURRENT_CHILDREN:
      id = payload.id;
      user = users[id];
      const { subordinates, subTotalCount = 0 } = users[payload.replacedAccountId] || {};

      return {
        ...state,
        entities: {
          users: {
            ...users,
            [id]: {
              ...user,
              subTotalCount: user.subTotalCount ? user.subTotalCount + subTotalCount : subTotalCount,
              subordinates: user.subordinates ? user.subordinates.concat(subordinates) : subordinates,
            },
          },
        },
        highLightId,
      };
    case ACTIONS.CLEAR_HIGHLIGHT:
      return {
        ...state,
        highLightId: null,
        highLightRootId: null,
      };
    case ACTIONS.UPDATE_HIGHLIGHT:
      return {
        ...state,
        highLightId: payload.highLightId,
        highLightRootId: payload.highLightRootId,
      };
    case ACTIONS.UPDATE_IS_LOADING:
      return {
        ...state,
        isLoading: payload.data,
      };
    case ACTIONS.UPDATE_FIRST_LEVEL_LOADING:
      return {
        ...state,
        firstLevelLoading: payload.data,
      };
    default:
      return state;
  }
};
