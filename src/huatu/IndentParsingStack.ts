
export type YmlValueType = string | number | object | undefined | null;

export class IndentParsingStack {
  public isOpen = false;
  public openKey: string = "";
  public isList = false;
  public inUse = false;
  public list: {key: string, value: YmlValueType}[] = [];

  constructor() {
  }

  close(obj: object | undefined) {
    if (!this.isOpen || !this.inUse) return;
    if (this.isList) {   
      if (obj) {  // undefined will not be pushed
        this.list.push({key: "", value: obj});
      }
    } else {
      this.list.push({key: this.openKey, value: obj});
    }
    // Mark to close
    this.isOpen = false;
  }

  buildObj() {
    if (!this.inUse) return undefined;
    if (this.isList) {
      const obj: YmlValueType[] = [];
      this.list.forEach(item => obj.push(item.value));
      return obj;
    } else {
      const obj: {[key: string]: YmlValueType } = {};
      this.list.forEach(item => {
        obj[item.key] = item.value;
      })
      return obj;
    }
  }
  
  start(asList: boolean, key?: string, value?: string | number) {
    this.isList = asList;
    this.add(key, value);
    this.inUse = true;
  }
 
  open(key?: string) {
    this.isOpen = true;
    if (!this.isList && key) {
      this.openKey = key;
    }
  }

  add(key?: string, value?: string | number): string | null {
    if (this.isList) {
      if (value) {
        this.list.push({key: "", value: value});
      } else {
        this.open();
      }
    } else {
      if (key) {
        if (this.list.find(x => x.key === key)) return `Name '${key}' has already been defined!`;
        if (value) {
          this.list.push({
            key: key,
            value: value,
          });
        } else {
          this.open(key);
        }
      }
    }
    return null;
  }

  stop() {
    this.list = [];
    this.isOpen = false;
    this.openKey = "" ;
    this.inUse = false;
  }

}