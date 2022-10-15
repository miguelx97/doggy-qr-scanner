import { Component } from '@angular/core';
import { Device } from '@capacitor/device';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private translate: TranslateService
  ) {
    this.translate.setDefaultLang(Language.ENGLISH);
    this.setLanguage();
  }

  async setLanguage(){
    let language:string = Language.ENGLISH;
    const languageDevice: string = (await Device.getLanguageCode()).value;
    const listLanguage = Language.list().filter(lang => (new RegExp("\\b" + lang + "\\b")).test(languageDevice))
    if(listLanguage.length) language = listLanguage[0];
    if(language !== this.translate.currentLang) this.translate.use(language);
  }
}

enum Language {
  SPANISH = 'es'
  , ENGLISH = 'en'
}
namespace Language {
  export function list():any[] {
      return Object.values(Language).slice(0,-1);
  }
}