// Database row types (as returned by sql.js)
export interface UserRow {
  id: number;
  username: string;
  password: string;
  fullname: string;
  perm_products: number;
  perm_categories: number;
  perm_transactions: number;
  perm_users: number;
  perm_settings: number;
  status: string;
}

export interface ProductRow {
  id: number;
  name: string;
  price: number;
  category: string;
  quantity: number;
  stock: number;
  img: string;
}

export interface CategoryRow {
  id: number;
  name: string;
}

export interface CustomerRow {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface SettingsRow {
  id: number;
  app: string;
  store: string;
  address_one: string;
  address_two: string;
  contact: string;
  tax: string;
  symbol: string;
  percentage: number;
  charge_tax: number;
  footer: string;
  img: string;
  till: number;
  server_ip: string;
  pexels_api_key: string;
}

export interface MediaRow {
  id: number;
  filename: string;
  source: string;
  pexels_id: number | null;
  photographer: string;
  alt: string;
  created_at: string;
}

export interface TransactionRow {
  id: number;
  ref_number: string;
  customer: string;
  customer_name: string;
  status: number;
  user_id: number;
  user_name: string;
  till: number;
  discount: number;
  subtotal: number;
  tax: number;
  total: number;
  paid: number;
  change: number;
  payment_type: number;
  items_json: string;
  date: string;
}

// DTO types (API response shapes)
export interface UserDTO {
  _id: number;
  id: number;
  username: string;
  fullname: string;
  perm_products: number;
  perm_categories: number;
  perm_transactions: number;
  perm_users: number;
  perm_settings: number;
  status: string;
}

export interface ProductDTO {
  _id: number;
  id: number;
  name: string;
  price: number;
  category: string;
  quantity: number;
  stock: number;
  img: string;
}

export interface CategoryDTO {
  _id: number;
  id: number;
  name: string;
}

export interface CustomerDTO {
  _id: string;
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface SettingsDTO {
  _id: number;
  settings: {
    app: string;
    store: string;
    address_one: string;
    address_two: string;
    contact: string;
    tax: string;
    symbol: string;
    percentage: number;
    charge_tax: boolean;
    footer: string;
    img: string;
    till: number;
    ip: string;
    pexels_api_key: string;
  };
}

export interface MediaDTO {
  _id: number;
  id: number;
  filename: string;
  path: string;  // alias for filename (frontend compatibility)
  source: string;
  pexels_id: number | null;
  photographer: string;
  alt: string;
  created_at: string;
}

export interface TransactionDTO {
  _id: number;
  id: number;
  ref_number: string;
  customer: string;
  customer_name: string;
  status: number;
  user_id: number;
  user: string;
  till: number;
  discount: number;
  subtotal: number;
  tax: number;
  total: number;
  paid: number;
  change: number;
  payment_type: number;
  items: CartItemDTO[];
  date: string;
}

export interface CartItemDTO {
  id: number;
  name: string;
  price: number;
  quantity: number;
  stock: number;
}

// Input types for create/update operations
export interface CreateUserData {
  username: string;
  password: string;
  fullname?: string;
  perm_products?: number;
  perm_categories?: number;
  perm_transactions?: number;
  perm_users?: number;
  perm_settings?: number;
  status?: string;
}

export interface UpdateUserData {
  username?: string;
  fullname?: string;
  perm_products?: number;
  perm_categories?: number;
  perm_transactions?: number;
  perm_users?: number;
  perm_settings?: number;
}

export interface ProductFormData {
  id?: string;
  name: string;
  price: string | number;
  category: string;
  quantity?: string | number;
  stock?: string | number;
  img?: string;
  remove?: string;
}

export interface CategoryFormData {
  name: string;
}

export interface CustomerFormData {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface SettingsFormData {
  app?: string;
  store?: string;
  address_one?: string;
  address_two?: string;
  contact?: string;
  tax?: string;
  symbol?: string;
  percentage?: number;
  charge_tax?: boolean | number;
  footer?: string;
  img?: string;
  till?: number;
  server_ip?: string;
  pexels_api_key?: string;
}

export interface TransactionFormData {
  ref_number?: string;
  customer?: string | number;
  customer_name?: string;
  status?: number;
  user_id?: number;
  user?: string;
  user_name?: string;
  till?: number;
  discount?: number;
  subtotal?: number;
  tax?: number;
  total?: number;
  paid?: number;
  change?: number;
  payment_type?: number;
  items?: CartItemDTO[];
  date?: string;
  _id?: number;
  id?: number;
}

// JWT Payload
export interface JWTPayload {
  id: number;
  username: string;
  perm_products: number;
  perm_categories: number;
  perm_transactions: number;
  perm_users: number;
  perm_settings: number;
}

// Express request extensions
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      uploadsPath?: string;
      validated?: unknown;
      file?: Express.Multer.File;
    }
  }
}

// Multer file type extension
declare namespace Express {
  namespace Multer {
    interface File {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      destination: string;
      filename: string;
      path: string;
      size: number;
    }
  }
}