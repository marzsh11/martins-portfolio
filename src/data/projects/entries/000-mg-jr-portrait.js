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
  description: 'As a first generation Mexican-American UCSD alumni, this work encapsulates the education experience and navigation between two identities. The concrete architecture acts as an encroaching presence, mirroring the assimilation and mental toll required to occupy academic spaces. The ironic tension of visibility and concealment of me wearing a U.S flag cap while hiding my face questions why self erasure. Its the unspoken pressure of navigating predominantly “white” or institutional spaces as a visibly Mexican person. The feeling to mute one’s own cultural markers and perform a palatable version of myself, the American version. Although this disorientation is a blessing. The ability to navigate the shared perspective and dual understanding from two cultures at the same time allows me to exist outside a binary world.',
  translations: {
    es: {
      project: 'Fotografía',
      description: 'Como egresado mexicano-americano de primera generación de La Universidad de California San Diego, este trabajo encapsula la experiencia universitaria y el constante navegar entre dos identidades. La arquitectura de concreto actúa como una presencia invasiva que refleja la asimilación y el desgaste mental que exige ocupar estos espacios académicos. La tensión irónica entre hacerse visible y ocultarse al usar una gorra con la bandera de Estados Unidos mientras cubro mi cara cuestiona el porqué de borrarse a uno mismo. Es esa presión silenciosa de moverse en espacios institucionales o predominantemente “blancos” siendo una persona visiblemente mexicana; la sensación de tener que apagar las propias características culturales para proyectar una versión más digerible de mí mismo: la versión americano. Sin embargo, esta desorientación es una bendición. La capacidad de habitar una perspectiva compartida y entender dos culturas al mismo tiempo me permite existir fuera de un mundo binario.',
    },
  },
}
