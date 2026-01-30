import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const DEMO_STORE_ID = "00000000-0000-0000-0000-000000000001";

export interface RawMaterial {
  id: string;
  name: string;
  icon: string;
  current_amount: number;
  max_amount: number;
  unit: string;
  usage_per_cup: number;
}

export interface PackagingMaterial {
  id: string;
  name: string;
  current_amount: number;
  max_amount: number;
}

export interface Store {
  id: string;
  code: string;
  name: string;
  brand: string;
}

export interface RestockShipment {
  id: string;
  status: string;
  estimated_days: number | null;
  created_at: string;
}

export interface RestockItem {
  id: string;
  item_name: string;
  quantity: string;
  item_type: string;
}

export function useStore() {
  return useQuery({
    queryKey: ["store", DEMO_STORE_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("id", DEMO_STORE_ID)
        .single();
      
      if (error) throw error;
      return data as Store;
    },
  });
}

export function useRawMaterials() {
  return useQuery({
    queryKey: ["raw_materials", DEMO_STORE_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("raw_materials")
        .select("*")
        .eq("store_id", DEMO_STORE_ID);
      
      if (error) throw error;
      return data as RawMaterial[];
    },
  });
}

export function usePackagingMaterials() {
  return useQuery({
    queryKey: ["packaging_materials", DEMO_STORE_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packaging_materials")
        .select("*")
        .eq("store_id", DEMO_STORE_ID);
      
      if (error) throw error;
      return data as PackagingMaterial[];
    },
  });
}

export function useActiveRestockShipment() {
  return useQuery({
    queryKey: ["restock_shipment_active", DEMO_STORE_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("restock_shipments")
        .select("*")
        .eq("store_id", DEMO_STORE_ID)
        .eq("status", "in_transit")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as RestockShipment | null;
    },
  });
}

export function useRestockItems(shipmentId: string | undefined) {
  return useQuery({
    queryKey: ["restock_items", shipmentId],
    queryFn: async () => {
      if (!shipmentId) return [];
      
      const { data, error } = await supabase
        .from("restock_items")
        .select("*")
        .eq("shipment_id", shipmentId);
      
      if (error) throw error;
      return data as RestockItem[];
    },
    enabled: !!shipmentId,
  });
}

export function useConfirmRestockDelivery() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (shipmentId: string) => {
      const { error } = await supabase
        .from("restock_shipments")
        .update({ 
          status: "delivered",
          delivered_at: new Date().toISOString()
        })
        .eq("id", shipmentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restock_shipment_active"] });
      queryClient.invalidateQueries({ queryKey: ["raw_materials"] });
      queryClient.invalidateQueries({ queryKey: ["packaging_materials"] });
    },
  });
}

// 计算可售杯数
export function calculateAvailableCups(
  rawMaterials: RawMaterial[],
  packagingMaterials: PackagingMaterial[]
): number {
  if (!rawMaterials?.length || !packagingMaterials?.length) return 0;
  
  // 根据原材料计算
  const rawLimits = rawMaterials.map(m => 
    Math.floor(m.current_amount / m.usage_per_cup)
  );
  
  // 根据杯子和杯盖计算
  const hotCups = packagingMaterials.find(p => p.name === "热杯")?.current_amount || 0;
  const coldCups = packagingMaterials.find(p => p.name === "冰杯")?.current_amount || 0;
  const hotLids = packagingMaterials.find(p => p.name === "热杯盖")?.current_amount || 0;
  const coldLids = packagingMaterials.find(p => p.name === "冰杯盖")?.current_amount || 0;
  
  const cupsLimit = Math.min(hotCups, coldCups);
  const lidsLimit = Math.min(hotLids, coldLids);
  
  return Math.min(...rawLimits, cupsLimit, lidsLimit);
}
