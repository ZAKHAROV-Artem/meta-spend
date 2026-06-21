import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <svg width={32} height={32} viewBox="0 0 48 48" fill="none">
        <path d="M24 3 L40 10 L44 26 L36 40 L24 45 L12 40 L4 26 L8 10 Z" fill="#F6851B" />
        <path d="M8 10 L14 3 L20 12 Z" fill="#E2761B" />
        <path d="M40 10 L34 3 L28 12 Z" fill="#E2761B" />
        <path d="M20 12 L28 12 L32 20 L24 22 L16 20 Z" fill="#CD6116" />
        <circle cx="17.5" cy="19.5" r="2.2" fill="#1D1D1D" />
        <circle cx="32.5" cy="19.5" r="2.2" fill="#1D1D1D" />
        <ellipse cx="24" cy="32" rx="7" ry="5.5" fill="#FCD0A3" />
        <ellipse cx="24" cy="29.5" rx="2.2" ry="1.4" fill="#1D1D1D" />
        <path d="M12 40 L24 45 L36 40 L31 35 L24 37 L17 35 Z" fill="#E2761B" />
      </svg>
    ),
    { ...size }
  );
}
