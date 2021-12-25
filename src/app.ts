import { css, html, LitElement, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { Object } from './types'
import fr from 'javascript-time-ago/locale/fr.json'
import TimeAgo from 'javascript-time-ago'
import '@material/mwc-button'
import '@material/mwc-icon-button'
import '@material/mwc-textfield'
import '@material/mwc-textarea'
import '@material/mwc-snackbar'
import { TextField } from '@material/mwc-textfield'
import { TextArea } from '@material/mwc-textarea'
import clipboard from '@vdegenne/clipboard-copy'

TimeAgo.addDefaultLocale(fr)
const timeAgo = new TimeAgo('fr-FR')

@customElement('bon-coin')
export class BonCoin extends LitElement {
  @state()
  private dirname?: string;

  @state()
  private _data?: { [name: string]: Object };

  constructor() {
    super()

    fetch('/list').then(async res => {
      this._data = await res.json()
      // this.requestUpdate()
    })


    /* Keyboard Events */
    window.addEventListener('keyup', e => {
      if (e.key === 't') {
        this.copyTitle()
      }
      if (e.key === 'd') {
        this.copyDescription()
      }
    })
  }

  static styles = css`
  .object {
    display: flex;
    justify-content: space-between;
    background-color: #eeeeee;
    padding: 12px;
    margin: 12px;
    cursor: pointer;
  }
  `

  render() {
    if (this._data === undefined) {
      return nothing;
    }

    // Order objects by date
    const objects = Object.entries(this._data).sort(function (a, b) {
      return b[1].date - a[1].date;
    })

    if (this.dirname === undefined) {
      /* List template */
      return html`
      <div>
      ${objects.map(([dirname, meta]) => {
        return html`<div class="object" @click=${() => this.onObjectClick(dirname)}><span>${meta.title}</span> <span>${timeAgo.format(meta.date)}</span></div>`
      })}
      </div>
      `
    }
    else {
      /* Object template */
      const o = this._data[this.dirname];
      return html`
      <header style="display:flex;align-items:center;margin-bottom:12px;">
        <mwc-icon-button icon="arrow_back" @click=${() => this.dirname = undefined}></mwc-icon-button>
        <span style="flex:1;padding:0 5px;">${this.dirname}</span>
        <mwc-icon-button icon="save" @click=${() => this.saveObject()}></mwc-icon-button>
      </header>

      <mwc-textfield label="titre" style="width:100%" value=${o.title}
        @keyup=${e => e.stopPropagation()}></mwc-textfield>
      <div style="text-align:right;margin-bottom:10px"><mwc-button label="copier titre" @click=${() => this.copyTitle()}></mwc-button></div>

      <mwc-textarea label="description" style="width:100%" rows=20 value=${o.description}
        @keyup=${e => e.stopPropagation()}></mwc-textarea>
      <div style="text-align:right;margin-bottom:10px;"><mwc-button label="copier description" @click=${() => this.copyDescription()}></mwc-button></div>

      <mwc-textfield label="prix" style="width:100%;margin-bottom:10px;" type="number" min=0 max=10000 step=1 value=${o.price}></mwc-textfield>

      <div style="display:flex;justify-content:center">
        <div style="display:flex;flex-direction:column;color:grey">
          <mwc-button unelevated label="mettre à jour date" icon="event" style="--mdc-theme-primary:#ffeb3b;--mdc-theme-on-primary:black"
            @click=${() => this.onDateClick()}></mwc-button>
          <span style="padding:2px 0 0 3px;font-size:0.9em">${timeAgo.format(o.date)}</span>
        </div>
        <mwc-button unelevated label="sauvegarder" icon="save" style="margin: 0 6px"
          @click=${() => this.saveObject()}></mwc-button>
        <mwc-button unelevated label="images" icon="folder" style="--mdc-theme-primary:#f57c00"
          @click=${() => this.openDirectory()}></mwc-button>
      </div>
      `
    }
  }

  private onDateClick() {
    this._data![this.dirname!].date = Date.now()
    this.requestUpdate()
    fetch(`/update/${this.dirname}`, { method: 'POST'})
  }

  private async saveObject() {
    const object = this._data![this.dirname!]
    object.title = (this.shadowRoot!.querySelector('mwc-textfield[label=titre]') as TextField).value
    object.description = (this.shadowRoot!.querySelector('mwc-textarea') as TextArea).value
    object.price = parseFloat((this.shadowRoot!.querySelector('mwc-textfield[label=prix]') as TextField).value)

    // save data to the server
    fetch(`/save/${this.dirname}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(object)
    })
    window.toast('sauvegardé')
  }

  private onObjectClick(dirname: string) {
    this.dirname = dirname;
  }

  // private copy (content: string) {
  //   clipboard(content)
  //   window.toast('copy to clipboard')
  // }

  private copyTitle () {
    clipboard((this.shadowRoot!.querySelector('mwc-textfield[label=titre]') as TextField).value)
    window.toast('titre copié')
  }
  private copyDescription () {
    clipboard((this.shadowRoot!.querySelector('mwc-textarea') as TextArea).value)
    window.toast('description copié')
  }


  private openDirectory () {
    fetch(`/open/${this.dirname}`)
  }
}


declare global {
  interface Window {
    toast: (text: string) => void
  }
}