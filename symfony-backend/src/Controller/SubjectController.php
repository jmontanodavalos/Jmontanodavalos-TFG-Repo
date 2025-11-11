<?php

namespace App\Controller;

use App\Entity\Subject;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;

#[Route('/api/subjects')]
class SubjectController extends AbstractController
{

    #[Route('/list', name: 'subject_list', methods: ['GET'])]
    public function index(EntityManagerInterface $em): JsonResponse
    {
        $subjects = $em->getRepository(Subject::class)->findAll();

        $data = array_map(fn(Subject $s) => [
            'id' => $s->getId(),
            'name' => $s->getName(),
            'description' => $s->getDescription(),
        ], $subjects);

        return $this->json($data);
    }

    #[Route('', name: 'subject_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['name'])) {
            return $this->json(['error' => 'Nombre de asignatura requerido'], Response::HTTP_BAD_REQUEST);
        }

        $subject = new Subject();
        $subject->setName($data['name']);
        $subject->setDescription($data['description'] ?? '');

        $em->persist($subject);
        $em->flush();

        return $this->json([
            'message' => 'Asignatura creada correctamente',
            'subject' => [
                'id' => $subject->getId(),
                'name' => $subject->getName(),
                'description' => $subject->getDescription(),
            ]
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'subject_update', methods: ['PUT'])]
    public function update(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $subject = $em->getRepository(Subject::class)->find($id);
        if (!$subject) {
            return $this->json(['error' => 'Asignatura no encontrada'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['name'])) $subject->setName($data['name']);
        if (isset($data['description'])) $subject->setDescription($data['description']);

        $em->flush();

        return $this->json([
            'message' => 'Asignatura actualizada correctamente',
            'subject' => [
                'id' => $subject->getId(),
                'name' => $subject->getName(),
                'description' => $subject->getDescription(),
            ]
        ]);
    }

    #[Route('/{id}', name: 'subject_delete', methods: ['DELETE'])]
    public function delete(int $id, EntityManagerInterface $em): JsonResponse
    {
        $subject = $em->getRepository(Subject::class)->find($id);
        if (!$subject) {
            return $this->json(['error' => 'Asignatura no encontrada'], Response::HTTP_NOT_FOUND);
        }

        $em->remove($subject);
        $em->flush();

        return $this->json(['message' => 'Asignatura eliminada correctamente']);
    }
}
