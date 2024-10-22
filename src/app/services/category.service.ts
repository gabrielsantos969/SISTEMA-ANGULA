import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoryListar, CategoryWithSubcategory, CreateCategory } from '../models/Category';
import { Response } from '../models/Response';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  readonly apiUrl = environment.urlApi;
  readonly versionApi = environment.versionApi;

  constructor(readonly http: HttpClient) { }

  getCategories(): Observable<Response<CategoryListar[]>>{
    return this.http.get<Response<CategoryListar[]>>(`${this.apiUrl}/${this.versionApi}/category`);
  }

  getCategoryById(categoryId: string): Observable<Response<CategoryListar>>{
    return this.http.get<Response<CategoryListar>>(`${this.apiUrl}/${this.versionApi}/category/${categoryId}`);
  }

  getCategoryByIdWithSubcategories(categoryId: string): Observable<Response<CategoryWithSubcategory>>{
    return this.http.get<Response<CategoryWithSubcategory>>(`${this.apiUrl}/${this.versionApi}/category/subcategory/${categoryId}`);
  }

  getCategoryWithSubcategories(): Observable<CategoryWithSubcategory[]>{
    return this.http.get<CategoryWithSubcategory[]>(`${this.apiUrl}/${this.versionApi}/category/WithAllSubCategories`);
  }

  deleteCategory(categoryId: string): Observable<boolean>{
    return this.http.delete<boolean>(`${this.apiUrl}/${this.versionApi}/category/${categoryId}`);
  }

  createCategory(category: CategoryWithSubcategory): Observable<Response<CategoryWithSubcategory>>{
    return this.http.post<Response<CategoryWithSubcategory>>(`${this.apiUrl}/${this.versionApi}/category`, category);
  }

  updateCategory(category: CategoryWithSubcategory): Observable<Response<CategoryWithSubcategory>>{
    return this.http.put<Response<CategoryWithSubcategory>>(`${this.apiUrl}/${this.versionApi}/category`, category);
  }

}
