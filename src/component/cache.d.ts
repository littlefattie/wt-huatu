
export {};

declare global {

  var wthtCompCache: {
    url: string;
    yml: string;
  }[];

  var wthtCompFetchErrors: {
    url: string;
    error: string;
  }[];
}
