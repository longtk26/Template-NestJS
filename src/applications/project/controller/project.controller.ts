import { Controller, Get, Param } from '@nestjs/common';
import { ProjectService } from '../service/project.service';
import { Public } from 'src/applications/guards/decorators/guard.decorator';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @Public()
  async registerProject() {
    const projectId = '123';
    const userId = crypto.randomUUID();
    return this.projectService.registerProject(projectId, userId);
  }
}
