Es un gradient overlay que cambia de negro a púrpura al hacer hover:

  CSS en production-home.css (líneas 5865-5875):
                                                                                                                          /* Estado default — overlay negro */
  .property-card .img-wrap.loaded:before {                                                                                  background: linear-gradient(180deg, transparent 60%, #000);
    opacity: 1;
  }

  /* Hover — overlay púrpura (el "efecto luz") */
  .property-card:hover .img-wrap.loaded:after {
    background: linear-gradient(180deg, transparent 60%, #652660);
    opacity: 1;  /* cambia de 0 a 1 en hover */
  }

  Cómo funciona:
  - .loaded:before — gradient negro hacia abajo, siempre visible (opacity 1)
  - .loaded:after — gradient púrpura #652660, invisible por defecto (opacity 0)
  - Al hacer hover → el :after pasa a opacity 1 y el :before a opacity 0, creando un cambio de tono de negro a púrpura
  que simula un efecto de luz

  También hay un shimmer (líneas 5841-5854) que es la animación de carga antes de que la imagen esté lista.

  El JS simplemente agrega/remove la clase loaded en el img-wrap para indicar que la imagen terminó de cargar.

fetchea https://www.senadaadzem.com/ para confirmar.