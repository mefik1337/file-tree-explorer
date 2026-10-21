import { useId, type SVGProps } from 'react';

type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & { readonly size?: number };

const iconDefaults = (size: number) => ({
  width: size,
  height: size,
  'aria-hidden': true,
  focusable: false,
});

const EXTENSION_TINTS: Readonly<Record<string, string>> = {
  ts: '#3178c6',
  tsx: '#3178c6',
  js: '#e8b100',
  mjs: '#e8b100',
  json: '#8e8e93',
  css: '#a259ff',
  scss: '#c6538c',
  md: '#5e5ce6',
  sql: '#ff9500',
  html: '#ff6b2c',
  png: '#30b158',
  jpg: '#30b158',
  webp: '#30b158',
  svg: '#ff9f0a',
  ico: '#30b158',
  txt: '#8e8e93',
  lock: '#8e8e93',
};

export const fileTint = (fileName: string): string => {
  const extension = fileName.includes('.') ? fileName.split('.').pop()?.toLowerCase() ?? '' : '';
  return EXTENSION_TINTS[extension] ?? '#8e8e93';
};

export const FolderIcon = ({ size = 18, ...props }: IconProps) => (
  <svg viewBox="0 0 24 24" {...iconDefaults(size)} {...props}>
    <path
      d="M2.5 6.2c0-1.1.9-2 2-2h4.6c.5 0 1 .2 1.4.6l1.3 1.3c.4.4.9.6 1.4.6h6.3c1.1 0 2 .9 2 2v.8H2.5V6.2Z"
      fill="var(--color-folder-back)"
    />
    <path
      d="M2.5 8.6c0-.9.7-1.6 1.6-1.6h15.8c.9 0 1.6.7 1.6 1.6v9.2c0 1.1-.9 2-2 2h-15c-1.1 0-2-.9-2-2V8.6Z"
      fill="var(--color-folder)"
    />
    <path d="M2.5 8.9c0-.9.7-1.6 1.6-1.6h15.8c.9 0 1.6.7 1.6 1.6v.5H2.5v-.5Z" fill="#fff" opacity=".28" />
  </svg>
);

export const FileIcon = ({ size = 18, name = '', ...props }: IconProps & { readonly name?: string }) => (
  <svg viewBox="0 0 24 24" {...iconDefaults(size)} {...props}>
    <path
      d="M6.2 2.5h7.6l4.7 4.7v12.3c0 1.1-.9 2-2 2H6.2c-1.1 0-2-.9-2-2v-15c0-1.1.9-2 2-2Z"
      fill="#fdfdfd"
      stroke="#c7c7cc"
    />
    <path d="M13.8 2.5v3.7c0 .6.4 1 1 1h3.7" fill="#ececf0" stroke="#c7c7cc" />
    <rect x="7" y="15.2" width="10" height="3.2" rx="1" fill={fileTint(name)} />
    <path d="M7.2 10.2h6.6M7.2 12.5h9" stroke="#d1d1d6" strokeLinecap="round" />
  </svg>
);

export const ChevronIcon = ({ size = 12, ...props }: IconProps) => (
  <svg viewBox="0 0 12 12" {...iconDefaults(size)} {...props}>
    <path d="m4.5 2.5 3.5 3.5-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const SearchIcon = ({ size = 14, ...props }: IconProps) => (
  <svg viewBox="0 0 16 16" {...iconDefaults(size)} {...props}>
    <circle cx="7" cy="7" r="4.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
    <path d="m10.5 10.5 3.2 3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const ClearIcon = ({ size = 15, ...props }: IconProps) => (
  <svg viewBox="0 0 16 16" {...iconDefaults(size)} {...props}>
    <circle cx="8" cy="8" r="7" fill="currentColor" />
    <path d="m5.6 5.6 4.8 4.8m0-4.8-4.8 4.8" stroke="var(--color-surface)" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const UploadIcon = ({ size = 28, ...props }: IconProps) => (
  <svg viewBox="0 0 32 32" {...iconDefaults(size)} {...props}>
    <path
      d="M9 4.5h10l6 6v15c0 1.1-.9 2-2 2H9c-1.1 0-2-.9-2-2v-19c0-1.1.9-2 2-2Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path d="M16 22v-8m-3.5 3.5L16 14l3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const WarningIcon = ({ size = 16, ...props }: IconProps) => (
  <svg viewBox="0 0 16 16" {...iconDefaults(size)} {...props}>
    <path d="M7.1 2.3a1 1 0 0 1 1.8 0l5.6 10.2a1 1 0 0 1-.9 1.5H2.4a1 1 0 0 1-.9-1.5L7.1 2.3Z" fill="currentColor" />
    <path d="M8 6v3.6" stroke="var(--color-surface)" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="8" cy="11.6" r=".9" fill="var(--color-surface)" />
  </svg>
);

export const AppIcon = ({ size = 28, ...props }: IconProps) => {
  const gradientId = useId();
  return (
  <svg viewBox="0 0 64 64" {...iconDefaults(size)} {...props}>
    <defs>
      <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#6a86ff" />
        <stop offset="1" stopColor="#2f49c4" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="15" fill={`url(#${gradientId})`} />
    <rect x=".5" y=".5" width="63" height="63" rx="14.5" fill="none" stroke="#fff" strokeOpacity=".22" />
    <g fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 17v26c0 2.2 1.8 4 4 4h8M20 30h12" />
    </g>
    <rect x="13" y="11" width="14" height="11" rx="3.2" fill="#fff" />
    <rect x="33" y="25" width="18" height="10" rx="3.2" fill="#fff" fillOpacity=".85" />
    <rect x="33" y="42" width="18" height="10" rx="3.2" fill="#fff" fillOpacity=".7" />
  </svg>
  );
};
