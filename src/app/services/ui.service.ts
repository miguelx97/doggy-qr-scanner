import { Injectable } from '@angular/core';
import { AlertController, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { first } from 'rxjs/operators';
import { ComponentRef } from '@ionic/core';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  
  constructor(
    private toastController: ToastController
    , private loadingController: LoadingController
    , private alert: AlertController
    , private translateSvc:TranslateService
    , private modalCtrl: ModalController
    ) { }

    /**
     * Ionic toast encapsulation
     * @param message 
     * @param duration in miliseconds
     * @param cssClass 
     */
  private async toast(message:string, duration:number = 3000, cssClass:string = 'simple') {
    const toast = await this.toastController.create({
      message, duration, cssClass
    });
    toast.present();
  }
    
  /**
   * Show a toast with "error" style when something is not as expected
   * @param error string message or exception with status code
   * @param duration miliseconds duration
   * @returns 
   */
   error(error:any, duration?:number): boolean{

    let message:string = "";
    console.error(error);   
    if (typeof error === "string") message = error;
    else message = error.code;

    this.translate(message, null, 'err')?.then((traducido: string)=> {
      if(traducido) this.toast(traducido, duration, 'error');  
    });

    return false;
  }

  /**
   * Give feedback to user that an operation was successfully completed showing a success stylized toast 
   * @param message success message
   * @param params dynamic data
   * @param duration milliseconds duration
   * @returns 
   */
  success(message?:string, params?:any, duration?:number): boolean{
    if(!message) return true;
    this.translate(message, params, 'succ').then((traducido: string)=> {
      if(traducido) this.toast(traducido, duration);
    });
    return true;
  }

  /**
   * Show information toast
   * @param message success message
   * @param params dynamic data
   * @param duration milliseconds duration
   */
  info(message?:string, params?:any, duration?:number) {
    this.translate(message, params).then((traducido: string)=> {
      if(traducido) this.toast(traducido, duration);
    })
  }

  private loadingDialog: HTMLIonLoadingElement;
  /**
   * Show loading dialog
   * @param message optional message to show to user to explain why it's taking time
   */
  async showLoading(message?:string, duration:number = 10) {
    message = await this.translate(message);
    this.loadingDialog = await this.loadingController.create({
      message, duration:duration*1000
    });
    await this.loadingDialog.present();
  }

  /**
   * Hide loading dialog
   */
  hideLoading(){
    this.loadingDialog?.dismiss();   
  }
  
  /**
   * Show a confirmation alert for dangerous operation
   * @param text reference to header and body message
   * @param confirmBtn confirmation button text
   * @param params dynamic data for the message
   * @returns 
   */
  async confirm(text:string, confirmBtn:string = 'accept', params?:any):Promise<boolean> {
    const header = await this.translate(text, null, 'modal.header');
    const message = await this.translate(text, params, 'modal.body');
    confirmBtn = await this.translate(confirmBtn);
    const cancelmBtn = await this.translate('cancel');
    return new Promise(async resolve => {
      const alert = await this.alert.create({
        header, message,
        buttons: [
          {
            text: cancelmBtn,
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              resolve(false);
            }
          }, {
            text: confirmBtn,
            handler: () => {
              resolve(true);
            }
          }
        ]
      });

      await alert.present();
    });
  }
  
  /**
   * Show informative alert
   * @param msg reference to header and body message
   * @param params dynamic data for the message
   */
  async modalInfo(msg:string, params?:any):Promise<void>{
    if(!msg) return;
    const header:string = await this.translate(msg, null, 'modal.header');
    const body:string = await this.translate(msg, params, 'modal.body');
    const confirmBtn = await this.translate('accept');
    
    return new Promise(async resolve => {
      const alert = await this.alert.create({
        header: header,
        message: body,
        buttons: [
          {
            text: confirmBtn,
            handler: () => {
              resolve();
            }
          }
        ]
      });
      await alert.present();
    });
  }

  /**
   * Encapsulation to make easier to translate text with ng-translate
   * @param msg reference to i18n json
   * @param params dynamic data
   * @param prefix prefix inside i18n json
   * @returns translated string
   */
  translate(msg:string, params?:any, prefix?:string):Promise<string>{
    if(!msg) return null;
    if(prefix) msg = `${prefix}.${msg}`;
    return this.translateSvc.get(msg, params).pipe(first()).toPromise();
  }

  /**
   * Ionic modal encapsulation
   * @param component 
   * @param componentProps 
   * @param modeIos 
   * @param cssClass 
   * @returns modal object
   */
  async modal(component:ComponentRef, componentProps?:any, modeIos:boolean=false, cssClass:string='basic-modal'):Promise<HTMLIonModalElement>{    
    const modal = await this.modalCtrl.create({
      component, componentProps,
      showBackdrop: true,
      mode:	(modeIos)?'ios':'md',
      cssClass,
    });
    await modal.present();
    return modal;
  }

}
