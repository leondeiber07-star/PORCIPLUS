/**
 * =========================================================================
 * PORCIPLUS - SISTEMA DE CONTROL DE MORTALIDAD DE CERDAS & RBAC
 * Código Apps Script (Code.gs)
 * =========================================================================
 * Instrucciones de Instalación:
 * 1. En tu Hoja de Cálculo, ve a: Extensiones > Apps Script
 * 2. Reemplaza el contenido del archivo Code.gs con este código completo.
 * 3. Haz clic en "Guardar" (ícono de disco).
 * 4. Para usar como Web App: Haz clic en "Implementar" > "Nueva implementación"
 *    > Tipo: "Aplicación web" > Ejecutar como: "Yo" > Quién tiene acceso: "Cualquiera".
 * =========================================================================
 */

const SHEET_NAME_MORTALIDAD = 'Mortalidad';
const SHEET_NAME_USUARIOS = 'Usuarios';

/**
 * Menú personalizado dentro de la Hoja de Cálculo
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🐷 PORCIPLUS')
    .addItem('Inicializar Estructura de Hojas', 'inicializarEstructura')
    .addItem('Crear Usuario Admin por Defecto', 'crearAdminDefecto')
    .addToUi();
}

/**
 * Función auxiliar para extraer el ID limpio de cualquier enlace o texto
 */
function extraerIdHoja(str) {
  if (!str) return '';
  const s = String(str).trim();
  const match = s.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) return match[1];
  const match2 = s.match(/([a-zA-Z0-9-_]{20,})/);
  if (match2 && match2[1]) return match2[1];
  return s.split(/[/?#]/)[0];
}

/**
 * Obtiene la Hoja de Cálculo objetivo: por ID personalizado o activa
 */
function obtenerSpreadsheet(customId) {
  if (customId && typeof customId === 'string' && customId.trim() !== '') {
    const cleanId = extraerIdHoja(customId);
    try {
      const ssFound = SpreadsheetApp.openById(cleanId);
      if (ssFound) {
        PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', cleanId);
        return ssFound;
      }
    } catch (e) {
      console.warn('No se pudo abrir hoja con ID ' + cleanId + ': ' + e.toString());
    }
  }
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {}

  const props = PropertiesService.getScriptProperties();
  const savedId = props.getProperty('SPREADSHEET_ID');
  if (savedId) {
    try {
      const ssSaved = SpreadsheetApp.openById(savedId);
      if (ssSaved) return ssSaved;
    } catch (e) {}
  }

  try {
    const newSs = SpreadsheetApp.create('PORCIPLUS - Base de Datos');
    props.setProperty('SPREADSHEET_ID', newSs.getId());
    return newSs;
  } catch (e) {
    console.error('Error al crear hoja automatica: ' + e.toString());
    return null;
  }
}

/**
 * Asegura la existencia y formato de las pestañas 'Mortalidad' y 'Usuarios'
 */
function asegurarHojas(ss) {
  // 1. Hoja Mortalidad
  let sheetMort = ss.getSheetByName(SHEET_NAME_MORTALIDAD);
  if (!sheetMort) {
    sheetMort = ss.insertSheet(SHEET_NAME_MORTALIDAD);
  }
  const mortHeaders = [
    'ID', 'FECHA', 'ID_ANIMAL', 'REGISTRADO_POR', 'ROL', 'USUARIO',
    'GENETICA', 'ESTATUS', 'CAUSA', 'LUGAR', 'PARIDAD', 'SEMANA', 'DIA', 'OBSERVACIONES'
  ];
  if (sheetMort.getLastRow() === 0) {
    sheetMort.getRange(1, 1, 1, mortHeaders.length)
      .setValues([mortHeaders])
      .setFontWeight('bold')
      .setBackground('#0f172a')
      .setFontColor('#ffffff');
    sheetMort.setFrozenRows(1);
  }

  // 2. Hoja Usuarios
  let sheetUsers = ss.getSheetByName(SHEET_NAME_USUARIOS);
  if (!sheetUsers) {
    sheetUsers = ss.insertSheet(SHEET_NAME_USUARIOS);
  }
  const userHeaders = [
    'ID', 'NOMBRE', 'USUARIO', 'PASSWORD', 'ROL',
    'VER_DASHBOARD', 'VER_TABLA', 'EDITAR_TABLA', 'VER_GRAFICOS', 'VER_ALERTAS',
    'BLOQUEADO', 'TIPO_BLOQUEO', 'BLOQUEADO_HASTA', 'MOTIVO_BLOQUEO'
  ];
  if (sheetUsers.getLastRow() === 0) {
    sheetUsers.getRange(1, 1, 1, userHeaders.length)
      .setValues([userHeaders])
      .setFontWeight('bold')
      .setBackground('#1e293b')
      .setFontColor('#ffffff');
    sheetUsers.setFrozenRows(1);
  }

  // Si la hoja de usuarios solo tiene encabezados, insertar admin inicial
  if (sheetUsers.getLastRow() <= 1) {
    sheetUsers.appendRow([
      'user-admin-1', 'Admin', 'admin', 'admin', 'administrador',
      'TRUE', 'TRUE', 'TRUE', 'TRUE', 'TRUE', 'FALSE', '', '', ''
    ]);
  }

  return { sheetMort: sheetMort, sheetUsers: sheetUsers };
}

function inicializarEstructura() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  asegurarHojas(ss);
  SpreadsheetApp.getUi().alert('✅ Estructura inicializada exitosamente en la Hoja de Cálculo.');
}

function crearAdminDefecto() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hojas = asegurarHojas(ss);
  const sheetUsers = hojas.sheetUsers;
  if (sheetUsers.getLastRow() <= 1) {
    sheetUsers.appendRow([
      'user-admin-1', 'Admin', 'admin', 'admin', 'administrador',
      'TRUE', 'TRUE', 'TRUE', 'TRUE', 'TRUE', 'FALSE', '', '', ''
    ]);
  }
}

/**
 * Endpoint Web App (GET):
 * - Carga y muestra la interfaz web completa Index.html cuando se visita en el navegador
 * - Retorna JSON si se especifica ?api=json o ?action=getAll
 */
function doGet(e) {
  try {
    if (e && e.parameter && (e.parameter.api === 'json' || e.parameter.action === 'getAll')) {
      const customId = e.parameter.sheetId || '';
      const ss = obtenerSpreadsheet(customId);
      if (!ss) return respuestaJson({ success: false, error: 'No se encontró la hoja de cálculo.' });
      asegurarHojas(ss);
      const records = obtenerRegistrosMortalidad(ss);
      const users = obtenerUsuarios(ss);
      return respuestaJson({
        success: true,
        spreadsheetId: ss.getId(),
        spreadsheetUrl: ss.getUrl(),
        records: records,
        users: users
      });
    }

    let template;
    try {
      template = HtmlService.createTemplateFromFile('index');
    } catch (e1) {
      template = HtmlService.createTemplateFromFile('Index');
    }
    return template
      .evaluate()
      .setTitle('PORCIPLUS - Sistema de Mortalidad & Usuarios')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } catch (err) {
    return HtmlService.createHtmlOutput(
      '<div style="font-family:sans-serif;padding:30px;max-width:650px;margin:40px auto;border:1px solid #e2e8f0;border-radius:16px;background:#ffffff;">' +
      '<h2 style="color:#b91c1c;margin-top:0;">⚠️ Falta el archivo Index.html en Apps Script</h2>' +
      '<p style="color:#334155;">Para visualizar el sistema interactivo completo con login, tabla y métricas:</p>' +
      '<ol style="color:#334155;line-height:1.8;">' +
      '<li>En el editor de Apps Script, haz clic en el botón <strong>+ (Añadir un archivo) > HTML</strong>.</li>' +
      '<li>Nómbralo exactamente <strong>Index</strong> (sin la extensión .html).</li>' +
      '<li>Pega el código provisto en el apartado <strong>"Código Web App (Index.html)"</strong> del sistema y pulsa Guardar (Ctrl + S).</li>' +
      '<li>Recarga esta URL.</li>' +
      '</ol>' +
      '<hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;" />' +
      '<p style="color:#64748b;font-size:12px;">Si solo deseas consultar la API de datos en crudo JSON, añade <code>?api=json</code> al final de la URL.</p>' +
      '</div>'
    );
  }
}

/**
 * Funciones nativas para llamadas directas desde Index.html con google.script.run
 */
function apiObtenerDatos(customId) {
  try {
    const ss = obtenerSpreadsheet(customId);
    if (!ss) throw new Error('No se encontró una hoja de cálculo activa ni vinculada.');
    asegurarHojas(ss);
    return {
      success: true,
      spreadsheetId: ss.getId(),
      spreadsheetUrl: ss.getUrl(),
      spreadsheetName: ss.getName(),
      records: obtenerRegistrosMortalidad(ss),
      users: obtenerUsuarios(ss)
    };
  } catch (err) {
    console.error('Error en apiObtenerDatos: ' + err.toString());
    return {
      success: false,
      error: err.toString(),
      records: [],
      users: []
    };
  }
}

function apiSincronizarTodo(records, users, customId) {
  try {
    const ss = obtenerSpreadsheet(customId);
    if (!ss) throw new Error('No se encontró una hoja de cálculo activa ni vinculada.');
    guardarTodo(ss, records || [], users || []);
    return {
      success: true,
      spreadsheetId: ss.getId(),
      spreadsheetUrl: ss.getUrl(),
      countRecords: (records || []).length,
      countUsers: (users || []).length
    };
  } catch (err) {
    console.error('Error en apiSincronizarTodo: ' + err.toString());
    return {
      success: false,
      error: err.toString()
    };
  }
}

function apiVincularHoja(customIdOrUrl) {
  try {
    if (!customIdOrUrl) throw new Error('Debes ingresar un ID o URL válido.');
    const cleanId = extraerIdHoja(customIdOrUrl);
    const ss = SpreadsheetApp.openById(cleanId);
    if (!ss) throw new Error('No se pudo acceder a la hoja con el ID especificado.');
    asegurarHojas(ss);
    return {
      success: true,
      id: ss.getId(),
      url: ss.getUrl(),
      name: ss.getName(),
      records: obtenerRegistrosMortalidad(ss),
      users: obtenerUsuarios(ss)
    };
  } catch (err) {
    return {
      success: false,
      error: 'Error al vincular hoja: ' + err.toString()
    };
  }
}

/**
 * Endpoint Web App (POST)
 */
function doPost(e) {
  try {
    let data = {};
    if (e && e.postData && e.postData.contents) {
      try { data = JSON.parse(e.postData.contents); } catch (errP) { data = e.parameter || {}; }
    } else if (e && e.parameter) {
      data = e.parameter;
    }
    const ss = obtenerSpreadsheet(data.sheetId);
    if (!ss) throw new Error('No se encontró la hoja de cálculo de destino.');

    if (data.action === 'syncAll') {
      guardarTodo(ss, data.records || [], data.users || []);
      return respuestaJson({
        success: true,
        message: 'Datos sincronizados exitosamente.',
        spreadsheetId: ss.getId()
      });
    }

    if (data.action === 'addRecord') {
      const hojas = asegurarHojas(ss);
      const r = data.record;
      hojas.sheetMort.appendRow([
        r.id || Utilities.getUuid(),
        r.fecha || '',
        r.idAnimal || '',
        r.registradoPor ? r.registradoPor.nombre : '',
        r.registradoPor ? r.registradoPor.rol : '',
        r.registradoPor ? r.registradoPor.usuario : '',
        r.genetica || '',
        r.estatus || '',
        r.causa || '',
        r.lugar || '',
        r.paridad !== undefined ? r.paridad : 0,
        r.semana !== undefined ? r.semana : 1,
        r.dia || '',
        r.observaciones || ''
      ]);
      return respuestaJson({ success: true, message: 'Registro añadido.' });
    }

    return respuestaJson({ success: false, error: 'Operación desconocida.' });
  } catch (err) {
    return respuestaJson({ success: false, error: err.toString() });
  }
}

function obtenerRegistrosMortalidad(ss) {
  const sheet = ss.getSheetByName(SHEET_NAME_MORTALIDAD);
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  const results = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[1] && !r[2]) continue;

    let fechaStr = '';
    if (r[1] instanceof Date) {
      fechaStr = Utilities.formatDate(r[1], Session.getScriptTimeZone() || 'GMT', 'yyyy-MM-dd');
    } else {
      fechaStr = String(r[1] || '');
    }

    results.push({
      id: String(r[0] || 'rec-' + i),
      fecha: fechaStr,
      idAnimal: String(r[2] || ''),
      registradoPor: r[3] ? {
        nombre: String(r[3]),
        rol: String(r[4] || 'usuario'),
        usuario: String(r[5] || ''),
        iniciales: String(r[3]).charAt(0).toUpperCase()
      } : undefined,
      genetica: String(r[6] || 'Yorkshire'),
      estatus: String(r[7] || 'GESTANTE'),
      causa: String(r[8] || 'No especificada'),
      lugar: String(r[9] || 'EXP'),
      paridad: Number(r[10]) || 0,
      semana: Number(r[11]) || 1,
      dia: String(r[12] || ''),
      observaciones: String(r[13] || '')
    });
  }
  return results;
}

function obtenerUsuarios(ss) {
  const sheet = ss.getSheetByName(SHEET_NAME_USUARIOS);
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  const users = [];
  for (let i = 1; i < rows.length; i++) {
    const u = rows[i];
    if (!u[2]) continue;
    users.push({
      id: String(u[0] || 'user-' + i),
      nombre: String(u[1] || 'Usuario'),
      usuario: String(u[2] || ''),
      password: String(u[3] || 'admin'),
      rol: String(u[4] || 'usuario'),
      permisos: {
        verDashboard: u[5] === true || u[5] === 'TRUE' || String(u[5]).toUpperCase() === 'TRUE',
        verTabla: u[6] === true || u[6] === 'TRUE' || String(u[6]).toUpperCase() === 'TRUE',
        editarTabla: u[7] === true || u[7] === 'TRUE' || String(u[7]).toUpperCase() === 'TRUE',
        verGraficos: u[8] === true || u[8] === 'TRUE' || String(u[8]).toUpperCase() === 'TRUE',
        verAlertas: u[9] === true || u[9] === 'TRUE' || String(u[9]).toUpperCase() === 'TRUE'
      },
      bloqueado: u[10] === true || u[10] === 'TRUE' || String(u[10]).toUpperCase() === 'TRUE',
      tipoBloqueo: u[11] || null,
      bloqueadoHasta: u[12] || null,
      motivoBloqueo: u[13] || ''
    });
  }
  return users;
}

function guardarTodo(ss, records, users) {
  const hojas = asegurarHojas(ss);
  const sheetMort = hojas.sheetMort;
  const sheetUsers = hojas.sheetUsers;

  // 1. Guardar registros de Mortalidad
  const lastMortRow = sheetMort.getLastRow();
  if (lastMortRow > 1) {
    sheetMort.getRange(2, 1, lastMortRow - 1, 14).clearContent();
  }

  if (records && records.length > 0) {
    const neededMortRows = records.length + 1;
    const currentMaxMortRows = sheetMort.getMaxRows();
    if (neededMortRows > currentMaxMortRows) {
      sheetMort.insertRowsAfter(currentMaxMortRows, neededMortRows - currentMaxMortRows);
    }
    if (sheetMort.getMaxColumns() < 14) {
      sheetMort.insertColumnsAfter(sheetMort.getMaxColumns(), 14 - sheetMort.getMaxColumns());
    }

    const rows = records.map(function(r) {
      return [
        r.id || Utilities.getUuid(),
        r.fecha || '',
        r.idAnimal || '',
        r.registradoPor ? (r.registradoPor.nombre || '') : '',
        r.registradoPor ? (r.registradoPor.rol || '') : '',
        r.registradoPor ? (r.registradoPor.usuario || '') : '',
        r.genetica || '',
        r.estatus || '',
        r.causa || '',
        r.lugar || '',
        r.paridad !== undefined ? r.paridad : 0,
        r.semana !== undefined ? r.semana : 1,
        r.dia || '',
        r.observaciones || ''
      ];
    });
    sheetMort.getRange(2, 1, rows.length, 14).setValues(rows);
  }

  // 2. Guardar usuarios
  const lastUserRow = sheetUsers.getLastRow();
  if (lastUserRow > 1) {
    sheetUsers.getRange(2, 1, lastUserRow - 1, 14).clearContent();
  }

  if (users && users.length > 0) {
    const neededUserRows = users.length + 1;
    const currentMaxUserRows = sheetUsers.getMaxRows();
    if (neededUserRows > currentMaxUserRows) {
      sheetUsers.insertRowsAfter(currentMaxUserRows, neededUserRows - currentMaxUserRows);
    }
    if (sheetUsers.getMaxColumns() < 14) {
      sheetUsers.insertColumnsAfter(sheetUsers.getMaxColumns(), 14 - sheetUsers.getMaxColumns());
    }

    const userRows = users.map(function(u) {
      return [
        u.id || Utilities.getUuid(),
        u.nombre || '',
        u.usuario || '',
        u.password || '',
        u.rol || 'usuario',
        u.permisos ? (u.permisos.verDashboard ? 'TRUE' : 'FALSE') : 'TRUE',
        u.permisos ? (u.permisos.verTabla ? 'TRUE' : 'FALSE') : 'TRUE',
        u.permisos ? (u.permisos.editarTabla ? 'TRUE' : 'FALSE') : 'TRUE',
        u.permisos ? (u.permisos.verGraficos ? 'TRUE' : 'FALSE') : 'TRUE',
        u.permisos ? (u.permisos.verAlertas ? 'TRUE' : 'FALSE') : 'TRUE',
        u.bloqueado ? 'TRUE' : 'FALSE',
        u.tipoBloqueo || '',
        u.bloqueadoHasta || '',
        u.motivoBloqueo || ''
      ];
    });
    sheetUsers.getRange(2, 1, userRows.length, 14).setValues(userRows);
  }

  SpreadsheetApp.flush();
}

function respuestaJson(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
