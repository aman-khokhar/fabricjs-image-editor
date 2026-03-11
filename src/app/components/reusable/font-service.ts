import { Injectable, signal } from '@angular/core';
import { forkJoin, from, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FontService {
  tempFonts = [
    {
      name: 'Montserrat',
      url: 'https://cdn.jsdelivr.net/fontsource/fonts/montserrat:vf@latest/latin-wght-normal.woff2',
    },
    {
      name: 'Lato',
      url: 'https://fonts.gstatic.com/s/lato/v17/S6u9w4BMUTPHh7USSwaPGR_p.woff2',
    },
    {
      name: 'Roboto',
      url: 'https://cdn.jsdelivr.net/fontsource/fonts/roboto-flex@latest/latin-400-normal.woff2',
    },
    {
      name: 'OpenSans',
      url: 'https://fonts.gstatic.com/s/opensans/v34/mem8YaGs126MiZpBA-UFVZ0b.woff2',
    },
  ];

  private _loadedFonts = signal<string[]>([]);
  public loadedFonts = this._loadedFonts.asReadonly();

  getFonts(): Observable<{ name: string; url: string }[]> {
    return of(this.tempFonts);
  }

  loadFonts(fonts: { name: string; url: string }[]): Observable<void[]> {
    const loaders = fonts.map((f) =>
      from(
        new FontFace(f.name, `url(${f.url})`).load().then((loaded) => {
          (document as any).fonts.add(loaded);
          this._loadedFonts.update((fonts) => [...fonts, f.name]);
        })
      )
    );
    return forkJoin(loaders);
  }
}
