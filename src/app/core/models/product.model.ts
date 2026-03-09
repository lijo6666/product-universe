import { Category } from './category.model';

export interface Product {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  category: Category['name'];
  stock: number;
  discountPercent: number;
  releasedAt: string;
  rating: number;
}

export class CatalogProduct implements Product {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public imageUrl: string,
    public price: number,
    public category: Category['name'],
    public stock: number,
    public discountPercent: number,
    public releasedAt: string,
    public rating: number
  ) {}

  get finalPrice(): number {
    return this.price - (this.price * this.discountPercent) / 100;
  }
}
