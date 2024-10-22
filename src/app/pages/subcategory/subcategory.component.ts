import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CategoryWithSubcategory } from '../../models/Category';
import { CategoryService } from '../../services/category.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-subcategory',
  standalone: true,
  imports: [],
  templateUrl: './subcategory.component.html',
  styleUrl: './subcategory.component.css'
})
export class SubcategoryComponent implements OnInit{

  public categoryWithSubcategories!: CategoryWithSubcategory;

  currentPageSubCategory = 1;
  itemsPerPageSubCategory = 10;
  totalPagesSubCategory: number = 0

  isLoadingCategory: boolean = true;

  hasSubCategories: boolean = false;

  constructor(private categoryService: CategoryService, private router: ActivatedRoute, private location: Location){}
  
  ngOnInit(): void {
    this.router.queryParams.subscribe(async params => {
      const categoryId = params['id'];
      await this.loadCategory(categoryId);
    })

    
  }

  loadCategory(id: string){
    this.categoryService.getCategoryByIdWithSubcategories(id).subscribe(
      response => {
        this.categoryWithSubcategories = response.data;
        this.updateTotalPagesSubCategory();
        this.isLoadingCategory = false;
        this.hasSubCategories = Array.isArray(this.categoryWithSubcategories?.subCategories) && this.categoryWithSubcategories.subCategories.length > 0;
        
      },
      (error) => {
        console.error('Ocorreu um error ao buscar a categoria com Subcategorias:', error);

        if(error.error.errors && error.error.errors.length > 0){
          const errorMessage = error.error.errors.map((err: string) => `- ${err}`).join('\n');
          alert(`${error.error.message}: \n ${errorMessage}`);
        }else{
          alert(error.error.message);
        }
        
      }
    )
  }

  goBack(){
    this.location.back();
  }

  /* Paginação Tabela SubCategoria */
  get paginatedSubCategories() {
    if(!this.categoryWithSubcategories || !Array.isArray(this.categoryWithSubcategories.subCategories)){
      return [];
    }
    const startIndex = (this.currentPageSubCategory - 1) * this.itemsPerPageSubCategory;
    return this.categoryWithSubcategories.subCategories.slice(startIndex, startIndex + this.itemsPerPageSubCategory) || [];
  }

  updateTotalPagesSubCategory() {    
    this.totalPagesSubCategory = this.categoryWithSubcategories && this.categoryWithSubcategories.subCategories
      ? Math.ceil(this.categoryWithSubcategories.subCategories.length / this.itemsPerPageSubCategory)
      : 0; 
  }

  nextPageSubCategory() {
    if (this.currentPageSubCategory < this.totalPagesSubCategory) {
      this.currentPageSubCategory++;
    }
  }

  prevPageSubCategory() {
    if (this.currentPageSubCategory > 1) {
      this.currentPageSubCategory--;
    }
  }

  /* Fim paginação tabela SubCategory */

}
