export const CUSTOM_FIELD_CODE_MAX_SIZE_IN_KB = 128;

export function isCustomFieldCodeTooLarge(code = '') {
  return new Blob([code]).size / 1024 > CUSTOM_FIELD_CODE_MAX_SIZE_IN_KB;
}
