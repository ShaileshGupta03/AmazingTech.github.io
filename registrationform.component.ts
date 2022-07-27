import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { User } from '../common/user.interface';
import { UsersService } from '../common/users.service';
import Swal from 'sweetalert2';
import { DBOpration } from '../common/db-opration';
import { MustMatch } from '../common/must_match_validator';
@Component({
  selector: 'app-registrationform',
  templateUrl: './registrationform.component.html',
  styleUrls: ['./registrationform.component.css']
})
export class RegistrationformComponent implements OnInit {
  addForm: FormGroup;
  submited: boolean = false
  buttonText: string  //button ka name change karne ke liye
  dbops: DBOpration   //button ka name change karne ke liye

  @ViewChild("nav") elfile: any
  users: User[] = []
  constructor(private usersService: UsersService, private toster: ToastrService) { }
  ngOnInit(): void {
    this.setFormState()
    this.getUsers()
  }
  setFormState() {
    this.buttonText = "Save"; //button ka name change karne ke liye
    this.dbops = DBOpration.add;  //button ka name change karne ke liye

    this.addForm = new FormGroup({
      id: new FormControl(0),
      title: new FormControl('', Validators.required),
      firstName: new FormControl('', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(10)])),
      lastName: new FormControl('', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(10)])),
      emailID: new FormControl('', Validators.compose([Validators.required, Validators.email])),
      dob: new FormControl('', Validators.compose([Validators.required, Validators.pattern(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/)])),
      password: new FormControl('', Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(10)])),
      confirmpassword: new FormControl('', Validators.required),
      acceptTerms: new FormControl(false, Validators.requiredTrue)
    },
      MustMatch('password', 'confirmpassword')
    )
  }
  register() {
    this.submited = true
    if (this.addForm.invalid) {
      return;
    }
    switch (this.dbops) {
      case DBOpration.add:
        this.usersService.addUser(this.addForm.value).subscribe(res => {
          this.toster.success("User Added !!", "User Registration")
          this.getUsers()
          this.resetForm()
          this.elfile.select('viewtab')
        })
        break;
      case DBOpration.update:
        this.usersService.updateUser(this.addForm.value).subscribe(res => {
          this.toster.success("User Updated", "User Registration")
          this.getUsers()
          this.resetForm()
          this.elfile.select('viewtab')

        })
        break;
    }

  }
  resetForm() {
    this.submited = false
    this.addForm.reset()

    this.buttonText = "Save"; //button ka name change karne ke liye
    this.dbops = DBOpration.add;  //button ka name change karne ke liye
  }
  getUsers() {
    this.usersService.getAllUsers().subscribe((res: User[]) => {
      this.users = res;
      // console.log(this.users)
    })
  }
  edit(Id: number) {
    this.buttonText = "Update"; //button ka name change karne ke liye
    this.dbops = DBOpration.update;  //button ka name change karne ke liye
    let user = this.users.find((u: User) => u.id === Id);
    this.addForm.patchValue(user);
    this.elfile.select("addtab");

    this.addForm.get("password").setValue('')
    this.addForm.get("confirmpassword").setValue('')
    this.addForm.get("acceptTerms").setValue(false)
  }
  tabChange() {
    this.resetForm()
  }
  delete(Id: number) {
    // this.usersService.deleteUser(Id).subscribe(res => {
    // this.toster.success("Deleted Success !!","User Registrations")
    // this.getUsers()

    Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: false
    })

    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.usersService.deleteUser(Id).subscribe(res => {
          this.toster.success("Deleted Success !!", "User Registration")
          this.getUsers();
        })
        // Swal.fire(
        //   'Deleted!',
        //   'Your file has been deleted.',
        //   'success'
        // )
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        Swal.fire(
          'Cancelled',
          'Your imaginary file is safe :)',
          'error'
        )
      }
    })

    // })

  }
  get f() { return this.addForm.controls; }

}
