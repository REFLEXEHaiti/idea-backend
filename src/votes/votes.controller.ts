// src/votes/votes.controller.ts
import { Controller, Post, Get, Param, Body, Req, UseGuards } from '@nestjs/common';
import { VotesService } from './votes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('votes')
@UseGuards(JwtAuthGuard)
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Post()
  async voter(@Body() body: any, @Req() req: any) {
    return this.votesService.voter(req.user.id, body);
  }

  @Get('message/:id')
  async votesParMessage(@Param('id') messageId: string) {
    return this.votesService.votesParMessage(messageId);
  }

  @Get('debat/:id')
  async votesParDebat(@Param('id') debatId: string) {
    return this.votesService.votesParDebat(debatId);
  }

  @Get('debat/:id/mon-vote')
  async monVoteDebat(@Param('id') debatId: string, @Req() req: any) {
    return this.votesService.monVoteDebat(req.user.id, debatId);
  }
}
