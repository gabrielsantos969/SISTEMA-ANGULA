export interface Response<T> {
    data: T;
    message: string;
    success: boolean;
    errors: string[];
    statusCode: number;
}