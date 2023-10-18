/* eslint-disable react/prop-types */
// export default function Image({ src, ...rest }) {
//   const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';

//   if (src && src.startsWith('https://')) {
//     return (
//       <img {...rest} src={src} alt={''} />
//     );
//   } else {
//     const localSrc = `${baseUrl}/uploads/${src}`;
//     return (
//       <img {...rest} src={localSrc} alt={''} />
//     );
//   }
// }

export default function Image({ src, ...rest }) {
  const isExternalUrl = src.startsWith('http://') || src.startsWith('https://');

  // Construct the image URL based on whether it's external or local
  const imageUrl = isExternalUrl ? src : `${import.meta.env.VITE_BASE_URL}/uploads/${src}`;

  return <img {...rest} src={imageUrl} alt={''} />;
}
