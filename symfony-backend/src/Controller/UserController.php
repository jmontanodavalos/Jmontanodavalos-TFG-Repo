<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\Subject;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\User\UserInterface;


#[Route('/api/users')]
class UserController extends AbstractController
{
    #[Route('/me', name: 'user_me', methods: ['GET'])]
    public function me(UserInterface $user): JsonResponse
    {
        return new JsonResponse([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'full_name' => $user->getFullName(),
            'username' => $user->getUsername(),
            'role' => $user->getRoles(),
            'subjects' => array_map(fn(Subject $s) => [
                'id' => $s->getId(),
                'name' => $s->getName(),
                'description' => $s->getDescription()
            ], $user->getSubjects()->toArray())
        ]);
    }

    #[Route('/logout', name: 'logout', methods: ['POST'])]
    public function apiLogout(): JsonResponse
    {
        $response = new JsonResponse(['message' => 'Logged out successfully']);
        $response->headers->clearCookie(
            name: 'authToken',
            path: '/',
            domain: null,
            secure: false,
            httpOnly: true,
            sameSite: 'Lax'
        );

        return $response;
    }


    #[Route('/list', name: 'list_users', methods: ['GET'])]
    public function index(EntityManagerInterface $em): JsonResponse
    {
        $users = $em->getRepository(User::class)->findAll();

        $data = array_map(fn(User $u) => [
            'id' => $u->getId(),
            'username' => $u->getUsername(),
            'full_name' => $u->getFullname(),
            'email' => $u->getEmail(),
            'roles' => $u->getRoles(),
            'phone' => $u->getPhone(),
            'subjects' => array_map(fn(Subject $s) => [
                'id' => $s->getId(),
                'name' => $s->getName(),
                'description' => $s->getDescription()
            ], $u->getSubjects()->toArray())
        ], $users);

        return $this->json($data);
    }

    #[Route('/{id}', name: 'find_user', methods: ['GET'])]
    public function show(int $id, EntityManagerInterface $em): JsonResponse
    {
        $user = $em->getRepository(User::class)->find($id);
        if (!$user) {
            return $this->json(['error' => 'Usuario no encontrado'], Response::HTTP_NOT_FOUND);
        }

        return $this->json([
            'id' => $user->getId(),
            'username' => $user->getUsername(),
            'full_name' => $user->getFullname(),
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
            'phone' => $user->getPhone(),
            'subjects' => array_map(fn(Subject $s) => [
                'id' => $s->getId(),
                'name' => $s->getName(),
                'description' => $s->getDescription()
            ], $user->getSubjects()->toArray())
        ]);
    }

    #[Route('/register', name: 'user_register', methods: ['POST'])]
    public function register(
        Request $request,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $passwordHasher,
        SerializerInterface $serializer
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['email'], $data['password'])) {
            return $this->json(['error' => 'Email y contraseña son obligatorios'], Response::HTTP_BAD_REQUEST);
        }

        $existingUser = $em->getRepository(User::class)->findOneBy(['email' => $data['email']]);
        if ($existingUser) {
            return new JsonResponse(['error' => 'User already exists.'], Response::HTTP_CONFLICT);
        }


        $user = new User();
        $user->setEmail($data['email']);
        $user->setFullname($data['fullname'] ?? '');
        $user->setUsername($data['username'] ?? '');
        $user->setPhone($data['phone'] ?? null);
        $user->setRoles($data['roles'] ?? ['ROLE_USER']);
        $hashedPassword = $passwordHasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPassword);

        if (!empty($data['subjects'])) {
            $subjectRepo = $em->getRepository(\App\Entity\Subject::class);
            foreach ($data['subjects'] as $subjectId) {
                $subject = $subjectRepo->find($subjectId);
                if ($subject) {
                    $user->addSubject($subject);
                }
            }
        }

        $em->persist($user);
        $em->flush();

        return $this->json([
            'message' => 'Usuario creado correctamente',
            'user' => [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'full_name' => $user->getFullname(),
                'email' => $user->getEmail(),
                'roles' => $user->getRoles(),
                'phone' => $user->getPhone(),
                'subjects' => array_map(fn($s) => $s->getName(), $user->getSubjects()->toArray())
            ]
        ], Response::HTTP_CREATED);
    }


    #[Route('/{id}', name: 'user_update', methods: ['PUT'])]
    public function update(
        int $id,
        Request $request,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        $user = $em->getRepository(User::class)->find($id);
        if (!$user) {
            return $this->json(['error' => 'Usuario no encontrado'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['email'])) {
            $user->setEmail($data['email']);
        }

        if (isset($data['fullname'])) {
            $user->setFullname($data['fullname']);
        }

        if (isset($data['username'])) {
            $user->setUsername($data['username']);
        }

        if (isset($data['phone'])) {
            $user->setPhone($data['phone']);
        }

        if (isset($data['password'])) {
            $hashedPassword = $passwordHasher->hashPassword($user, $data['password']);
            $user->setPassword($hashedPassword);
        }

        if (isset($data['roles'])) {
            $user->setRoles($data['roles']);
        }

        if (isset($data['subjects'])) {
            $subjectRepo = $em->getRepository(\App\Entity\Subject::class);
            $user->getSubjects()->clear();
            foreach ($data['subjects'] as $subjectId) {
                $subject = $subjectRepo->find($subjectId);
                if ($subject) {
                    $user->addSubject($subject);
                }
            }
        }

        $em->flush();

        return $this->json([
            'message' => 'Usuario actualizado correctamente',
            'user' => [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'full_name' => $user->getFullname(),
                'email' => $user->getEmail(),
                'roles' => $user->getRoles(),
                'phone' => $user->getPhone(),
                'subjects' => array_map(fn($s) => $s->getName(), $user->getSubjects()->toArray())
            ]
        ]);
    }

    #[Route('/{id}', name: 'user_delete', methods: ['DELETE'])]
    public function delete(int $id, EntityManagerInterface $em): JsonResponse
    {
        $user = $em->getRepository(User::class)->find($id);
        if (!$user) {
            return $this->json(['error' => 'Usuario no encontrado'], Response::HTTP_NOT_FOUND);
        }

        $em->remove($user);
        $em->flush();

        return $this->json(['message' => 'Usuario eliminado correctamente']);
    }
}
