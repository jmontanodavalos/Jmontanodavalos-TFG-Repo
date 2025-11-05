<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\Subject;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;

#[Route('/api/users')]
class UserController extends AbstractController
{
    #[Route('', name: 'list_users', methods: ['GET'])]
    public function index(EntityManagerInterface $em): JsonResponse
    {
        $users = $em->getRepository(User::class)->findAll();

        $data = array_map(fn(User $u) => [
            'id' => $u->getId(),
            'username' => $user->getUsername(),
            'fullname' => $u->getFullname(),
            'email' => $u->getEmail(),
            'roles' => $u->getRoles(),
            'phone' => $u->getPhone(),
            'subjects' => array_map(fn($s) => $s->getName(), $u->getSubjects()->toArray())
        ], $users);

        return $this->json($data);
    }

    #[Route('/{id}', name: 'me', methods: ['GET'])]
    public function show(int $id, EntityManagerInterface $em): JsonResponse
    {
        $user = $em->getRepository(User::class)->find($id);
        if (!$user) {
            return $this->json(['error' => 'Usuario no encontrado'], Response::HTTP_NOT_FOUND);
        }

        return $this->json([
            'id' => $user->getId(),
            'username' => $user->getUsername(),
            'fullname' => $user->getFullname(),
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
            'phone' => $user->getPhone(),
            'subjects' => array_map(fn($s) => $s->getName(), $u->getSubjects()->toArray())
        ]);
    }

    #[Route('', name: 'user_create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $passwordHasher,
        SerializerInterface $serializer
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['email'], $data['password'])) {
            return $this->json(['error' => 'Email y contraseña son obligatorios'], Response::HTTP_BAD_REQUEST);
        }

        $user = new User();
        $user->setEmail($data['email']);
        $user->setFullname($data['fullname'] ?? '');
        $user->setUsername($data['username'] ?? '');
        $user->setPhone($data['phone'] ?? null);
        $user->setRoles($data['roles'] ?? ['ROLE_USER']);
        $hashedPassword = $passwordHasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPassword);

        // Asociar asignaturas si vienen del front
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
                'fullname' => $user->getFullname(),
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
                'fullname' => $user->getFullname(),
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
