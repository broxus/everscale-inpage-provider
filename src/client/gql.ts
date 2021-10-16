import * as nt from 'nekoton-wasm';

export type GqlSocketParams = {
  endpoint: string;
  timeout: number;
  local: boolean;
}

export class GqlSocket {
  public async connect(params: GqlSocketParams): Promise<nt.GqlTransport> {
    return new nt.GqlTransport(new GqlSender(params));
  }
}

class GqlSender implements nt.IGqlSender {
  constructor(private readonly params: GqlSocketParams) {
  }

  isLocal(): boolean {
    return this.params.local;
  }

  send(data: string, handler: nt.GqlQuery) {
    (async () => {
      try {
        const response = await fetch(this.params.endpoint, {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
          },
          body: data,
        }).then((response) => response.text());
        handler.onReceive(response);
      } catch (e) {
        handler.onError(e);
      }
    })();
  }
}
