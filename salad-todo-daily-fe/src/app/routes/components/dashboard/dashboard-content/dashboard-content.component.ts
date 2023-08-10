import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from 'src/app/models/Project';
import { ProjectService } from 'src/app/services/project/project.service';

// interface ViewItem {
//   index: number;
//   name: string;
//   icon: string;
//   selected: boolean;
// }

enum ViewType {
  Kanban = 0,
  List = 1,
  Calendar = 2,
}

@Component({
  selector: 'app-dashboard-content',
  templateUrl: './dashboard-content.component.html',
  styleUrls: ['./dashboard-content.component.css'],
})
export class DashboardContentComponent implements OnInit {
  currentViewType: ViewType = ViewType.Kanban;
  ViewType = ViewType;
  filterForm!: FormGroup;
  projectList: Project[] = [];
  listFilteringProject: string = '';
  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initFilterForm();

    this.projectService.getProjectList().subscribe((projects) => {
      this.projectList = projects;
      this.getListFilteringProject();
    });

    this.route.queryParams.subscribe((params) => {
      if (params.projectId) {
        const projectIdNumberArr = [...params.projectId].map(Number);
        this.filterForm.get('projectId')?.setValue(projectIdNumberArr);
        this.getListFilteringProject();
      }
    });
  }

  initFilterForm(): void {
    this.filterForm = this.fb.group({
      projectId: [[]],
    });
  }

  onChangeProject(ev: any): void {
    this.router.navigate(['/home/dashboard'], {
      queryParams: { projectId: [...ev] },
    });
  }

  getListFilteringProject(): void {
    let result = '';
    for (const projectId of this.filterForm.value.projectId) {
      const projectName = this.projectList.find(
        (p: any) => p.id === projectId
      )?.name;
      result += `${projectName}, `;
    }
    result = result.slice(0, -2);
    if (result.length > 50) {
      result = result.slice(0, 50) + '...';
    }
    this.listFilteringProject = result;
  }
}
