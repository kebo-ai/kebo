import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/config/supabase"
import { queryKeys } from "../keys"
import { queryConfig } from "../query-config"

export interface IconItem {
  id: string
  name: string
  description: string
  type: string
  url: string
}

export function useIcons() {
  return useQuery({
    queryKey: queryKeys.icons.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("icons")
        .select("*")
        .eq("is_deleted", false)

      if (error) throw error
      return (data ?? []) as IconItem[]
    },
    ...queryConfig.icons,
  })
}
