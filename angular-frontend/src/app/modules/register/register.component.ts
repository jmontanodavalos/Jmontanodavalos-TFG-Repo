import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormsModule, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../shared/services/authService/auth.service';
import { RegisterDTO } from '../../shared/interfaces/RegisterDTO';
import { SubjectService } from '../../shared/services/subjectService/subject.service';
import { ToastService } from '../../shared/services/toastService/toast.service';

@Component({
 selector: 'app-register',
 standalone: true,
 imports: [
   CommonModule,
   FormsModule,
   ReactiveFormsModule,
   RouterLink,
 ],
 templateUrl: './register.component.html',
 styleUrls: []
})
export class RegisterComponent implements OnInit {

 registerForm!: FormGroup;
 subjectsList: any[] = [];
 isSubjectsLoading: boolean = true;
 isLoading: boolean = false;
 errorMessage: string | null = null;

 constructor(
   private fb: FormBuilder,
   private auth: AuthService,
   private subjectService: SubjectService,
   private router: Router,
   private toastService: ToastService
 ) { }

 ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      full_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [
        Validators.required,
        Validators.pattern(/^\d{9}$/)
      ]],
      subjects: this.fb.array([], Validators.required),
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#+\-_])[A-Za-z\d@$!%*?&#+\-_]{8,}$/)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    // Cargar subjects desde backend
    this.subjectService.getSubjects().subscribe({
      next: data => {
        this.subjectsList = data;
        this.isSubjectsLoading = false;
      },
      error: err => {
        this.isSubjectsLoading = false;
        this.toastService.showToast('Error cargando asignaturas','error',3000);
      }
    });
  }

  // FormArray de subjects
  get subjects(): FormArray {
    return this.registerForm.get('subjects') as FormArray;
  }

  onCheckboxChange(e: any) {
    if (e.target.checked) {
      this.subjects.push(this.fb.control(Number(e.target.value)));
    } else {
      const index = this.subjects.controls.findIndex(x => x.value === e.target.value);
      if (index >= 0) this.subjects.removeAt(index);
    }
  }

  onSubmit(): void {
    this.errorMessage = null;

    if (this.registerForm.valid) {
      this.isLoading = true;
      const { full_name, username, email, password, phone, subjects } = this.registerForm.value;

      const registerData: RegisterDTO = {
        fullname: full_name,
        username,
        email,
        password,
        phone,
        subjects
      };

      this.auth.register(registerData).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.error || 'Error durante el registro.';
        }
      });

    } else {
      this.registerForm.markAllAsTouched();
      this.errorMessage = 'Por favor, corrige los errores en el formulario.';
    }
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (!password || !confirmPassword) return null;
    return password.value === confirmPassword.value ? null : { mismatch: true };
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  get full_name() {
    return this.registerForm.get('full_name');
  }

  get username() {
    return this.registerForm.get('username');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get phone() {
    return this.registerForm.get('phone');
  }

  get password() {
    return this.registerForm.get('password');
  }

  }
