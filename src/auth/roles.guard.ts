// Guard qui vérifie le rôle de l'utilisateur connecté
// Doit toujours être utilisé APRÈS JwtAuthGuard

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Récupère les rôles requis définis par @Roles(...)
    const rolesRequis = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si aucun rôle requis, la route est accessible à tous les connectés
    if (!rolesRequis || rolesRequis.length === 0) {
      return true;
    }

    // Récupère l'utilisateur depuis la requête (injecté par JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();

    // Vérifie si le rôle de l'utilisateur est dans la liste des rôles autorisés
    const aAcces = rolesRequis.includes(user?.role);

    if (!aAcces) {
      throw new ForbiddenException(
        'Vous n\'avez pas les permissions pour cette action',
      );
    }

    return true;
  }
}