import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Project } from 'src/app/models/Project';
import { Task } from 'src/app/models/Task';
import { ProjectService } from 'src/app/services/project/project.service';
import { TaskService } from 'src/app/services/task/task.service';
import {
  AddTaskModalComponent,
  TaskItemViewMode,
} from '../add-task-modal/add-task-modal.component';
import {
  NzContextMenuService,
  NzDropdownMenuComponent,
} from 'ng-zorro-antd/dropdown';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

export enum TaskPriority {
  Undefined = 0,
  Low = 1,
  Medium = 2,
  High = 3,
}

export enum TaskStatus {
  Open = 0,
  InProgress = 1,
  Done = 2,
}

// interface ProjectInfo {
//   name: string;
//   color: string;
// }

@Component({
  selector: 'app-task-item',
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.css'],
})
export class TaskItemComponent implements OnInit {
  @ViewChild('addTaskModalInItem') addTaskModalInItem!: AddTaskModalComponent;
  @Input() task!: Task;
  @Output() onTaskChange = new EventEmitter();
  TaskPriority = TaskPriority;
  TaskItemViewMode = TaskItemViewMode;
  listProject: Project[] = [];
  checkListCompleteCount!: number;
  checkListTotalCount!: number;
  projectInfo!: Project;
  constructor(
    private taskService: TaskService,
    private projectService: ProjectService,
    private nzContextMenuService: NzContextMenuService,
    private msg: NzMessageService,
    private modal: NzModalService
  ) {}

  ngOnInit(): void {
    this.projectService.getProjectList().subscribe((projects) => {
      this.listProject = projects;
    });
    this.getProjectInfo();
  }

  ngOnChanges(): void {
    this.transformTaskData();
    this.getCheckListCount();
    this.projectService
      .getProjectList()
      .subscribe((projects) => (this.listProject = projects));
  }

  transformTaskData(): void {
    this.task.priorityColor = this.getPriorityColor(this.task.priority);
    this.task.priorityLabel = this.getPriorityLabel(this.task.priority);
  }

  getProjectInfo(): void {
    this.projectInfo = this.listProject.find(
      (p: any) => p.id === this.task.projectId
    )!;
  }

  getPriorityLabel(taskPriority: TaskPriority): string {
    switch (taskPriority) {
      case TaskPriority.High:
        return 'Cao';
      case TaskPriority.Medium:
        return 'Trung bình';
      case TaskPriority.Low:
        return 'Thấp';
      default:
        return '';
    }
  }

  getPriorityColor(taskPriority: TaskPriority): string {
    switch (taskPriority) {
      case TaskPriority.High:
        return 'red';
      case TaskPriority.Medium:
        return 'blue';
      case TaskPriority.Low:
        return 'default';
      default:
        return '';
    }
  }

  quickChangeTaskStatus() {
    var newStatus =
      this.task.status === TaskStatus.Open
        ? TaskStatus.InProgress
        : TaskStatus.Done;
    this.taskService
      .updatePropTask(this.task.id, { status: newStatus })
      .toPromise()
      .then((res) => {
        this.onTaskChange.emit();
      });
  }

  openDetailTaskModal() {
    this.addTaskModalInItem.viewMode = TaskItemViewMode.View;
    this.addTaskModalInItem.isVisible = true;
  }

  openEditTaskModal() {
    this.addTaskModalInItem.handleEditTask(this.task);
    this.addTaskModalInItem.isVisible = true;
  }

  getCheckListCount() {
    this.checkListTotalCount = this.task.checkList?.length;
    this.checkListCompleteCount = this.task.checkList?.filter(
      (item) => item.checked == true
    ).length;
  }

  contextMenu($event: MouseEvent, menu: NzDropdownMenuComponent): void {
    this.nzContextMenuService.create($event, menu);
  }

  actionWhenUpdateTask() {
    this.onTaskChange.emit();
  }

  showDeleteConfirm() {
    this.modal.confirm({
      nzTitle: 'Xóa công việc?',
      nzContent: `Bạn có chắc chắn muốn xóa công việc: <b style="color: red;">${this.task?.name}</b>`,
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => this.deleteTask(),
      nzCancelText: 'Hủy',
    });
  }

  deleteTask() {
    this.taskService
      .updatePropTask(this.task.id, { isDeleted: true })
      .toPromise()
      .then((res: any) => {
        if (res && res.result) {
          this.actionWhenUpdateTask();
          this.msg.success('Xoá công việc thành công');
        } else {
          this.msg.error('Có lỗi xảy ra. Xóa công việc thất bại');
        }
      });
  }
}
