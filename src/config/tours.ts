import type { Config, DriveStep } from 'driver.js'

export const driverConfig: Config = {
  showProgress: true,
  animate: true,
  allowClose: true,
  overlayColor: '#18181b',
  overlayOpacity: 0.6,
  stagePadding: 8,
  stageRadius: 8,
  popoverClass: 'factus-tour-popover',
  nextBtnText: 'Siguiente',
  prevBtnText: 'Anterior',
  doneBtnText: 'Listo',
  progressText: 'Paso {{current}} de {{total}}',
}

export const TOUR_STEPS: Record<string, DriveStep[]> = {
  dashboard: [
    {
      element: '[data-guide="sidebar-logo"]',
      popover: {
        title: 'Bienvenido a Factus Easy',
        description:
          'Tu plataforma de facturación electrónica para el SRI. Te guiaremos por las secciones principales.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '[data-guide="dashboard-stats"]',
      popover: {
        title: 'Dashboard',
        description:
          'Aquí ves el resumen de tus documentos emitidos, su estado ante el SRI y tus catálogos.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-guide="company-selector"]',
      popover: {
        title: 'Selección de empresa',
        description:
          'Cambia entre tus empresas desde aquí. Todo lo que hagas aplica a la empresa activa.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-guide="nav-documentos"]',
      popover: {
        title: 'Documentos',
        description:
          'Emite facturas, notas de crédito, guías de remisión y retenciones desde este grupo.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '[data-guide="nav-facturas"]',
      popover: {
        title: 'Tu primera factura',
        description: 'Comienza emitiendo tu primera factura electrónica desde aquí.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '[data-guide="nav-catalogos"]',
      popover: {
        title: 'Catálogos',
        description:
          'Administra tus clientes, productos y transportistas para agilizar la emisión de documentos.',
        side: 'right',
        align: 'start',
      },
    },
    {
      element: '[data-guide="nav-configuracion"]',
      popover: {
        title: 'Configuración',
        description:
          'Configura tu empresa, establecimientos, puntos de emisión, impuestos y formas de pago.',
        side: 'right',
        align: 'start',
      },
    },
  ],
  invoices: [
    {
      element: '[data-guide="page-title"]',
      popover: {
        title: 'Facturas',
        description:
          'Aquí gestionas todas tus facturas electrónicas y ves el estado de cada una.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-guide="create-button"]',
      popover: {
        title: 'Nueva Factura',
        description:
          'Crea una factura. Podrás guardarla como borrador o enviarla directo al SRI.',
        side: 'left',
        align: 'start',
      },
    },
    {
      element: '[data-guide="search-input"]',
      popover: {
        title: 'Buscar y filtrar',
        description:
          'Busca por cliente, serie o secuencial y filtra por estado o rango de fechas.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-guide="list-card"]',
      popover: {
        title: 'Listado y acciones',
        description:
          'En cada fila puedes Ver, Editar o Enviar al SRI. Las facturas en borrador son editables.',
        side: 'top',
        align: 'start',
      },
    },
  ],
  'credit-notes': [
    {
      element: '[data-guide="page-title"]',
      popover: {
        title: 'Notas de Crédito',
        description:
          'Gestiona las notas de crédito vinculadas a una factura original.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-guide="create-button"]',
      popover: {
        title: 'Nueva Nota de Crédito',
        description:
          'Crea una nota de crédito por devolución o descuento sobre una factura existente.',
        side: 'left',
        align: 'start',
      },
    },
    {
      element: '[data-guide="search-input"]',
      popover: {
        title: 'Buscar y filtrar',
        description: 'Busca por cliente, serie o secuencial y filtra por estado o fechas.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-guide="list-card"]',
      popover: {
        title: 'Listado y acciones',
        description: 'Consulta la factura original asociada y usa Ver, Editar o Enviar.',
        side: 'top',
        align: 'start',
      },
    },
  ],
  'remission-guides': [
    {
      element: '[data-guide="page-title"]',
      popover: {
        title: 'Guías de Remisión',
        description:
          'Documentos para el traslado de mercancías. Gestiona tus guías aquí.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-guide="create-button"]',
      popover: {
        title: 'Nueva Guía de Remisión',
        description:
          'Crea una guía con destinatario, sustento del traslado y datos del transportista.',
        side: 'left',
        align: 'start',
      },
    },
    {
      element: '[data-guide="search-input"]',
      popover: {
        title: 'Buscar y filtrar',
        description: 'Busca por transportista, serie o secuencial y filtra por fechas.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-guide="list-card"]',
      popover: {
        title: 'Listado y acciones',
        description: 'Usa Ver, Editar o Enviar al SRI en cada fila.',
        side: 'top',
        align: 'start',
      },
    },
  ],
  retentions: [
    {
      element: '[data-guide="page-title"]',
      popover: {
        title: 'Retenciones',
        description:
          'Comprobantes de retención de renta e IVA. Gestiona tus retenciones aquí.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-guide="create-button"]',
      popover: {
        title: 'Nueva Retención',
        description:
          'Crea un comprobante de retención con sujeto retenido y periodo fiscal.',
        side: 'left',
        align: 'start',
      },
    },
    {
      element: '[data-guide="search-input"]',
      popover: {
        title: 'Buscar y filtrar',
        description: 'Busca por sujeto, serie o secuencial y filtra por estado o fechas.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-guide="list-card"]',
      popover: {
        title: 'Listado y acciones',
        description: 'Usa Ver, Editar o Enviar al SRI en cada fila.',
        side: 'top',
        align: 'start',
      },
    },
  ],
  documents: [
    {
      element: '[data-guide="page-title"]',
      popover: {
        title: 'Documentos',
        description:
          'Seguimiento del estado de todos tus documentos emitidos ante el SRI.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-guide="summary-cards"]',
      waitForElement: 3000,
      popover: {
        title: 'Resumen',
        description:
          'Vista rápida: total de documentos, autorizados, en proceso y finalizados.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-guide="filters"]',
      popover: {
        title: 'Filtros',
        description: 'Filtra por tipo de documento, estado y rango de fechas.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-guide="list-card"]',
      popover: {
        title: 'Detalle y descargas',
        description:
          'Ver detalle, descargar el RIDE (PDF) o el XML de cada comprobante autorizado.',
        side: 'top',
        align: 'start',
      },
    },
  ],
  customers: [
    {
      element: '[data-guide="page-title"]',
      popover: {
        title: 'Clientes',
        description: 'Catálogo de clientes para usar en tus documentos.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-guide="create-button"]',
      popover: {
        title: 'Nuevo Cliente',
        description: 'Agrega un cliente con su identificación y datos de contacto.',
        side: 'left',
        align: 'start',
      },
    },
    {
      element: '[data-guide="search-input"]',
      popover: {
        title: 'Buscar',
        description: 'Busca clientes por nombre o identificación.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-guide="list-card"]',
      popover: {
        title: 'Listado y acciones',
        description: 'Edita o elimina clientes desde aquí.',
        side: 'top',
        align: 'start',
      },
    },
  ],
  products: [
    {
      element: '[data-guide="page-title"]',
      popover: {
        title: 'Productos',
        description: 'Catálogo de productos y servicios con su precio e impuestos.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-guide="create-button"]',
      popover: {
        title: 'Nuevo Producto',
        description: 'Agrega un producto con su tipo, precio e impuestos asociados.',
        side: 'left',
        align: 'start',
      },
    },
    {
      element: '[data-guide="search-input"]',
      popover: {
        title: 'Buscar y filtrar',
        description: 'Busca por descripción y filtra por tipo o tipo SRI.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-guide="list-card"]',
      popover: {
        title: 'Listado y acciones',
        description: 'Edita o elimina productos desde aquí.',
        side: 'top',
        align: 'start',
      },
    },
  ],
  transporters: [
    {
      element: '[data-guide="page-title"]',
      popover: {
        title: 'Transportistas',
        description: 'Catálogo de transportistas usados en las guías de remisión.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-guide="create-button"]',
      popover: {
        title: 'Nuevo Transportista',
        description: 'Agrega un transportista con identificación y placa.',
        side: 'left',
        align: 'start',
      },
    },
    {
      element: '[data-guide="search-input"]',
      popover: {
        title: 'Buscar',
        description: 'Busca por nombre, identificación o placa.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-guide="list-card"]',
      popover: {
        title: 'Listado y acciones',
        description: 'Edita o elimina transportistas desde aquí.',
        side: 'top',
        align: 'start',
      },
    },
  ],
  settings: [
    {
      element: '[data-guide="page-title"]',
      popover: {
        title: 'Configuración de Empresa',
        description:
          'Configura los datos de tu empresa que aparecerán en tus comprobantes.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-guide="company-form"]',
      popover: {
        title: 'Datos de la empresa',
        description:
          'Nombre comercial, razón social, dirección y condiciones tributarias.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-guide="certificate-section"]',
      popover: {
        title: 'Certificado digital',
        description:
          'Sube tu firma electrónica (.p12) para autorizar comprobantes y tu logo para el RIDE.',
        side: 'top',
        align: 'start',
      },
    },
  ],
  establishments: [
    {
      element: '[data-guide="page-title"]',
      popover: {
        title: 'Establecimientos',
        description:
          'Sucursales de tu empresa. Cada una tiene un código de 3 dígitos.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-guide="create-button"]',
      popover: {
        title: 'Nuevo Establecimiento',
        description: 'Agrega una sucursal con su código, nombre y dirección.',
        side: 'left',
        align: 'start',
      },
    },
    {
      element: '[data-guide="list-card"]',
      popover: {
        title: 'Listado y acciones',
        description: 'Edita o activa/desactiva cada establecimiento.',
        side: 'top',
        align: 'start',
      },
    },
  ],
  'emission-points': [
    {
      element: '[data-guide="page-title"]',
      popover: {
        title: 'Puntos de Emisión',
        description:
          'Puntos desde los que emites comprobantes, ligados a un establecimiento.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-guide="create-button"]',
      popover: {
        title: 'Nuevo Punto de Emisión',
        description: 'Crea un punto de emisión con su código y descripción.',
        side: 'left',
        align: 'start',
      },
    },
    {
      element: '[data-guide="list-card"]',
      popover: {
        title: 'Listado y acciones',
        description: 'Edita, cambia el secuencial o activa/desactiva cada punto.',
        side: 'top',
        align: 'start',
      },
    },
  ],
  'sri-taxes': [
    {
      element: '[data-guide="page-title"]',
      popover: {
        title: 'Impuestos SRI',
        description: 'Catálogo de impuestos SRI (IVA, ICE, IRBPNR). Solo lectura.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-guide="list-card"]',
      popover: {
        title: 'Catálogo',
        description: 'Consulta códigos y porcentajes. No se puede modificar.',
        side: 'top',
        align: 'start',
      },
    },
  ],
  'payment-methods': [
    {
      element: '[data-guide="page-title"]',
      popover: {
        title: 'Formas de Pago',
        description: 'Catálogo de formas de pago del SRI. Solo lectura.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-guide="list-card"]',
      popover: {
        title: 'Catálogo',
        description: 'Consulta códigos y descripciones de las formas de pago.',
        side: 'top',
        align: 'start',
      },
    },
  ],
  'retention-configs': [
    {
      element: '[data-guide="page-title"]',
      popover: {
        title: 'Catálogo de Retenciones',
        description: 'Configuraciones de retención de renta e IVA. Solo lectura.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-guide="list-card"]',
      popover: {
        title: 'Catálogo',
        description: 'Consulta códigos y porcentajes de retención.',
        side: 'top',
        align: 'start',
      },
    },
  ],
}

export const tourStorageKey = (tourName: string, userId: number) =>
  `factus_easy_tour_${tourName}_${userId}`

export function isTourCompleted(tourName: string, userId: number | undefined): boolean {
  if (!userId) return true
  return localStorage.getItem(tourStorageKey(tourName, userId)) === 'true'
}

export function markTourCompleted(tourName: string, userId: number): void {
  localStorage.setItem(tourStorageKey(tourName, userId), 'true')
}

export function resetTourFlag(tourName: string, userId: number): void {
  localStorage.removeItem(tourStorageKey(tourName, userId))
}
