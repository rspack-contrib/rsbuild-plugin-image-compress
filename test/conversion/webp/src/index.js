import imageJpeg from '../../../assets/image.jpeg?url';
import imagePng from '../../../assets/image.png?url';

const images = [imagePng, imageJpeg];

for (const image of images) {
  const el = new Image();
  el.src = image;
  document.body.appendChild(el);
}
