import { inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

export const authGuard: CanActivateFn = async (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  const user = await firstValueFrom(authState(auth));
  if (user) return true;

  router.navigateByUrl('/login', { replaceUrl: true });
  return false;
};