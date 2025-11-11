<?php

namespace App\Controller;

use App\Entity\Booking;
use App\Entity\User;
use App\Entity\Subject;
use App\Entity\Timeslot;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;

#[Route('/api/bookings')] // Para pruebas
class BookingController extends AbstractController
{
    #[Route('', name: 'list_bookings', methods: ['GET'])]
    public function index(EntityManagerInterface $em): JsonResponse
    {
        $bookings = $em->getRepository(Booking::class)->findAll();

        $data = array_map(fn(Booking $b) => [
            'id' => $b->getId(),
            'student' => $b->getStudent() ? $b->getStudent()->getFullname() : null,
            'subject' => $b->getSubject() ? $b->getSubject()->getName() : null,
            'timeslot' => $b->getTimeslot()
                ? $b->getTimeslot()->getStartTime()->format('H:i') . ' - ' . $b->getTimeslot()->getEndTime()->format('H:i')
                : null,
            'date' => $b->getDate()->format('Y-m-d'),
        ], $bookings);

        return $this->json($data);
    }

    #[Route('/{id}', name: 'booking_show', methods: ['GET'])] // Para pruebas
    public function show(int $id, EntityManagerInterface $em): JsonResponse
    {
        $booking = $em->getRepository(Booking::class)->find($id);
        if (!$booking) {
            return $this->json(['error' => 'Reserva no encontrada'], Response::HTTP_NOT_FOUND);
        }

        return $this->json([
            'id' => $booking->getId(),
            'student' => $booking->getStudent()?->getFullname(),
            'subject' => $booking->getSubject()?->getName(),
            'timeslot' => $booking->getTimeslot()
                ? $booking->getTimeslot()->getStartTime()->format('H:i') . ' - ' . $booking->getTimeslot()->getEndTime()->format('H:i')
                : null,
            'date' => $booking->getDate()->format('Y-m-d')
        ]);
    }

    #[Route('/month', name: 'bookings_month', methods: ['GET'])]
    public function getMonth(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $year = (int) $request->query->get('year', date('Y'));
        $month = (int) $request->query->get('month', date('m'));

        if ($month < 1 || $month > 12) {
            return $this->json(['error' => 'Mes inválido'], Response::HTTP_BAD_REQUEST);
        }

        // Primer y último día del mes
        $start = new \DateTime("$year-$month-01");
        $end = (clone $start)->modify('last day of this month');

        // Consultar solo fechas y cantidad de reservas por día
        $qb = $em->createQueryBuilder()
            ->select('b.date AS day, COUNT(b.id) AS total')
            ->from(Booking::class, 'b')
            ->where('b.date BETWEEN :start AND :end')
            ->setParameter('start', $start)
            ->setParameter('end', $end)
            ->groupBy('b.date')
            ->orderBy('b.date', 'ASC');

        $results = $qb->getQuery()->getResult();

        // Transformar resultado: clave = día, valor = cantidad
        $data = [];
        foreach ($results as $r) {
            $data[$r['day']->format('Y-m-d')] = (int) $r['total'];
        }

        return $this->json([
            'month' => $month,
            'year' => $year,
            'days' => $data
        ]);
    }

    #[Route('/day', name: 'bookings_day', methods: ['GET'])]
    public function getDay(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $dateParam = $request->query->get('date');
        if (!$dateParam) {
            return $this->json(['error' => 'Debe especificar una fecha (YYYY-MM-DD)'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $date = new \DateTime($dateParam);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Formato de fecha no válido'], Response::HTTP_BAD_REQUEST);
        }

        // Cargar todas las reservas del día con joins
        $qb = $em->createQueryBuilder()
            ->select('b', 's', 't', 'sub')
            ->from(Booking::class, 'b')
            ->leftJoin('b.student', 's')
            ->leftJoin('b.timeslot', 't')
            ->leftJoin('b.subject', 'sub')
            ->where('b.date = :date')
            ->setParameter('date', $date)
            ->orderBy('t.startTime', 'ASC');

        $bookings = $qb->getQuery()->getResult();

        $data = array_map(fn(Booking $b) => [
            'id' => $b->getId(),
            'student' => $b->getStudent()?->getFullname(),
            'subject' => $b->getSubject()?->getName(),
            'timeslot' => $b->getTimeslot()
                ? $b->getTimeslot()->getStartTime()->format('H:i') . ' - ' . $b->getTimeslot()->getEndTime()->format('H:i')
                : null,
            'date' => $b->getDate()->format('Y-m-d'),
        ], $bookings);

        return $this->json([
            'date' => $date->format('Y-m-d'),
            'count' => count($data),
            'bookings' => $data
        ]);
    }


    #[Route('', name: 'booking_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['student_id'], $data['subject_id'], $data['timeslot_id'], $data['date'])) {
            return $this->json(['error' => 'Datos incompletos para crear la reserva'], Response::HTTP_BAD_REQUEST);
        }

        $student = $em->getRepository(User::class)->find($data['student_id']);
        $subject = $em->getRepository(Subject::class)->find($data['subject_id']);
        $timeslot = $em->getRepository(Timeslot::class)->find($data['timeslot_id']);

        if (!$student || !$subject || !$timeslot) {
            return $this->json(['error' => 'Usuario, asignatura o franja horaria no válidos'], Response::HTTP_BAD_REQUEST);
        }

        // Comprobar si ya hay una reserva en ese día y franja
        $existing = $em->getRepository(Booking::class)->findOneBy([
            'date' => new \DateTime($data['date']),
            'timeslot' => $timeslot,
        ]);

        if ($existing) {
            return $this->json(['error' => 'Esa franja horaria ya está reservada para ese día'], Response::HTTP_CONFLICT);
        }

        $booking = new Booking();
        $booking->setStudent($student);
        $booking->setSubject($subject);
        $booking->setTimeslot($timeslot);
        $booking->setDate(new \DateTime($data['date']));

        $em->persist($booking);
        $em->flush();

        return $this->json([
            'message' => 'Reserva creada correctamente',
            'booking' => [
                'id' => $booking->getId(),
                'student' => $student->getFullname(),
                'subject' => $subject->getName(),
                'timeslot' => $timeslot->getStartTime()->format('H:i') . ' - ' . $timeslot->getEndTime()->format('H:i'),
                'date' => $booking->getDate()->format('Y-m-d'),
            ]
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'booking_update', methods: ['PUT'])]
    public function update(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $booking = $em->getRepository(Booking::class)->find($id);
        if (!$booking) {
            return $this->json(['error' => 'Reserva no encontrada'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['student_id'])) {
            $student = $em->getRepository(User::class)->find($data['student_id']);
            if ($student) $booking->setStudent($student);
        }

        if (isset($data['subject_id'])) {
            $subject = $em->getRepository(Subject::class)->find($data['subject_id']);
            if ($subject) $booking->setSubject($subject);
        }

        if (isset($data['timeslot_id'])) {
            $timeslot = $em->getRepository(Timeslot::class)->find($data['timeslot_id']);
            if ($timeslot) $booking->setTimeslot($timeslot);
        }

        if (isset($data['date'])) {
            $booking->setDate(new \DateTime($data['date']));
        }

        $em->flush();

        return $this->json([
            'message' => 'Reserva actualizada correctamente',
            'booking' => [
                'id' => $booking->getId(),
                'student' => $booking->getStudent()?->getFullname(),
                'subject' => $booking->getSubject()?->getName(),
                'timeslot' => $booking->getTimeslot()
                    ? $booking->getTimeslot()->getStartTime()->format('H:i') . ' - ' . $booking->getTimeslot()->getEndTime()->format('H:i')
                    : null,
                'date' => $booking->getDate()->format('Y-m-d'),
            ]
        ]);
    }

    #[Route('/{id}', name: 'booking_delete', methods: ['DELETE'])]
    public function delete(int $id, EntityManagerInterface $em): JsonResponse
    {
        $booking = $em->getRepository(Booking::class)->find($id);
        if (!$booking) {
            return $this->json(['error' => 'Reserva no encontrada'], Response::HTTP_NOT_FOUND);
        }

        $em->remove($booking);
        $em->flush();

        return $this->json(['message' => 'Reserva eliminada correctamente']);
    }
}
