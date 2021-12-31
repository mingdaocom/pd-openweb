export function isDescendant(parent, child) {
  let node = child && child.parentNode || null;
  while (node != null) {
    if (node === parent) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
}

export default {
  isDescendant,
};
