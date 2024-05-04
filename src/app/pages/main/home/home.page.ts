import { Component, OnInit, inject } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { FirebaeService } from 'src/app/services/firebae.service';
import { UtilsService } from 'src/app/services/utils.service';
import { PluginListenerHandle } from '@capacitor/core';
import { Motion } from '@capacitor/motion';
import { CapacitorFlash } from '@capgo/capacitor-flash';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  firebaseSvc = inject(FirebaeService)
  utilSvc = inject(UtilsService)
  titulo_alarma = "Alarma desactivada";
  estado_alarma = false;

  accelHandler: PluginListenerHandle;
  bloqueoDetecion: boolean = false;


  audio1 = new Audio("assets/aud/audio1.mp3")
  audio2 = new Audio("assets/aud/audio2.mp3")
  audio3 = new Audio("assets/aud/audio3.mp3")
  audio4 = new Audio("assets/aud/audio4.mp3")
  audio5 = new Audio("assets/aud/audio5.mp3")


  constructor(private alertController: AlertController, ) {

  }

  ngOnInit() {
  }

  activarAudio(){

    this.audio1.play()
    this.audio2.play()
    this.audio3.play()
    this.audio4.play()
    this.audio5.play()
  }

  async flashActivate() {
    await CapacitorFlash.switchOn({intensity:100});
    setTimeout(async () => {
      await CapacitorFlash.switchOff(); // Desbloquear la detección después de 'segundos' segundos
    }, 5000);
  }
  
  async vibrar() {
    await Haptics.vibrate({duration:5000});
  }




   ejex:number;
   ejey:number;
   ejez:number;

    derechaIzquierda(){
      Motion.addListener('orientation', async event => {
        const umbral = 35; // Puedes ajustar este valor según sea necesario

        if (this.bloqueoDetecion) {
          return; // Salir de la función si la detección está bloqueada
        }
  
        const accelerationx = Math.floor( event.beta );
        const accelerationy = Math.floor( event.gamma);
        const accelerationz = Math.floor( event.alpha) -180;
      
        // Verifica si es la primera vez que se detecta la aceleración horizontal
        if (this.ejex === undefined || this.ejey === undefined || this.ejez === undefined) {
          this.ejex = accelerationx;
          this.ejey = accelerationy;
          this.ejez = accelerationz;
          return; // Sale de la función para evitar el resto de la lógica
        }
      

        if(this.ejez-accelerationz>umbral){
          this.bloqueoDetecion=true;
          this.bloquearDetecionPorSegundos(2);
          this.audio1.play()
        }else if(this.ejez-accelerationz<-umbral){
          this.bloqueoDetecion=true;
          this.bloquearDetecionPorSegundos(2);
          this.audio2.play()
        }else if(this.ejex-accelerationx>umbral || this.ejex-accelerationx<-umbral){
          this.bloqueoDetecion=true;
          this.bloquearDetecionPorSegundos(5);
          this.flashActivate()
          this.audio3.play()
        }else if(this.ejey-accelerationy>umbral || this.ejey-accelerationy<-umbral){
          this.bloqueoDetecion=true;
          this.bloquearDetecionPorSegundos(6);
          this.vibrar()
          this.audio4.play()
        }

        this.ejex=accelerationx;
        this.ejey=accelerationy;
        this.ejez=accelerationz;

       this.bloqueoDetecion=true;
        this.bloquearDetecionPorSegundos(0.4);
        
      });
    }
    
/*
  lastX: number;
  lastY: number;
  lastZ: number;
  posicionPantalla:number;
  movimientoActivado() {
    Motion.addListener('accel', event => {

      if (this.bloqueoDetecion) {
        return; // Salir de la función si la detección está bloqueada
      }

      const accelerationX = event.acceleration.x;
      const accelerationY = event.acceleration.y
      const accelerationZ = event.acceleration.z;

      // Verifica si es la primera vez que se detecta la aceleración
      if (this.lastX === undefined || this.lastY === undefined || this.lastZ === undefined) {
        this.lastX = accelerationX;
        this.lastY = accelerationY;
        this.lastZ = accelerationZ;
        return; // Sale de la función para evitar el resto de la lógica
      }

      this.lastX = (Math.asin(accelerationX / 9.81) * 180) / Math.PI
      this.lastY = (Math.asin(accelerationY / 9.81) * 180) / Math.PI
      this.lastZ = (Math.asin(accelerationZ / 9.81) * 180) / Math.PI
      this.bloquearDetecionPorSegundos(0.3)
      /*
      // Calcula la diferencia entre la aceleración actual y la anterior
      const diffX = Math.abs(accelerationX - this.lastX);
      const diffY = Math.abs(accelerationY - this.lastY);
      const diffZ = Math.abs(accelerationZ - this.lastZ);

      // Define un umbral de movimiento para considerar un cambio
      const umbral = 1; // Puedes ajustar este valor según sea necesario
      const umbral2=0.3
      const umbral3=0.5
      
      // Verifica si el dispositivo se ha movido a la derecha

      if (diffZ > umbral && diffY>umbral2  ) {
        if(this.posicionPantalla!= 1){
        this.alertCustom('me puse vertical')
        this.bloquearDetecionPorSegundos(2);
        this.resetEjes()
        this.posicionPantalla =1;}
      } else if (diffX > umbral3 && diffZ > umbral3) {
        if(this.posicionPantalla!= 2){
        this.alertCustom('me puse horizontal')
        this.bloquearDetecionPorSegundos(2);
        this.resetEjes()
        this.posicionPantalla =2;}
      } else if (diffX > umbral && accelerationX > 0 ) {
        if(this.posicionPantalla!= 3){
        this.alertCustom('me movi a la derecha')
        this.bloquearDetecionPorSegundos(2);
        this.resetEjes()
        this.posicionPantalla =3;}
      }
      // Verifica si el dispositivo se ha movido a la izquierda
      else if (diffX > umbral && accelerationX < 0 ) {
        if(this.posicionPantalla!= 4){
        this.alertCustom('me movi a la Izquierda')
        this.bloquearDetecionPorSegundos(2);
        this.resetEjes()
        this.posicionPantalla =4;}
      }

      // Actualiza las últimas aceleraciones

    });
  }
*/
  bloquearDetecionPorSegundos(segundos: number) {
    this.bloqueoDetecion = true; // Bloquear la detección de movimiento
    setTimeout(() => {
      this.bloqueoDetecion = false; // Desbloquear la detección después de 'segundos' segundos
    }, segundos * 1000); // Convierte segundos a milisegundos
  }


  
  async alarma() {
    if (!this.estado_alarma) {
      this.titulo_alarma = "alarma activada";
      this.estado_alarma = true;
      //this.derechaIzquierda()
      this.derechaIzquierda()
    } else {
      await this.presentAlert()
    }

  }

  singOut() {
    this.firebaseSvc.sigOut()
  }

  async alertCustom(messageIn: string) {
    const alert = await this.alertController.create({
      header: messageIn,
      buttons: ['ok']
    })
    await alert.present();
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Desbloquear alarma',
      message: 'Por favor ingrese su contraseña para desbloquear',
      inputs: [
        {
          name: 'password',
          type: 'password',
          placeholder: 'contraseña',
        }],
      buttons: [{
        text: 'Aceptar',
        handler: (data) => {
          let passwordSave = this.utilSvc.getFrontLocalStorage('password').password;
          // Aquí puedes acceder a los valores ingresados por el usuario
          if (passwordSave == data.password) {
            this.alertCustom('alarma desbloqueada')
            Motion.removeAllListeners()
            this.titulo_alarma = "Alarma desactivada";
            this.estado_alarma = false;
          } else {
            this.alertCustom('contraseña incorrecta')
            this.audio5.play()
            this.flashActivate()
            this.vibrar()
            this.bloquearDetecionPorSegundos(5)
          }
        }
      }]
    });

    await alert.present();
  }


}
