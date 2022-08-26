declare global {
  import 'typed-query-selector/strict';
}

declare module 'https://unpkg.com/ky@0.31.1' {
  export * from 'ky';
  export { default } from 'ky';
}

type StatusResponse = {
  [Id: string]:
    | {
        status: false | null;
      }
    | {
        status: true;
        data: StatusData;
      };
};

interface StatusData {
  name: string;
  uptime: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
  };
  // TODO
  // requests: {
  //   codes: Record<number, number>;
  //   links: {};
  //   methods: {
  //     GET: {
  //       200: 1;
  //     };
  //   };
  // };
  technicalWork: {
    status: boolean;
    // message: {
    //   default: {};
    //   eng: {};
    //   rus: {};
    // };
  };
}
