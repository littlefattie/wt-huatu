import type { IHuatuYmlObj } from "../huatu/IHuatuYml.js";

export class HuatuComponentCache {

  static pushToCache(url: string, yml: string) {
    if (!globalThis.wthtCompCache) {
      globalThis.wthtCompCache = [];
    }
    globalThis.wthtCompCache.push({
      url,
      yml
    });
  }

  static pushError(url: string, error: string) {
    if (!globalThis.wthtCompFetchErrors) {
      globalThis.wthtCompFetchErrors = [];
    }
    let existing = globalThis.wthtCompFetchErrors.find(x => x.url === url);
    if (existing) {
      existing.error = error;
    } else {
      globalThis.wthtCompFetchErrors.push({
        url,
        error
      });
    }
  }

  static getCachedYml(url: string) {
    return globalThis.wthtCompCache?.find(x => x.url === url)?.yml;
  }

  static getFetchError(url: string) {
    return globalThis.wthtCompFetchErrors?.find(x => x.url === url)?.error;
  }

  static async fetchDef(url: string): Promise<void> {
    // Already cached, nothing to do
    if (HuatuComponentCache.getCachedYml(url)) return;
    // If errored, stop trying
    if (HuatuComponentCache.getFetchError(url)) return;
    
    // Try fetch from remote server
    const reBsonObjId = /^[0-9a-f]{24}$/i;
    const reHttpUrl = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;
    const rePathInvalid = /[,:;*?"'`<>|\0#%&+$]/;
    const HUATU_REPO_URL = "https://wt-huatu.org/huatu";
    // let pmsFetch: Promise<Response>;
    let query: URL;
    if (reHttpUrl.exec(url)) {
      // If http link, use it directly
      query = new URL(url);
    } else if (reBsonObjId.exec(url)) {
      // If it is some huatu Id, use it as ID
      query = new URL(`${HUATU_REPO_URL}/${url.toLowerCase()}`);
    } else if (!rePathInvalid.exec(url)) {
      // Some valid path like path/to/some/repo/huatu.yml
      query = new URL(HUATU_REPO_URL);
      query.searchParams.append('path', url);
    } else {
      // The path is invalid, will skip fetching and return error
      HuatuComponentCache.pushError(url, `Component path '${url}' not recognized/found!`);
      return;
    }
    try {
      let res = await globalThis.fetch(query);
      if (res.status === 200) {
        let yml = await res.text();
        HuatuComponentCache.pushToCache(url, yml);
      } else {
        HuatuComponentCache.pushError(url, `Component Fetch Error (Code: ${res.status}) for ${url}`);
      }
    } catch (error) {
      HuatuComponentCache.pushError(url, `Component Fetch Error for ${url}: ${error}`);
    }
  }

  static async prepareComponents(ymlObj: IHuatuYmlObj): Promise<void> {
    let comps = ymlObj["components"];
    if (!comps || typeof comps !== "object" || Array.isArray(comps)) return;
    for (const key in comps) {
      let comp = comps[key];
      if (typeof comp === "string" && comp) {
        await HuatuComponentCache.fetchDef(comp);
      }
    }
  }
  
}
