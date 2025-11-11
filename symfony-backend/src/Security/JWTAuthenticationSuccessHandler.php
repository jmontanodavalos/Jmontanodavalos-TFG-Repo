<?php

namespace App\Security;

use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationSuccessEvent;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Http\Authentication\AuthenticationSuccessHandlerInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\HttpFoundation\Request;

class JWTAuthenticationSuccessHandler implements AuthenticationSuccessHandlerInterface
{
   private JWTTokenManagerInterface $jwtManager;

   public function __construct(JWTTokenManagerInterface $jwtManager)
   {
       $this->jwtManager = $jwtManager;
   }

   public function onAuthenticationSuccess(Request $request, TokenInterface $token): Response
   {
       $user = $token->getUser();
       $jwt = $this->jwtManager->create($user);

       $response = new JsonResponse(['token' => $jwt]);

       $response->headers->setCookie(
           cookie: new \Symfony\Component\HttpFoundation\Cookie(
               name: 'authToken',
               value: $jwt,
               expire: time() + 3600,
               path: '/',
               domain: null, // se aplica al dominio actual (localhost)
               secure: false,
               httpOnly: true,
               sameSite: 'Lax'
           )
       );

       return $response;
   }
}
