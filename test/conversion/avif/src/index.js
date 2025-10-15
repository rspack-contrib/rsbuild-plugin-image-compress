import imageJpeg from '../../../assets/image.jpeg?url';

const images = [imageJpeg];

for (const image of images) {
  const el = new Image();
  el.src = image;
  document.body.appendChild(el);
}
