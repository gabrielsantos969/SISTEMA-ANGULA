import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { SubCategoryListar } from '../models/SubCategory';
import { Observable } from 'rxjs';
import { Response } from '../models/Response';

@Injectable({
  providedIn: 'root'
})
export class SubcategoryService {

  private urlApi = environment.urlApi;
  private versionApi = environment.versionApi;

  constructor(private http: HttpClient) { }

  createSubcategory(subcategory: SubCategoryListar): Observable<Response<SubCategoryListar>>{
    return this.http.post<Response<SubCategoryListar>>(`${this.urlApi}/${this.versionApi}/subcategory`, subcategory);
  }

  deleteSUbcategory(subcategoryId: string): Observable<boolean>{
    return this.http.delete<boolean>(`${this.urlApi}/${this.versionApi}/subcategory/${subcategoryId}`);
  }

  updateSubcategory(subcategory: SubCategoryListar): Observable<Response<SubCategoryListar>>{
    return this.http.put<Response<SubCategoryListar>>(`${this.urlApi}/${this.versionApi}/subcategory`, subcategory);
  }
}
