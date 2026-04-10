import { ImageResponse } from 'next/og';

export const size = {
  width: 64,
  height: 64,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          height: '100%',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
          border: '4px solid #111111',
          borderRadius: 18,
          color: '#111111',
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: '-0.08em',
          fontFamily: 'sans-serif',
        }}
      >
        MA
      </div>
    ),
    size
  );
}
