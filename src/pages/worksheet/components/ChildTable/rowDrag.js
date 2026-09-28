/**
 * 子表整行拖拽排序管理器（无 React 依赖，直接操作 DOM）。
 *
 * 表格由多个 react-window VariableSizeGrid 拼成，"一整行"并非单个 DOM 节点，
 * 因此这里用"按行数据现渲染一个幽灵行浮层"的方式实现整行悬浮跟随效果：
 *  1. 拖拽开始：抓取该行当前可见的单元格 DOM，克隆并内联计算样式，拼成一个
 *     position:fixed 的幽灵行，附加到 body，跟随指针纵向移动；
 *  2. 拖拽过程：用 elementFromPoint 命中指针下的目标行，按上/下半区决定插入到
 *     目标行之前/之后，绘制蓝色插入线；靠近上/下边缘时自动滚动；
 *  3. 松开：回调 onReorder(targetRowId, position)，由外层 dispatch(moveRow) 落库到本地。
 */

const START_THRESHOLD = 4; // 超过该位移才判定为拖拽（区分点击）
const EDGE = 40; // 距离表格上/下边缘多少 px 内触发自动滚动
const SCROLL_STEP = 14; // 每帧自动滚动步长

// 递归把源节点的计算样式内联到克隆节点，使幽灵行脱离原表格 DOM 上下文后仍保持外观
function copyComputedStyle(src, dest) {
  const cs = window.getComputedStyle(src);
  let cssText = '';

  for (let i = 0; i < cs.length; i++) {
    const prop = cs[i];
    cssText += `${prop}:${cs.getPropertyValue(prop)};`;
  }

  dest.style.cssText = cssText;
  dest.style.transition = 'none';
  dest.style.animation = 'none';
  // 关键：幽灵行整棵树都必须不吃指针事件，否则 elementFromPoint 命中的是克隆节点，
  // 拖拽目标行探测不到（不画插入线、松开也不移动）。computed 会把 pointer-events 还原成 auto，
  // 故逐节点强制 none 覆盖。
  dest.style.pointerEvents = 'none';
  const srcChildren = src.children;
  const destChildren = dest.children;

  for (let i = 0; i < srcChildren.length && i < destChildren.length; i++) {
    copyComputedStyle(srcChildren[i], destChildren[i]);
  }
}

export default class RowDragManager {
  constructor() {
    this.dragging = false;
    this.started = false;
    this.ghost = null;
    this.indicator = null;
    this.raf = null;
    this.opts = null;
    this.target = null;
    this.lastX = 0;
    this.lastY = 0;
    this.dir = 0; // 拖拽纵向方向：1 向下 / -1 向上 / 0 尚未确定（回退中点判定）
    // 绑定 this，保证可正确 remove
    this._onPreMove = this._onPreMove.bind(this);
    this._onPreUp = this._onPreUp.bind(this);
    this._onMove = this._onMove.bind(this);
    this._onUp = this._onUp.bind(this);
    this._loop = this._loop.bind(this);
  }

  /**
   * 在拖拽手柄 onMouseDown 时调用
   * @param {MouseEvent} e
   * @param {Object} opts
   * @param {HTMLElement} opts.container    表格容器 DOM（.sheetViewTable）
   * @param {string}      opts.rowid        被拖拽行 rowid
   * @param {HTMLElement} [opts.scrollViewport] 纵向滚动视口（.scroll-y .scroll-viewport）
   * @param {Function}    opts.onReorder    (targetRowId, position) => void
   */
  start(e, opts) {
    if (e.button !== 0 || this.dragging) {
      return;
    }

    // 先提交正在编辑的单元格：子表单元格靠"点击别处(文档级 mousedown)"提交在途输入，而非原生 blur。
    // 拖拽会重排并虚拟复用单元格（不卸载，只换行数据），若不先提交，在途编辑会被新行数据覆盖丢失；
    // 且下面的 stopPropagation 会挡住真实 mousedown 触发的 click-away。故主动派发一次 body mousedown 触发提交。
    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    this.opts = opts;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.started = false;
    document.addEventListener('mousemove', this._onPreMove, true);
    document.addEventListener('mouseup', this._onPreUp, true);
    e.preventDefault();
    e.stopPropagation();
  }

  _onPreMove(e) {
    if (Math.abs(e.clientX - this.startX) + Math.abs(e.clientY - this.startY) < START_THRESHOLD) {
      return;
    }

    document.removeEventListener('mousemove', this._onPreMove, true);
    document.removeEventListener('mouseup', this._onPreUp, true);
    this._begin(e);
  }

  _onPreUp() {
    // 未越过阈值即松手 = 普通点击，不进入拖拽
    document.removeEventListener('mousemove', this._onPreMove, true);
    document.removeEventListener('mouseup', this._onPreUp, true);
  }

  _begin(e) {
    const built = this._buildGhost();

    if (!built) {
      return;
    }

    this.dragging = true;
    this.started = true;
    this.dir = 0;
    this.grabOffsetY = e.clientY - built.minTop;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    document.body.appendChild(this.ghost);
    this._createGrip();
    this._createIndicator();
    // 先打拖拽标记，行头 hover 据此不再弹出插入加号
    document.documentElement.classList.add('childTableRowDragging');
    // 再收掉拖拽起手时已显示的插入加号
    if (typeof this.opts.onDragBegin === 'function') {
      this.opts.onDragBegin();
    }
    document.addEventListener('mousemove', this._onMove, true);
    document.addEventListener('mouseup', this._onUp, true);
    this._positionGhost(e.clientY);
    this._dimSource();
    this.raf = requestAnimationFrame(this._loop);
  }

  _buildGhost() {
    const { container, rowid } = this.opts;

    if (!container) {
      return null;
    }

    const rowCells = Array.prototype.slice.call(container.querySelectorAll(`.cell[class~="row-id-${rowid}"]`));
    // 快照前移除本行 hover 态，让行头呈现静止外观（显示行号、不带拖拽/操作按钮）
    rowCells.forEach(cell => {
      cell.classList.remove('hover');
      cell.classList.remove('row-head-hover');
    });
    // 含行头（col-0）一起快照
    const cells = rowCells.filter(node => !node.classList.contains('placeholder'));

    if (!cells.length) {
      return null;
    }

    const containerRect = container.getBoundingClientRect();
    const rects = cells.map(n => n.getBoundingClientRect());
    const minTop = Math.min.apply(
      null,
      rects.map(r => r.top),
    );
    const bottom = Math.max.apply(
      null,
      rects.map(r => r.bottom),
    );
    // 幽灵行宽度与表格可视宽度一致，超出列裁剪（overflow:hidden）
    const width = containerRect.width;
    // 边框/背景在克隆脱离表格样式作用域后不再继承，统一取真实节点上已解析的计算值显式重建
    const sampleCell = cells.filter(c => !c.classList.contains('col-0'))[0] || cells[0];
    const borderColor = window.getComputedStyle(sampleCell).borderBottomColor || 'rgba(0,0,0,0.12)';
    // 主底色从 :root 取已解析值（而非 var()），保证幽灵行在 body 下、明暗主题都有实底
    const bgPrimary =
      window.getComputedStyle(document.documentElement).getPropertyValue('--color-background-primary').trim() || '#fff';

    const ghost = document.createElement('div');
    ghost.className = 'childTableRowDragGhost';
    ghost.style.cssText =
      `position:fixed;left:${containerRect.left}px;top:${minTop}px;` +
      `width:${width}px;height:${bottom - minTop}px;` +
      'pointer-events:none;z-index:100000;overflow:hidden;box-sizing:border-box;' +
      `border:1px solid ${borderColor};border-radius:4px;` +
      'box-shadow:0 8px 20px rgba(0,0,0,0.18);' +
      `background:${bgPrimary};opacity:0.96;`;

    cells.forEach((node, i) => {
      const clone = node.cloneNode(true);
      const nodeStyle = window.getComputedStyle(node);
      const nodeBg = nodeStyle.backgroundColor;
      copyComputedStyle(node, clone);
      const r = rects[i];
      clone.style.position = 'absolute';
      clone.style.boxSizing = 'border-box';
      clone.style.left = `${r.left - containerRect.left}px`;
      clone.style.top = `${r.top - minTop}px`;
      clone.style.width = `${r.width}px`;
      clone.style.height = `${r.height}px`;
      clone.style.margin = '0';
      // 逐格显式落背景：保留公式/只读等单元格的特殊底色，透明的补主底色
      clone.style.backgroundColor =
        !nodeBg || nodeBg === 'transparent' || nodeBg === 'rgba(0, 0, 0, 0)' ? bgPrimary : nodeBg;
      // 外框由幽灵容器统一绘制，单元格只补内部竖向分隔线（行头 col-0 无右边框）
      clone.style.borderTop = 'none';
      clone.style.borderBottom = 'none';
      clone.style.borderLeft = 'none';
      clone.style.borderRight = node.classList.contains('col-0') ? 'none' : `1px solid ${borderColor}`;
      ghost.appendChild(clone);
    });

    this.ghost = ghost;
    this.ghostLeft = containerRect.left;
    this.ghostHeight = bottom - minTop;
    return { minTop };
  }

  // 拖拽态的手柄：跟随幽灵行移动，位于其左缘外侧、垂直居中（hover 态那个已在 onDragBegin 收掉）
  _createGrip() {
    const grip = document.createElement('div');
    grip.className = 'childTableDragFloat dragging';
    grip.innerHTML = '<i class="icon icon-drag"></i>';
    this.grip = grip;
    document.body.appendChild(grip);
  }

  _createIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'childTableRowDragIndicator';
    indicator.style.cssText =
      'position:fixed;height:2px;pointer-events:none;z-index:100001;display:none;' +
      'background:var(--color-primary,#2196f3);border-radius:1px;';
    this.indicator = indicator;
    document.body.appendChild(indicator);
  }

  _positionGhost(clientY) {
    const top = clientY - this.grabOffsetY;
    if (this.ghost) {
      this.ghost.style.top = `${top}px`;
      this.ghost.style.left = `${this.ghostLeft}px`;
    }
    if (this.grip) {
      this.grip.style.left = `${this.ghostLeft - 22}px`;
      this.grip.style.top = `${top + this.ghostHeight / 2 - 10}px`;
      this.grip.style.display = 'flex';
    }
  }

  _onMove(e) {
    // 记录纵向方向（阈值 2px 过滤悬停时的微抖，避免插入线在目标行上下反复跳）
    const dy = e.clientY - this.lastY;
    if (dy >= 2) {
      this.dir = 1;
    } else if (dy <= -2) {
      this.dir = -1;
    }
    this.lastX = e.clientX;
    this.lastY = e.clientY;
    this._positionGhost(e.clientY);
    e.preventDefault();
  }

  _loop() {
    if (!this.dragging) {
      return;
    }

    this._autoScroll();
    this._dimSource();
    this._updateTarget();
    this.raf = requestAnimationFrame(this._loop);
  }

  _autoScroll() {
    const { scrollViewport, container } = this.opts;

    if (!scrollViewport) {
      return;
    }

    const rect = container.getBoundingClientRect();

    if (this.lastY < rect.top + EDGE) {
      scrollViewport.scrollTop -= SCROLL_STEP;
    } else if (this.lastY > rect.bottom - EDGE) {
      scrollViewport.scrollTop += SCROLL_STEP;
    }
  }

  // 拖拽过程中被拖行会随滚动重新渲染，class 可能丢失，逐帧补上淡化标记
  _dimSource() {
    const { container, rowid } = this.opts;
    const cells = container.querySelectorAll(`.cell[class~="row-id-${rowid}"]`);

    for (let i = 0; i < cells.length; i++) {
      cells[i].classList.add('childTableRowDragSource');
    }
  }

  _clearDimSource() {
    const { container } = this.opts;
    const cells = container.querySelectorAll('.childTableRowDragSource');

    for (let i = 0; i < cells.length; i++) {
      cells[i].classList.remove('childTableRowDragSource');
    }
  }

  _findTarget(x, y) {
    const { container, rowid } = this.opts;
    const el = document.elementFromPoint(x, y);

    if (!el) {
      return null;
    }

    const cell = el.closest('.cell');

    if (!cell || !container.contains(cell)) {
      return null;
    }

    if (cell.classList.contains('placeholder') || cell.classList.contains('emptyRow')) {
      return null;
    }

    if (/\brow-head\b|\brow-foot\b/.test(cell.className)) {
      return null;
    }

    const match = cell.className.match(/\brow-id-([^\s]+)/);

    if (!match) {
      return null;
    }

    const targetId = match[1];

    if (!targetId || targetId === 'undefined' || targetId === rowid || targetId.indexOf('empty') === 0) {
      return null;
    }

    const rect = cell.getBoundingClientRect();
    // 按拖拽方向判定：向下移动→落到当前行下方(after)，向上移动→落到当前行上方(before)。
    // 方向未定（刚起手）时回退到中点判定。
    let isBefore;
    if (this.dir > 0) {
      isBefore = false;
    } else if (this.dir < 0) {
      isBefore = true;
    } else {
      isBefore = y < rect.top + rect.height / 2;
    }
    return {
      targetId,
      position: isBefore ? 'before' : 'after',
      boundaryY: isBefore ? rect.top : rect.bottom,
    };
  }

  _updateTarget() {
    const target = this._findTarget(this.lastX, this.lastY);
    this.target = target;
    if (!this.indicator) {
      return;
    }

    if (!target) {
      this.indicator.style.display = 'none';
      return;
    }

    const rect = this.opts.container.getBoundingClientRect();
    this.indicator.style.display = 'block';
    this.indicator.style.left = `${rect.left}px`;
    this.indicator.style.width = `${rect.width}px`;
    this.indicator.style.top = `${target.boundaryY - 1}px`;
  }

  _onUp() {
    const target = this.target;
    const { onReorder, rowid } = this.opts;
    this._cleanup();
    if (target && typeof onReorder === 'function') {
      onReorder(rowid, target.targetId, target.position);
    }
  }

  _cleanup() {
    this.dragging = false;
    this.started = false;
    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = null;
    }

    document.removeEventListener('mousemove', this._onMove, true);
    document.removeEventListener('mouseup', this._onUp, true);
    document.removeEventListener('mousemove', this._onPreMove, true);
    document.removeEventListener('mouseup', this._onPreUp, true);
    document.documentElement.classList.remove('childTableRowDragging');
    if (this.opts && this.opts.container) {
      this._clearDimSource();
    }

    if (this.grip && this.grip.parentNode) {
      this.grip.parentNode.removeChild(this.grip);
    }

    if (this.ghost && this.ghost.parentNode) {
      this.ghost.parentNode.removeChild(this.ghost);
    }

    if (this.indicator && this.indicator.parentNode) {
      this.indicator.parentNode.removeChild(this.indicator);
    }

    this.ghost = null;
    this.grip = null;
    this.indicator = null;
    this.target = null;
  }

  // 组件卸载时兜底清理
  destroy() {
    if (this.dragging || this.ghost || this.grip || this.indicator) {
      this._cleanup();
    }

    document.removeEventListener('mousemove', this._onPreMove, true);
    document.removeEventListener('mouseup', this._onPreUp, true);
  }
}
