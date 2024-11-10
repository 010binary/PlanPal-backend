import { priority } from "@prisma/client";

type Task = {
  title: string;
  day?: string;
  date?: string;
  note: string;
  status: true | false;
  time: string;
  repeat: boolean;
  priority: priority;
  fnshTime: number | null;
  createdAt: Date;
  updatedAt: Date;
};

type CreateTaskParams = {
  title: string;
  day: string;
  date: string;
  note: string;
  status: boolean;
  time: string;
  repeat?: boolean;
  priority: priority;
  fnshTime?: string;
};

type UpdateTaskParams = {
  title?: string;
  day?: string;
  date?: string;
  note?: string;
  status?: boolean;
  time?: string;
  repeat?: boolean;
  priority?: priority;
  fnshTime?: string;
};

type Result<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };

type CreateTask = Result<Omit<Task, "createdAt" | "updatedAt">>;
type UpdateTask = Result<Omit<Task, "createdAt" | "updatedAt">>;

export type {
  Task,
  Result,
  CreateTask,
  UpdateTaskParams,
  CreateTaskParams,
  UpdateTask,
};
