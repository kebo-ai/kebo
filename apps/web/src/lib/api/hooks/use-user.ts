"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../client"
import type { Profile, UpdateProfileInput } from "../types"

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => api.get<Profile>("/users/profile"),
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateProfileInput) =>
      api.put<Profile>("/users/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] })
    },
  })
}

export function useDeleteUserAccount() {
  return useMutation({
    mutationFn: (confirmationText: string) =>
      api.delete(`/users/delete?confirmation=${encodeURIComponent(confirmationText)}`),
  })
}
