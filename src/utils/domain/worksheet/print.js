export const hasPrintLimitTemplate = (templates = []) =>
  templates.some(template =>
    (template.advanceSettings || []).some(setting => setting.key === 'print_limit_enabled' && setting.value === '1'),
  );
