import { SubCategoryIdName } from "./SubCategory";

export interface CategoryListar {
    id: string;
    nm_Category: string;
    ds_Category: string;
}

export interface CreateCategory{
    nm_Category: string;
    ds_Category: string;
}

export interface CategoryWithSubcategory{
    id: string;
    nm_Category: string;
    ds_Category: string;
    subCategories: SubCategoryIdName[];
}