import { Controller, Post, Get, Body, Param, Request, UseGuards } from '@nestjs/common';
import { VotesService } from './votes.service';
import { CreerVoteDto } from './dto/creer-vote.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  // POST /api/votes — APPRENANT, FORMATEUR, ADMIN (pas SPECTATEUR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'FORMATEUR', 'APPRENANT')
  @Post()
  async voter(@Request() req: any, @Body() dto: CreerVoteDto) {
    return this.votesService.voter(req.user.id, dto);
  }

  // GET /api/votes/message/:id — accessible à tous les connectés
  @UseGuards(JwtAuthGuard)
  @Get('message/:id')
  async votesParMessage(@Param('id') id: string) {
    return this.votesService.votesParMessage(id);
  }
}