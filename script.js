
/* =========================================
   1. CONEXIÓN CON SUPABASE
========================================= */

// Pegá tu Project URL entre las comillas:
const SUPABASE_URL = 'https://sayehiisneupxkivuqmo.supabase.co';

// Pegá tu Publishable Key entre las comillas:
const SUPABASE_KEY = 'sb_publishable_VyxX3M6CsBNEhRw_BwojtA_bPP_36wa';

const configurado =
  !SUPABASE_URL.includes('TU-PROYECTO') &&
  !SUPABASE_KEY.includes('TU_PUBLISHABLE_KEY');

const db = configurado
  ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;


/* =========================================
   2. INTEGRANTES DEL CENTRO
========================================= */

// Para agregar fotos:
// Guardalas dentro de la carpeta img/
// y escribí el nombre del archivo en "foto".

const INTEGRANTES = [

  {
    nombre: 'Bastian, Pinchetti',
    cargo: 'Presidente',
    contacto: '@usuario',
    foto: 'presidente.jpg'
  },

  {
    nombre: 'Brenda, Maldonado',
    cargo: 'Secretaria General',
    contacto: '@usuario',
    foto: 'secretaria.jpg'
  },

  {
    nombre: 'Mateo, Fernandez',
    cargo: 'Secretario de Finanzas',
    contacto: '@usuario',
    foto: 'finanzas.jpg'
  },

  {
    nombre: 'Cespedes, Pia',
    cargo: 'Secretario de Cultura, Deportes y Recreación',
    contacto: '@lucikyu7',
    foto: 'cultura.jpeg'
  },

  {
    nombre: 'Postigo, Lautaro',
    cargo: 'Secretario de Gestión Comunitaria',
    contacto: '@usuario',
    foto: 'gestion.jpg'
  },

  {
    nombre: 'Vallejos, Santino',
    cargo: 'Secretario de Comunicación y Prensa',
    contacto: '@usuario',
    foto: 'prensa.jpg'
  },

  {
    nombre: 'Arrieta, Tiziano',
    cargo: 'Secretario de Asuntos Estudiantiles',
    contacto: '@usuario',
    foto: 'asuntos.jpg'
  }
];


/* =========================================
   3. CLUBES
========================================= */

const CLUBES_EJEMPLO = [
  { id: 1, nombre: 'Lectura' },
  { id: 2, nombre: 'Ajedrez' }
];

const EMOJIS = {
  Lectura: '📚',
  Ajedrez: '♟️'
};

let clubes = [];
let elegido = null;

const $ = id => document.getElementById(id);


/* =========================================
   4. FUNCIONES GENERALES
========================================= */

function iniciales(nombre) {
  return nombre
    .split(' ')
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function aviso(texto, error = false) {
  $('mensaje').textContent = texto;
  $('mensaje').className = error ? 'error' : '';
}


/* =========================================
   5. MOSTRAR INTEGRANTES
========================================= */

function dibujarIntegrantes() {

  $('lista-integrantes').innerHTML = '';

  INTEGRANTES.forEach(persona => {

    const tarjeta = document.createElement('article');
    tarjeta.className = 'card';

    let foto;

    if (persona.foto) {

      foto = document.createElement('img');
      foto.src = 'img/' + persona.foto;
      foto.alt = persona.nombre;

      // Si no encuentra la foto, muestra las iniciales.
      foto.onerror = () => {
        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        avatar.textContent = iniciales(persona.nombre);
        foto.replaceWith(avatar);
      };

    } else {

      foto = document.createElement('div');
      foto.className = 'avatar';
      foto.textContent = iniciales(persona.nombre);

    }

    const nombre = document.createElement('h3');
    nombre.textContent = persona.nombre;

    const cargo = document.createElement('p');
    cargo.className = 'cargo';
    cargo.textContent = persona.cargo;

    const contacto = document.createElement('a');
    contacto.textContent = persona.contacto;

    if (
      persona.contacto.includes('@') &&
      !persona.contacto.startsWith('@')
    ) {
      contacto.href = 'mailto:' + persona.contacto;
    }

    tarjeta.append(foto, nombre, cargo, contacto);

    $('lista-integrantes').append(tarjeta);

  });

}


/* =========================================
   6. MOSTRAR CLUBES
========================================= */

function dibujarClubes() {

  $('lista-clubs').innerHTML = '';

  clubes.forEach(club => {

    const boton = document.createElement('button');

    boton.type = 'button';
    boton.className = 'club';

    boton.setAttribute(
      'aria-pressed',
      String(elegido === club.id)
    );

    const emoji = document.createElement('span');
    emoji.className = 'emoji';
    emoji.textContent = EMOJIS[club.nombre] || '✨';

    const nombre = document.createElement('h3');
    nombre.textContent = club.nombre;

    boton.append(emoji, nombre);

    boton.addEventListener('click', () => {

      elegido = elegido === club.id ? null : club.id;

      dibujarClubes();

      const seleccionado = clubes.find(
        c => c.id === elegido
      );

      $('elegidos').textContent = seleccionado
        ? 'Club elegido: ' + seleccionado.nombre
        : 'Todavía no elegiste un club.';

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

  // Comprobar que todos los campos estén completos.
  if (!nombre || !apellido || !curso || !division) {
    return aviso(
      'Completá nombre, apellido, curso y división.',
      true
    );
  }

  // Comprobar que haya elegido un club.
  if (!elegido) {
    return aviso('Elegí un club.', true);
  }

  // Comprobar la conexión con Supabase.
  if (!db) {
    return aviso(
      'Falta conectar Supabase en script.js.',
      true
    );
  }

  const boton = $('enviar');
  boton.disabled = true;
  boton.textContent = 'Guardando...';

  try {

    const { error } = await db
      .from('estudiantes')
      .insert({
        nombre,
        apellido,
        curso,
        division,
        club_id: elegido
      });

  if (error) {
  console.error('ERROR COMPLETO DE SUPABASE:', error);

  return aviso(
    'Error: ' + error.message,
    true
  );
}
    aviso('¡Listo! Tu inscripción quedó guardada.');

    // Limpiar el formulario.
    elegido = null;

    dibujarClubes();

    $('elegidos').textContent =
      'Todavía no elegiste un club.';

    ['nombre', 'apellido', 'curso', 'division'].forEach(id => {
      $(id).value = '';
    });

  } catch (error) {

    console.error(error);

    aviso(
      'Ocurrió un error al guardar la inscripción.',
      true
    );

  } finally {

    boton.disabled = false;
    boton.textContent = 'Guardar mi inscripción';

  }

});


/* =========================================
   8. INICIAR LA PÁGINA
========================================= */

(async function iniciar() {

  dibujarIntegrantes();

  if (db) {

    const { data, error } = await db
      .from('clubes')
      .select('id, nombre')
      .order('nombre');

    if (error) {

      console.error(error);
      clubes = CLUBES_EJEMPLO;

    } else {

      clubes = data;

    }

  } else {

    clubes = CLUBES_EJEMPLO;

  }

  dibujarClubes();

})();
