import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectQueue } from '@nestjs/bull';
import { Model } from 'mongoose';
import { Queue } from 'bull';
import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import to from 'await-to-js';
import { AppService } from './app.service';
import { Generation } from './app.schema';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectQueue('generation') private generationQue: Queue,
    @InjectModel(Generation.name) private generationModel: Model<Generation>,
  ) {}

  @Get('users/:query')
  async getUsers(@Param() params): Promise<any> {
    return this.appService.searchUsers(params.query);
  }

  @Get('user/:id/collect')
  async getUser(@Param() params): Promise<any> {
    return this.appService.getUserData(params.id);
  }

  @Post('generate')
  async generate(@Body() { user, selection, accessToken }): Promise<any> {
    const sdk = SpotifyApi.withAccessToken(
      process.env.SPTFY_CLIENT_ID,
      accessToken,
    );

    const [getProfileErr, getProfileSuccess] = await to(
      sdk.currentUser.profile(),
    );

    if (getProfileErr) {
      console.error('getProfileErr: ', getProfileErr);
      throw getProfileErr;
    }

    const generationItem = await this.generationModel.create({
      scUser: String(user.id),
      sptfyUser: String(getProfileSuccess.id),
    });

    const [addJobError] = await to(
      this.generationQue.add(
        {
          scUser: user,
          sptfyUser: getProfileSuccess,
          selection,
          accessToken,
          docId: generationItem._id,
        },
        {
          jobId: String(generationItem._id),
        },
      ),
    );

    if (addJobError) {
      console.error('addJobError: ', addJobError);
      throw addJobError;
    }

    return generationItem._id;
  }

  @Get('generate/:id/progress')
  async status(@Param() { id }): Promise<any> {
    const generationItem = await this.generationModel.findById(id);
    const generateJob = await this.generationQue.getJob(generationItem.jobId);

    return {
      ...generateJob.data,
      progress: generateJob.progress(),
    };
  }

  @Get('generate/:id/cancel')
  async cancel(@Param() { id }): Promise<any> {
    const generationItem = await this.generationModel.findById(id);
    const generateJob = await this.generationQue.getJob(generationItem.jobId);

    await generateJob.remove();
    await this.generationModel.findByIdAndUpdate(id, { status: 'canceled' });
  }
}
