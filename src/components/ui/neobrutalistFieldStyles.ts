const baseShadow = 'shadow-[8px_8px_0_rgba(0,0,0,0.14)]'
const focusShadow = 'focus:shadow-[11px_11px_0_rgba(0,0,0,0.2)]'
const disabledStyles =
  'disabled:cursor-not-allowed disabled:border-dashed disabled:border-black/40 disabled:bg-[#F5F3FF] disabled:text-black/60 disabled:shadow-[4px_4px_0_rgba(0,0,0,0.1)] disabled:translate-y-0'

const fieldBase = [
  'w-full',
  'rounded-[32px]',
  'border-2',
  'border-black',
  'bg-[radial-gradient(circle_at_top_left,#FFFFFF,#F6F1FF_58%,#E8E1FF_100%)]',
  'px-5',
  'py-3',
  'text-sm',
  'font-semibold',
  'text-black',
  baseShadow,
  'transition-all',
  'duration-200',
  'hover:-translate-y-0.5',
  'hover:shadow-[10px_10px_0_rgba(0,0,0,0.22)]',
  'focus:-translate-y-0.5',
  'focus:outline-none',
  'focus:ring-4',
  'focus:ring-black/10',
  focusShadow,
  disabledStyles,
].join(' ')

export const neoInputClass = fieldBase

export const neoTextareaClass = [fieldBase, 'min-h-[160px]', 'resize-vertical', 'leading-relaxed'].join(' ')

export const neoSelectClass = [
  fieldBase,
  'appearance-none',
  'pr-14',
  'bg-[radial-gradient(circle_at_top_right,#FFFFFF,#F1ECFF_55%,#E1D7FF_95%)]',
  'neo-select-arrow',
].join(' ')

export const neoBadgeClass = 'inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-4 py-1 text-xs font-black uppercase tracking-[0.2em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.12)]'
export const neoCardClass =
  'relative rounded-[36px] border-[3px] border-black bg-white/92 p-6 shadow-[14px_14px_0_rgba(0,0,0,0.08)] backdrop-blur-sm'
