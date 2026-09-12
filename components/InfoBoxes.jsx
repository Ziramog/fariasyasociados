import InfoBox from './InfoBox';

const InfoBoxes = () => {
  return (
    <section>
      <div className='container-xl lg:container m-auto'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg'>
          <InfoBox
            heading='Para Compradores'
            backgroundColor='bg-[#0A0A0A]'
            buttonInfo={{
              text: 'Ver Propiedades',
              link: '/properties',
              backgroundColor: 'bg-primary',
            }}
          >
            Encontrá tu próxima propiedad. Casas, departamentos, campos y más en Córdoba.
          </InfoBox>
          <InfoBox
            heading='Para Vendedores'
            backgroundColor='bg-[#1C1C1A]'
            buttonInfo={{
              text: 'Publicar Propiedad',
              link: '/properties/add',
              backgroundColor: 'bg-[#3B3B3B]',
            }}
          >
            Vendé o alquilá tu propiedad con ayuda de profesionales con más de 10 años de experiencia.
          </InfoBox>
        </div>
      </div>
    </section>
  );
};
export default InfoBoxes;
