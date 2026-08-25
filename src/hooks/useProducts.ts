import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createProduct, deleteProduct, getProductOptions, getProducts, updateProduct } from '../api/products'
import { getSriTaxes } from '../api/taxes'
import type { ProductInput } from '../types/api'

export interface ProductListQuery {
  ruc: string | null
  search?: string
  page?: number
  productKind?: string
  sriProductType?: string
}

export function useProducts(params: ProductListQuery) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () =>
      getProducts({
        ruc: params.ruc!,
        search: params.search || undefined,
        page: params.page ?? 1,
        per_page: 15,
        product_kind: params.productKind || undefined,
        sri_product_type: params.sriProductType || undefined,
      }),
    enabled: !!params.ruc,
    placeholderData: (previousData) => previousData,
  })
}

export function useProductOptions() {
  return useQuery({
    queryKey: ['products', 'options'],
    queryFn: getProductOptions,
    staleTime: Infinity,
  })
}

export function useSriTaxes() {
  return useQuery({
    queryKey: ['sri-taxes'],
    queryFn: getSriTaxes,
    staleTime: Infinity,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ProductInput) => createProduct(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductInput }) => updateProduct(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}
