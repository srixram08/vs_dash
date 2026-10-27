import React from 'react';

interface VSLogoProps {
  className?: string;
  size?: number;
  color?: string;
}

export const VSLogo: React.FC<VSLogoProps> = ({
  className = 'w-10 h-10',
  size = 40,
  color = 'currentColor',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Left V Wing */}
      <path
        d="M20 20 H62 L100 148 L80 148 L20 20 Z"
        fill={color}
      />

      {/* Top Left Wing Notch */}
      <polygon
        points="20,20 62,20 54,42 36,42"
        fill={color}
      />

      {/* Right V Wing with Top Arrow Notch */}
      <path
        d="M178 20 H136 L100 148 L116 148 L178 20 Z"
        fill={color}
      />
      <polygon
        points="136,20 178,20 160,54 136,54"
        fill={color}
      />

      {/* Central Stylized Bold S */}
      <path
        d="M98 20 C122 20 140 33 138 52 C137 68 122 75 104 82 C88 88 80 94 82 105 C84 118 100 126 114 116 L124 130 C104 144 76 136 72 114 C69 94 84 84 102 78 C118 72 126 66 125 56 C124 47 114 36 98 36 C86 36 76 42 72 50 L56 40 C64 26 80 20 98 20 Z"
        fill={color}
      />
    </svg>
  );
};

export default VSLogo;
