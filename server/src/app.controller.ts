import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { sc } from '../../utils';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('sc/users/:query')
  async getUsers(@Param() params): Promise<any> {
    return this.appService.searchUsers(params.query);
  }

  @Get('sc/likes/:userid')
  async getLikes(@Param() params): Promise<any> {
    return this.appService.getLikes(params.userid);
  }
}
