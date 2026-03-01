import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-address',
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './address.component.html',
  styleUrl: './address.component.scss',
})
export class AddressComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<AddressComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.cartForm.patchValue(this.data);
    }
  }

  cartForm = new FormGroup({
    name: new FormControl(null, [Validators.required]),
    line1: new FormControl(null, [Validators.required]),
    line2: new FormControl(null, [Validators.required]),
    city: new FormControl(null, [Validators.required]),
    state: new FormControl(null, [Validators.required]),
    pincode: new FormControl(null, [Validators.required]),
  });

  onSave() {
    this.dialogRef.close(this.cartForm.value);
  }

  onClose() {
    this.dialogRef.close(null);
  }
}
