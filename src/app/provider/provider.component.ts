import {Component, OnInit} from '@angular/core';

import {combineLatest, Observable} from 'rxjs';
import {take} from 'rxjs/operators';
import firebase from 'firebase/compat';
import {AuthService} from '../services/auth.service';

@Component({
  selector: 'app-provider',
  templateUrl: './provider.component.html',
  styleUrl: './provider.component.sass',
})

export class ProviderComponent {

}
