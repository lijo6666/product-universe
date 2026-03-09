import { Pipe, PipeTransform } from '@angular/core';
import { Product } from '../../core/models/product.model';

@Pipe({
  name: 'productFilter',
  standalone: true
})
export class ProductFilterPipe implements PipeTransform {
  transform(products: Product[], searchTerm: string, category: string): Product[] {
    if (!products?.length) {
      return [];
    }

    const normalizedSearch = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.description.toLowerCase().includes(normalizedSearch);
      const matchesCategory = !category || category === 'All' || product.category === category;
      return matchesSearch && matchesCategory;
    });
  }
}
