import { Component, HostListener, OnInit } from '@angular/core';
import { TruncatePipe } from '../../shared/truncate.pipe';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryWithSubcategory } from '../../models/Category';
import { CategoryService } from '../../services/category.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [TruncatePipe, CommonModule, FormsModule],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css'
})
export class CategoryComponent implements OnInit{

  public categoryWithSubcategories: CategoryWithSubcategory[] = [];

  isExpanded: boolean[] = [];

  isMobile: boolean = false;
  
  showCreateModal = false;
  showUpdateModal = false;
  showDeleteModal = false;
  
  isLoadingCategory: boolean = true;
  isLoadingCadastroCategory: boolean = false;
  isLoadingUpdateCategory: boolean = false;

  currentPageCategory = 1;
  itemsPerPageCategory = 10;
  totalPagesCategory: number = 0

  sortOrder: string | null = null;

  newCategory = { id: '', nm_Category: '', ds_Category: '', subCategories: [{ id: '', nm_SubCategory: '' }] };
  selectedCategory = { id: '', nm_Category: '', ds_Category: '', subCategories: [{ id: '', nm_SubCategory: '' }] };

  constructor(private categoryService: CategoryService, private router: Router) { }

  ngOnInit(): void {
    this.checkScreenWidth();
    this.getCategoryWithSubcategories();

  }

  sortByName() {
    if (this.sortOrder === 'asc') {
      this.sortOrder = 'desc';
    } else if (this.sortOrder === 'desc') {
      this.sortOrder = null; // Volta ao estado original
    } else {
      this.sortOrder = 'asc';
    }
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: any){
    this.checkScreenWidth();
  }

  checkScreenWidth(): void{
    this.isMobile = window.innerWidth < 768;
  }

  openCreateModal(){
    this.showCreateModal = true;
  }

  closeCreateModal(){
    this.showCreateModal = false;
  }

  openUpdateModal(category: CategoryWithSubcategory){
    this.selectedCategory = { ...category }
    this.showUpdateModal = true;
  }

  closeUpdateModal(){
    this.showUpdateModal = false;
  }

  openViewSubCategory(category: CategoryWithSubcategory){
    this.router.navigate(['/subcategory'], { queryParams: {id: category.id} });
  }

  /* Modal Para deleção de Categoria */

  openDeleteModal(category: CategoryWithSubcategory){
    this.selectedCategory = category;
    this.showDeleteModal = true;
  }

  

  async confirmDelete(category: CategoryWithSubcategory){
    this.categoryWithSubcategories = this.categoryWithSubcategories.filter(sc => sc.id !== category.id);
    await this.deleteCategory(category.id);
    this.closeDeleteModal();
  }

  closeDeleteModal(){
    this.showDeleteModal = false;
  }

  /* Fim para Modal de Deleção de categoria */

  toggleText(index: number): void {
    this.isExpanded[index] = !this.isExpanded[index];
  }

  deleteCategory(categoryId: string){
    this.categoryService.deleteCategory(categoryId).subscribe({
      next: () => {
          this.categoryWithSubcategories = this.categoryWithSubcategories.filter(category => category.id !== categoryId);
        
      },
      error: (err) => {
        console.error("Error ao excluir categoria:", err);
        if(err.error.errors && err.error.errors.length > 0){
          const errorMessage = err.error.errors.map((erro: string) => `- ${erro}`).join('\n');
          alert(`${err.error.message}:\n\n${errorMessage}`);
        }else{
          alert(err.error.message)
        }
      }
    })
  }

  createCategory(){
    this.isLoadingCadastroCategory = true;

    this.categoryService.createCategory(this.newCategory).subscribe(
      response => {
       
        this.categoryWithSubcategories.push(response.data);
        this.isExpanded = new Array(this.categoryWithSubcategories.length).fill(false);
        this.closeCreateModal();
        
      },
      (error) => {
        console.error('Error ao cadastrar categoria', error);
        if(error.error.errors && error.error.errors.length > 0){
          const errorMessage = error.error.errors.map((err: string) => `- ${err}`).join('\n');
          alert(`${error.error.message}:\n\n${errorMessage}`);
        }else if(error.status === 409){
          alert("Erro: Categoria já existente ou conflito de dados.");
        }else if(error.status === 400){
          alert("Erro: Dados inválidos fornecidos.");
        }else{
          alert(error.error.message);
        }
        this.isLoadingCadastroCategory = false; 
      },
      () => {
        this.isLoadingCadastroCategory = false;
      }
    )
  }

  updateCategory(): void{
    this.isLoadingUpdateCategory = true;

    this.categoryService.updateCategory(this.selectedCategory).subscribe(
      response => {
        const index = this.categoryWithSubcategories.findIndex(category => category.id === this.selectedCategory.id);

        if(index !== -1){
          this.categoryWithSubcategories[index] = response.data;
        }

        this.isExpanded = new Array(this.categoryWithSubcategories.length).fill(false);
        this.closeUpdateModal();
      },
      (error) => {
        console.error('Error ao atualizar categoria:', error);

        if(error.error.errors && error.error.errors.length > 0){
          const errorMessage = error.error.errors.map((err: string) => `- ${err}`).join('\n');
          alert(`${error.error.message}: \n\n ${errorMessage}`);
        }else{
          alert(error.error.message);
        }
        

        this.isLoadingUpdateCategory = false;
      },
      () => {
        this.isLoadingUpdateCategory = false;
      }
    )
  }

  getCategoryWithSubcategories(): void{
    this.categoryService.getCategoryWithSubcategories().subscribe(
      response => {
        console.log(response);
        
        this.categoryWithSubcategories = response;
        this.updateTotalPagesCategory();
        this.isLoadingCategory = false;
      },
      (error) => {
        console.error("Error ao buscar todas as categorias com subcategorias:", error);
        this.isLoadingCategory = false;
        if(error.error.errors && error.error.errors.length > 0){
          const errorMessage = error.error.errors.map((err: string) => `- ${err}`).join('\n');
          alert(`${error.error.message}: \n ${errorMessage}`);
        }else{
          alert(error.error.message);
        }
        
      }
    )
  }

  /* Paginação da tabela Category*/
  get paginatedCategories() {
    let sortedCategories = [...this.categoryWithSubcategories];
  
    // Aplica ordenação se necessário
    if (this.sortOrder === 'asc') {
      sortedCategories.sort((a, b) => a.nm_Category.localeCompare(b.nm_Category));
    } else if (this.sortOrder === 'desc') {
      sortedCategories.sort((a, b) => b.nm_Category.localeCompare(a.nm_Category));
    }
  
    const startIndex = (this.currentPageCategory - 1) * this.itemsPerPageCategory;
    return sortedCategories.slice(startIndex, startIndex + this.itemsPerPageCategory) || [];
  }
  

  updateTotalPagesCategory() {
    this.totalPagesCategory = Math.ceil(this.categoryWithSubcategories.length / this.itemsPerPageCategory);
  }

  nextPageCategory() {
    if (this.currentPageCategory < this.totalPagesCategory) {
      this.currentPageCategory++;
    }
  }

  prevPageCategory() {
    if (this.currentPageCategory > 1) {
      this.currentPageCategory--;
    }
  }

  /* Fim paginação de Tabela Category */

  
}
