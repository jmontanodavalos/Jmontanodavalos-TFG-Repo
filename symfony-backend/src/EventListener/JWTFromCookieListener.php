<?php

namespace App\EventListener;

use Symfony\Component\HttpKernel\Event\RequestEvent;

class JWTFromCookieListener
{
   public function onKernelRequest(RequestEvent $event): void
   {
       $request = $event->getRequest();
       $token = $request->cookies->get('authToken');

       if ($token && !$request->headers->has('Authorization')) {
           $request->headers->set('Authorization', 'Bearer ' . $token);
       }
   }
}
