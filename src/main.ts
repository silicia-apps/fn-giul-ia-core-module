import { profile } from 'console';
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
    log(`connect to Appwrite API`);
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT!)
      .setProject(process.env.APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);
    const datastore = new Databases(client);
    const chatids: string[] = [];
    if (req.body.action) {
      const action: Action = JSON.parse(req.body.action);
      debug(`action: ${JSON.stringify(action)}`);
      if (action.module === 'core' && action.channel !== 'telegram') {
        switch (action.channel) {
          case 'store':
            break;
          case 'stop': //stop conversation
            log(`The IA stop the conversation`);
            new_action = action;
            new_action.action = 'input';
            new_action.payload!.value = `Analizza la discussione ed organizza i dati per memorizzarli (su un database vettoriale Qdrant),
classifica i dati nel seguente modo:

- memoria episodica: è la capacità di ricordare esperienze personali, specifiche e contestualizzate nel tempo e nello spazio. Ti permette di "rivivere" mentalmente eventi passati, ricordando dettagli come chi era presente, dove e quando è successo.
- memoria semantica: è la memoria delle conoscenze generali e dei fatti, indipendentemente da quando e dove li hai appresi.
- memoria autobiografica: è l'insieme dei ricordi che hanno plasmato la tua identità e il tuo rapporto con il mondo, visti attraverso la lente del tuo "io". è un sistema complesso che organizza e dà senso alle tue esperienze di vita, costruendo la tua identità e la tua visione del mondo.
memoria prospettica: il ricordarsi di portare a termine quelle intenzioni che, per diverse ragioni, non possono essere realizzate nel momento stesso in cui vengono formulate, ma devono essere rimandate ad un momento successivo
memoria procedurale: si utilizza nel momento in cui dobbiamo fornire una performance o una semplice attività quotidiana divenuta routinaria e contiene le istruzioni passo passo per eseguire l'attività

Esempi :
memoria episodica: Ricordare il giorno della laurea, con tutti i dettagli ad essa legati, a differenza di un ricordo generico di aver accompagnato i figli a scuola.
memoria semnantica : sapere che Parigi è la capitale della Francia, conoscere le regole della grammatica, o comprendere il concetto di "mammifero".

al termine invia le azioni per memorizzare i dati nel seguente formato:

{ 'module': 'core', 'action': 'store', 'channel': 'memoria episodica|memoria semantica|memoria autobiografica|memoria prospettica|memoria procedurale', 'payload': { 'value': string, tags: string[] }}

`;
            break;
          case 'rethink': //resend rethink command
            log(`The IA Need some extra time for make his thought`);
            new_action = action;
            new_action.action = 'input';
            break;
          default: //at this moment do anything
        }
        chatids.push(req.body.thought.chat.$id);
      } else {
        log(`This action not is for this module`);
      }
    } else {
      log(`not action here, send time action`);
      const chats = await datastore.listDocuments(
        process.env.APPWRITE_DATABASE_ID!,
        process.env.APPWRITE_TABLE_CHATS_ID!, [Query.select(['$id'])]
      );
      debug(`chats: ${JSON.stringify(chats)}`);
      chats.documents.forEach((chat) => {
        chatids.push(chat.$id);
      });
      new_action = {
        module: 'core',
        action: 'input',
        channel: 'time',
        payload: { value: new Date().toISOString() },
      };
    }
    if (new_action) {
      log('add new action in conversation');
      debug(`new action: ${JSON.stringify(new_action)}`);
      const client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT!)
        .setProject(process.env.APPWRITE_PROJECT_ID!)
        .setKey(process.env.APPWRITE_API_KEY!);
      let datastore = new Databases(client);
      chatids.forEach(chatid => {
        debug(`Send Action to chat ${chatid}`);
        datastore.createDocument(
          process.env.APPWRITE_DATABASE_ID!,
          process.env.APPWRITE_TABLE_MESSAGES_ID!,
          ID.unique(),
          {
            message: JSON.stringify(new_action),
            bot: false,
            chat: chatid
          }
        );
      });
    }
    if (req.method === 'GET') {
      return res.send('Silicia - Giul-IA BOT - core module');
    }
    return res.empty();
  } catch (e: any) {
    error(String(e));
  }
}
