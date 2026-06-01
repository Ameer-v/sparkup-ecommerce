export type Product = {
  id: string;

  name: string;

  description: string;

  price: number | string;

  stock: number;

  imageUrl: string;

  category: {
    id: string;
    name: string;
    slug?: string;
    description?: string;
  };
};
