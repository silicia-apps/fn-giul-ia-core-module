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

export interface Action {
  module: string;
  channel: string;
  action: 'input' | 'output';
  payload?: {
    key?: string;
    value?: string;
    type?: string;
    chatid?: string;
  };
  thought?: Thought;
}

export default async ({ req, res, log, error }: Context) => {
  function debug(text: string) {
    if (process.env.DEBUG!.toLowerCase() === 'true') {
      error(`debug: ${text}`);
    }
  }
  debug(`request: ${JSON.stringify(req.body)}`);
  try {
    
    let new_action: Action | null = null;
    debug(`action: ${JSON.stringify(action)}`);
    log(`connect to Appwrite API`);
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT!)
      .setProject(process.env.APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);
    let datastore = new Databases(client);
    if (req.body.action) {
      const action: Action = JSON.parse(req.body.action);
      if (action.module === 'core' && action.channel !== 'telegram') {
        switch (action.channel) {
          case 'store': //add memory slot on ltm
            log('add new information on Long Term Memory');
            debug(`memory slot key: ${action.payload?.key}`);
            debug(`memory slot value: ${action.payload?.value}`);
            const ltm_slot = await datastore.createDocument(
              process.env.APPWRITE_DATABASE_ID!,
              process.env.APPWRITE_TABLE_LTM_ID!,
              ID.unique(),
              {
                key: action.payload?.key,
                value: action.payload?.value,
              }
            );
            break;
          case 'stop': //stop conversation
          case 'rethink': //resend rethink command
            log(`Conversation is ended, send confirm to IA`);
            new_action = action;
            new_action.action = 'input';
            break;
          default: //at this moment do anything
        }
      } else {
        log(`This action not is for this module`);
      }
    } else {
      log(`not action here, send time action`);
      new_action = {
        module: 'core',
        action: 'input',
        channel: 'time',
        payload: { value: new Date().toISOString() },
      };
    }
    if (new_action) {
      log('add new action in conversation');
      debug(`new action: ${new_action}`);
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
          message: JSON.stringify(new_action),
          bot: false,
          chat: req.body.thought.chat.$id,
        }
      );
    }
    if (req.method === 'GET') {
      return res.send('Silicia - Giul-IA BOT - core module');
    }
    return res.empty();
  } catch (e: any) {
    error(String(e));
  }
};
