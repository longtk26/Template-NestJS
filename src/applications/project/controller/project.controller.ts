import { Controller, Get } from '@nestjs/common';
import { ProjectService } from '../service/project.service';
import { Public } from 'src/applications/guards/decorators/guard.decorator';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @Public()
  async registerProject() {
    const projectId = '123';
    console.log(`Timestamp ${new Date().getTime()}`);
    return this.projectService.registerProject(projectId);
  }
}
