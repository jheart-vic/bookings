/* eslint-disable react/prop-types */
// export default function Image({src,...rest}) {
//   src = src && src.includes('https://')
//     ? src
//     : 'http://localhost:4000/uploads/'+src;
//   return (
//     <img  {...rest} src={src} alt={''} />
//   );
// }

// Compare this snippet from client/src/PhotosUploader.jsx:
/* eslint-disable react/prop-types */
export default function Image({ src, ...rest }) {
  // Check if src is a remote URL (starts with 'https://')
  if (src && src.startsWith('https://')) {
    return (
      <img {...rest} src={src} alt={''} />
    );
  } else {
    // Assuming it's a local path
    const localSrc = 'http://localhost:4000/uploads/' + src;
    return (
      <img {...rest} src={localSrc} alt={''} />
    );
  }
}