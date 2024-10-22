import { Routes } from '@angular/router';
import { CategoryComponent } from './pages/category/category.component';
import { HomeComponent } from './pages/home/home.component';
import { ProductComponent } from './pages/product/product.component';
import { SalesComponent } from './pages/sales/sales.component';
import { SubcategoryComponent } from './pages/subcategory/subcategory.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'category', component: CategoryComponent },
    {path: 'product', component: ProductComponent},
    { path: 'sales', component: SalesComponent},
    { path: 'subcategory', component: SubcategoryComponent }
];
