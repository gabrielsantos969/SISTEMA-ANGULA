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

  countdown: number = 5; // Tempo da contagem regressiva em segundos
  interval: any; // Armazenará o intervalo da contagem
  isButtonDisabled: boolean = true; // Estado do botão
  countdownDisplay: string = ''; // Para exibir a contagem
  progress: number = 0; // Progresso do carregamento
  gradientBackground: string = ''; // Para armazenar o estilo do gradiente

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
    if (this.showDeleteModal) {
      this.startCountdown();
    }
  }

  ngOnDestroy() {
    // Limpa o intervalo se o componente for destruído
    clearInterval(this.interval);
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
    this.countdown = 5; // Reseta a contagem regressiva
    this.countdownDisplay = `Confirmar (${this.countdown})`; // Inicializa a exibição para "Confirmar (5)"
    this.isButtonDisabled = true; // Desabilita o botão
    this.progress = 0; // Reseta o progresso
    this.startCountdown(); // Inicia a contagem
  }

  startCountdown() {
    const totalTime = 5; // Tempo total da contagem em segundos
    const intervalDuration = 100; // Atualiza a cada 100ms
    let elapsedTime = 0; // Tempo decorrido em ms

    this.interval = setInterval(() => {
      elapsedTime += intervalDuration; // Incrementa o tempo decorrido
      this.countdown = Math.ceil((totalTime - elapsedTime / 1000)); // Atualiza a contagem
      this.progress = Math.min(100, (elapsedTime / (totalTime * 1000)) * 100); // Calcula o progresso

      // Atualiza o gradiente do botão
      this.gradientBackground = `linear-gradient(to right, red ${this.progress}%, transparent ${this.progress}%)`;
      this.countdownDisplay = `Confirmar (${this.countdown})`; // Atualiza a exibição

      if (this.countdown <= 0) {
        clearInterval(this.interval);
        this.isButtonDisabled = false; // Habilita o botão
        this.countdownDisplay = 'Confirmar'; // Reseta o texto do botão
        this.progress = 100; // Define o progresso como 100% quando a contagem termina
        this.gradientBackground = `linear-gradient(to right, red 100%, transparent 100%)`; // Completa o gradiente
      }
    }, intervalDuration);
  }

  async confirmDelete(category: CategoryWithSubcategory){
    this.categoryWithSubcategories = this.categoryWithSubcategories.filter(sc => sc.id !== category.id);
    await this.deleteCategory(category.id);
    this.closeDeleteModal();
  }

  closeDeleteModal(){
    this.showDeleteModal = false;
    clearInterval(this.interval);
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
        this.categoryWithSubcategories = response.data;
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
