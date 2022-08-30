import { Component, ElementRef, ViewChild } from '@angular/core';
import { BarcodeScanner, SupportedFormat } from '@capacitor-community/barcode-scanner';
import { Browser } from '@capacitor/browser';
import { UiService } from 'src/app/services/ui.service';
import { wait } from 'src/app/services/utils';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(
    private ui:UiService
  ) {}

  @ViewChild('image', { static: true }) image: ElementRef;

  async ionViewDidEnter(): Promise<void> {
    // this.isScanning = true;
    // await wait(2000)
    // this.isScanning = false;
    // await wait(300)
    // this.isScanning = true
    // this.scannerStatus = ScannerStatus.CLOSED
    await this.userPermissions();
    await this.startScan();
  }

  get bodyCss():DOMTokenList { return document.body.classList}

  async startScan() {
    if(this.bodyCss.contains("qrscanner")) {
      console.log("Scanner already working");      
      return;
    }
    this.bodyCss.add("qrscanner"); // add the qrscanner class to body
    const result = await BarcodeScanner.startScan({ targetedFormats: [SupportedFormat.QR_CODE] });
    // alert(JSON.stringify(result))
    this.bodyCss.remove("qrscanner"); // remove the qrscanner from the body       
    if (result.hasContent) {
      await this.scanSuccess(result.content);
    };
  };

  async scanSuccess(scanUrl:string):Promise<void>{
    let regExWeb = /\S+\.[a-z]{2,5}/g;
    const arrRegexWeb = scanUrl.match(regExWeb);
    if(!arrRegexWeb) {
      console.log(scanUrl);      
      this.ui.modalInfo('no-url', {message:scanUrl});
      return;
    }

    this.changeImage(2)
    await wait(600)
    this.changeImage(1)
    await wait(200)
    await Browser.open({ url: scanUrl });
  }

  changeImage(imgNumber:number) {
    this.image.nativeElement.src = `assets/images/dog${imgNumber}.svg`
  }

  toggleTorch = async () => await BarcodeScanner.toggleTorch();

  async userPermissions() {
    // check if user already granted permission
    const status = await BarcodeScanner.checkPermission({ force: true });
  
    if (status.granted) return;
  
    if (status.denied) {
      // user denied permission
      this.ui.modalInfo('ask-permissions-denied').then(BarcodeScanner.openAppSettings);
      return;
    }
  
    if (status.asked) {
      // system requested the user for permission during this call
      // only possible when force set to true
    }
  
    if (status.neverAsked) {
      // user has not been requested this permission before
      // it is advised to show the user some sort of prompt
      // this way you will not waste your only chance to ask for the permission
      return (await this.ui.modalInfo('ask-permissions'))
    }
  
    if (status.restricted || status.unknown) {
      // ios only
      // probably means the permission has been denied
      return false;
    }
  
    // user has not denied permission
    // but the user also has not yet granted the permission
    // so request it
    const statusRequest = await BarcodeScanner.checkPermission({ force: true });
  
    if (statusRequest.asked) {
      // system requested the user for permission during this call
      // only possible when force set to true
    }
  
    if (statusRequest.granted) {
      // the user did grant the permission now
      return true;
    }
  
    // user did not grant the permission, so he must have declined the request
    return false;
  };

}
