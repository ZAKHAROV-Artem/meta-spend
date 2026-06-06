'use client';
import { useApiQuery, useApiMutation } from './useApi';
import type { TripSummary, TripDetail, CreateTripDto, UpdateTripDto } from '@crypto-tracker/shared';

export function useTrips() {
  return useApiQuery<TripSummary[]>('/trips');
}

export function useTrip(id: string, defaultCurrency?: string) {
  const path = defaultCurrency ? `/trips/${id}?defaultCurrency=${defaultCurrency}` : `/trips/${id}`;
  return useApiQuery<TripDetail>(path);
}

export function useCreateTrip() {
  return useApiMutation<TripSummary, CreateTripDto>('POST', '/trips', ['/trips']);
}

export function useUpdateTrip(id: string) {
  return useApiMutation<TripSummary, UpdateTripDto>('PATCH', `/trips/${id}`, ['/trips', `/trips/${id}`]);
}

export function useDeleteTrip() {
  return useApiMutation<void, string>('DELETE', (id) => `/trips/${id}`, ['/trips']);
}
