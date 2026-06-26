/**
 * Evaluate a parameter value against its condition and return a status.
 * @returns {'empty' | 'red' | 'yellow' | 'green'}
 */
export function evaluateParam(param, valueObj) {
  if (!valueObj || typeof valueObj !== 'object') return 'empty';
  return valueObj.status || 'empty';
}

/** Sort weight: empty/red at top (0,1), yellow in middle (2), green at bottom (3) */
export const STATUS_ORDER = { empty: 0, red: 1, yellow: 2, green: 3 };

export const STATUS_STYLES = {
  empty:  { bg: 'bg-gray-50',   border: 'border-gray-200',  dot: 'bg-gray-300',   badge: 'bg-gray-100 text-gray-500',   label: 'Empty'    },
  red:    { bg: 'bg-red-50',    border: 'border-red-200',   dot: 'bg-red-500',    badge: 'bg-red-100 text-red-700',     label: 'Attention'  },
  yellow: { bg: 'bg-amber-50',  border: 'border-amber-200', dot: 'bg-amber-400',  badge: 'bg-amber-100 text-amber-700', label: 'Partial'  },
  green:  { bg: 'bg-green-50',  border: 'border-green-200', dot: 'bg-green-500',  badge: 'bg-green-100 text-green-700', label: 'Done'     },
};
