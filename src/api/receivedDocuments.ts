import { apiClient } from './client'
import type { ApiResponse, ReceivedDocumentsQuery, ReceivedDocumentsResult } from '../types/api'

export async function getReceivedDocuments(query: ReceivedDocumentsQuery): Promise<ReceivedDocumentsResult> {
  const res = await apiClient.get<ApiResponse<ReceivedDocumentsResult>>('/document/received', { params: query })
  return res.data.data
}

export interface ReceivedUploadResult {
  upload_id: number
  company_id: number
  original_filename: string
  file_path: string
  status: string
}

export async function uploadReceivedDocuments(ruc: string, file: File): Promise<ReceivedUploadResult> {
  const formData = new FormData()
  formData.append('ruc', ruc)
  formData.append('file', file)
  const res = await apiClient.post<ApiResponse<ReceivedUploadResult>>('/document/received/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data.data
}

async function downloadBlob(url: string, filename: string, ruc: string): Promise<void> {
  const res = await apiClient.get(url, { params: { ruc }, responseType: 'blob' })
  const blobUrl = URL.createObjectURL(res.data as Blob)
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(blobUrl)
}

export async function downloadReceivedXml(ruc: string, accessKey: string): Promise<void> {
  await downloadBlob(`/document/received/${accessKey}/xml`, `XML_${accessKey}.xml`, ruc)
}

export async function downloadReceivedRide(ruc: string, accessKey: string): Promise<void> {
  await downloadBlob(`/document/received/${accessKey}/ride`, `RIDE_${accessKey}.pdf`, ruc)
}
