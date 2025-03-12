export enum DailyReportTypeEnum {
    EXPENSE = 'Expense',
    INCOME = 'Income',
}

export enum DailyIncomeExpenseTypeEnum {
    TINGERING_MATERIAL = 'Tingering Material',
    PAINTING_MATERIAL = 'Painting Material',
    FOOD = 'Food',
    TEA = 'Tea',
    OTHERS = 'Others',
}

interface BillDetail {
    name: DailyIncomeExpenseTypeEnum;
    description: string;
    amount: number;
    orderId?: string;
    billImage?: string;
    type: DailyReportTypeEnum;
}

export interface DailyReport {
    _id?: string;
    totalExpense?: number;
    totalIncome?: number;
    date: Date;
    billDetails: BillDetail[];
}
