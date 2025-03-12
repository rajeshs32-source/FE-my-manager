interface Schedule {
    labourId: string;
    workAssigned: string;
    hours: number;
    isCompleted: boolean;
    reason?: string;
}

interface PersonalTaskDetail {
    personalTaskId?: string;
    labourId: string;
    workDescription: string;
    startDate: Date;
    progressPercentage: string;
}

export interface DailySchedule {
    orderId?: string;
    schedules: Schedule[];
    isPersonalTask: boolean;
    personalTaskDetails: PersonalTaskDetail[];
    date: Date;
}
