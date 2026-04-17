// ============================================================
// DermaPro — Icons (linework minimalista, 1.6 stroke)
// ============================================================

const Icon = ({ d, size = 20, stroke = 1.6, children, fill = 'none', ...rest }) => (
  <svg
    width={size} height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...rest}
  >
    {d ? <path d={d} /> : children}
  </svg>
);

// Module icons — cada um uma metáfora sóbria
const IconAcne = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="9" cy="10" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="14.5" cy="13" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="10.5" cy="15" r="0.9" fill="currentColor" stroke="none" />
  </Icon>
);
const IconMelasma = (p) => (
  <Icon {...p}>
    <path d="M3.5 12c0-4.7 3.8-8.5 8.5-8.5s8.5 3.8 8.5 8.5-3.8 8.5-8.5 8.5S3.5 16.7 3.5 12Z" />
    <path d="M7.5 9c1.6 0 2-2 4-2s2.5 2 4.5 2" opacity=".55" />
    <path d="M6.5 14c1.6 0 2.5 1.5 4.5 1.5s3-1.5 5-1.5" opacity=".35" />
  </Icon>
);
const IconTexture = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="9" cy="9.5" r=".6" fill="currentColor" stroke="none" />
    <circle cx="12" cy="9" r=".6" fill="currentColor" stroke="none" />
    <circle cx="15" cy="9.5" r=".6" fill="currentColor" stroke="none" />
    <circle cx="8" cy="12.5" r=".6" fill="currentColor" stroke="none" />
    <circle cx="11" cy="12" r=".6" fill="currentColor" stroke="none" />
    <circle cx="14" cy="12.5" r=".6" fill="currentColor" stroke="none" />
    <circle cx="16" cy="12" r=".6" fill="currentColor" stroke="none" />
    <circle cx="9.5" cy="15" r=".6" fill="currentColor" stroke="none" />
    <circle cx="12.5" cy="15.5" r=".6" fill="currentColor" stroke="none" />
    <circle cx="15.5" cy="15" r=".6" fill="currentColor" stroke="none" />
  </Icon>
);
const IconSigns = (p) => (
  <Icon {...p}>
    <path d="M4 8.5c2-.8 4-1.5 8-1.5s6 .7 8 1.5" />
    <path d="M5 13c1.8-.7 3.5-1.2 7-1.2s5.2.5 7 1.2" opacity=".7" />
    <path d="M7 17.5c1.2-.4 2.4-.7 5-.7s3.8.3 5 .7" opacity=".45" />
  </Icon>
);
const IconRosacea = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M7 11c2.5-.6 3.5-.6 5 0" />
    <path d="M12 13c2.5-.6 3.5-.6 5 0" />
  </Icon>
);
const IconStructure = (p) => (
  <Icon {...p}>
    <path d="M12 3.5c4 1 6.5 4.2 6.5 8.5 0 5-3 8.5-6.5 8.5S5.5 17 5.5 12c0-4.3 2.5-7.5 6.5-8.5Z" />
    <path d="M9 11l2 2 4-4" opacity=".55" />
  </Icon>
);

// UI icons
const IconUpload = (p) => <Icon {...p} d="M12 15.5V4.5m0 0-4 4m4-4 4 4M4.5 15v2.5a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V15" />;
const IconDownload = (p) => <Icon {...p} d="M12 4.5V15m0 0-4-4m4 4 4-4M4.5 15v2.5a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V15" />;
const IconArrowRight = (p) => <Icon {...p} d="M4.5 12h15m0 0-5-5m5 5-5 5" />;
const IconSparkle = (p) => (
  <Icon {...p}>
    <path d="M12 4v4M12 16v4M4 12h4M16 12h4" />
    <path d="M7 7l2 2M15 15l2 2M17 7l-2 2M9 15l-2 2" opacity=".55" />
  </Icon>
);
const IconClose = (p) => <Icon {...p} d="M6 6l12 12M18 6L6 18" />;
const IconCheck = (p) => <Icon {...p} d="M4.5 12.5l4.5 4.5L19.5 6.5" />;
const IconShield = (p) => <Icon {...p} d="M12 3.5 5 6v6.5c0 4 3 6.5 7 8 4-1.5 7-4 7-8V6l-7-2.5Z" />;
const IconEye = (p) => (
  <Icon {...p}>
    <path d="M2.5 12S5.5 5.5 12 5.5 21.5 12 21.5 12 18.5 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);
const IconHome = (p) => <Icon {...p} d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1v-8Z" />;
const IconSettings = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2.5v2M12 19.5v2M4.5 12h-2M21.5 12h-2M6 6l-1.4-1.4M19.4 19.4 18 18M6 18l-1.4 1.4M19.4 4.6 18 6" />
  </Icon>
);
const IconFolder = (p) => <Icon {...p} d="M3.5 7a1.5 1.5 0 0 1 1.5-1.5h4l2 2h8a1.5 1.5 0 0 1 1.5 1.5V17a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 17V7Z" />;
const IconHistory = (p) => (
  <Icon {...p}>
    <path d="M3.5 12a8.5 8.5 0 1 0 2.5-6" />
    <path d="M3.5 4v4.5H8" />
    <path d="M12 7.5V12l3 2" />
  </Icon>
);
const IconPresent = (p) => <Icon {...p} d="M3.5 5.5h17v10h-17zM8 19.5h8M12 15.5v4" />;
const IconChevron = (p) => <Icon {...p} d="M9 6l6 6-6 6" />;
const IconInfo = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5.5M12 8v.01" />
  </Icon>
);

Object.assign(window, {
  Icon,
  IconAcne, IconMelasma, IconTexture, IconSigns, IconRosacea, IconStructure,
  IconUpload, IconDownload, IconArrowRight, IconSparkle, IconClose,
  IconCheck, IconShield, IconEye, IconHome, IconSettings, IconFolder,
  IconHistory, IconPresent, IconChevron, IconInfo,
});
