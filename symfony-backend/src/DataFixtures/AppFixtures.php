<?php

namespace App\DataFixtures;

use App\Entity\Subject;
use App\Entity\Timeslot;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        // --- Asignaturas ---
        $subjects = [
            1 => ['Matemáticas', 'Refuerzo y técnicas de cálculo'],
            2 => ['Inglés', 'Gramática y conversación'],
            3 => ['Lengua Castellana', 'Sintaxis, redacción y literatura'],
            4 => ['Historia', 'Historia universal y de España'],
        ];

        foreach ($subjects as $id => [$name, $desc]) {
            $existing = $manager->getRepository(Subject::class)->find($id);
            if (!$existing) {
                $subject = new Subject();
                $subject->setId($id);
                $subject->setName($name);
                $subject->setDescription($desc);
                $manager->persist($subject);
            }
        }

        // --- Bloques horarios ---
        $morningStart = new \DateTime('10:00');
        $morningEnd   = new \DateTime('14:00');
        $afternoonStart = new \DateTime('16:00');
        $afternoonEnd   = new \DateTime('20:00');
        $idCounter = 1;
        $this->generateTimeslots($manager, $morningStart, $morningEnd, $idCounter);
        $this->generateTimeslots($manager, $afternoonStart, $afternoonEnd, $idCounter);

        $manager->flush();
    }

    // Función para generar intervalos de 1 hora
    private function generateTimeslots(ObjectManager $manager, \DateTime $start, \DateTime $end, int &$idCounter): void
    {
        $interval = new \DateInterval('PT1H'); // 1 hora
        $period = new \DatePeriod($start, $interval, $end);

        foreach ($period as $start_time) {
            $end_time = (clone $start_time)->add($interval);

            $existing = $manager->getRepository(Timeslot::class)->findOneBy([
                'start_time' => $start_time,
                'end_time' => $end_time
            ]);

            if (!$existing) {
                $timeslot = new Timeslot();
                $timeslot->setId($idCounter);
                $timeslot->setStartTime($start_time);
                $timeslot->setEndTime($end_time);
                $manager->persist($timeslot);
            }

            $idCounter++;
        }
    }
}
