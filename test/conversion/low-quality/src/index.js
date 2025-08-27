import imageJpeg from '../../../assets/image.jpeg?url';
import imageWebp from '../../../assets/image.webp?url';

const images = [imageJpeg, imageWebp];

for (const image of images) {
  const el = new Image();
  el.src = image;
  document.body.appendChild(el);
}
