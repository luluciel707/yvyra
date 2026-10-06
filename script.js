/* =========================================
   1. CONEXIÓN CON SUPABASE
========================================= */

const SUPABASE_URL = 'https://jwygveqcffvsuwbmklbj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_A3DSf_Fw3wHDDRfA5cv0ng_wtgIhhOL';

const configurado =
  !SUPABASE_URL.includes('TU-PROYECTO') &&
  !SUPABASE_KEY.includes('TU_PUBLISHABLE_KEY');

const db = configurado ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;


/* =========================================
   2. INTEGRANTES DEL CENTRO
   Fotos: guardalas en la carpeta img/ y escribí el nombre del archivo en "foto".
========================================= */

const INTEGRANTES = [
  { nombre: 'Bastian, Pinchetti', cargo: 'Presidente', contacto: '@gordi._bas', foto: 'presidente.jpeg' },
  { nombre: 'Brenda, Maldonado', cargo: 'Secretaria General', contacto: '@brendamaldnn', foto: 'secretaria.jpg' },
  { nombre: 'Mateo, Fernande', cargo: 'Secretario de Finanzas', contacto: '@oetamsalocin', foto: 'finanzas.jpg' },
  { nombre: 'Pia, Cespedes', cargo: 'Secretario de Cultura, Deportes y Recreación', contacto: '@lucikyu7', foto: 'cultura.jpeg' },
  { nombre: 'Lautaro, Postigo', cargo: 'Secretario de Gestión Comunitaria', contacto: '@usuario', foto: 'gestion.jpg' },
  { nombre: 'Santino, Vallejos', cargo: 'Secretario de Comunicación y Prensa', contacto: '@usuario', foto: 'prensa.jpeg' },
  { nombre: 'Tiziano, Arrieta', cargo: 'Secretario de Asuntos Estudiantiles', contacto: '@usuario', foto: 'asuntos.jpg' }
];


/* =========================================
   3. CLUBES
========================================= */

const CLUBES_EJEMPLO = [{ id: 1, nombre: 'Lectura' }, { id: 2, nombre: 'Ajedrez' }];
const EMOJIS = { Lectura: '📚', Ajedrez: '♟️' };

const INFO_CLUBES = {
  Ajedrez: {
    resumen: 'Para quienes ya saben jugar o quieren aprender: se arman niveles para que todos avancen a su ritmo. Los sábados (u otro horario que les quede cómodo) pueden competir con sistema suizo o jugar entre sí. Se fomentan las partidas limpias, el respeto y la ayuda a los que recién empiezan. Además, el centro los apoya para competir con otras escuelas.',
    responsables: 'Con profesor guía · Centro: Mateo Fernande (Finanzas)'
  },
  Lectura: {
    resumen: 'Para quienes disfrutan leer narrativas de todo tipo y quieren debatir y dar su opinión crítica. Cada mes se elige un libro, y se reúnen (por ejemplo un sábado) a charlar sobre lo leído. También pueden hacer exposiciones de sus lecturas para toda la escuela.',
    responsables: 'Con la profesora Noelia May · Centro: Bastian Pinchetti (Presidente)'
  }
};
let clubes = [];
let elegido = null;

const $ = id => document.getElementById(id);


/* =========================================
   4. FUNCIONES GENERALES
========================================= */

function iniciales(nombre) {
  return nombre.split(/[ ,]+/).filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

function aviso(idElemento, texto, error = false) {
  const el = $(idElemento);
  el.textContent = texto;
  el.className = error ? 'aviso error' : 'aviso';
}

function crear(etiqueta, clase, texto) {
  const el = document.createElement(etiqueta);
  if (clase) el.className = clase;
  if (texto) el.textContent = texto;
  return el;
}


/* =========================================
   5. MOSTRAR INTEGRANTES
========================================= */

function dibujarIntegrantes() {
  $('lista-integrantes').innerHTML = '';

  INTEGRANTES.forEach(persona => {
    const tarjeta = crear('article', 'card');
    let foto;

    if (persona.foto) {
      foto = document.createElement('img');
      foto.src = 'img/' + persona.foto;
      foto.alt = persona.nombre;
      // Si no encuentra la foto, muestra las iniciales.
      foto.onerror = () => foto.replaceWith(crear('div', 'avatar', iniciales(persona.nombre)));
    } else {
      foto = crear('div', 'avatar', iniciales(persona.nombre));
    }

    const contacto = crear('a', '', persona.contacto);
    if (persona.contacto.includes('@') && !persona.contacto.startsWith('@')) {
      contacto.href = 'mailto:' + persona.contacto;
    }

    tarjeta.append(foto, crear('h3', '', persona.nombre), crear('span', 'cargo', persona.cargo), contacto);
    $('lista-integrantes').append(tarjeta);
  });
}


/* =========================================
   6. MOSTRAR CLUBES
========================================= */

function dibujarClubes() {
  $('lista-clubs').innerHTML = '';

  clubes.forEach(club => {
    const boton = crear('button', 'club');
    boton.type = 'button';
    boton.setAttribute('aria-pressed', String(elegido === club.id));
   const info = INFO_CLUBES[club.nombre];
boton.append(crear('span', 'emoji', EMOJIS[club.nombre] || '✨'), crear('h3', '', club.nombre));
if (info) {
  boton.append(crear('span', 'resumen', info.resumen), crear('span', 'responsables', info.responsables));
}

    boton.addEventListener('click', () => {
      elegido = elegido === club.id ? null : club.id;
      dibujarClubes();
      const sel = clubes.find(c => c.id === elegido);
      $('elegidos').textContent = sel ? 'Club elegido: ' + sel.nombre : 'Todavía no elegiste un club.';
    });

    $('lista-clubs').append(boton);
  });
}


/* =========================================
   7. GUARDAR INSCRIPCIÓN
========================================= */

$('enviar').addEventListener('click', async () => {
  const nombre = $('nombre').value.trim();
  const apellido = $('apellido').value.trim();
  const curso = $('curso').value.trim();
  const division = $('division').value.trim();
  const telefono = $('telefono').value.trim();

  if (!nombre || !apellido || !curso || !division || !telefono) {
    return aviso('mensaje', 'Completá nombre, apellido, curso, división y teléfono.', true);
  }
  if (!/^[0-9+\s()-]{8,20}$/.test(telefono)) {
    return aviso('mensaje', 'Revisá el teléfono: usá solo números (mínimo 8).', true);
  }
  if (!elegido) return aviso('mensaje', 'Elegí un club.', true);
  if (!db) return aviso('mensaje', 'Falta conectar Supabase en script.js.', true);

  const boton = $('enviar');
  boton.disabled = true;
  boton.textContent = 'Guardando...';

  try {
    const { error } = await db
      .from('estudiantes')
      .insert({ nombre, apellido, curso, division, telefono, club_id: elegido });

    if (error) {
      console.error('Error de Supabase:', error);
      return aviso('mensaje', 'Error: ' + error.message, true);
    }

    aviso('mensaje', '¡Listo! Tu inscripción quedó guardada.');
    elegido = null;
    dibujarClubes();
    $('elegidos').textContent = 'Todavía no elegiste un club.';
    ['nombre', 'apellido', 'curso', 'division', 'telefono'].forEach(id => $(id).value = '');

  } catch (error) {
    console.error(error);
    aviso('mensaje', 'Ocurrió un error al guardar la inscripción.', true);
  } finally {
    boton.disabled = false;
    boton.textContent = 'Guardar mi inscripción';
  }
});

/* =========================================
   8. YVYRÁ ESCUCHA
========================================= */

$('enviar-escucha').addEventListener('click', async () => {
  const marcado = document.querySelector('input[name="tipo"]:checked');
  const mensaje = $('mensaje-escucha').value.trim();
  const nombre = $('escucha-nombre').value.trim() || null;
  const curso = $('escucha-curso').value.trim() || null;

  if (!marcado) return aviso('aviso-escucha', 'Elegí qué querés contarnos.', true);
  if (mensaje.length < 5) return aviso('aviso-escucha', 'Escribí tu mensaje (mínimo 5 letras).', true);
  if (!db) return aviso('aviso-escucha', 'Falta conectar Supabase en script.js.', true);

  const boton = $('enviar-escucha');
  boton.disabled = true;
  boton.textContent = 'Enviando...';

  try {
    const { error } = await db
      .from('propuestas')
      .insert({ tipo: marcado.value, mensaje, nombre, curso });

    if (error) {
      console.error('Error de Supabase:', error);
      return aviso('aviso-escucha', 'Error: ' + error.message, true);
    }

    aviso('aviso-escucha', '¡Gracias! Recibimos tu mensaje.');
    marcado.checked = false;
    ['mensaje-escucha', 'escucha-nombre', 'escucha-curso'].forEach(id => $(id).value = '');

  } catch (error) {
    console.error(error);
    aviso('aviso-escucha', 'Ocurrió un error al enviar el mensaje.', true);
  } finally {
    boton.disabled = false;
    boton.textContent = 'Enviar';
  }
});

/* =========================================
   9. INICIAR LA PÁGINA
========================================= */

(async function iniciar() {
  dibujarIntegrantes();

  if (db) {
    const { data, error } = await db.from('clubes').select('id, nombre').order('nombre');
    if (error) console.error(error);
    clubes = error ? CLUBES_EJEMPLO : data;
  } else {
    clubes = CLUBES_EJEMPLO;
  }

  dibujarClubes();
})();



