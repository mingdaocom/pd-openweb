import { isPortalAccount } from 'src/utils/platform/runtime/config';

// 分享页的「已登录」口径：必须是主站账号。
// 外部门户账号（isPortal）只属于某个应用的门户体系，进不了主站的组织过闸，也开不了 Mingo 会话；
// 分享页走 preall({ allowNotLogin: true })，preall 不会把门户账号踢回门户，因此 accountId 会照常存在。
// 若只看 accountId，门户访客会被当成已登录：组织内分享直接落「地址无法访问」而不引导登录，
// 点「继续对话」则拿门户身份去调接口必然失败。这里统一按未登录处理，引导其用主站账号登录。
export function isShareViewerLoggedIn() {
  return Boolean(md?.global?.Account?.accountId) && !isPortalAccount();
}
