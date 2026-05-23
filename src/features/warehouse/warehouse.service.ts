import { getWarehouseById, listWarehouses } from "./warehouse.repository";

export async function retrieveWarehouse(id: string) {
  return getWarehouseById(id);
}

export async function fetchAllWarehouses() {
  return listWarehouses();
}
