import { TinyColor } from '@ctrl/tinycolor';

const COLOR_MIX_SUPPORT_VALUE = 'color-mix(in srgb, red 50%, blue)';
const OBSERVED_ATTRIBUTES = ['style', 'class', 'data-theme', 'data-prefers-color-scheme'];
const COLOR_EVENTS = ['mouseenter', 'mouseleave', 'focusin', 'focusout'];

export const mixColors = (color, percent, mixColor = 'transparent') => {
  if (typeof color !== 'string' || typeof mixColor !== 'string') return undefined;

  const first = new TinyColor(color);
  const second = new TinyColor(mixColor);

  if (!first.isValid || !second.isValid || !Number.isFinite(percent) || percent < 0 || percent > 100) {
    return undefined;
  }

  const a = first.toRgb();
  const b = second.toRgb();
  const weight = percent / 100;
  const alpha = a.a * weight + b.a * (1 - weight);
  const channels = ['r', 'g', 'b'].map(channel =>
    alpha ? Math.round((a[channel] * a.a * weight + b[channel] * b.a * (1 - weight)) / alpha) : 0,
  );

  return alpha === 1
    ? `rgb(${channels.join(', ')})`
    : `rgba(${channels.join(', ')}, ${Math.round(alpha * 1000000) / 1000000})`;
};

const resolveColor = (color, computedStyle, probe, view) => {
  if (typeof color !== 'string' || !color.trim()) return undefined;
  if (new TinyColor(color).isValid) return color;
  if (color.trim().toLowerCase() === 'currentcolor') return computedStyle.color;

  probe.removeAttribute('style');
  probe.style.display = 'none';
  const variablePattern = /var\(\s*(--[^,\s)]+)/g;
  let match;

  while ((match = variablePattern.exec(color))) {
    const value = computedStyle.getPropertyValue(match[1]);

    if (value.trim()) probe.style.setProperty(match[1], value);
  }

  probe.style.setProperty('--hap-color-mix-source', color);
  const resolved = view.getComputedStyle(probe).getPropertyValue('--hap-color-mix-source').trim();

  if (!resolved || /^(inherit|initial|unset|revert|revert-layer)$/i.test(resolved)) return undefined;
  if (resolved.toLowerCase() === 'currentcolor') return computedStyle.color;

  probe.style.color = resolved;
  return probe.style.color ? view.getComputedStyle(probe).color : undefined;
};

/** Resolve legacy color mixes in the element's own variable scope and follow theme changes. */
export const observeColorMix = (element, mixes) => {
  const entries = Object.entries(mixes || {});
  const document = element?.ownerDocument;
  const view = document?.defaultView;

  if (
    !entries.length ||
    !view ||
    (typeof view.CSS?.supports === 'function' && view.CSS.supports('color', COLOR_MIX_SUPPORT_VALUE))
  ) {
    return () => {};
  }

  const originals = new Map(
    entries.map(([name]) => [
      name,
      { value: element.style.getPropertyValue(name), priority: element.style.getPropertyPriority(name) },
    ]),
  );
  const written = new Map();
  let observer = null;
  let frame = null;
  let disposed = false;

  const restore = name => {
    if (element.style.getPropertyValue(name) !== written.get(name)) return;
    const original = originals.get(name);

    if (original.value) {
      element.style.setProperty(name, original.value, original.priority);
    } else {
      element.style.removeProperty(name);
    }

    written.delete(name);
  };

  const update = () => {
    const computedStyle = view.getComputedStyle(element);
    const probe = document.createElement('span');
    probe.style.display = 'none';
    document.body.appendChild(probe);

    try {
      const values = entries.map(([name, { color, percent, mixColor = 'transparent' }]) => {
        const first = resolveColor(color, computedStyle, probe, view);
        const second = resolveColor(mixColor, computedStyle, probe, view);

        return [name, first && second ? mixColors(first, percent, second) : undefined];
      });

      values.forEach(([name, value]) => {
        if (value === undefined) {
          restore(name);
        } else if (element.style.getPropertyValue(name) !== value) {
          element.style.setProperty(name, value);
          written.set(name, value);
        }
      });
    } finally {
      probe.remove();
      observer?.takeRecords();
    }
  };

  const schedule = () => {
    if (disposed || frame !== null) return;

    frame = view.requestAnimationFrame(() => {
      frame = null;
      update();
    });
  };

  const onStyleLoad = event => {
    if (event.target.tagName === 'LINK') schedule();
  };

  update();

  observer = typeof view.MutationObserver === 'function' ? new view.MutationObserver(schedule) : null;

  for (let ancestor = element; ancestor; ancestor = ancestor.parentElement) {
    observer?.observe(ancestor, { attributes: true, attributeFilter: OBSERVED_ATTRIBUTES });
  }

  if (document.head) {
    observer?.observe(document.head, { subtree: true, childList: true, characterData: true });
  }

  COLOR_EVENTS.forEach(event => element.addEventListener(event, schedule));
  document.addEventListener('load', onStyleLoad, true);
  view.addEventListener('resize', schedule);

  return () => {
    disposed = true;
    observer?.disconnect();
    if (frame !== null) view.cancelAnimationFrame(frame);
    COLOR_EVENTS.forEach(event => element.removeEventListener(event, schedule));
    document.removeEventListener('load', onStyleLoad, true);
    view.removeEventListener('resize', schedule);
    written.forEach((value, name) => restore(name));
  };
};
