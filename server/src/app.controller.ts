import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectQueue('generation') private generationQue: Queue,
  ) {}

  @Get('users/:query')
  async getUsers(@Param() params): Promise<any> {
    return this.appService.searchUsers(params.query);
  }

  @Post('generate')
  async generate(@Body() { user, accessToken }): Promise<any> {
    const generateJob = await this.generationQue.add({
      scUser: user,
      accessToken,
    });

    return generateJob.id;
  }

  @Get('generate/:id/progress')
  async status(@Param() { id }): Promise<any> {
    const generateJob = await this.generationQue.getJob(id);

    return {
      ...generateJob.data,
      progress: generateJob.progress(),
    };
  }

  @Get('generate/:id/cancel')
  async cancel(@Param() { id }): Promise<any> {
    const generateJob = await this.generationQue.getJob(id);

    return generateJob.moveToFailed(
      {
        message: 'Canceled by user',
      },
      false,
    );
  }
}
