export class TaskDaily {
  id: any;
  name: string;
  description: string;
  tagId: number[];
  startDate: Date;
  isDeleted: boolean;
  constructor(
    id: any,
    name: string,
    description: string,
    tagId: number[],
    startDate: Date,
    isDeleted: boolean
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.tagId = tagId;
    this.startDate = startDate;
    this.isDeleted = isDeleted;
  }
}
