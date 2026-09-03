import { useState } from 'react'
import type { Product } from '../../../types/api'
import type { AuthorizedDocumentLookup } from '../../../api/quickRemissionGuides'
import type { FormDestinatario } from '../remissionGuideForm'
import { IDENTIFICATION_TYPES } from '../remissionGuideForm'
import DestinatarioItemsTable from './DestinatarioItemsTable'
import SustentoLookup from './SustentoLookup'

interface DestinatarioEditorProps {
  destinatario: FormDestinatario
  index: number
  products: Product[]
  productsById: Map<number, Product>
  ruc: string
  readonly: boolean
  canRemove: boolean
  onUpdate: (key: string, patch: Partial<FormDestinatario>) => void
  onRemove: (key: string) => void
  onAddItem: (key: string) => void
  onUpdateItem: (key: string, itemKey: string, patch: Record<string, unknown>) => void
  onRemoveItem: (key: string, itemKey: string) => void
}

const inputClass =
  'w-full rounded-md border border-border-warm bg-canvas px-2.5 py-1.5 text-[12px] text-ink focus:border-accent focus:outline-none disabled:opacity-60'
const labelClass = 'block text-[11px] font-medium uppercase tracking-wide text-faint'

export default function DestinatarioEditor({
  destinatario,
  index,
  products,
  productsById,
  ruc,
  readonly,
  canRemove,
  onUpdate,
  onRemove,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
}: DestinatarioEditorProps) {
  const [sustentoNotice, setSustentoNotice] = useState<string | null>(null)

  const idMaxLength =
    destinatario.tipoIdentificacion === '04' ? 13 : destinatario.tipoIdentificacion === '05' ? 10 : 20

  function handleSustentoResult(result: AuthorizedDocumentLookup) {
    onUpdate(destinatario.key, {
      codDocSustento: result.cod_doc_sustento,
      numDocSustento: result.num_doc_sustento,
      numAutDocSustento: result.num_aut_doc_sustento,
      fechaEmisionDocSustento: result.fecha_emision_doc_sustento,
    })
    setSustentoNotice('Documento sustento completado con la factura autorizada.')
  }

  return (
    <div className="rounded-lg border border-border-warm bg-surface p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-accent-soft font-mono text-[11px] font-bold text-accent">
            {index + 1}
          </span>
          <h4 className="text-[13px] font-semibold tracking-tight text-ink">Destinatario {index + 1}</h4>
        </div>
        {!readonly && canRemove && (
          <button
            type="button"
            onClick={() => onRemove(destinatario.key)}
            className="rounded-md px-2 py-1 text-[12px] font-medium text-danger transition-colors duration-150 hover:bg-danger/10"
          >
            Quitar destinatario
          </button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className={labelClass}>Tipo de documento</label>
          <select
            value={destinatario.tipoIdentificacion}
            onChange={(e) => onUpdate(destinatario.key, { tipoIdentificacion: e.target.value })}
            disabled={readonly}
            className={inputClass}
          >
            {Object.entries(IDENTIFICATION_TYPES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Identificación</label>
          <input
            type="text"
            value={destinatario.identificacion}
            maxLength={idMaxLength}
            onChange={(e) => onUpdate(destinatario.key, { identificacion: e.target.value })}
            disabled={readonly}
            className={inputClass}
          />
        </div>
        <div className="lg:col-span-2">
          <label className={labelClass}>Razón social</label>
          <input
            type="text"
            value={destinatario.razonSocial}
            onChange={(e) => onUpdate(destinatario.key, { razonSocial: e.target.value })}
            disabled={readonly}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Dirección destino</label>
          <input
            type="text"
            value={destinatario.dirDestinatario}
            onChange={(e) => onUpdate(destinatario.key, { dirDestinatario: e.target.value })}
            disabled={readonly}
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Motivo de traslado</label>
          <input
            type="text"
            value={destinatario.motivoTraslado}
            onChange={(e) => onUpdate(destinatario.key, { motivoTraslado: e.target.value })}
            disabled={readonly}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Doc. aduanero único</label>
          <input
            type="text"
            value={destinatario.docAduaneroUnico}
            onChange={(e) => onUpdate(destinatario.key, { docAduaneroUnico: e.target.value })}
            disabled={readonly}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Cód. estab. destino</label>
          <input
            type="text"
            value={destinatario.codEstabDestino}
            maxLength={3}
            onChange={(e) => onUpdate(destinatario.key, { codEstabDestino: e.target.value })}
            disabled={readonly}
            className={inputClass}
          />
        </div>
        <div className="lg:col-span-2">
          <label className={labelClass}>Ruta</label>
          <input
            type="text"
            value={destinatario.ruta}
            onChange={(e) => onUpdate(destinatario.key, { ruta: e.target.value })}
            disabled={readonly}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Cód. doc. sustento</label>
          <input
            type="text"
            value={destinatario.codDocSustento}
            maxLength={2}
            onChange={(e) => onUpdate(destinatario.key, { codDocSustento: e.target.value })}
            disabled={readonly}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Núm. doc. sustento</label>
          <input
            type="text"
            value={destinatario.numDocSustento}
            onChange={(e) => onUpdate(destinatario.key, { numDocSustento: e.target.value })}
            disabled={readonly}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Núm. aut. doc. sustento</label>
          <input
            type="text"
            value={destinatario.numAutDocSustento}
            maxLength={49}
            onChange={(e) => onUpdate(destinatario.key, { numAutDocSustento: e.target.value })}
            disabled={readonly}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Fecha emisión doc. sustento</label>
          <input
            type="date"
            value={destinatario.fechaEmisionDocSustento}
            onChange={(e) => onUpdate(destinatario.key, { fechaEmisionDocSustento: e.target.value })}
            disabled={readonly}
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-4">
        {!readonly && <SustentoLookup ruc={ruc} readonly={readonly} onResult={handleSustentoResult} />}
        {sustentoNotice && (
          <p className="mt-2 rounded-md border border-success/30 bg-success/10 px-3 py-1.5 text-[12px] text-success">
            {sustentoNotice}
          </p>
        )}
      </div>

      <DestinatarioItemsTable
        items={destinatario.items}
        products={products}
        productsById={productsById}
        readonly={readonly}
        onAdd={() => onAddItem(destinatario.key)}
        onUpdate={(itemKey, patch) => onUpdateItem(destinatario.key, itemKey, patch)}
        onRemove={(itemKey) => onRemoveItem(destinatario.key, itemKey)}
      />
    </div>
  )
}
