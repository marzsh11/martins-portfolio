import page01 from '../open-studio/page-01.jpg'
import page02 from '../open-studio/page-02.jpg'
import page03 from '../open-studio/page-03.jpg'
import page04 from '../open-studio/page-04.jpg'
import page05 from '../open-studio/page-05.jpg'
import page06 from '../open-studio/page-06.jpg'
import page07 from '../open-studio/page-07.jpg'
import page08 from '../open-studio/page-08.jpg'
import page09 from '../open-studio/page-09.jpg'
import page10 from '../open-studio/page-10.jpg'

const pages = [page01, page02, page03, page04, page05, page06, page07, page08, page09, page10]

export default {
  id: '001',
  client: 'The Open Studio',
  project: 'Zine',
  year: '2026',
  featured: true,
  image: page01,
  imageAlt: 'The Open Studio Issue 0 zine cover with green apples',
  pages,
  description: 'The Open Studio is an artist showcase zine I helped build from initial concept to physical product, designed to create a living space that fosters ongoing conversations about art. My role spanned creative direction, editorial, production, writer assessments, graphic design guidance, and maintaining a cohesive brand identity and voice. I coordinated artist outreach and conducted 1+ hour comprehensive interviews to highlight selected works and give artists a platform for their voices. Additionally, I developed deliberate page layouts tailored to balance each artist’s visual work with their interviews, finishing the zine on gloss and matte paper then hand binding.',
  translations: {
    es: {
      project: 'Fanzine',
      description: 'The Open Studio es un zine de exhibición artística que ayudé a desarrollar desde el concepto inicial hasta el producto final, diseñado para crear un espacio vivo que fomente conversaciones continuas sobre el arte. Mi rol abarcó la dirección creativa, edición, producción, revisión de textos y redactores, dirección de diseño gráfico y el mantenimiento de una identidad y voz de marca cohesionadas. Coordiné la gestión y el contacto con artistas, y realicé entrevistas a profundidad de más de una hora para destacar obras seleccionadas y darle una plataforma a sus voces. Además, desarrollé diseños editoriales intencionales para equilibrar la obra visual de cada artista con sus entrevistas, finalizando el zine en papel couché brillante y mate con encuadernación artesanal hecha a mano.',
    },
  },
}
