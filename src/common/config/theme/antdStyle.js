import { autoPrefixTransformer, legacyLogicalPropertiesTransformer } from '@ant-design/cssinjs';

const LOGICAL_PROPERTIES = ['inset', 'margin-inline', 'padding-inline', 'border-inline', 'border-start-start-radius'];
const PREFIX_TRANSFORMERS = [autoPrefixTransformer];
const LEGACY_TRANSFORMERS = [legacyLogicalPropertiesTransformer, autoPrefixTransformer];

const MODERN_STYLE_PROPS = { hashPriority: 'low' };
const SELECTOR_FALLBACK_STYLE_PROPS = { hashPriority: 'high', transformers: PREFIX_TRANSFORMERS };
const LOGICAL_FALLBACK_STYLE_PROPS = { hashPriority: 'low', transformers: LEGACY_TRANSFORMERS };
const LEGACY_STYLE_PROPS = { hashPriority: 'high', transformers: LEGACY_TRANSFORMERS };

export const getAntdStyleProviderProps = () => {
  const canCheckSupport = typeof CSS !== 'undefined' && typeof CSS.supports === 'function';
  const supportsWhere = canCheckSupport && CSS.supports('selector(:where(*))');
  const supportsLogicalProperties =
    canCheckSupport && LOGICAL_PROPERTIES.every(property => CSS.supports(property, '0px'));

  if (supportsLogicalProperties) {
    return supportsWhere ? MODERN_STYLE_PROPS : SELECTOR_FALLBACK_STYLE_PROPS;
  }

  return supportsWhere ? LOGICAL_FALLBACK_STYLE_PROPS : LEGACY_STYLE_PROPS;
};
