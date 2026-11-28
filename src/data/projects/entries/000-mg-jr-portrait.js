import portraitImage from '../mgjr/IMG_3120.JPG'
import graduationPortrait from '../mgjr/IMG_1388-preview.jpg'
import portraitAtWall from '../mgjr/IMG_1401-preview.jpg'
import portraitInHoodie from '../mgjr/IMG_1493-preview.jpg'

export default {
  id: '002',
  client: 'M. G. Jr Portrait',
  project: 'Photography',
  year: '2026',
  featured: true,
  image: portraitImage,
  imageAlt: 'Portrait photograph for M. G. Jr Portrait',
  gallery: [
    { src: graduationPortrait, alt: 'Graduation portrait from the M. G. Jr Portrait series' },
    { src: portraitAtWall, alt: 'Portrait against a wall from the M. G. Jr Portrait series' },
    { src: portraitInHoodie, alt: 'Portrait in a hoodie from the M. G. Jr Portrait series' },
    { src: portraitImage, alt: 'Portrait photograph for M. G. Jr Portrait' },
  ],
  description: 'Directed from my perspective as a first generation Mexican American UCSD alumnus, this series examines the psychological toll of assimilation inside predominantly white academic spaces. Imposing campus concrete and a portrait hiding behind a U.S. flag cap highlight the tension between visibility, self erasure, and the pressure to perform a palatable identity. Ultimately, the work reframes that cultural disorientation as a strength, offering a dual perspective that exists beyond a binary world.',
  translations: {
    es: {
      project: 'Fotografía',
      description: 'Dirigida creativamente desde mi perspectiva como egresado de UCSD y mexicoamericano de primera generación, esta serie examina el desgaste psicológico de la asimilación dentro de espacios académicos predominantemente blancos. El concreto imponente del campus y un retrato oculto tras una gorra con la bandera de Estados Unidos resaltan la tensión entre la visibilidad, el borrarse a uno mismo y la presión de proyectar una identidad aceptable. Al final, la obra replantea esa desorientación cultural como una fortaleza, ofreciendo una doble perspectiva que existe más allá de un mundo binario.',
    },
  },
}
