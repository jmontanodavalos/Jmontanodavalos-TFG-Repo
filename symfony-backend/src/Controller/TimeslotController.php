<?php

namespace App\Controller;

use App\Entity\Timeslot;
use App\Repository\TimeslotRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

#[Route('/api/timeslots')]
class TimeslotController extends AbstractController
{
    #[Route('/list', name: 'timeslot_list', methods: ['GET'])]
    public function index(TimeslotRepository $repository): JsonResponse
    {
        $timeslots = $repository->findAll();

        $data = array_map(function (Timeslot $t) {
            return [
                'id' => $t->getId(),
                'start_time' => $t->getStartTime()?->format('H:i'),
                'end_time' => $t->getEndTime()?->format('H:i'),
            ];
        }, $timeslots);

        return $this->json($data);
    }

    #[Route('/', name: 'timeslot_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['id'], $data['start_time'], $data['end_time'])) {
            return $this->json(['error' => 'Missing fields'], 400);
        }

        $timeslot = new Timeslot();
        $timeslot->setId($data['id']);
        $timeslot->setStartTime(new \DateTime($data['start_time']));
        $timeslot->setEndTime(new \DateTime($data['end_time']));

        $em->persist($timeslot);
        $em->flush();

        return $this->json(['message' => 'Timeslot created'], 201);
    }

    #[Route('/{id}', name: 'timeslot_update', methods: ['PUT'])]
    public function update(Request $request, Timeslot $timeslot, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (isset($data['start_time'])) {
            $timeslot->setStartTime(new \DateTime($data['start_time']));
        }

        if (isset($data['end_time'])) {
            $timeslot->setEndTime(new \DateTime($data['end_time']));
        }

        $em->flush();

        return $this->json(['message' => 'Timeslot updated']);
    }

    #[Route('/{id}', name: 'timeslot_delete', methods: ['DELETE'])]
    public function delete(Timeslot $timeslot, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($timeslot);
        $em->flush();

        return $this->json(['message' => 'Timeslot deleted']);
    }
}
