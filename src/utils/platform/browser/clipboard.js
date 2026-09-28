import copy from 'copy-to-clipboard';

/**
 * 复制文本到剪贴板，返回是否成功。text 可以是字符串，也可以是稍后 resolve 的 Promise。
 *
 * 必须在用户手势的同步调用栈里调用（点击回调内、第一个 await 之前）。剪贴板写入在各浏览器都绑定用户手势：
 * copy-to-clipboard 走的 document.execCommand('copy') 要求仍处于手势的同步栈，
 * navigator.clipboard.writeText 要求 transient user activation 未过期——两者在「await 接口」之后都会失效，
 * 移动端会直接失败并弹出库内置的 window.prompt 兜底框（提示语还写着 Ctrl+C）。
 *
 * 分享链接这类「要等接口创建完才有内容」的场景，把 Promise 直接传进来：ClipboardItem 允许承接尚未
 * resolve 的 Promise，浏览器会为本次手势保留写入权限直到内容就绪，这是这类场景唯一稳妥的写法。
 */
export async function copyTextToClipboard(text) {
  const pendingText = Promise.resolve(text).then(value => String(value ?? ''));

  // 内容 Promise 失败时按复制失败处理，同时避免抛出未捕获的 rejection
  pendingText.catch(() => {});

  if (navigator.clipboard && window.ClipboardItem && window.isSecureContext) {
    try {
      // write(...) 本身必须在当前同步栈发起，await 只是等它的结果，不能把调用挪到 await 之后
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/plain': pendingText.then(value => new Blob([value], { type: 'text/plain' })),
        }),
      ]);

      return true;
    } catch (err) {
      console.error('[clipboard] write failed, fallback to execCommand', err);
    }
  }

  try {
    return copy(await pendingText);
  } catch (err) {
    console.error('[clipboard] copy failed', err);
    return false;
  }
}
