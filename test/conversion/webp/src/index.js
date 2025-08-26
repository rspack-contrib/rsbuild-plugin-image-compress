import imageJpeg from '../../../assets/conversion/source-jpeg.jpeg?url';
import imagePng from '../../../assets/conversion/source-png.png?url';

const images = [imageJpeg, imagePng];

for (const image of images) {
  const el = new Image();
  el.src = image;
  document.body.appendChild(el);
}
