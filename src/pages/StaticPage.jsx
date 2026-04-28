import React from 'react';
import { useLocation } from 'react-router-dom';

const pagesData = {
  '/politica-de-privacidad': {
    title: 'Política de Privacidad',
    content: `
      <h2>1. Información que recopilamos</h2>
      <p>En Tearz 1874! respetamos tu privacidad y estamos comprometidos a proteger tus datos personales. Recopilamos información que nos proporcionas directamente cuando creas una cuenta, realizas una compra, te suscribes a nuestro newsletter o te comunicas con nosotros. Esto incluye tu nombre, dirección de correo electrónico, dirección de envío y facturación, número de teléfono y detalles de pago.</p>
      
      <h2>2. Uso de la información</h2>
      <p>Utilizamos tu información personal exclusivamente para los siguientes propósitos:</p>
      <ul>
        <li>Procesar y entregar tus pedidos de manera eficiente.</li>
        <li>Enviarte actualizaciones sobre el estado de tu compra y número de seguimiento.</li>
        <li>Responder a tus consultas y brindarte soporte técnico.</li>
        <li>Enviarte novedades, drops exclusivos y promociones (solo si te has suscrito a nuestro newsletter).</li>
        <li>Mejorar nuestro sitio web y tu experiencia de usuario.</li>
      </ul>

      <h2>3. Protección y seguridad de datos</h2>
      <p>Implementamos estrictas medidas de seguridad técnicas y organizativas para proteger tu información personal contra acceso no autorizado, alteración, divulgación o destrucción. Tus pagos son procesados a través de plataformas seguras (como Mercado Pago) y nosotros no almacenamos los datos de tus tarjetas de crédito.</p>

      <h2>4. Compartir información con terceros</h2>
      <p>No vendemos, intercambiamos ni transferimos a terceros tu información personal, excepto a nuestros proveedores de servicios de confianza (empresas de logística, procesadores de pago) que nos asisten en la operación de nuestro sitio web y en la entrega de tu pedido, siempre bajo estrictos acuerdos de confidencialidad.</p>

      <h2>5. Tus derechos</h2>
      <p>Tienes derecho a solicitar acceso, corrección o eliminación de tus datos personales en cualquier momento. Puedes ejercer estos derechos contactándonos a través de nuestro email oficial.</p>
    `
  },
  '/terminos-y-condiciones': {
    title: 'Términos y Condiciones',
    content: `
      <h2>1. Condiciones Generales</h2>
      <p>Bienvenido a Tearz 1874!. Al acceder y utilizar este sitio web para realizar compras, aceptas estar sujeto a los presentes términos y condiciones. Te recomendamos leerlos cuidadosamente antes de realizar cualquier transacción. Nos reservamos el derecho de modificar estos términos en cualquier momento sin previo aviso.</p>
      
      <h2>2. Productos y Disponibilidad</h2>
      <p>Hacemos todo lo posible para mostrar con precisión los colores y detalles de nuestros productos. Sin embargo, no podemos garantizar que el monitor de tu computadora o pantalla del celular muestre los colores de manera exacta. La disponibilidad de los productos está sujeta a stock. En caso de que un artículo se agote después de tu compra, te contactaremos inmediatamente para ofrecerte un cambio o el reembolso total.</p>
      
      <h2>3. Precios y Pagos</h2>
      <p>Todos los precios en el sitio están en Pesos Argentinos (ARS) e incluyen el IVA. Nos reservamos el derecho de modificar los precios en cualquier momento. Aceptamos múltiples métodos de pago, incluyendo tarjetas de crédito/débito y saldo de Mercado Pago. Tu pedido solo será procesado una vez que se haya confirmado el pago.</p>

      <h2>4. Envíos y Entregas</h2>
      <p>Realizamos envíos a todo el país. Los tiempos de entrega son estimativos y dependen de la empresa de logística. Tearz 1874! no se hace responsable por demoras una vez que el paquete ha sido despachado, aunque siempre estaremos a disposición para ayudarte a rastrear y solucionar cualquier inconveniente.</p>

      <h2>5. Propiedad Intelectual</h2>
      <p>Todo el contenido de este sitio (textos, gráficos, logos, imágenes, diseño) es propiedad exclusiva de Tearz 1874! y está protegido por las leyes de propiedad intelectual. Queda estrictamente prohibida su reproducción o uso sin nuestra autorización por escrito.</p>
    `
  },
  '/cambios-y-devoluciones': {
    title: 'Cambios y Devoluciones',
    content: `
      <h2>1. Política de Cambios</h2>
      <p>Queremos que estés 100% conforme con tu compra. Aceptamos cambios dentro de los <strong>30 días corridos</strong> a partir de la fecha en que recibiste tu pedido. Para que el cambio sea válido, las prendas deben cumplir con las siguientes condiciones:</p>
      <ul>
        <li>Estar sin uso, sin lavar y sin olores.</li>
        <li>Conservar todas sus etiquetas originales colocadas.</li>
        <li>Estar en su packaging original en buen estado.</li>
      </ul>
      <p>Si la prenda no cumple con estas condiciones, nos reservamos el derecho de rechazar el cambio.</p>

      <h2>2. Procedimiento para solicitar un cambio</h2>
      <p>Para iniciar un cambio, envíanos un email a nuestro correo oficial o un mensaje por Instagram indicando tu número de pedido (#XXXX), la prenda que deseas cambiar y el motivo. Te indicaremos los pasos a seguir y la dirección a donde debes enviar el paquete.</p>

      <h2>3. Costos de envío por cambios</h2>
      <p>Si el cambio es por un error nuestro (producto defectuoso o diferente al solicitado), Tearz 1874! se hace cargo de todos los costos de envío. Si el cambio es por talle, color o preferencia del cliente, los costos de envío (ida y vuelta) corren por cuenta del cliente.</p>

      <h2>4. Devoluciones y Reembolsos</h2>
      <p>Si no estás conforme con tu producto y deseas devolverlo, tienes un plazo de 10 días corridos desde que recibiste la compra para solicitar el arrepentimiento. El reembolso se procesará al método de pago original una vez que recibamos e inspeccionemos la prenda.</p>
    `
  },
  '/preguntas-frecuentes': {
    title: 'Preguntas Frecuentes',
    content: `
      <h2>¿Hacen envíos a todo el país?</h2>
      <p>Sí, llegamos a cualquier punto de la República Argentina a través de empresas de correo de primera línea (Correo Argentino, Andreani o similares dependiendo de tu zona). Te enviaremos un código de seguimiento apenas tu pedido sea despachado.</p>
      
      <h2>¿Cuánto tarda en llegar mi pedido?</h2>
      <p>El tiempo de preparación en nuestro depósito suele ser de 24 a 48 hs hábiles. Luego de ser despachado, el tiempo del correo es estimativamente:</p>
      <ul>
        <li><strong>CABA y GBA:</strong> 2 a 4 días hábiles.</li>
        <li><strong>Interior del país:</strong> 3 a 7 días hábiles.</li>
      </ul>

      <h2>¿Qué métodos de pago aceptan?</h2>
      <p>Trabajamos a través de Mercado Pago, lo cual te permite abonar con:</p>
      <ul>
        <li>Tarjetas de Crédito y Débito (Visa, Mastercard, Amex, Cabal).</li>
        <li>Dinero en cuenta de Mercado Pago.</li>
        <li>Efectivo en puntos de pago (Rapipago, Pago Fácil).</li>
        <li>Transferencia Bancaria (con descuento especial si lo indica la web).</li>
      </ul>

      <h2>¿Cómo sé cuál es mi talle?</h2>
      <p>En la descripción de cada producto vas a encontrar una tabla de talles detallada con las medidas en centímetros. Te recomendamos medir una prenda tuya que te quede bien y compararla con nuestra tabla para elegir el talle perfecto.</p>

      <h2>¿Tienen local físico?</h2>
      <p>Por el momento operamos de manera exclusivamente online (e-commerce). Esto nos permite llegar a todo el país y lanzar nuevos drops cada semana. Mantenete atento a nuestras redes porque a veces realizamos Pop-up Stores (eventos físicos temporales).</p>

      <h2>¿Qué pasa si mi pedido no llega o el correo no me encuentra?</h2>
      <p>Si el correo hace una visita y no encuentra a nadie, generalmente intentarán una segunda visita o dejarán el paquete en la sucursal más cercana por unos días. Te recomendamos estar siempre atento al código de seguimiento. Si el paquete vuelve a nosotros, el reenvío quedará a cargo del cliente.</p>
    `
  },
  '/contacto': {
    title: 'Contacto',
    content: `
      <h2>¿Necesitas ayuda o tenés alguna duda?</h2>
      <p>En Tearz 1874! estamos para ayudarte. Escribinos por cualquiera de nuestros canales oficiales y te vamos a responder lo más rápido posible (nuestro horario de atención es de Lunes a Viernes de 10:00 a 18:00 hs).</p>
      
      <p><strong>Email:</strong> <a href="mailto:tearz.ar.oficial@gmail.com" style="color: var(--color-accent); text-decoration: underline;">tearz.ar.oficial@gmail.com</a></p>
      <p><strong>Instagram:</strong> <a href="https://www.instagram.com/tearz.1874/" target="_blank" style="color: var(--color-accent); text-decoration: underline;">@tearz.1874</a></p>
      
      <p style="margin-top: 30px;"><i>Por favor, si tu consulta es sobre un pedido ya realizado, no olvides incluir tu número de orden (#XXXX) en el mensaje para que podamos ayudarte más rápido.</i></p>
    `
  }
};

function StaticPage() {
  const location = useLocation();
  const page = pagesData[location.pathname] || { title: 'Página no encontrada', content: '<p>Lo sentimos, la página que buscas no existe.</p>' };

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="static-page" style={{ padding: '80px 20px', maxWidth: '850px', margin: '0 auto', minHeight: '60vh' }}>
      <h1 style={{ fontFamily: 'var(--font-primary)', fontSize: '2.5rem', marginBottom: '50px', textTransform: 'uppercase', textAlign: 'center', letterSpacing: '0.1em' }}>
        {page.title}
      </h1>
      <style>
        {`
          .static-content h2 {
            font-family: var(--font-primary);
            font-size: 1.4rem;
            margin-top: 2rem;
            margin-bottom: 1rem;
            color: var(--color-text);
          }
          .static-content p {
            margin-bottom: 1.2rem;
            line-height: 1.8;
          }
          .static-content ul {
            list-style-type: disc;
            margin-left: 2rem;
            margin-bottom: 1.5rem;
          }
          .static-content li {
            margin-bottom: 0.5rem;
            line-height: 1.8;
          }
        `}
      </style>
      <div 
        className="static-content" 
        style={{ color: 'var(--color-text-light)' }}
        dangerouslySetInnerHTML={{ __html: page.content }} 
      />
    </div>
  );
}

export default StaticPage;
