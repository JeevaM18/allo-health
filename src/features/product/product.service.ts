import { getProductById, listProducts } from "./product.repository";

export async function retrieveProduct(id: string) {
  return getProductById(id);
}

export async function fetchAllProducts() {
  return listProducts();
}
