import { useQuery } from '@tanstack/react-query'
import { getPaymentMethods } from '../api/paymentMethods'

export function usePaymentMethods() {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: getPaymentMethods,
    staleTime: Infinity,
  })
}
