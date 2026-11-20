import portraitImage from '../mgjr/IMG_3120.JPG'
import graduationPortrait from '../mgjr/IMG_1388-preview.jpg'
import portraitAtWall from '../mgjr/IMG_1401-preview.jpg'
import portraitInHoodie from '../mgjr/IMG_1493-preview.jpg'

export default {
  id: '000',
  client: 'M. G. Jr Portrait',
  project: 'Photography',
  year: '2025',
  featured: true,
  image: portraitImage,
  imageAlt: 'Portrait photograph for M. G. Jr Portrait',
  gallery: [
    { src: graduationPortrait, alt: 'Graduation portrait from the M. G. Jr Portrait series' },
    { src: portraitAtWall, alt: 'Portrait against a wall from the M. G. Jr Portrait series' },
    { src: portraitInHoodie, alt: 'Portrait in a hoodie from the M. G. Jr Portrait series' },
    { src: portraitImage, alt: 'Portrait photograph for M. G. Jr Portrait' },
  ],
  description: 'A portrait photograph from the M. G. Jr Portrait series.',
}
