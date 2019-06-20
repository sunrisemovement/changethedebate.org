import * as React from 'react'
import BaseEventTarget from '../core/BaseEventTarget'
import { navigate } from 'gatsby'

export type Locale =
  | 'en'
  | 'es'

const allLocales: Set<String> = new Set(['en', 'es'])

const STORAGE_KEY = 'org.changethedebate.LocaleService.userSelection'

export class Service extends BaseEventTarget {
  public readonly all: Array<Locale>

  private static _instance: Service | null = null

  constructor() {
    super()
    this.all = ['en', 'es']
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.onStorageChange)
    }
  }

  private onStorageChange = (event: StorageEvent) => {
    if (typeof window === 'undefined') return
    if (event.key === STORAGE_KEY && event.storageArea === window.localStorage) {
      this.dispatchEvent(new Event('change'))
    }
  }

  private getInitialDefault(): Locale {
    try {
      const fullLocale = Intl.DateTimeFormat().resolvedOptions().locale
      const minimalLocale = fullLocale.split('-')[0].toLocaleLowerCase()
      if (allLocales.has(minimalLocale)) return minimalLocale as Locale
      else return 'en'
    } catch (_) {
      return 'en'
    }
  }

  public get(): Locale {
    if (typeof window === 'undefined' || !window.localStorage) return this.getInitialDefault()
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === null || !allLocales.has(stored)) {
      const initial = this.getInitialDefault()
      window.localStorage.setItem(STORAGE_KEY, initial)
      return initial
    } else {
      return stored as Locale
    }
  }

  public set(locale: Locale) {
    if (typeof window === 'undefined') return
    if (this.get() === locale) return
    window.localStorage.setItem(STORAGE_KEY, locale)
    this.dispatchEvent(new Event('change'))
  }

  public shortName(locale: Locale): string {
    switch (locale) {
      case 'en': return 'EN'
      case 'es': return 'ES'
      default: return ''
    }
  }

  public fullName(locale: Locale): string {
    switch (locale) {
      case 'en': return 'English'
      case 'es': return 'Español'
      default: return ''
    }
  }

  public redirect() {
    if (typeof window === 'undefined') return
    const locale = this.get()
    const location = window.location.pathname
    if (locale === 'en' && location.startsWith('/es')) {
      window.location.pathname = window.location.pathname.replace('/es', '')
    } else if (locale === 'es' && !location.startsWith('/es')) {
      window.location.pathname = '/es' + window.location.pathname
    }
  }

  public static get instance() {
    if (this._instance === null) this._instance = new Service()
    return this._instance
  }
}

const LocaleContext = React.createContext(Service.instance.get())

export const Provider = (props: React.PropsWithChildren<{}>) => {
  const [locale, setLocale] = React.useState(Service.instance.get())
  React.useEffect(() => {
    const onChange =  () => {
      setLocale(Service.instance.get())
      Service.instance.redirect()
    }
    Service.instance.addEventListener('change', onChange)
    return () => Service.instance.removeEventListener('change', onChange)
  })
  return (
    <LocaleContext.Provider value={locale}>{props.children}</LocaleContext.Provider>
  )
}

export const Consumer = LocaleContext.Consumer

export const useLocale = (): Locale => React.useContext(LocaleContext)