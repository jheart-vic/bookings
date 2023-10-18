/* eslint-disable react/prop-types */
export default function Image({ src, ...rest }) {
  const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';

  if (src && src.startsWith('https://')) {
    return (
      <img {...rest} src={src} alt={''} />
    );
  } else {
    const localSrc = `${baseUrl}/uploads/${src}`;
    return (
      <img {...rest} src={localSrc} alt={''} />
    );
  }
}
