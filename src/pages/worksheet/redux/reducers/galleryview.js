export function view(state = {}, action) {
  switch (action.type) {
    case 'CHANGE_GALLERY_VIEW':
      return action.data || {};
    default:
      return state;
  }
}

export function galleryViewLoading(state = false, action) {
  switch (action.type) {
    case 'CHANGE_GALLERY_VIEW_LOADING':
      return action.loading;
    default:
      return state;
  }
}

export function galleryLoading(state = false, action) {
  switch (action.type) {
    case 'CHANGE_GALLERY_LOADING':
      return action.loading;
    default:
      return state;
  }
}

export function galleryViewRecordCount(state = 0, action) {
  const { type } = action;
  switch (type) {
    case 'GALLERY_VIEW_RECORD_COUNT':
      return action.count;
    default:
      return state;
  }
}

export function gallery(state = [], action) {
  const { type } = action;
  switch (type) {
    case 'CHANGE_GALLERY_VIEW_DATA':
      return action.list;
    default:
      return state;
  }
}

export function galleryIndex(state = 0, action) {
  const { type } = action;
  switch (type) {
    case 'CHANGE_GALLERY_VIEW_INDEX':
      return action.pageIndex;
    default:
      return state;
  }
}
