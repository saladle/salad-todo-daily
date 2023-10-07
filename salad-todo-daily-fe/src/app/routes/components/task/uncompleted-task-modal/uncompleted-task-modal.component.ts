import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Task } from 'src/app/models/Task';
import { LoadingService } from 'src/app/services/common/loading/loading.service';
import { TaskService } from 'src/app/services/task/task.service';
import { differenceInCalendarDays } from 'date-fns';
import { DatePipe } from '@angular/common';
import { DateType, getFormattedStartDate } from 'src/app/helpers/helper';
import { TaskStatus } from '../task-item/task-item.component';
@Component({
  selector: 'app-uncompleted-task-modal',
  templateUrl: './uncompleted-task-modal.component.html',
  styleUrls: ['./uncompleted-task-modal.component.css'],
})
export class UncompletedTaskModalComponent implements OnInit {
  isVisible: boolean = false;
  uncompletedTaskList: any[] = [];
  handlingTask: Task | null = null;
  reselectFinishDateBtnText: string = '';
  reselectDate!: Date | null;
  today = new Date();
  allChecked: boolean = false;
  indeterminate: boolean = false;
  disabledDate = (current: Date): boolean =>
    // Can not select days before today
    differenceInCalendarDays(current, this.today) < 0;
  constructor(
    private taskService: TaskService,
    private msg: NzMessageService,
    private loadingService: LoadingService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {}

  openModal(): void {
    this.isVisible = true;
  }

  setUncompletedTaskList(data: Task[]): void {
    this.uncompletedTaskList = data.map((task) => {
      return {
        ...task,
        checked: false,
      };
    });
  }
  handleCancel() {
    this.isVisible = false;
  }
  handleOk() {}
  onAllChecked(e: any) {}

  onConfirmDelete(taskId: any): void {
    this.deleteTask(taskId);
  }

  async deleteTask(uncompletedTaskId: any): Promise<void> {
    this.loadingService.setLoading(true);
    this.taskService
      .updatePropTask(uncompletedTaskId, {
        isDeleted: true,
      })
      .toPromise()
      .then((res: any) => {
        this.msg.success('Xóa công việc thành công!');

        this.removeHandledTask(uncompletedTaskId);
      })
      .catch((err) => {
        this.msg.error('Có lỗi xảy ra. Xóa công việc thất bại');
      })
      .finally(() => {
        this.loadingService.setLoading(false);
      });
  }
  onChangeVisibleReselectFinishDate(e: boolean, handlingTask: Task) {
    if (e) {
      this.handlingTask = handlingTask;
      this.reselectDate = handlingTask.finishDate;
    } else {
      this.handlingTask = null;
      this.reselectDate = null;
      this.reselectFinishDateBtnText = '';
    }
  }
  onChangeReselectDate(e: any) {
    this.reselectDate = e;
    this.reselectFinishDateBtnText = `Chuyển thành ngày ${this.datePipe.transform(
      e,
      'dd/MM/yyyy'
    )}`;
  }
  onRemoveFinishDate() {
    this.reselectDate = null;
    this.reselectFinishDateBtnText = 'Xóa ngày hoàn thành công việc';
  }

  updateFinishDate() {
    this.loadingService.setLoading(true);
    const finishDate = getFormattedStartDate(
      this.reselectDate,
      DateType.FinishDate
    );
    this.taskService
      .updatePropTask(this.handlingTask!.id, {
        finishDate,
      })
      .toPromise()
      .then((res: any) => {
        this.msg.success('Gia hạn công việc thành công');
        this.removeHandledTask(this.handlingTask!.id);
        this.handlingTask = null;
      })
      .catch((err) => {
        this.msg.error('Có lỗi xảy ra. Gia hạn thất bại');
      })
      .finally(() => {
        this.loadingService.setLoading(false);
      });
  }

  removeHandledTask(taskId: any): void {
    let deleteIndex = this.uncompletedTaskList.findIndex(
      (item) => item.id === taskId
    );
    this.uncompletedTaskList.splice(deleteIndex, 1);
    if(this.uncompletedTaskList.length === 0) {
      this.isVisible = false;
    }
  }

  onConfirmFinished(uncompletedTaskId: any) {
    this.loadingService.setLoading(true);
    this.taskService.updatePropTask(uncompletedTaskId, {
      status: TaskStatus.Done,
    }).toPromise().then((res: any) => {
      this.msg.success('Đã đánh dấu hoàn thành công việc');
      this.removeHandledTask(uncompletedTaskId);
    }).catch((err) => {
      this.msg.error('Có lỗi xảy ra.');
    }).finally(() => {
      this.loadingService.setLoading(false);
    })
  }

  updateAllChecked(): void {
    this.indeterminate = false;
    if (this.allChecked) {
      this.uncompletedTaskList = this.uncompletedTaskList.map(item => ({
        ...item,
        checked: true
      }));
    } else {
      this.uncompletedTaskList = this.uncompletedTaskList.map(item => ({
        ...item,
        checked: false
      }));
    }
  }

  updateSingleChecked(): void {
    if (this.uncompletedTaskList.every(item => !item.checked)) {
      this.allChecked = false;
      this.indeterminate = false;
    } else if (this.uncompletedTaskList.every(item => item.checked)) {
      this.allChecked = true;
      this.indeterminate = false;
    } else {
      this.indeterminate = true;
    }
  }
}
