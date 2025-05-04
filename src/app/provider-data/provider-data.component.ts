import { Component } from '@angular/core';
import {AppModule} from '../app.module';

@Component({
  selector: 'app-provider-data',
  standalone: true,
    imports: [
        AppModule
    ],
  templateUrl: './provider-data.component.html',
  styleUrl: './provider-data.component.sass'
})
export class ProviderDataComponent {

}
