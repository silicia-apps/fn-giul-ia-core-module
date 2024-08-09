import { Client, Databases, Query, ID, Models } from 'node-appwrite';

//import * as process from './env.js';

function log(text: string) {
  console.log(text);
}
function error(text: string) {
  console.error(text);
}

type Context = {
  req: any;
  res: any;
  log: (msg: string) => void;
  error: (msg: string) => void;
};

export interface HistoryItem {
  role: 'model' | 'user';
  parts: {
    text: string;
  }[];
}

export interface Message extends Models.Document {
  $id: string;
  message: string;
  thought: Thought;
  bot: boolean;
  chat: Chat;
}

export interface Thought extends Models.Document {
  thought: string;
  message: Message;
}

export interface Chat {
  $id: string;
  chat_id: string;
  channel: 'telegram' | 'alexa';
  messages: Message[];
}

export interface Module {
  name: string;
  description: string;
  queue: string[];
  actions: string[];
  events: string[];
}
export interface SlotLtm {
  key: string;
  value: string[];
}

export interface Es {
  $id: string;
  fear?: number;
  happiness?: number;
  sadness?: number;
  anger?: number;
  surprise?: number;
  disgust?: number;
  anxiety?: number;
  excitement?: number;
  frustration?: number;
  satisfaction?: number;
  curiosity?: number;
  boredom?: number;
  nostalgia?: number;
  hope?: number;
  pride?: number;
  shame?: number;
  concentration?: number;
  confusion?: number;
  calm?: number;
  stress?: number;
  creativity?: number;
  empathy?: number;
  logic?: number;
  humor?: number;
  learning?: number;
  connection?: number;
  autonomy?: number;
}

export interface Profile extends Models.Document {
  name: string;
  chats: Chat[];
  es: Es;
  queue: string[];
  ltm: SlotLtm[];
  modules: Module[];
}

export default async ({ req, res, log, error }: Context) => {
  function debug(text: string) {
    if (process.env.DEBUG!.toLowerCase() === 'true') {
      error(`debug: ${text}`);
    }
  }
  debug(`request: ${JSON.stringify(req.body)}`);
  //try {
  const headers = { Authorization: 'Bearer ' + process.env.HA_TOKEN! };
  //log(JSON.stringify(req));
  //const req = {"bodyRaw":"{\"action\":\"{\\\"module\\\":\\\"home-assistant\\\",\\\"action\\\":\\\"get\\\",\\\"channel\\\":\\\"lights\\\"}\",\"state\":\"waiting\",\"$id\":\"66b3c77a0034311279e4\",\"$permissions\":[],\"$createdAt\":\"2024-08-07T19:14:03.457+00:00\",\"$updatedAt\":\"2024-08-07T19:14:03.457+00:00\",\"thought\":{\"thought\":\"{\\\"situation\\\":\\\"L'utente xFr4xx mi ha chiesto di accendere la luce del bagno.\\\",\\\"interpretation\\\":\\\"L'utente desidera che io interagisca con l'ambiente tramite Home Assistant.\\\",\\\"reflection\\\":\\\"Devo verificare se ho le informazioni necessarie per eseguire l'azione. Se non ho il nome dell'entit\\u00e0 'luce del bagno', dovr\\u00f2 chiedere maggiori dettagli.\\\"}\",\"$id\":\"66b3af380029da08ba04\",\"$createdAt\":\"2024-08-07T17:30:32.747+00:00\",\"$updatedAt\":\"2024-08-07T19:13:21.133+00:00\",\"$permissions\":[],\"message\":{\"message\":\"puoi accendere la luce del bagno ?\",\"bot\":false,\"$id\":\"66b3af330005bc8fb2ea\",\"$createdAt\":\"2024-08-07T17:30:27.171+00:00\",\"$updatedAt\":\"2024-08-07T17:30:32.768+00:00\",\"$permissions\":[],\"$databaseId\":\"66ae9f440015b50a678b\",\"$collectionId\":\"66aea08e003d46e738fa\"},\"chat\":{\"channel\":\"telegram\",\"chat_id\":\"7045034835\",\"$id\":\"66b27ff2130cac12b5c0\",\"$createdAt\":\"2024-08-06T19:56:34.092+00:00\",\"$updatedAt\":\"2024-08-06T19:58:07.348+00:00\",\"$permissions\":[],\"$databaseId\":\"66ae9f440015b50a678b\",\"$collectionId\":\"66ae9fc00025ac4542d6\"},\"$databaseId\":\"66ae9f440015b50a678b\",\"$collectionId\":\"66aea1a7003cba1f2b86\"},\"$databaseId\":\"66ae9f440015b50a678b\",\"$collectionId\":\"66b1f8ea001d5b79ca27\"}","body":{"action":"{\"module\":\"home-assistant\",\"action\":\"set\", \"payload\" : {\"channel\":\"light.kitchen_lights\", \"value\":\"on\"}}","state":"waiting","$id":"66b3c77a0034311279e4","$permissions":[],"$createdAt":"2024-08-07T19:14:03.457+00:00","$updatedAt":"2024-08-07T19:14:03.457+00:00","thought":{"thought":"{\"situation\":\"L'utente xFr4xx mi ha chiesto di accendere la luce del bagno.\",\"interpretation\":\"L'utente desidera che io interagisca con l'ambiente tramite Home Assistant.\",\"reflection\":\"Devo verificare se ho le informazioni necessarie per eseguire l'azione. Se non ho il nome dell'entità 'luce del bagno', dovrò chiedere maggiori dettagli.\"}","$id":"66b3af380029da08ba04","$createdAt":"2024-08-07T17:30:32.747+00:00","$updatedAt":"2024-08-07T19:13:21.133+00:00","$permissions":[],"message":{"message":"puoi accendere la luce del bagno ?","bot":false,"$id":"66b3af330005bc8fb2ea","$createdAt":"2024-08-07T17:30:27.171+00:00","$updatedAt":"2024-08-07T17:30:32.768+00:00","$permissions":[],"$databaseId":"66ae9f440015b50a678b","$collectionId":"66aea08e003d46e738fa"},"chat":{"channel":"telegram","chat_id":"7045034835","$id":"66b27ff2130cac12b5c0","$createdAt":"2024-08-06T19:56:34.092+00:00","$updatedAt":"2024-08-06T19:58:07.348+00:00","$permissions":[],"$databaseId":"66ae9f440015b50a678b","$collectionId":"66ae9fc00025ac4542d6"},"$databaseId":"66ae9f440015b50a678b","$collectionId":"66aea1a7003cba1f2b86"},"$databaseId":"66ae9f440015b50a678b","$collectionId":"66b1f8ea001d5b79ca27"},"headers":{"host":"66b3c6d57f9f6:3000","user-agent":"Appwrite/1.5.7","content-type":"application/json","x-appwrite-trigger":"event","x-appwrite-event":"databases.66ae9f440015b50a678b.collections.66b1f8ea001d5b79ca27.documents.66b3c77a0034311279e4.create","x-appwrite-user-id":"65eee35b6bf7806d9eb5","connection":"keep-alive","content-length":"1468"},"method":"POST","host":"66b3c6d57f9f6","scheme":"http","query":{},"queryString":"","port":3000,"url":"http://66b3c6d57f9f6:3000/","path":"/"}
  log(`Try to connect to HA endpoint ${process.env.HA_ENDPOINT!}`);
  const action = JSON.parse(req.body.action);
  if (action.module === 'home-assistant') {
    switch (action.action) {
      case 'get':
        switch (action.channel) {
          case 'lights':
          default:
            log(`Try to get Light HA Entities`);
            const request = (
              await fetch(`${process.env.HA_ENDPOINT}/states`, {
                headers: headers,
              })
            ).text();
            const ha_entities = await request;
            const entities: { entity_id: any; friendly_name: any }[] = [];
            JSON.parse(ha_entities).forEach((entity: any) => {
              if (entity.entity_id.search('light') !== -1) {
                entities.push({
                  entity_id: entity.entity_id,
                  friendly_name: entity.attributes.friendly_name,
                });
              }
            });
            log(`founded this some light`);
            log(JSON.stringify(entities));
            log('connect to appwrite api');
            const client = new Client()
              .setEndpoint(process.env.APPWRITE_ENDPOINT!)
              .setProject(process.env.APPWRITE_PROJECT_ID!)
              .setKey(process.env.APPWRITE_API_KEY!);
            let datastore = new Databases(client);
            datastore.createDocument(
              process.env.APPWRITE_DATABASE_ID!,
              process.env.APPWRITE_TABLE_MESSAGES_ID!,
              ID.unique(),
              {
                message: `{ 'module': 'home-assistant', 'action': 'input', 'channel': 'lights', 'payload': ('value': '${JSON.stringify(entities)}' }}`,
                bot: false,
                chat: req.body.thought.chat.$id,
              }
            );
        }
        break;
      case 'set':
      default:
        log(
          `Try to turn ${action.payload.value} ${action.payload.channel} device`
        );
        const request = (
          await fetch(
            `${process.env.HA_ENDPOINT}/states/${action.payload.channel}`,
            {
              headers: headers,
              method: 'POST',
              body: JSON.stringify({ state: action.payload.value }),
            }
          )
        ).text();
        const result = await request;
        log(JSON.stringify(result));
    }
  } else {
    log(`This action not is for this module`);
  }

  if (req.method === 'GET') {
    return res.send('Silicia - Giul-IA BOT - home assistant module');
  }
  return res.empty();
  /*} catch (e: any) {
    error(String(e));
  }*/
};
