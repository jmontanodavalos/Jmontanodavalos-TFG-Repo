<?php 
namespace App\Command; 
use App\Entity\User; 
use Doctrine\ORM\EntityManagerInterface; 
use Symfony\Component\Console\Attribute\AsCommand; 
use Symfony\Component\Console\Command\Command; 
use Symfony\Component\Console\Input\InputInterface; 
use Symfony\Component\Console\Output\OutputInterface; 
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface; 

#[AsCommand(name: 'app:create-admin', description: 'Crea un admin si no existe')] 
class CreateAdminCommand extends Command 
{
    private const ADMIN_EMAIL = 'admin@example.com';
    private const ADMIN_PASSWORD = 'admin123';

    public function __construct( 
        private EntityManagerInterface $em, 
        private UserPasswordHasherInterface $passwordHasher 
    ) { 
        parent::__construct();
    } 
    protected function execute(InputInterface $input, OutputInterface $output): int  { 
        $repo = $this->em->getRepository(User::class); 

        $admin = $repo->findOneBy(['email' => self::ADMIN_EMAIL]); 
        if ($admin) { 
            $output->writeln('Admin ya existe.'); 
            return Command::SUCCESS; 
        } 

        $user = new User();
        $user->setEmail(self::ADMIN_EMAIL);
        $user->setUsername('admin');
        $user->setFullname('Administrator');
        $user->setPhone(0);
        $user->setRoles(['ROLE_ADMIN']);
        $user->setPassword($this->passwordHasher->hashPassword($user, self::ADMIN_PASSWORD));

        $this->em->persist($user); 
        $this->em->flush(); 

        $output->writeln('Admin creado.'); 
        
        return Command::SUCCESS; 
    } 
} 

