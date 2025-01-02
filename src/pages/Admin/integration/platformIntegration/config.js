import workWeiXinAjax from 'src/api/workWeiXin';

export const INTEGRATION_INFO = {
  3: {
    text: '企业微信',
    checkAjax: workWeiXinAjax.checkWorkWXToMingByApp,
    getAddressAjax: workWeiXinAjax.getWorkWXStructureInfo,
    getRelationsAjax: workWeiXinAjax.getWorkWxUserRelations,
    unbindRelationAjax: workWeiXinAjax.unbindWorkWxUserRelation,
    syncAjax: workWeiXinAjax.syncWorkWXToMingByApp,
  },
  1: {
    text: '钉钉',
    checkAjax: workWeiXinAjax.checkWorkDDToMing,
    getAddressAjax: workWeiXinAjax.getDDStructureInfo,
    getRelationsAjax: workWeiXinAjax.getDDUserRelations,
    unbindRelationAjax: workWeiXinAjax.unbindDDUserRelation,
    syncAjax: workWeiXinAjax.syncWorkDDToMing,
  },
  6: {
    text: '飞书',
    checkAjax: workWeiXinAjax.checkFeiShuToMingByApp,
    getAddressAjax: workWeiXinAjax.getFeiShuStructureInfo,
    getRelationsAjax: workWeiXinAjax.getFeiShuUserRelations,
    unbindRelationAjax: workWeiXinAjax.unbindFeiShuUserRelation,
    syncAjax: workWeiXinAjax.syncFeishuToMingByApp,
  },
  7: {
    text: 'Lark',
    checkAjax: workWeiXinAjax.checkFeiShuToMingByApp,
    getAddressAjax: workWeiXinAjax.getFeiShuStructureInfo,
    getRelationsAjax: workWeiXinAjax.getFeiShuUserRelations,
    unbindRelationAjax: workWeiXinAjax.unbindFeiShuUserRelation,
    syncAjax: workWeiXinAjax.syncFeishuToMingByApp,
  },
};
