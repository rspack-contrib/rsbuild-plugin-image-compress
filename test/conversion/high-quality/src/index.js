import imageJpeg from '../../../assets/other-image.jpeg?url';
import imageWebp from '../../../assets/other-image.webp?url';

const images = [imageJpeg, imageWebp];

for (const image of images) {
  const el = new Image();
  el.src = image;
  document.body.appendChild(el);
}
