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
            ['Matemáticas', 'Refuerzo y técnicas de cálculo'],
            ['Inglés', 'Gramática y conversación'],
            ['Lengua Castellana', 'Sintaxis, redacción y literatura'],
            ['Historia', 'Historia universal y de España'],
        ];

        foreach ($subjects as [$name, $desc]) {
            $subject = new Subject();
            $subject->setName($name);
            $subject->setDescription($desc);
            $manager->persist($subject);
        }

        // --- Bloques horarios ---
        $morningStart = new \DateTime('10:00');
        $morningEnd   = new \DateTime('14:00');
        $afternoonStart = new \DateTime('16:00');
        $afternoonEnd   = new \DateTime('20:00');

        $this->generateTimeslots($manager, $morningStart, $morningEnd);
        $this->generateTimeslots($manager, $afternoonStart, $afternoonEnd);

        $manager->flush();
    }

    // Función para generar intervalos de 1 hora
    private function generateTimeslots(ObjectManager $manager, \DateTime $start, \DateTime $end): void
    {
        $interval = new \DateInterval('PT1H'); // 1 hora
        $period = new \DatePeriod($start, $interval, $end);

        foreach ($period as $startTime) {
            $endTime = (clone $startTime)->add($interval);

            $timeslot = new Timeslot();
            $timeslot->setStartTime($startTime);
            $timeslot->setEndTime($endTime);

            $manager->persist($timeslot);
        }
    }
}
