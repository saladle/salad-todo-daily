export class Task {
  id: any;
  name: string;
  projectId: any;
  description: string;
  startDate: Date;
  endDate: Date;
  priority: number;
  status: number;
  createdAt: Date;
  isDeleted: boolean;
  constructor(id: any, name: string, projectId: any, description: string, startDate: Date, endDate: Date, priority: number, status: number, createdAt: Date, isDeleted: boolean) {
    this.id = id;
    this.name = name;
    this.projectId = projectId;
    this.description = description;
    this.startDate = startDate;
    this.endDate = endDate;
    this.priority = priority;
    this.status = status;
    this.createdAt = createdAt;
    this.isDeleted = isDeleted;
  }
}
