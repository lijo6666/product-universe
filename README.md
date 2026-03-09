# Dynamic Product Catalog and Shopping Cart (Angular + TypeScript)

A complete Angular 17 application that demonstrates:
- Component-based architecture
- Lazy-loaded routing
- Services + dependency injection
- Template-driven and reactive forms
- Custom pipes and directives
- Angular Material UI integration
- HTTP data loading, RxJS observables, and interceptor-based error handling

## Tech Stack
- Angular `17.3.x`
- TypeScript
- Angular Material
- RxJS
- Mock backend via static JSON (`src/assets/data/products.json`)

## Features Implemented
- Product listing with search/category filters
- Product detail page (`/products/:id`)
- Shopping cart with quantity management and totals
- Reactive checkout form with validation
- Checkout confirmation via Material Dialog
- Order history management page
- Admin simulation page with template-driven form to add products
- Custom filter pipe (`productFilter`)
- Custom product status directive (`appProductStatus`)
- HTTP interceptor for API/network error notifications
- Responsive layout for desktop/mobile

## Requirement Mapping
- Setup + TypeScript: strict TypeScript config, typed interfaces (`Product`, `Category`, `CartItem`, `Order`) and class model (`CatalogProduct`).
- Component architecture: modular standalone components for `product-list`, `product-detail`, `shopping-cart`, `navbar`, `admin-product`, and `orders`.
- Input/Output communication: `ProductCardComponent` uses `@Input()` for product data and `@Output()` events for add-to-cart actions.
- Routing + lazy loading: feature-level lazy routes for products, cart, admin, and orders.
- Services + DI: `ProductService`, `CartService`, `OrderService` injected across feature components.
- Forms: template-driven admin product form and reactive checkout form with validators.
- Pipes + directives: custom `productFilter` pipe and `appProductStatus` directive for discount/stock highlighting.
- Angular Material UI: toolbar, cards, form fields, table, chips, snackbars, icons, and confirmation dialog.
- HTTP + RxJS + error handling: `HttpClient` fetch from mock JSON, observable-based shared state with subjects, and interceptor notifications.
- Integration + testing: build/test verified, page routing and cart/order flow connected end-to-end.

## Project Structure
- `src/app/core/models` - interfaces and model classes
- `src/app/core/services` - product/cart/order state and business logic
- `src/app/core/interceptors` - HTTP error interceptor
- `src/app/features` - lazy-loaded feature route groups
- `src/app/shared/pipes` - custom pipe
- `src/app/shared/directives` - custom directive
- `src/app/shared/dialogs` - checkout confirmation dialog
- `src/assets/data/products.json` - mock catalog data

## Local Setup
1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm start
```
Open `http://localhost:4200/`.

3. Production build:
```bash
npm run build
```

## GitHub Pages Deployment

The project is preconfigured for a repository named **`ecommerce-catalog`**.

1. Build for GitHub Pages:
```bash
npm run build:gh-pages
```

2. Publish `dist` to `gh-pages` branch:
```bash
npm run deploy:gh-pages
```

3. In GitHub repository settings, enable **Pages** with source = `gh-pages` branch.

4. Your app URL will be:
`https://<your-github-username>.github.io/ecommerce-catalog/`

If your repository name is different, update script `build:gh-pages` in `package.json` to match:
```json
"build:gh-pages": "ng build --configuration production --base-href /<repo-name>/"
```

## Notes
- Angular recommends Node LTS (20 or 22). If you face CLI issues, switch to an LTS Node version.
- Admin-added products and orders are persisted in browser `localStorage` for simulation.
